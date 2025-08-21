import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@/components/ComponentCustom/Flatpickr';
import { Button } from '@/components/ui/button';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import priorityApi, { IPriority } from '@/api/priorityApi';
import itCategoryApi, { ITCategoryInterface } from '@/api/itCategoryApi';
import { useEffect, useRef, useState } from 'react';
import DotRequireComponent from '@/components/DotRequireComponent';
import { getErrorMessage, ShowToast } from '@/lib';
import { useAuthStore } from '@/store/authStore';
import itFormApi, { CreateITFormRequest, ITFormCategory, useCreateITForm, useUpdateITForm } from '@/api/itFormApi';
import { useNavigate, useParams } from 'react-router-dom';
import ModalConfirm from '@/components/ModalConfirm';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const DetailWaitApprovalFormIT = () => {
    const { t } = useTranslation();
    const { t: tCommon  } = useTranslation('common');
    const { user } = useAuthStore()
    const lang = useTranslation().i18n.language.split('-')[0]
    const previousUserCodeValueRef = useRef('');
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { id } = useParams<{ id: string }>();
    const isApproval = !!id;
    const [statusModalConfirm, setStatusModalConfirm] = useState('')
    const [note, setNote] = useState("")
    
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
            priority: z.coerce.number()
        })
    });

    type ITRequestState = z.infer<typeof ITRequestFormSchema>;
    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        setValue
    } = useForm<ITRequestState>({
        resolver: zodResolver(ITRequestFormSchema),
        defaultValues: {
            requester: {
                userCode: '',
                name: '',
                email: '',
                department: '',
                departmentId: -1,
                orgPositionId: user?.orgPositionId
            },
            itRequest: {
                dateRequired: new Date().toISOString().split('T')[0],
                dateCompleted: new Date().toISOString().split('T')[0],
                itCategory: [],
                reason: '',
                priority: 1,
            }
        },
    });

    const createItForm = useCreateITForm()
    const updateItForm = useUpdateITForm()
    const onSubmit: SubmitHandler<ITRequestState> = async (data) => {
        
        const payload: CreateITFormRequest = {
            UserCodeRequestor: data.requester.userCode,
            UserNameRequestor: data.requester.name,
            UserCodeCreated: user?.userCode,
            UserNameCreated: user?.userName ?? '',
            DepartmentId: data.requester.departmentId,
            Email: data.requester.email,
            Position: data.requester.position,
            Reason: data.itRequest.reason,
            PriorityId: data.itRequest.priority,
            OrgPositionId: user?.orgPositionId ?? 0,
            ITCategories: data.itRequest.itCategory,
            RequestDate: data.itRequest.dateRequired, 
            RequiredCompletionDate: data.itRequest.dateCompleted
        };

        if (isApproval) {
            await updateItForm.mutateAsync({id: id, data: payload})
        }
        else {
            await createItForm.mutateAsync(payload)
        }

        navigate("/form-it")
        queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });
    };

    const { data: priorities = [] } = useQuery({
        queryKey: ['get-all-priority'],
        queryFn: async () => {
            const res = await priorityApi.getAll()
            return res.data.data
        },
    });

    const { data: ItCategories = [] } = useQuery({
        queryKey: ['get-all-it-category'],
        queryFn: async () => {
            const res = await itCategoryApi.getAll()
            return res.data.data
        },
    });


    useEffect(() => {
        if (id) {
            const fetchData = async () => {
                try {
                    const data = await itFormApi.getById(id);
                    const result = data.data.data;
                    previousUserCodeValueRef.current = result.userCodeRequestor;
                    const idsCategories = result?.itFormCategories?.map((item: ITFormCategory) => item.itCategory.id)
                    setValue('requester.userCode', result?.userCodeRequestor, { shouldValidate: true })
                    setValue('requester.name', result?.userNameRequestor, { shouldValidate: true })
                    setValue('requester.department', result?.orgUnit.name, { shouldValidate: true })
                    setValue('requester.departmentId', result?.orgUnit.id, { shouldValidate: true })
                    setValue('requester.email', result?.email ?? '', { shouldValidate: true })
                    setValue('requester.position', result?.position ?? '', { shouldValidate: true })
                    setValue('itRequest.dateRequired', result?.requestDate ?? '', { shouldValidate: true })
                    setValue('itRequest.dateCompleted', result?.requiredCompletionDate ?? '', { shouldValidate: true })
                    setValue('itRequest.itCategory', idsCategories, { shouldValidate: true })
                    setValue('itRequest.reason', result?.reason ?? '', { shouldValidate: true })
                    setValue('itRequest.priority', result?.priority.id ?? '', { shouldValidate: true })
                } catch (err) {
                    ShowToast(getErrorMessage(err), "error")
                }
            };
            fetchData();
        }
    }, [id, setValue])

    const handleSaveModalConfirm = async (type: string) => {
        alert(type)
        // const payload = {
        //     UserCodeApproval: user?.userCode,
        //     UserNameApproval: user?.userName ?? "",
        //     OrgPositionId: user?.orgPositionId,
        //     Status: type == 'approval' ? true : false,
        //     Note: note,
        //     LeaveRequestId: id,
        //     urlFrontend: window.location.origin,
        //     RequestTypeId: leaveRequest?.applicationForm?.requestTypeId
        // }

        // try {
        //     if (isHrAndHRPermissionMngLeaverqAndLeaveIsWaitHR) {
        //         await registerAllLeaveMutation.mutateAsync({
        //             UserCode: user?.userCode,
        //             UserName: user?.userName ?? "",
        //             leaveRequestIds: [id ?? ""]
        //         })
        //         setStatusModalConfirm('')
        //         navigate("/approval/pending-approval")
        //         queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });
        //     }
        //     else {
        //         await approval.mutateAsync(payload)
        //         setStatusModalConfirm('')
        //         navigate("/approval/pending-approval")
        //         queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });
        //     }

        // } catch (err) {
        //     console.log(err);
        // }
    }

    return (
        <div className="p-1 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0">{isApproval ? 'Cập nhật' : t('create.title')}</h3>
                <Button onClick={() => navigate("/form-it")} className="w-full md:w-auto hover:cursor-pointer">
                    Danh sách đã tạo
                </Button>
            </div>

            <ModalConfirm
                type={statusModalConfirm}
                isOpen={statusModalConfirm != ''}
                onClose={() => setStatusModalConfirm('')}
                onSave={handleSaveModalConfirm}
            />

            <div className="flex min-h-screen">
                <div className="w-full max-w-3xl bg-white rounded-xl pl-0">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
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
                                            disabled
                                            {...register('requester.userCode')}
                                            type="text"
                                            id="requester.userCode"
                                            placeholder={tCommon('usercode')}
                                            className={`${errors.requester?.userCode ? 'border-red-500' : 'border-gray-300'} bg-gray-100 mt-1 w-full p-2 rounded-md text-sm border select-none`}
                                        />
                                        {errors.requester?.userCode && <p className="text-red-500 text-xs mt-1">{errors.requester.userCode.message}</p>}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="requester.name" className="block text-sm font-medium text-gray-700">
                                            {tCommon('name')}<DotRequireComponent />
                                        </label>
                                        <input
                                            {...register('requester.name')}
                                            disabled
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
                                            disabled
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
                                            disabled
                                            {...register('requester.position')}
                                            type="text"
                                            id="requester.position"
                                            placeholder={t('create.position')}
                                            className={`${errors.requester?.position ? 'border-red-500' : 'border-gray-300'} bg-gray-100 mt-1 w-full p-2 rounded-md text-sm border`}
                                        />
                                        {errors.requester?.position && <p className="text-red-500 text-xs mt-1">{errors.requester.position.message}</p>}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="requester.email" className="block text-sm font-medium text-gray-700">
                                            Email<DotRequireComponent />
                                        </label>
                                        <input
                                            disabled
                                            {...register('requester.email')}
                                            type="email"
                                            id="requester.email"
                                            placeholder="email@vsvn.com.vn"
                                            className={`${errors.requester?.email ? 'border-red-500' : 'border-gray-300'} bg-gray-100 mt-1 w-full p-2 rounded-md text-sm border`}
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
                                                    disabled={true}
                                                    enableTime={false}
                                                    dateFormat="Y-m-d"
                                                    initialDateTime={field.value}
                                                    onChange={(_selectedDates, dateStr) => field.onChange(dateStr)}
                                                    className={`dark:bg-[#454545] w-full shadow-xs border border-gray-300 bg-gray-100 p-2 text-sm rounded-[5px] hover:cursor-pointer`}
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
                                                    disabled={true}
                                                    enableTime={false}
                                                    dateFormat="Y-m-d"
                                                    initialDateTime={field.value}
                                                    onChange={(_selectedDates, dateStr) => field.onChange(dateStr)}
                                                    className={`dark:bg-[#454545] w-full shadow-xs border border-gray-300 bg-gray-100 p-2 text-sm rounded-[5px] hover:cursor-pointer`}
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
                                                {ItCategories?.map((item: ITCategoryInterface, idx: number) => {
                                                    const checked = field.value?.includes(item?.id ?? -1);
                                                    return (
                                                        <label
                                                            key={idx}
                                                            className="w-[48%] flex items-center space-x-2 cursor-pointer select-none"
                                                        >
                                                            <input
                                                                disabled
                                                                type="checkbox"
                                                                value={item.id}
                                                                checked={checked}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        field.onChange([...field.value, item.id]); // thêm vào mảng
                                                                    } else {
                                                                        field.onChange(
                                                                            field.value.filter((val: number) => val !== item.id) // bỏ khỏi mảng
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

                                <div className="form-group mt-4">
                                    <label htmlFor="itRequest.reason" className="block text-sm font-medium text-gray-700">
                                        {tCommon('reason')}<DotRequireComponent />
                                    </label>
                                    <textarea
                                        disabled
                                        id="itRequest.reason"
                                        {...register('itRequest.reason')}
                                        placeholder={tCommon('reason')}
                                        rows={4}
                                        className={`${errors.itRequest?.reason ? 'border-red-500' : 'border-gray-300'} bg-gray-100 mt-1 w-full p-2 rounded-md text-sm border`}
                                    ></textarea>
                                    {errors.itRequest?.reason && <p className="text-red-500 text-xs mt-1">{errors.itRequest.reason.message}</p>}
                                </div>

                                <div className="form-group mt-4">
                                    <label htmlFor="itRequest.priority" className="block text-sm font-medium text-gray-700">
                                        {t('create.priority')}
                                    </label>
                                    <select
                                        disabled
                                        id="itRequest.priority"
                                        {...register('itRequest.priority')}
                                        className="mt-1 w-full p-2 rounded-md text-sm border border-gray-300 bg-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
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
                    </form>
                </div>
                <div className='pl-5 border-l-1 ml-5 w-full'>
                    <div className="flex justify-end flex-col gap-4 mt-8">
                        <div className='flex-1'>
                            <div className='w-full'>
                                <Label className='mb-1'>{t('note')}</Label>
                                <Textarea placeholder='Note' value={note} onChange={(e) => setNote(e.target.value)} className="border-gray-300"/>
                            </div>
                        </div>
                        <div>
                            <Label className='mb-1'>{t('asssigned')}</Label>
                            <div className="form-group mt-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    {t('create.category')}<DotRequireComponent />
                                </label>
                                <Controller
                                    name="itRequest.itCategory"
                                    control={control}
                                    render={({ field }) => (
                                        
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {ItCategories?.map((item: ITCategoryInterface, idx: number) => {
                                                const checked = field.value?.includes(item?.id ?? -1);
                                                return (
                                                    <label
                                                        key={idx}
                                                        className="w-[48%] flex items-center space-x-2 cursor-pointer select-none"
                                                    >
                                                        <input
                                                            disabled
                                                            type="checkbox"
                                                            value={item.id}
                                                            checked={checked}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    field.onChange([...field.value, item.id]); // thêm vào mảng
                                                                } else {
                                                                    field.onChange(
                                                                        field.value.filter((val: number) => val !== item.id) // bỏ khỏi mảng
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
                        </div>
                        <div className='flex justify-end'>
                            <Button
                                onClick={() => setStatusModalConfirm('approval')}
                                className="px-4 py-2 mr-2 bg-blue-700 text-white rounded-[3px] shadow-lg hover:bg-blue-800 hover:shadow-xl transition-all duration-200 text-base hover:cursor-pointer"
                            >
                                {t('approval')}
                            </Button>
                            <Button
                                onClick={() => setStatusModalConfirm('reject')}
                                className="flex items-center justify-center hover:cursor-pointer px-8 py-4 bg-red-600 text-white rounded-[3px] shadow-lg hover:bg-red-700 hover:shadow-xl transform transition-all duration-200 text-base"
                            >
                                {t('reject')}
                        </Button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailWaitApprovalFormIT;
