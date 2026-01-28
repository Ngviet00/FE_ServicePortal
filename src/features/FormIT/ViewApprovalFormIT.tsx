/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import itFormApi, { useApprovalITForm, useApproveITPurchaseRequestForm, useAssignedTaskITForm, useConfirmITPurchaseRequirement, useResolvedTaskITForm } from '@/api/itFormApi';
import { Link, useNavigate } from 'react-router-dom';
import itCategoryApi, { ITCategoryInterface } from '@/api/itCategoryApi';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import DotRequireComponent from '@/components/DotRequireComponent';
import { useEffect, useState } from 'react';
import DateTimePicker from '@/components/ComponentCustom/Flatpickr';
import { handleDownloadFile, RequestTypeEnum, ShowToast, StatusApplicationFormEnum, ViewApprovalProps } from '@/lib';
import { FileListPreviewDownload } from '@/components/ComponentCustom/FileListPreviewMemoNotify';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ITFormSchema, ITRequestState } from './CreateFormIT';
import ModalConfirm from '@/components/ModalConfirm';
import HistoryApproval from '../Approval/Components/HistoryApproval';
import { ISelectedUserAssigned } from '@/api/userApi';

const ViewApprovalFormIT = ({id, mode}: ViewApprovalProps) => {
    const { t } = useTranslation('formIT');
    const { t: tCommon  } = useTranslation('common')
    const lang = useTranslation().i18n.language.split('-')[0]
    const { user } = useAuthStore()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const hasId = !!id;
    const [statusModalConfirm, setStatusModalConfirm] = useState('')
    const [note, setNote] = useState('')
    const [selectedUserAssigned, setSelectedUserAssigned] = useState<ISelectedUserAssigned[]>([]);

    const {
        register,
        formState: { errors },
        control,
        reset,
        watch,
        getValues 
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
            attachmentsUploaded: [],
            actualCompletionDate: new Date().toISOString().split('T')[0],
            targetCompletionDate: new Date().toISOString().split('T')[0],
        },
    });
    
    const { data: formData, isLoading: isFormDataLoading } = useQuery({
        queryKey: ['itForm', id],
        queryFn: async () => {
            const res = await itFormApi.getById(id ?? '');
            return res.data.data;
        },
        enabled: hasId,
    });
    
    const { data: ItMembers = [] } = useQuery({
        queryKey: ['get-all-it-member'],
        queryFn: async () => {
            const res = await itFormApi.getMemberITAssigned()
            return res.data.data
        }
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
                attachmentsUploaded: formData?.itForm?.files,
                attachmentQuoteApplicationFormUpload: formData?.itForm?.applicationForm?.files,
                actualCompletionDate: formData?.itForm?.actualCompletionDate ?? new Date().toISOString().split('T')[0],
                targetCompletionDate: formData?.itForm?.targetCompletionDate ?? new Date().toISOString().split('T')[0],
            })
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

    const attachmentsUploaded = watch('attachmentsUploaded');

    const itCategory = watch("itCategory");
    const shouldShowUpload = itCategory?.some((id: number) => [1, 2, 5].includes(id));

    const approvalFormIT = useApprovalITForm()
    const assignFormIT = useAssignedTaskITForm()
    const resolvedFormIT = useResolvedTaskITForm()
    const confirmITPurchase = useConfirmITPurchaseRequirement()
    const approvalITPurchase = useApproveITPurchaseRequestForm()

    const handleSaveModalConfirm = async (type: string) => {
        const { targetCompletionDate, actualCompletionDate } = getValues();
        const payload = {
            UserCodeApproval: user?.userCode,
            UserNameApproval: user?.userName ?? "",
            OrgPositionId: user?.orgPositionId,
            Status: type == 'approval' ? true : false,
            Note: note,
            applicationFormId: formData?.itForm?.applicationForm?.id,
            RequestTypeId: formData?.itForm?.applicationForm?.requestTypeId,
            RequestStatusId: formData?.itForm?.applicationForm?.requestStatusId,
            UserAssignedTasks: selectedUserAssigned ?? [],
            TargetCompletionDate: targetCompletionDate ?? '',
            ActualCompletionDate: actualCompletionDate ?? ''
        }

        setStatusModalConfirm('')

        try {
            if (type == 'approval_purchase_request') {
                
                await approvalITPurchase.mutateAsync({
                    applicationFormId: formData?.itForm?.applicationForm?.id,
                    userCodeApproval: user?.userCode ?? '',
                    userNameApproval: user?.userName ?? '',
                    note: note
                })
                navigate('/approval/wait-confirm')
                queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });
            }
            if (type == 'confirm_purchase_request') {
                const fd = new FormData()
                fd.append('ApplicationFormId', String(formData?.itForm?.applicationForm?.id))
                fd.append('UserCodeApproval', user?.userCode ?? '')
                fd.append('UserNameApproval', user?.userName ?? '')
                fd.append('Note', note)

                await confirmITPurchase.mutateAsync(fd)
                navigate('/approval/assigned-tasks')
                queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });
            }
            if (type == 'resolved') {
                await resolvedFormIT.mutateAsync(payload);

                if (formData?.itForm?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Assigned) {
                    navigate('/approval/assigned-tasks')
                } else {
                    navigate('/form-it/list-item-wait-form-purchase')
                }
                queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });
            }
            else if (type == 'assigned') {
                if (selectedUserAssigned.length <= 0) {
                    ShowToast(lang == 'vi' ? 'Chọn 1 thành viên để thực hiện yêu cầu này' : 'Please select at least one person to this task', 'error')
                    return
                }
                await assignFormIT.mutateAsync(payload)
                navigate('/approval/pending-approval')
                queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });
            }
            else if (type == 'reject' || type == 'approval'){
                await approvalFormIT.mutateAsync(payload)
                navigate("/approval/pending-approval")
                queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });
            }
        } catch (err) {
            console.log(err);
        }
    }

    const handleCheckboxChangeUserAssigned = (event: React.ChangeEvent<HTMLInputElement>, item: {nvMaNV: string, nvHoTen: string, email: string}) => {
        const isChecked = event.target.checked;
        if (isChecked) {
            setSelectedUserAssigned(prevSelected => [...prevSelected, { userCode: item.nvMaNV, userName: item.nvHoTen, email: item.email }]);
        } else {
            setSelectedUserAssigned(prevSelected => prevSelected.filter(u => u.userCode !== item.nvMaNV));
        }
    };
        
    if (hasId && isFormDataLoading) {
        return <div>{lang === 'vi' ? 'Đang tải dữ liệu...' : 'Loading data...'}</div>;
    }

    if (hasId && !formData) {
        return  <div className='text-red-700 font-semibold'>{lang == 'vi' ? 'Không tìm thấy dữ liệu' : 'Not found data'}</div>;
    }

    return (
        <div className="p-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0">Form IT</h3>
            </div>
 
            {
                formData?.itForm?.applicationForm?.reference != null && 
                <div className="mb-4 mt-2 text-base text-black bg-orange-200 p-2 rounded">
                    <span>
                        {lang == 'vi'
                            ? 'Đơn IT liên kết với đơn mua hàng'
                            : 'The IT order linked to purchase order'}:{' '}
                        <Link
                            className="text-purple-600 font-bold underline"
                            to={`/view/${formData?.itForm?.applicationForm?.reference?.code}?requestType=${RequestTypeEnum.Purchase}`}
                        >
                            {formData?.itForm?.applicationForm?.reference?.code}
                        </Link>
                    </span>
                </div>
            }

            <ModalConfirm
                type={statusModalConfirm}
                isOpen={statusModalConfirm != ''}
                onClose={() => setStatusModalConfirm('')}
                onSave={handleSaveModalConfirm}
            />

            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full max-w-3xl bg-white rounded-xl pl-0">
                    <div className="flex flex-col gap-6">
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
                                            {...register('userCode')}
                                            disabled
                                            type="text"
                                            id="userCode"
                                            placeholder={tCommon('usercode')}
                                            className={`${errors?.userCode ? 'border-red-500 bg-red-50' : 'border-gray-300'} bg-gray-50 mt-1 w-full p-2 rounded-md text-sm border select-none`}
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
                                            className={`${errors?.userName ? 'border-red-500 bg-red-50' : 'border-gray-300'} bg-gray-50 mt-1 w-full p-2 rounded-md text-sm border`}
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
                                            disabled
                                            {...register('position')}
                                            type="text"
                                            id="position"
                                            placeholder={t('create.position')}
                                            className={`${errors?.position ? 'border-red-500 bg-red-50' : 'border-gray-300'} bg-gray-50 mt-1 w-full p-2 rounded-md text-sm border`}
                                        />
                                    </div>
            
                                    <div className="form-group">
                                        <label htmlFor="requester.email" className="block text-sm font-medium text-gray-700">
                                            Email<DotRequireComponent />
                                        </label>
                                        <input
                                            {...register('email')}
                                            type="email"
                                            disabled
                                            id="email"
                                            placeholder="email@vsvn.com.vn"
                                            className={`${errors?.email ? 'border-red-500 bg-red-50' : 'border-gray-300'} bg-gray-50 mt-1 w-full p-2 rounded-md text-sm border`}
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
                                                    disabled
                                                    enableTime={false}
                                                    dateFormat="Y-m-d"
                                                    initialDateTime={field.value}
                                                    onChange={(_selectedDates, dateStr) => field.onChange(dateStr)}
                                                    className={`dark:bg-[#454545] w-full shadow-xs border border-gray-300 p-2 bg-gray-50 text-sm rounded-[5px] hover:cursor-pointer`}
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
                                                    disabled
                                                    dateFormat="Y-m-d"
                                                    initialDateTime={field.value}
                                                    onChange={(_selectedDates, dateStr) => field.onChange(dateStr)}
                                                    className={`dark:bg-[#454545] w-full shadow-xs border border-gray-300 p-2 bg-gray-50 text-sm rounded-[5px] hover:cursor-pointer`}
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
                                                                disabled
                                                                checked={checked}
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
                                            <FileListPreviewDownload 
                                                key={attachmentsUploaded?.length || 0}
                                                onDownload={(file) => {handleDownloadFile(file)}} 
                                                uploadedFiles={attachmentsUploaded} isShowCheckbox={false}
                                            />
                                        </div>
                                    )
                                }
            
                                <div className="form-group mt-4">
                                    <label htmlFor="itRequest.reason" className="block text-sm font-medium text-gray-700">
                                        {tCommon('reason')}<DotRequireComponent />
                                    </label>
                                    <textarea
                                        id="itRequest.reason"
                                        disabled
                                        {...register('reason')}
                                        placeholder={tCommon('reason')}
                                        rows={4}
                                        className={`${errors?.reason ? 'border-red-500 bg-red-50' : 'border-gray-300'} bg-gray-100 mt-1 w-full p-2 rounded-md text-sm border`}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                        <div className="mb-0">
                            <span className="font-bold text-black">
                                {lang === 'vi' ? 'Quy trình' : 'Approval flow'}:
                            </span>{' '}
                            {formData?.defineAction
                                .map((item: any, idx: number) => (
                                    <span key={idx} className="font-bold text-orange-700">
                                        ({idx + 1}) {item?.Name ?? item?.UserCode ?? (item?.StepOrder == 3 ? 'Admin' : 'HR')}
                                        {idx < formData?.defineAction?.length - 1 ? ', ' : ''}
                                    </span>
                                ))}
                        </div>
                    </div>
                </div>
                <div className="w-full md:pl-5 md:border-l border-gray-200 flex flex-col gap-2">
                    <div className="w-full">
                        <Label className="mb-1">
                            {t('create.note')}{" "}
                        </Label>
                        <Textarea
                            placeholder={t('create.note')}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="border-gray-300 w-full"
                        />
                    </div>
                    {
                        (formData?.defineAssigned?.length > 0 || (mode != 'view' && formData?.itForm?.applicationForm?.requestStatusId == StatusApplicationFormEnum.FinalApproval))
                            && 
                            <label className="block text-sm font-medium text-gray-700 mb-0">
                                {lang == 'vi' ? 'Được giao cho' : 'Assigned to'}<DotRequireComponent />
                            </label>
                    }
                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 mt-1">
                        {
                            formData?.defineAssigned?.length > 0 ? (
                                formData?.defineAssigned?.map((item: any, idx: number) => (
                                    <label
                                        key={idx}
                                        className="flex cursor-pointer"
                                    >
                                        <span>
                                            <strong>({item.UserCode})</strong> {item.UserName}
                                        </span>
                                    </label>
                                ))
                            ) :
                            mode != 'view' && formData?.itForm?.applicationForm?.requestStatusId == StatusApplicationFormEnum.FinalApproval 
                            ? (
                                ItMembers?.map((item: {nvMaNV: string, nvHoTen: string, email: string}, idx: number) => (
                                    <label
                                        key={idx}
                                        className="flex items-center space-x-2 cursor-pointer w-full sm:w-[48%] select-none"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedUserAssigned.some(
                                                (e) => e.userCode == item.nvMaNV
                                            )}
                                            value={item.nvMaNV}
                                            className="border-gray-300 scale-[1.4] accent-black"
                                            onChange={(e) =>
                                                handleCheckboxChangeUserAssigned(e, item)
                                            }
                                        />
                                        <span>
                                            <strong>({item.nvMaNV})</strong> {item.nvHoTen}
                                        </span>
                                    </label>
                                ))
                            ) : (null)
                        }
                    </div>
                    {
                        (
                            (formData?.itForm?.targetCompletionDate != null && formData?.itForm?.actualCompletionDate != null) ||
                            (mode != 'view' && formData?.itForm?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Assigned ) ||
                            (formData?.purchase?.purchaseOrder && mode != 'view' && formData?.itForm?.applicationForm?.requestStatusId != StatusApplicationFormEnum.Complete)
                        )
                        && 
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t("create.target_completion_date")}
                                    <DotRequireComponent />
                                </label>
                                <Controller
                                    name="targetCompletionDate"
                                    control={control}
                                    render={({ field }) => (
                                        <DateTimePicker
                                            disabled={mode == 'view' || formData?.itForm?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Complete}
                                            key="target_date"
                                            enableTime={false}
                                            dateFormat="Y-m-d"
                                            initialDateTime={field.value ?? new Date().toISOString().split("T")[0]}
                                            onChange={(_selectedDates, dateStr) => field.onChange(dateStr)}
                                            className={`dark:bg-[#454545] w-full shadow-xs border border-gray-300 p-2 text-sm rounded-[5px] hover:cursor-pointer 
                                                ${mode == 'view' || formData?.itForm?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Complete ? 'bg-gray-100' : ''}`
                                            }
                                        />
                                    )}
                                />
                            </div>

                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t("create.actual_completion_date")}
                                    <DotRequireComponent />
                                </label>
                                <Controller
                                    name="actualCompletionDate"
                                    control={control}
                                    render={({ field }) => (
                                        <DateTimePicker
                                            disabled={mode == 'view' || formData?.itForm?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Complete}
                                            key="actual_date"
                                            enableTime={false}
                                            dateFormat="Y-m-d"
                                            initialDateTime={field.value ?? new Date().toISOString().split("T")[0]}
                                            onChange={(_selectedDates, dateStr) => field.onChange(dateStr)}
                                            className={`dark:bg-[#454545] w-full shadow-xs border border-gray-300 p-2 text-sm rounded-[5px] hover:cursor-pointer 
                                                ${mode == 'view' || formData?.itForm?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Complete ? 'bg-gray-100' : ''}`
                                            }
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    }
                    
                    <div className="flex justify-end">
                        {
                            formData?.purchase?.purchaseOrder && mode != 'view' && formData?.itForm?.applicationForm?.requestStatusId != StatusApplicationFormEnum.Complete ?
                            (
                                 <button
                                    onClick={() => setStatusModalConfirm('resolved')}
                                    disabled={assignFormIT.isPending}
                                    className="mr-2 cursor-pointer w-full sm:w-auto py-3 px-4 bg-blue-600 text-white font-semibold rounded-sm shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm tracking-wide uppercase disabled:bg-gray-400"
                                >
                                    {lang == 'vi' ? 'Đóng' : 'Closed'}
                                </button>
                            ) : 
                            formData?.itForm?.applicationForm?.requestStatusId == StatusApplicationFormEnum.WaitConfirm && mode != 'view' ?
                            (
                                formData?.defineAction?.find((e: any) => e.StepOrder == formData?.defineInstance?.currentStep)?.UserCode == (user?.userCode ?? '') &&
                                    (
                                        formData?.defineAction?.find((e: any) => e.StepOrder == formData?.defineInstance?.currentStep)?.IsFinal == false ? 
                                        <button
                                            onClick={() => setStatusModalConfirm('approval_purchase_request')}
                                            disabled={approvalITPurchase.isPending}
                                            className="mr-2 cursor-pointer w-full sm:w-auto py-3 px-4 bg-blue-600 text-white font-semibold rounded-sm shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm tracking-wide uppercase disabled:bg-gray-400"
                                        >
                                            {lang == 'vi' ? 'Xác nhận' : 'Confirm'}
                                        </button>
                                        :
                                        <Link
                                            to={`/purchase/create?applicationFormCode=${formData?.itForm?.applicationForm?.code}`}
                                            className="px-4 py-2 sm:ml-2 bg-orange-600 text-white rounded-[3px] shadow-lg hover:bg-orange-700 transition-all duration-200 text-base hover:cursor-pointer"
                                        >
                                            {lang == "vi"
                                                ? "Tạo đơn mua bán"
                                                : "Create Purchase Request"}
                                        </Link>
                                    )
                            )
                            : formData?.itForm?.applicationForm?.requestStatusId == StatusApplicationFormEnum.FinalApproval ?
                            (
                                mode != 'view' &&
                                    <button
                                        onClick={() => setStatusModalConfirm('assigned')}
                                        disabled={assignFormIT.isPending}
                                        className="mr-2 cursor-pointer w-full sm:w-auto py-3 px-4 bg-blue-600 text-white font-semibold rounded-sm shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm tracking-wide uppercase disabled:bg-gray-400"
                                    >
                                        {lang == 'vi' ? 'Giao việc' : 'Assigned task'}
                                    </button>
                            )
                            : formData?.itForm?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Assigned ?
                            (
                                mode != 'view' &&
                                (
                                    <div>
                                        <button
                                            onClick={() => setStatusModalConfirm('confirm_purchase_request')}
                                            disabled={confirmITPurchase.isPending}
                                            className="mr-2 cursor-pointer w-full sm:w-auto py-3 px-4 bg-orange-600 text-white font-semibold rounded-sm shadow-lg hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm tracking-wide uppercase disabled:bg-gray-400"
                                        >
                                            {lang == 'vi' ? 'Yêu cầu đơn mua bán' : 'Purchase Request'}
                                        </button>
                                        <button
                                            onClick={() => setStatusModalConfirm('resolved')}
                                            disabled={assignFormIT.isPending}
                                            className="mr-2 cursor-pointer w-full sm:w-auto py-3 px-4 bg-blue-600 text-white font-semibold rounded-sm shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm tracking-wide uppercase disabled:bg-gray-400"
                                        >
                                            {lang == 'vi' ? 'Đóng' : 'Closed'}
                                        </button>
                                    </div>
                                )
                            ) : [StatusApplicationFormEnum.Complete, StatusApplicationFormEnum.Reject].includes(formData?.itForm?.applicationForm?.requestStatusId) ? (null) : (
                                    mode != 'view' && <>
                                    <button
                                        onClick={() => setStatusModalConfirm('reject')}
                                        disabled={approvalFormIT.isPending}
                                        className="mr-2 cursor-pointer w-full sm:w-auto py-3 px-5 bg-red-600 text-white font-semibold rounded-sm shadow-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm tracking-wide uppercase disabled:bg-gray-400"
                                    >
                                        {lang == 'vi' ? 'Từ chối' : 'Reject'}
                                    </button>
                                    {
                                        <button
                                            onClick={() => setStatusModalConfirm('approval')}
                                            disabled={approvalFormIT.isPending}
                                            className="cursor-pointer w-full sm:w-auto py-3 px-5 bg-blue-600 text-white font-semibold rounded-sm shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-base tracking-wide uppercase disabled:bg-gray-400"
                                        >
                                            {lang == 'vi' ? 'Duyệt đơn' : 'Approval'}
                                        </button>
                                    }
                                </>
                            )
                        }
                    </div>
                    <HistoryApproval historyApplicationForm={formData?.itForm?.applicationForm?.historyApplicationForms}/>
                </div>
            </div>
        </div>
    );
};

export default ViewApprovalFormIT;
