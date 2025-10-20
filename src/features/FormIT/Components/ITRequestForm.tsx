/* eslint-disable @typescript-eslint/no-explicit-any */
import { ITCategoryInterface } from "@/api/itCategoryApi";
import memoNotificationApi from "@/api/memoNotificationApi";
import { IPriority } from "@/api/priorityApi";
import userApi from "@/api/userApi";
import FileListPreview, { FileListPreviewDownload, UploadedFileType } from "@/components/ComponentCustom/FileListPreviewMemoNotify";
import DateTimePicker from "@/components/ComponentCustom/Flatpickr";
import DotRequireComponent from "@/components/DotRequireComponent";
import FullscreenLoader from "@/components/FullscreenLoader";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getErrorMessage, ShowToast } from "@/lib";
import { useAuthStore } from "@/store/authStore";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { z } from 'zod';

interface ITRequestFormProps {
    mode: 'create' | 'edit' | 'view' | 'approval' | 'manager_it_approval' | 'assigned' 
    formData?: any
    onSubmit?: (data: any) => void,
    itCategories?: { id: number, name: string, nameE: string }[],
    priorities?: { id: number, name: string, nameE: string }[],
    isPending?: boolean;
}

const ITRequestForm: React.FC<ITRequestFormProps> = ({ mode, formData, onSubmit, itCategories, priorities, isPending }) => {
    const { t } = useTranslation('formIT')
    const { t: tCommon  } = useTranslation('common')
    const { user } = useAuthStore()
    const lang = useTranslation().i18n.language.split('-')[0]
    const navigate = useNavigate()

    const [localFiles, setLocalFiles] = useState<File[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
    const [idDeleteFile, setIdDeleteFile] = useState<number[]>([]);

    const isCreate = mode == 'create'
    const isEdit = mode == 'edit'

    const MAX_FILE_SIZE_MB = 5;
    const MAX_FILE_COUNT = 5;

    //create
    const previousUserCodeValueRef = useRef('')
    const [isSearchingUser, setIsSearchingUser] = useState(false)

    const ITRequestFormSchema = z.object({
        requester: z.object({
            userCode: z.string().min(1, tCommon('required')),
            name: z.string().min(1, tCommon('required')),
            email: z.string().email('Email không hợp lệ.').min(1, tCommon('required')),
            department: z.string().min(1, tCommon('required')),
            departmentId: z.coerce.number(),
            orgPositionId: z.coerce.number(),
            position: z.string().min(1, tCommon('required')),
        }),
        itRequest: z.object({
            dateRequired: z.string().min(1, tCommon('required')),
            dateCompleted: z.string().min(1, tCommon('required')),
            itCategory: z.array(z.number()).nonempty(tCommon('required')),
            reason: z.string().min(1, tCommon('required')),
            priority: z.coerce.number(),
            attachments: z.any().optional()
        })
    });

    type ITRequestState = z.infer<typeof ITRequestFormSchema>;
    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        reset,
        getValues,
        setValue,
        watch
    } = useForm<ITRequestState>({
        resolver: zodResolver(ITRequestFormSchema),
        defaultValues: {
            requester: {
                userCode: formData?.applicationFormItem?.applicationForm?.userCodeCreatedForm ?? '',
                name: formData?.applicationFormItem?.applicationForm?.userNameCreatedForm ?? '',
                email: formData?.email ?? '',
                department: formData?.orgUnit?.name ?? '',
                departmentId: formData?.orgUnit?.id ?? -1,
                orgPositionId: user?.orgPositionId,
                position: formData?.position ?? ''
            },
            itRequest: {
                dateRequired: formData?.requestDate ?? new Date().toISOString().split('T')[0],
                dateCompleted: formData?.requiredCompletionDate ?? new Date().toISOString().split('T')[0],
                itCategory: formData?.itFormCategories?.map((item: {itCategoryId: number}) => item.itCategoryId) ?? [],
                reason: formData?.reason ?? '',
                priority: formData?.priorityId ?? 1,
                attachments: formData?.files ?? []
            }
        },
    });

    useEffect(() => {
        if (formData) {
            setUploadedFiles(formData?.files ?? []);
            reset((values) => ({
                ...values,
                requester: {
                    ...values.requester,
                    userCode: formData?.applicationFormItem?.applicationForm?.userCodeCreatedForm ?? '',
                    name: formData?.applicationFormItem?.applicationForm?.userNameCreatedForm ?? '',
                    email: formData?.email ?? '',
                    department: formData?.orgUnit?.name ?? '',
                    departmentId: formData?.orgUnit?.id ?? -1,
                    position: formData?.position ?? '',
                },
                itRequest: {
                    ...values.itRequest,
                    dateRequired: formData?.requestDate ?? new Date().toISOString().split('T')[0],
                    dateCompleted: formData?.requiredCompletionDate ?? new Date().toISOString().split('T')[0],
                    itCategory: formData?.itFormCategories?.map((item: { itCategoryId: number }) => item.itCategoryId) ?? [],
                    reason: formData?.reason ?? '',
                    priority: formData?.priorityId ?? 1,
                },
            }));
        } else {
            setUploadedFiles([]);
            setLocalFiles([]);
            setIdDeleteFile([]);

            reset({
                requester: {
                    userCode: '',
                    name: '',
                    email: '',
                    department: '',
                    departmentId: user?.departmentId ?? -1,
                    orgPositionId: user?.orgPositionId ?? -1,
                    position: '',
                },
                itRequest: {
                    dateRequired: new Date().toISOString().split('T')[0],
                    dateCompleted: new Date().toISOString().split('T')[0],
                    itCategory: [],
                    reason: '',
                    priority: 1,
                    attachments: [],
                },
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData, user?.orgPositionId]);

    const onInternalSubmit = (data: any) => {
        if (shouldShowUpload) {
            if (localFiles.length == 0 && (uploadedFiles?.length == 0 || uploadedFiles == undefined)) {
                ShowToast(lang == 'vi' ? 'Vui lòng chọn file đính kèm' : 'Please select file attachment', 'error')
                return false
            }
        }
        const payload = {
            ...data,
            itRequest: {
                ...data.itRequest,
                attachments: localFiles,
                idDeleteFile: idDeleteFile
            }
        };
        onSubmit?.(payload);
    };

    const onCancel = () => {
        if (isEdit) {
            navigate("/form-it")
        }
        else {
            reset()
        }
    }

    const handleFindUser = async () => {
        const value = getValues('requester.userCode')

        if (value == previousUserCodeValueRef.current) {
            return
        }

        previousUserCodeValueRef.current = value;

        if (!value.trim()) {
            setValue('requester.name', '')
            setValue('requester.department', '')
            setValue('requester.email', '')
            setValue('requester.position', '')
            return
        }

        try {
            setIsSearchingUser(true)
            await new Promise(resolve => setTimeout(resolve, 300));
            const fetchData = await userApi.SearchUserCombineViClockAndWebSystem(value)
            const result = fetchData?.data?.data

            if (result == null || result == undefined || result?.userCode == null) {
                ShowToast("Not found user", "error")
                setValue('requester.name', '', { shouldValidate: true })
                setValue('requester.department', '', { shouldValidate: true })
                setValue('requester.email', '', { shouldValidate: true })

                return
            }

            if (result?.orgPositionId == null || result?.departmentId == null) {
                ShowToast("Chưa được thiết lập vị trí phòng ban, liên hệ HR", "error")
                setValue('requester.name', result?.nvHoTen, { shouldValidate: true })
                setValue('requester.department', '', { shouldValidate: true })
                return
            }

            setValue('requester.name', result?.nvHoTen, { shouldValidate: true })
            setValue('requester.department', result?.departmentName, { shouldValidate: true })
            setValue('requester.departmentId', result?.departmentId, { shouldValidate: true })
            setValue('requester.email', result?.email ?? '', { shouldValidate: true })
        }
        catch (err) {
            ShowToast(getErrorMessage(err), "error");
        }
        finally {
            setIsSearchingUser(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newFiles = Array.from(files);

        const totalCount = (newFiles?.length ?? 0) + (localFiles?.length ?? 0) + (uploadedFiles?.length ?? 0);

        if (totalCount > MAX_FILE_COUNT) {
            e.target.value = "";
            ShowToast(
                lang == 'vi'
                    ? `Chỉ được upload tối đa ${MAX_FILE_COUNT} file`
                    : `Only upload maximum ${MAX_FILE_COUNT} file`,
                'error'
            );
            return;
        }

        const oversized = newFiles.find(f => f.size > MAX_FILE_SIZE_MB * 1024 * 1024);
        if (oversized) {
            e.target.value = "";
            ShowToast(
                lang == 'vi'
                    ? `File ${oversized.name} vượt quá ${MAX_FILE_SIZE_MB}MB`
                    : `The file ${oversized.name} exceeds ${MAX_FILE_SIZE_MB}MB.`,
                'error'
            );
            return;
        }

        setLocalFiles(prev => [...prev, ...newFiles]);
        e.target.value = "";
    };

    const itCategory = watch("itRequest.itCategory");
    const shouldShowUpload = itCategory?.some((id: number) => [1, 2, 5].includes(id));

    const handleDownloadFile = async (file: UploadedFileType) => {
        try {
            const result = await memoNotificationApi.downloadFile(file.id)
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

    return (
        <form onSubmit={handleSubmit(onInternalSubmit)} className="flex flex-col gap-6">

            {isSearchingUser && <FullscreenLoader />}

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
                                disabled={mode != 'create'}
                                {...register('requester.userCode')}
                                onBlur={handleFindUser}
                                type="text"
                                id="requester.userCode"
                                placeholder={tCommon('usercode')}
                                className={`${errors.requester?.userCode ? 'border-red-500' : 'border-gray-300'} ${mode != 'create' ? 'bg-gray-100' : ''} mt-1 w-full p-2 rounded-md text-sm border select-none`}
                            />
                            {errors.requester?.userCode && <p className="text-red-500 text-xs mt-1">{errors.requester.userCode.message}</p>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="requester.name" className="block text-sm font-medium text-gray-700">
                                {tCommon('name')}<DotRequireComponent />
                            </label>
                            <input
                                {...register('requester.name')}
                                disabled={true}
                                type="text"
                                id="requester.name"
                                placeholder={tCommon('name')}
                                className={`${errors.requester?.name ? 'border-red-500' : 'border-gray-300'} bg-gray-100 mt-1 w-full p-2 rounded-md text-sm border`}
                            />
                            {errors.requester?.name && <p className="text-red-500 text-xs mt-1">{errors.requester.name.message}</p>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="requester.department" className="block text-sm font-medium text-gray-700">
                                {tCommon('department')}<DotRequireComponent />
                            </label>
                            <input
                                {...register('requester.department')}
                                disabled={true}
                                type="text"
                                id="requester.department"
                                placeholder={tCommon('department')}
                                className={`${errors.requester?.department ? 'border-red-500' : 'border-gray-300'} mt-1 w-full p-2 rounded-md text-sm border bg-gray-100`}
                            />
                            {errors.requester?.department && <p className="text-red-500 text-xs mt-1">{errors.requester.department.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label htmlFor="requester.position" className="block text-sm font-medium text-gray-700">
                                {t('create.position')}<DotRequireComponent />
                            </label>
                            <input
                                disabled={mode != 'create' && mode != 'edit'}
                                {...register('requester.position')}
                                type="text"
                                id="requester.position"
                                placeholder={t('create.position')}
                                className={`${errors.requester?.position ? 'border-red-500' : 'border-gray-300'} ${mode != 'create' && mode != 'edit' ? 'bg-gray-100' : ''} mt-1 w-full p-2 rounded-md text-sm border`}
                            />
                            {errors.requester?.position && <p className="text-red-500 text-xs mt-1">{errors.requester.position.message}</p>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="requester.email" className="block text-sm font-medium text-gray-700">
                                Email<DotRequireComponent />
                            </label>
                            <input
                                disabled={mode != 'create' && mode != 'edit'}
                                {...register('requester.email')}
                                type="email"
                                id="requester.email"
                                placeholder="email@vsvn.com.vn"
                                className={`${errors.requester?.email ? 'border-red-500' : 'border-gray-300'} ${mode != 'create' && mode != 'edit' ? 'bg-gray-100' : ''} mt-1 w-full p-2 rounded-md text-sm border`}
                            />
                            {errors.requester?.email && <p className="text-red-500 text-xs mt-1">{errors.requester.email.message}</p>}
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
                                name="itRequest.dateRequired"
                                control={control}
                                render={({ field }) => (
                                    <DateTimePicker
                                        disabled={mode != 'create' && mode != 'edit'}
                                        enableTime={false}
                                        dateFormat="Y-m-d"
                                        initialDateTime={field.value}
                                        onChange={(_selectedDates, dateStr) => field.onChange(dateStr)}
                                        className={`dark:bg-[#454545] w-full shadow-xs border border-gray-300 p-2 text-sm rounded-[5px] hover:cursor-pointer ${mode != 'create' && mode != 'edit' ? 'bg-gray-100' : ''}`}
                                    />
                                )}
                            />
                            {errors.itRequest?.dateRequired && <p className="text-red-500 text-xs mt-1">{errors.itRequest.dateRequired.message}</p>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="itRequest.dateCompleted" className="block text-sm font-medium text-gray-700 mb-1">
                                {t('create.date_required_completed')}<DotRequireComponent />
                            </label>
                            <Controller
                                name="itRequest.dateCompleted"
                                control={control}
                                render={({ field }) => (
                                    <DateTimePicker
                                        disabled={mode != 'create' && mode != 'edit'}
                                        enableTime={false}
                                        dateFormat="Y-m-d"
                                        initialDateTime={field.value}
                                        onChange={(_selectedDates, dateStr) => field.onChange(dateStr)}
                                        className={`dark:bg-[#454545] w-full shadow-xs border border-gray-300 p-2 text-sm rounded-[5px] hover:cursor-pointer ${mode != 'create' && mode != 'edit' ? 'bg-gray-100' : ''}`}
                                    />
                                )}
                            />
                            {errors.itRequest?.dateCompleted && <p className="text-red-500 text-xs mt-1">{errors.itRequest.dateCompleted.message}</p>}
                        </div>
                    </div>

                    <div className="form-group mt-4">
                        <label className="block text-sm font-medium text-gray-700">
                            {t('create.category')}<DotRequireComponent />
                        </label>
                        <Controller
                            name="itRequest.itCategory"
                            control={control}
                            render={({ field }) => (
                                
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {itCategories?.map((item: ITCategoryInterface, idx: number) => {
                                        const checked = field.value?.includes(item?.id ?? -1);
                                        return (
                                            <label
                                                key={idx}
                                                className="w-[48%] flex items-center space-x-2 cursor-pointer select-none"
                                            >
                                                <input
                                                    disabled={mode != 'create'}
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
                        {errors.itRequest?.itCategory && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.itRequest.itCategory.message}
                            </p>
                        )}
                    </div>
                    {
                        shouldShowUpload && (
                            <div className="form-group mt-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    File <DotRequireComponent/><span className="inline-block ml-1 text-red-700 text-xs italic">(5MB)</span>
                                </label>
                                {
                                    mode == 'create' || mode == 'edit' ? (
                                        <>
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
                                                files={localFiles} 
                                                uploadedFiles={uploadedFiles}
                                                onRemove={(index) => {
                                                    const updated = [...localFiles];
                                                    updated.splice(index, 1);
                                                    setLocalFiles(updated);
                                                }}
                                                onRemoveUploaded={(index) => {
                                                    const removed = uploadedFiles[index];
                                                    const updated = [...uploadedFiles];
                                                    updated.splice(index, 1);
                                                    setUploadedFiles(updated);
                                                    setIdDeleteFile((prev) => [...prev, removed.id]);
                                                }}
                                            />
                                        </>
                                    ) : (
                                        <div>
                                            <FileListPreviewDownload onDownload={(file) => {handleDownloadFile(file)}} uploadedFiles={uploadedFiles} isShowCheckbox={false}/>
                                        </div>
                                    )
                                }
                            </div>
                        )
                    }

                    <div className="form-group mt-4">
                        <label htmlFor="itRequest.reason" className="block text-sm font-medium text-gray-700">
                            {tCommon('reason')}<DotRequireComponent />
                        </label>
                        <textarea
                            disabled={mode != 'create' && mode != 'edit'}
                            id="itRequest.reason"
                            {...register('itRequest.reason')}
                            placeholder={tCommon('reason')}
                            rows={6}
                            className={`${errors.itRequest?.reason ? 'border-red-500' : 'border-gray-300'} mt-1 w-full p-2 rounded-md text-sm border ${mode != 'create' && mode != 'edit' ? 'bg-gray-100' : ''}`}
                        ></textarea>
                        {errors.itRequest?.reason && <p className="text-red-500 text-xs mt-1">{errors.itRequest.reason.message}</p>}
                    </div>

                    <div className="form-group mt-4">
                        <label htmlFor="itRequest.priority" className="block text-sm font-medium text-gray-700">
                            {t('create.priority')}
                        </label>
                        <select
                            disabled={mode != 'create' && mode != 'edit'}
                            id="itRequest.priority"
                            {...register('itRequest.priority')}
                            className={`mt-1 w-full p-2 rounded-md text-sm border border-gray-300 ${mode != 'create' && mode != 'edit' ? 'bg-gray-100' : ''}`}
                        >
                            {
                                priorities?.map((item: IPriority, idx: number) => (
                                    <option value={item.id} key={idx}>{lang == 'vi' ? item.name : item.nameE}</option>
                                ))
                            }
                        </select>
                        {errors.itRequest?.priority && <p className="text-red-500 text-xs mt-1">{errors.itRequest.priority.message}</p>}
                    </div>
                </div>
            </div>
            {
                isCreate || isEdit ? (
                    <div className='flex gap-4 justify-end'>
                        <Button
                            type="button"
                            onClick={onCancel}
                            className='px-6 py-2 border bg-white border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer'
                        >
                            {tCommon('cancel')}
                        </Button>
                        <Button
                            disabled={isPending}
                            type='submit'
                            className='px-6 py-2 bg-black border border-transparent rounded-md text-sm font-medium text-white cursor-pointer'
                        >
                            {isPending ? <Spinner size="small" className='text-white'/> : tCommon('save')}
                        </Button>
                    </div>
                ) : (<></>)
            }            
        </form>
    )
}

export default ITRequestForm;