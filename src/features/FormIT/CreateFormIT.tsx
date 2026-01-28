/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import itFormApi, { useCreateITForm, useUpdateITForm } from '@/api/itFormApi';
import { useNavigate, useParams } from 'react-router-dom';
import itCategoryApi, { ITCategoryInterface } from '@/api/itCategoryApi';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import DotRequireComponent from '@/components/DotRequireComponent';
import { useEffect, useRef, useState } from 'react';
import DateTimePicker from '@/components/ComponentCustom/Flatpickr';
import { getErrorMessage, ShowToast } from '@/lib';
import FileListPreview, { FileListPreviewDownload, UploadedFileType } from '@/components/ComponentCustom/FileListPreviewMemoNotify';
import userApi from '@/api/userApi';
import FullscreenLoader from '@/components/FullscreenLoader';
import fileApi from '@/api/fileApi';

export const ITFormSchema = z.object({
    userCode: z.string().min(1, 'Bắt buộc'),
    userName: z.string().min(1, 'Bắt buộc'),
    email: z.string().min(1, 'Bắt buộc'),
    department: z.string().min(1, 'Bắt buộc'),
    departmentId: z.number(),
    position: z.string().min(1, 'Bắt buộc'),
    dateRequired: z.string().min(1, 'Bắt buộc'),
    dateCompleted: z.string().min(1, 'Bắt buộc'),
    itCategory: z.array(z.number()).nonempty('Bắt buộc'),
    reason: z.string().min(1, 'Bắt buộc'),
    attachments: z.any().optional(),
    attachmentsUploaded: z.any().optional().nullable(),
    attachmentQuoteApplicationForm: z.any().optional().nullable(),
    attachmentQuoteApplicationFormUpload: z.any().optional().nullable(),
    actualCompletionDate: z.string().optional().nullable(),
    targetCompletionDate: z.string().optional().nullable()
});

export type ITRequestState = z.infer<typeof ITFormSchema>;

const CreateFormIT = () => {
    const { t } = useTranslation('formIT');
    const { t: tCommon  } = useTranslation('common')
    const lang = useTranslation().i18n.language.split('-')[0]
    const { user } = useAuthStore()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;
    const [isInitialized, setIsInitialized] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        reset,
        getValues,
        setValue,
        watch,
        formState: { isSubmitting } 
    } = useForm<ITRequestState>({
        resolver: zodResolver(ITFormSchema),
        defaultValues: {
            userCode: '',
            userName: '',
            email: '',
            department: '',
            departmentId: -1,
            position: '',
            dateRequired: new Date().toISOString().split('T')[0],
            dateCompleted: new Date().toISOString().split('T')[0],
            itCategory: [],
            reason: '',
            attachments: [],
            attachmentsUploaded: []
        },
    });
    
    const { data: formData, isLoading: isFormDataLoading } = useQuery({
        queryKey: ['itForm', id],
        queryFn: async () => {
            const res = await itFormApi.getById(id ?? '');
            return res.data.data;
        },
        enabled: isEdit,
    });

    useEffect(() => {
        if (formData) {
            reset({
                userCode: formData?.itForm?.userCode,
                userName: formData?.itForm?.userName,
                email: formData?.itForm?.email,
                department: formData?.itForm?.orgUnit?.name,
                departmentId: formData?.itForm?.departmentId,
                position: formData?.itForm?.position,
                dateRequired: formData?.itForm?.requestDate,
                dateCompleted: formData?.itForm?.requiredCompletionDate,
                itCategory: formData?.itForm?.itFormCategories?.map((item: any ) => item.itCategoryId),
                reason: formData?.itForm?.reason,
                attachments: [],
                attachmentsUploaded: formData?.itForm?.files
            })
            setIsInitialized(true);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData])

    const { data: itCategories = [] } = useQuery({
        queryKey: ['get-all-it-category'],
        queryFn: async () => {
            const res = await itCategoryApi.getAll()
            return res.data.data
        },
    });

    const createItForm = useCreateITForm()
    const updateItForm = useUpdateITForm()

    const attachments = watch('attachments');
    const attachmentsUploaded = watch('attachmentsUploaded');

    const MAX_FILE_SIZE_MB = 5;
    const MAX_FILE_COUNT = 5;

    const previousUserCodeValueRef = useRef('')
    const [isSearchingUser, setIsSearchingUser] = useState(false)
    const handleFindUser = async () => {
        const value = getValues('userCode')

        if (value == previousUserCodeValueRef.current) {
            return
        }

        previousUserCodeValueRef.current = value;

        if (!value.trim()) {
            setValue('userName', '')
            setValue('department', '')
            setValue('email', '')
            setValue('position', '')
            return
        }

        try {
            setIsSearchingUser(true)
            const fetchData = await userApi.getByCode(value)
            const result = fetchData?.data?.data

            console.log(result);

            if (result == null || result == undefined || result?.userCode == null) {
                ShowToast("Not found user", "error")
                setValue('userName', '', { shouldValidate: true })
                setValue('department', '', { shouldValidate: true })
                setValue('email', '', { shouldValidate: true })
                setValue('position', '', { shouldValidate: true })
                return
            }

            if (result?.orgPositionId == null || result?.departmentId == null) {
                ShowToast("Chưa được thiết lập vị trí phòng ban, liên hệ HR", "error")
                setValue('userName', result?.userName, { shouldValidate: true })
                setValue('department', '', { shouldValidate: true })
                return
            }

            setValue('userName', result?.userName, { shouldValidate: true })
            setValue('department', result?.departmentName, { shouldValidate: true })
            setValue('departmentId', result?.departmentId, { shouldValidate: true })
            setValue('email', result?.email ?? '', { shouldValidate: true })
            setValue('position', result?.unitNameV ?? '', { shouldValidate: true })
        }
        catch (err) {
            ShowToast(getErrorMessage(err), "error");
        }
        finally {
            setIsSearchingUser(false)
        }
    }

    const onSubmit: SubmitHandler<ITRequestState> = async (data) => {
        if (shouldShowUpload && data?.attachments?.length <= 0) {
            ShowToast(lang == 'vi' ? 'Chưa chọn file đính kèm' : 'Please select file attachment', 'error')
            return;
        }

        const fd = new FormData();

        fd.append("OrgPositionIdUserCreatedForm", String(user?.orgPositionId ?? -1));
        fd.append("UserCodeCreatedForm", user?.userCode ?? '');
        fd.append("UserNameCreatedForm", user?.userName ?? '');

        fd.append("UserCode", data.userCode);
        fd.append("UserName", data.userName);
        fd.append("DepartmentId", String(data.departmentId));
        fd.append("Email", data.email);
        fd.append("Position", data.position);
        fd.append("Reason", data.reason);
        fd.append("RequestDate", data.dateRequired);
        fd.append("RequiredCompletionDate", data.dateCompleted);

        console.log(data?.itCategory);
        
        data?.itCategory?.forEach((cat: any) => {
            fd.append(`ITCategories`, String(cat));
        });

        data?.attachments?.forEach((file: File) => {
            fd.append("Files", file);
        });

        data?.attachmentsUploaded?.forEach((item: any) => {
            fd.append("FileIdUploadeds", item?.id);
        });

        if (isEdit) {
            await updateItForm.mutateAsync({id: formData?.itForm?.applicationFormId, data: fd})
        }
        else {
            await createItForm.mutateAsync(fd)
        }

        navigate("/form-it")
        queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });
    }

    const itCategory = watch("itCategory");
    const shouldShowUpload = itCategory?.some((id: number) => [1, 2, 5].includes(id));

    useEffect(() => {
        if (!isInitialized) return;

        if (!shouldShowUpload) {
            setValue("attachments", []);
            setValue("attachmentsUploaded", []);
        }
    }, [shouldShowUpload, isInitialized, setValue]);

    const handleDownloadFile = async (file: UploadedFileType) => {
        try {
            const result = await fileApi.downloadFile(file.id)
            const url = window.URL.createObjectURL(result.data);
            const a = document.createElement("a");
            a.href = url;
            a.download = file.fileName;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            ShowToast(`Download file failed,${getErrorMessage(err)}`, "error")
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newFiles = Array.from(files);
        const current = getValues('attachments');

        const totalCount = current?.length + newFiles?.length;
        if (totalCount > MAX_FILE_COUNT) {
            e.target.value = "";
            ShowToast(`Chỉ được upload tối đa ${MAX_FILE_COUNT} file`, 'error');
            return;
        }

        const oversized = newFiles.find(
            f => f.size > MAX_FILE_SIZE_MB * 1024 * 1024
        );
        if (oversized) {
            e.target.value = "";
            ShowToast(`File ${oversized.name} vượt quá ${MAX_FILE_SIZE_MB}MB`, 'error');
            return;
        }

        setValue('attachments', [...current, ...newFiles]);
        e.target.value = "";
    };
        
    if (isEdit && isFormDataLoading) {
        return <div>{lang === 'vi' ? 'Đang tải dữ liệu...' : 'Loading data...'}</div>;
    }

    if (isEdit && !formData) {
        return  <div className='text-red-700 font-semibold'>{lang == 'vi' ? 'Không tìm thấy dữ liệu' : 'Not found data'}</div>;
    }

    return (
        <div className="p-1 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0">{isEdit ? 'Cập nhật' : t('create.title')}</h3>
                <Button onClick={() => navigate("/form-it")} className="w-full md:w-auto hover:cursor-pointer">
                    {t('create.btn_list')}
                </Button>
            </div>
            {isSearchingUser && <FullscreenLoader />}

            <div className="flex flex-col">
                <div className="w-full max-w-3xl bg-white rounded-xl pl-0">
                    <form onSubmit={handleSubmit(onSubmit, (error) => {
                        console.log("⛔ Submit bị chặn vì lỗi:", error);
                    })} className="flex flex-col gap-6">
                        <div className="space-y-6">
                            <div>
                                <h2 className="mb-2 text-lg font-semibold text-[#007cc0]">{t('create.text_info_user_request')}</h2>
                                <hr className="mb-4 border-gray-200" />
            
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div className="form-group">
                                        <label htmlFor="requester.employeeId" className="block text-sm font-medium text-gray-700">
                                            {tCommon('usercode')}<DotRequireComponent />
                                        </label>
                                        <input
                                            disabled={isEdit}
                                            {...register('userCode')}
                                            onBlur={handleFindUser}
                                            type="text"
                                            id="userCode"
                                            placeholder={tCommon('usercode')}
                                            className={`${errors?.userCode ? 'border-red-500 bg-red-50' : 'border-gray-300'} ${isEdit ? 'bg-gray-50' : ''} mt-1 w-full p-2 rounded-md text-sm border select-none`}
                                        />
                                    </div>
            
                                    <div className="form-group">
                                        <label htmlFor="requester.name" className="block text-sm font-medium text-gray-700">
                                            {tCommon('name')}<DotRequireComponent />
                                        </label>
                                        <input
                                            {...register('userName')}
                                            disabled
                                            type="text"
                                            id="requester.name"
                                            placeholder={tCommon('name')}
                                            className={`${errors?.userName ? 'border-red-500 bg-red-50' : 'border-gray-300'}  bg-gray-50 mt-1 w-full p-2 rounded-md text-sm border`}
                                        />
                                    </div>
            
                                    <div className="form-group">
                                        <label htmlFor="requester.department" className="block text-sm font-medium text-gray-700">
                                            {tCommon('department')}<DotRequireComponent />
                                        </label>
                                        <input
                                            {...register('department')}
                                            disabled={true}
                                            type="text"
                                            id="requester.department"
                                            placeholder={tCommon('department')}
                                            className={`${errors?.department ? 'border-red-500 bg-red-50' : 'border-gray-300'} bg-gray-50  mt-1 w-full p-2 rounded-md text-sm border`}
                                        />
                                    </div>
                                </div>
            
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="form-group">
                                        <label htmlFor="requester.position" className="block text-sm font-medium text-gray-700">
                                            {t('create.position')}<DotRequireComponent />
                                        </label>
                                        <input
                                            {...register('position')}
                                            type="text"
                                            id="position"
                                            placeholder={t('create.position')}
                                            className={`${errors?.position ? 'border-red-500 bg-red-50' : 'border-gray-300'} mt-1 w-full p-2 rounded-md text-sm border`}
                                        />
                                    </div>
            
                                    <div className="form-group">
                                        <label htmlFor="requester.email" className="block text-sm font-medium text-gray-700">
                                            Email<DotRequireComponent />
                                        </label>
                                        <input
                                            {...register('email')}
                                            type="email"
                                            id="email"
                                            placeholder="email@vsvn.com.vn"
                                            className={`${errors?.email ? 'border-red-500 bg-red-50' : 'border-gray-300 '}  mt-1 w-full p-2 rounded-md text-sm border`}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h2 className="mb-2 text-lg font-semibold text-[#007cc0]">{t('create.text_info_request')}</h2>
                                <hr className="mb-4 border-gray-200" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="form-group">
                                        <label htmlFor="itRequest.dateRequired" className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('create.date_request')}<DotRequireComponent />
                                        </label>
                                        <Controller
                                            name="dateRequired"
                                            control={control}
                                            render={({ field }) => (
                                                <DateTimePicker
                                                    enableTime={false}
                                                    dateFormat="Y-m-d"
                                                    initialDateTime={field.value}
                                                    onChange={(_selectedDates, dateStr) => field.onChange(dateStr)}
                                                    className={`dark:bg-[#454545] w-full shadow-xs border border-gray-300 p-2 text-sm rounded-[5px] hover:cursor-pointer`}
                                                />
                                            )}
                                        />
                                    </div>
            
                                    <div className="form-group">
                                        <label htmlFor="itRequest.dateCompleted" className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('create.date_required_completed')}<DotRequireComponent />
                                        </label>
                                        <Controller
                                            name="dateCompleted"
                                            control={control}
                                            render={({ field }) => (
                                                <DateTimePicker
                                                    enableTime={false}
                                                    dateFormat="Y-m-d"
                                                    initialDateTime={field.value}
                                                    onChange={(_selectedDates, dateStr) => field.onChange(dateStr)}
                                                    className={`dark:bg-[#454545] w-full shadow-xs border border-gray-300 p-2 text-sm rounded-[5px] hover:cursor-pointer`}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>
            
                                <div className="form-group mt-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                        {t('create.category')}<DotRequireComponent />
                                    </label>
                                    <Controller
                                        name="itCategory"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {itCategories?.map((item: ITCategoryInterface, idx: number) => {
                                                    const checked = field.value?.includes(item?.id ?? -1);
                                                    return (
                                                        <label key={idx} className="w-[48%] flex items-center space-x-2 cursor-pointer select-none">
                                                            <input
                                                                type="checkbox"
                                                                value={item.id}
                                                                checked={checked}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        field.onChange([...field.value, item.id]);
                                                                    } else {
                                                                        field.onChange(
                                                                            field.value.filter((val: number) => val !== item.id)
                                                                        );
                                                                    }
                                                                }}
                                                                className="border-gray-300 scale-[1.4] accent-black"
                                                            />
                                                            <span>{item.name}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    />
                                    {errors?.itCategory && <span className='inline-block mt-1 text-red-500'>{errors?.itCategory?.message}</span>}
                                </div>
                                {
                                    shouldShowUpload && (
                                        <div className="form-group mt-4">
                                            <label className="block text-sm font-medium text-gray-700">
                                                File <DotRequireComponent/><span className="inline-block ml-1 text-red-700 text-xs italic"></span>
                                            </label>
                                            <input
                                                id="file-upload"
                                                type="file"
                                                multiple
                                                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />

                                            <div className="w-max mt-2">
                                                <label
                                                    htmlFor="file-upload"
                                                    className="inline-block cursor-pointer w-auto text-sm rounded-md bg-blue-800 px-3 py-2 text-white text-center hover:bg-blue-900 transition select-none"
                                                >
                                                    {lang == 'vi' ? 'Chọn file' : 'Choose file'}
                                                </label>
                                            </div>

                                            <FileListPreview 
                                                files={attachments}
                                                onRemove={(index) => {
                                                    const newFiles = [...attachments];
                                                    newFiles.splice(index, 1);
                                                    setValue('attachments', newFiles);
                                                }}
                                            />
                                            <div className='mt-1'>
                                                <FileListPreviewDownload 
                                                    key={attachmentsUploaded?.length || 0}
                                                    onDownload={(file) => {handleDownloadFile(file)}} 
                                                    uploadedFiles={attachmentsUploaded} isShowCheckbox={false}
                                                    onRemoveUploaded={(index) => {
                                                        const newUploaded = [...attachmentsUploaded];
                                                        newUploaded.splice(index, 1);
                                                        setValue('attachmentsUploaded', newUploaded);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )
                                }
            
                                <div className="form-group mt-4">
                                    <label htmlFor="itRequest.reason" className="block text-sm font-medium text-gray-700">
                                        {tCommon('reason')}<DotRequireComponent />
                                    </label>
                                    <textarea
                                        id="itRequest.reason"
                                        {...register('reason')}
                                        placeholder={tCommon('reason')}
                                        rows={4}
                                        className={`${errors?.reason ? 'border-red-500 bg-red-50' : 'border-gray-300'} mt-1 w-full p-2 rounded-md text-sm border`}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="cursor-pointer w-full sm:w-auto py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-base tracking-wide uppercase disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {tCommon('save')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateFormIT;
