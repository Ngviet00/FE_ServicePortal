import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ModalConfirm from '@/components/ModalConfirm';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { ShowToast, StatusApplicationFormEnum } from '@/lib';
import DateTimePicker from '@/components/ComponentCustom/Flatpickr';
import { Spinner } from '@/components/ui/spinner';
import HistoryApproval from '@/features/Approval/Components/HistoryApproval';
import { ResignationFormSchema, TResignationForm } from './CreateResignation';
import resignationLetterApi, { useApprovalResignationLetter, useAssignedTasResignationLetter, useExportExcelResignation, useResolvedTaskResignationLetter } from '@/api/HR/resignationLetterApi';
import DotRequireComponent from '@/components/DotRequireComponent';
import warningLetterApi from '@/api/HR/warningLetterApi';
import { ISelectedUserAssigned } from '@/api/userApi';

interface ViewApprovalTerminationLetterProps {
    id: string;
    mode?: string
}

const ViewApprovalRegisnation: React.FC<ViewApprovalTerminationLetterProps> = ({id, mode}) => {
    const { t } = useTranslation('hr')
    const user = useAuthStore(u => u.user)
    const lang = useTranslation().i18n.language.split('-')[0]
    const navigate = useNavigate()
    const [note, setNote] = useState("")
    const [statusModalConfirm, setStatusModalConfirm] = useState('')
    const queryClient = useQueryClient()
    const [selectedUserAssigned, setSelectedUserAssigned] = useState<ISelectedUserAssigned[]>([]);

    const { 
        register,
        watch, 
        formState: { errors },
        setValue, 
        getValues,
        reset
    } = useForm<TResignationForm>({
        resolver: zodResolver(ResignationFormSchema),
        defaultValues: {
            userCode: '',
            userName: '',
            department: '',
            departmentId: 0, 
            orgPositionId: 0,
            position: '',
            unit: '',
            dateJoinCompany: new Date().toISOString().split("T")[0],
            lastWorkingDate: new Date().toISOString().split("T")[0],
            reasons: {
                reason_parent3_checked: false,
                reason_parent4_checked: false,
                reason_contractExpired: false,
                reason_notContract: false,
                reason_sick: false,
                reason_newJob: false,
                reason_study: false,
                reason_goHome: false,
                reason_family: false,
                reason_unsuitable: false,
                reason_poorBenefits: false,
                reason_highPressure: false,
                reason_poorEnvironment: false,
                reason_lowSalary: false,
                reason_note: ''
            },
            handover: {
                handover_uniform: false,
                handover_id_card: false,
                handover_other_checked: false,
                handover_other1: '',
                handover_other2: '',
                handover_other3: '',
            }
        }
    });

    const isEdit = !!id;

    const { data: formDataDetail, isLoading: isLoadingFormDataDetail } = useQuery({
        queryKey: ['resignation-letter-detail', id],
        queryFn: async () => {
            try {
                const res = await resignationLetterApi.getByApplicationFormCode(id ?? '');
                return res.data.data;
            } catch {
                return
            }
        },
        enabled: isEdit,
    });

    useEffect(() => {
        if (formDataDetail) {
            const handOverParse = JSON.parse(formDataDetail?.resignationLetter?.handOver ?? "{}");
            const reasonParse = JSON.parse(formDataDetail?.resignationLetter?.reason ?? "{}");

            reset({
                userCode: formDataDetail?.resignationLetter?.userCode ?? '',
                userName: formDataDetail?.resignationLetter?.userName ?? '',
                department: formDataDetail?.resignationLetter?.departmentName ?? '',
                departmentId: formDataDetail?.resignationLetter?.departmentId ?? 0,
                position: formDataDetail?.resignationLetter?.position ?? '',
                unit: formDataDetail?.resignationLetter?.unit ?? '',
                dateJoinCompany: formDataDetail?.resignationLetter?.dateJoinCompany,
                lastWorkingDate: formDataDetail?.resignationLetter?.lastWorkingDate,
                reasons: {
                    reason_contractExpired: reasonParse?.reason_contractExpired,
                    reason_notContract: reasonParse?.reason_notContract,
                    reason_sick: reasonParse?.reason_sick,
                    reason_newJob: reasonParse?.reason_newJob,
                    reason_study: reasonParse?.reason_study,
                    reason_goHome: reasonParse?.reason_goHome,
                    reason_family: reasonParse?.reason_family,
                    reason_unsuitable: reasonParse?.reason_unsuitable,
                    reason_poorBenefits: reasonParse?.reason_poorBenefits,
                    reason_highPressure: reasonParse?.reason_highPressure,
                    reason_poorEnvironment: reasonParse?.reason_poorEnvironment,
                    reason_lowSalary: reasonParse?.reason_lowSalary,
                    reason_note: reasonParse?.reason_note,
                },
                handover: {
                    handover_uniform: handOverParse?.handover_uniform,
                    handover_id_card: handOverParse?.handover_id_card,
                    handover_other_checked: handOverParse?.handover_other_checked,
                    handover_other1: handOverParse?.handover_other1,
                    handover_other2: handOverParse?.handover_other2,
                    handover_other3: handOverParse?.handover_other3,
                }
            });
        }
    }, [formDataDetail, reset])
    
    const handoverOtherChecked = watch("handover.handover_other_checked");

    const approvalResignationLetter = useApprovalResignationLetter()
    const resolvedTask = useResolvedTaskResignationLetter()
    const assignResignationLetter = useAssignedTasResignationLetter()

    const handleSaveModalConfirm = async (type: string) => {
        setStatusModalConfirm('')
        const payload = {
            RequestTypeId: formDataDetail?.resignationLetter?.applicationForm?.requestTypeId,
            RequestStatusId: formDataDetail?.resignationLetter?.applicationForm?.requestStatusId,
            applicationFormId: formDataDetail?.resignationLetter?.applicationForm?.id,
            applicationFormCode: formDataDetail?.resignationLetter?.applicationForm?.code,
            UserCodeApproval: user?.userCode,
            UserNameApproval: user?.userName ?? "",
            OrgPositionId: user?.orgPositionId,
            Status: type == 'approval' ? true : false,
            Note: note,
            UserAssignedTasks: selectedUserAssigned ?? []
        }

        if (type == 'resolved') {
            await resolvedTask.mutateAsync(payload)
        }
        else if (type == 'reject' || type == 'approval') {
            await approvalResignationLetter.mutateAsync(payload);
        }
        else if (type == 'assigned') {
            if (selectedUserAssigned.length == 0) {
                ShowToast(lang == 'vi' ? 'Vui lòng chọn ít nhất 1 người để giao việc' : 'Please select at least 1 person', 'error')
                return 
            }
            await assignResignationLetter.mutateAsync(payload)
        }

        queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] })

        if (formDataDetail?.resignationLetter?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Assigned) {
            navigate("/approval/assigned-tasks")
        }
        else {
            navigate("/approval/pending-approval")
        }
    }
      
    const CheckboxItem: React.FC<{ name: keyof TResignationForm['reasons'] | keyof TResignationForm['handover'], label: string, isParent?: boolean }> = ({ name, label, isParent }) => {
        const isReason = name.startsWith('reason');
        const fieldName = isReason ? `reasons.${name}` : `handover.${name}`;
        const isDisabled = false
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isChecked = watch(fieldName as any) || false;

        return (
            <div className="flex items-center space-x-2">
                <input
                    id={name}
                    type="checkbox"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    {...register(fieldName as any)}
                    checked={isDisabled ? isChecked : false} 
                    disabled={true} 
                    className={`form-checkbox accent-black h-5 w-5 rounded ${isDisabled ? 'text-gray-400 border-gray-300' : 'text-indigo-600 border-gray-300'} cursor-pointer`}
                />
                <label htmlFor={name} className={`${isParent ? 'text-base' : 'text-sm'} font-medium text-gray-700 select-none cursor-pointer`}>{label}</label>
            </div>
        );
    };

    const exportExcel = useExportExcelResignation()
    const handleExport = async () => {
        await exportExcel.mutateAsync(id)
    };

    const { data: hrMembers = [] } = useQuery({
        queryKey: ['get-all-hr-member'],
        queryFn: async () => {
            const res = await warningLetterApi.getMemberHrs()
            return res.data.data
        }
    });

    const handleCheckboxChangeUserAssigned = (event: React.ChangeEvent<HTMLInputElement>, item: {userCode: string, userName: string, email: string}) => {
        const isChecked = event.target.checked;
        if (isChecked) {
            setSelectedUserAssigned(prevSelected => [...prevSelected, { userCode: item.userCode, userName: item.userName, email: item.email }]);
        } else {
            setSelectedUserAssigned(prevSelected => prevSelected.filter(u => u.userCode !== item.userCode));
        }
    };
    

    if (isEdit && !formDataDetail) {
        return  <div className='text-red-700 font-semibold'>{lang == 'vi' ? 'Không tìm thấy dữ liệu' : 'Not found data'}</div>;
    }
    
    if (isEdit && isLoadingFormDataDetail) {
        return <div>{lang === 'vi' ? 'Đang tải dữ liệu...' : 'Loading data...'}</div>;
    }

    return (
        <div className="p-1 pl-1 pt-0 space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-y-3 gap-x-4 mb-2">
                <h3 className="font-bold text-xl md:text-2xl m-0">{t('resignation.create.title')}</h3>
                {
                    [StatusApplicationFormEnum.Assigned, StatusApplicationFormEnum.Complete].includes(formDataDetail?.resignationLetter?.applicationForm?.requestStatusId)
                        &&
                        <button disabled={exportExcel.isPending} onClick={handleExport} className='btn bg-blue-600 cursor-pointer p-2 rounded-sm text-white hover:bg-blue-700 disabled:bg-gray-400'>
                            {exportExcel.isPending ? <Spinner/> : lang == 'vi' ? 'Xuất excel' : 'Export excel'}
                        </button>
                }
            </div>
            <div>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-1">
                        <div className="flex-1 min-w-[150px] relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('resignation.create.usercode')}</label>
                            <div className="relative">
                                <input
                                    disabled={true}
                                    {...register("userCode")}
                                    type='text'
                                    placeholder={t('resignation.create.usercode')}
                                    className={`w-full p-2 border rounded-sm transition duration-150 ease-in-out text-sm bg-gray-50 ${errors.userCode ? 'border-red-500 bg-red-50' : ''}`}
                                />
                            </div>
                        </div>
                        
                        <div className="flex-1 min-w-[150px] relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('resignation.create.username')}</label>
                            <div className="relative">
                                <input
                                    {...register("userName")}
                                    disabled
                                    type='text'
                                    placeholder={t('resignation.create.username')}
                                    className={`w-full p-2 border rounded-sm transition duration-150 ease-in-out text-sm bg-gray-50 ${errors.userName ? 'border-red-500 bg-red-50' : ''}`}
                                />
                            </div>
                        </div>
                        <div className="flex-1 min-w-[150px] relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('resignation.create.department')}</label>
                            <div className="relative">
                                <input
                                    {...register("department")}
                                    disabled
                                    type='text'
                                    placeholder={t('resignation.create.department')}
                                    className={`w-full p-2 border rounded-sm transition duration-150 ease-in-out text-sm bg-gray-50 ${errors.department ? 'border-red-500 bg-red-50' : ''}`}
                                />
                            </div>
                        </div>
                        <div className="flex-1 min-w-[150px] relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('resignation.create.position')}</label>
                            <div className="relative">
                                <input
                                    {...register("position")}
                                    type='text'
                                    disabled
                                    placeholder={t('resignation.create.position')}
                                    className={`w-full p-2 border rounded-sm transition bg-gray-50 duration-150 ease-in-out text-sm  ${errors.position ? 'border-red-500 bg-red-50' : ''}`}
                                />
                            </div>
                        </div>
                        <div className="flex-1 min-w-[150px] relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('resignation.create.date_join_company')}</label>
                            <div className="relative">
                                <DateTimePicker
                                    {...register("dateJoinCompany")}
                                    enableTime={false}
                                    dateFormat="Y-m-d"
                                    disabled
                                    initialDateTime={getValues(`dateJoinCompany`)}
                                    onChange={(_selectedDates, dateStr) =>
                                        setValue("dateJoinCompany", dateStr)
                                    }
                                    className={`dark:bg-[#454545] text-sm border rounded bg-gray-50 border-gray-300 p-2 w-full`}
                                />
                            </div>
                        </div>
                        <div className="flex-1 min-w-[150px] relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('resignation.create.last_day_employment')}</label>
                            <div className="relative">
                                <DateTimePicker
                                    {...register("lastWorkingDate")}
                                    disabled
                                    enableTime={false}
                                    dateFormat="Y-m-d"
                                    initialDateTime={getValues(`lastWorkingDate`)}
                                    onChange={(_selectedDates, dateStr) =>
                                        setValue("lastWorkingDate", dateStr)
                                    }
                                    className={`dark:bg-[#454545] text-sm border rounded bg-gray-50 border-gray-300 p-2 w-full`}
                                />
                            </div>
                        </div>
                    </div>
                    <div className={`${errors.reasons ? 'bg-red-50 border border-red-300' : 'bg-white border border-gray-200'} p-4 mt-4 rounded-lg shadow-sm transition-all duration-300`}>
                        <h2 className="text-xl font-bold border-b border-gray-300 pb-1 mb-2">
                            {t('resignation.create.reason')} <span className='text-base italic text-red-500'>{errors.reasons ? lang == 'vi' ? '(Bắt buộc)' : '(Required)' : ''}</span>
                        </h2>
                        <div className="grid grid-cols-2 gap-x-10 mb-2">
                            <div className="flex items-start">
                                <CheckboxItem name="reason_contractExpired" label={`1. ${t('resignation.create.contract_expire')}`} isParent={true} />
                            </div>
                            <div className="flex items-start">
                                <CheckboxItem name="reason_notContract" label={`2. ${t('resignation.create.non_renew_contract')}`} isParent={true}/>
                            </div>
                        </div>
                        
                        <div className="mb-2">
                            <div className="flex items-start mb-2">
                                <CheckboxItem name="reason_parent3_checked" label={`3. ${t('resignation.create.personal_reason')}`} isParent={true} />
                            </div>
                            <div className="grid grid-cols-2 gap-x-10 gap-y-2 pl-8 border-l border-gray-300 ml-2 py-2">
                                <CheckboxItem name="reason_sick" label={t('resignation.create.sick')} />
                                <CheckboxItem name="reason_newJob" label={t('resignation.create.new_employment')} />
                                <CheckboxItem name="reason_study" label={t('resignation.create.further_studies')} />
                                <CheckboxItem name="reason_goHome" label={t('resignation.create.return_hometown')} />
                                <CheckboxItem name="reason_family" label={t('resignation.create.family_matter')} />
                                <CheckboxItem name="reason_unsuitable" label={t('resignation.create.unsuitable_work')} />
                            </div>
                        </div>
                
                        <div className="mb-2">
                            <div className="flex items-start mb-1">
                                <CheckboxItem name="reason_parent4_checked" label={`4. ${t('resignation.create.other_reason')}`} isParent={true} />
                            </div>

                            <div className="grid grid-cols-2 gap-x-10 gap-y-2 pl-8 border-l border-gray-300 ml-2 py-2">
                                <CheckboxItem name="reason_poorBenefits" label={t('resignation.create.poor_benifit')} />
                                <CheckboxItem name="reason_highPressure" label={t('resignation.create.high_pressure')} />
                                <CheckboxItem name="reason_poorEnvironment" label={t('resignation.create.unfavorable_working_environment')} />
                                <CheckboxItem name="reason_lowSalary" label={t('resignation.create.low_salary')} />
                            </div>
                        </div>
                
                        <div className="mb-2">
                            <div className="flex items-start mb-1">
                                <div className='ml-2 w-full'>
                                    <p className="font-semibold mb-1 text-gray-700">{`5. ${t('resignation.create.additional_remarks')}`}</p>
                                    <textarea
                                        {...register("reasons.reason_note")}
                                        disabled
                                        className="w-full h-16 p-2 border bg-gray-50 border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder={lang == 'vi' ? 'Lý do bổ sung' : 'Additional remarks'}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='p-4 pt-0 border border-gray-200 rounded-lg shadow-sm bg-white'>
                        <h2 className="text-xl font-bold border-b border-gray-300 pb-1 my-2">{t('resignation.create.handover')}</h2>
                        <div className="grid grid-cols-2 gap-x-10">
                            <div className="flex flex-col space-y-3">
                                <CheckboxItem name="handover_uniform" label={t('resignation.create.uniform')} />
                                <CheckboxItem name="handover_id_card" label={t('resignation.create.ID_card')} />
                            </div>
                            <div className="flex flex-col space-y-3">
                                <div className="flex items-start space-x-4">
                                    <CheckboxItem name="handover_other_checked" label={t('resignation.create.other')} />
                                    <div className='flex flex-col w-64'>
                                        <input 
                                            type="text" 
                                            {...register("handover.handover_other1")}
                                            disabled={!handoverOtherChecked} 
                                            className={`border-b border-dotted border-gray-500 focus:border-solid focus:outline-none mb-1 p-0.5 ${!handoverOtherChecked ? 'bg-gray-100 text-gray-400' : ''}`}
                                            placeholder="1."
                                        />
                                        <input 
                                            type="text" 
                                            {...register("handover.handover_other2")}
                                            disabled={!handoverOtherChecked} 
                                            className={`border-b border-dotted border-gray-500 focus:border-solid focus:outline-none mb-1 p-0.5 ${!handoverOtherChecked ? 'bg-gray-100 text-gray-400' : ''}`}
                                            placeholder="2."
                                        />
                                        <input 
                                            type="text" 
                                            {...register("handover.handover_other3")}
                                            disabled={!handoverOtherChecked} 
                                            className={`border-b border-dotted border-gray-500 focus:border-solid focus:outline-none mb-1 p-0.5 ${!handoverOtherChecked ? 'bg-gray-100 text-gray-400' : ''}`}
                                            placeholder="3."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <Label className='mb-1'>{lang == 'vi' ? 'Ghi chú' : 'Note'}</Label>
                        <Textarea placeholder='Note' value={note} onChange={(e) => setNote(e.target.value)} className="border-gray-300"/>
                    </div>
                            
                    <ModalConfirm
                        type={statusModalConfirm}
                        isOpen={statusModalConfirm != ''}
                        onClose={() => setStatusModalConfirm('')}
                        onSave={handleSaveModalConfirm}
                        isPending={approvalResignationLetter.isPending || resolvedTask.isPending}
                    />
                    <div className='mt-2'>
                        {
                            [StatusApplicationFormEnum.FinalApproval, StatusApplicationFormEnum.Assigned, StatusApplicationFormEnum.Complete]
                                .includes(formDataDetail?.resignationLetter?.applicationForm?.requestStatusId) && 
                                <label className="block text-sm font-medium text-gray-700">
                                    {lang == 'vi' ? 'Được giao cho' : 'Assigned to'}<DotRequireComponent />
                                </label>
                        }
                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 mt-2">
                            {
                                formDataDetail?.assigns?.length > 0
                                ? (
                                    formDataDetail?.assigns?.map((item: {userCode: string, userName: string}, idx: number) => (
                                        <label
                                            key={idx}
                                            className="flex cursor-pointer"
                                        >
                                            <span>
                                                <strong>({item.userCode})</strong> {item.userName}
                                            </span>
                                        </label>
                                    ))
                                ) : formDataDetail?.resignationLetter?.applicationForm?.requestStatusId == StatusApplicationFormEnum.FinalApproval ?
                                (
                                    hrMembers?.map((item: {userCode: string, userName: string, email: string}, idx: number) => (
                                        <label
                                            key={idx}
                                            className="flex items-center space-x-2 cursor-pointer w-full sm:w-[48%]"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedUserAssigned.some(
                                                    (e) => e.userCode == item.userCode
                                                )}
                                                value={item.userCode}
                                                className="border-gray-300 scale-[1.4] accent-black"
                                                onChange={(e) =>
                                                    handleCheckboxChangeUserAssigned(e, item)
                                                }
                                            />
                                            <span>
                                                <strong>({item.userCode})</strong> {item.userName}
                                            </span>
                                        </label>
                                    ))
                                ) : (null)
                            }
                        </div>
                    </div>
                    <div className='flex justify-end mt-2'>
                        {
                            formDataDetail?.resignationLetter?.applicationForm?.requestStatusId == StatusApplicationFormEnum.FinalApproval ?
                            <>
                                {
                                    mode != 'view' &&
                                    <button
                                        onClick={() => setStatusModalConfirm('assigned')}
                                        disabled={approvalResignationLetter.isPending}
                                        className="mr-2 cursor-pointer w-full sm:w-auto py-3 px-4 bg-blue-600 text-white font-semibold rounded-sm shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm tracking-wide uppercase disabled:bg-gray-400"
                                    >
                                        {lang == 'vi' ? 'Giao việc' : 'Assigned'}
                                    </button>
                                }
                            </> :
                            formDataDetail?.resignationLetter?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Assigned ?
                            (
                                <>
                                    {
                                        mode != 'view' &&
                                        <button
                                            onClick={() => setStatusModalConfirm('resolved')}
                                            disabled={approvalResignationLetter.isPending}
                                            className="mr-2 cursor-pointer w-full sm:w-auto py-3 px-4 bg-blue-600 text-white font-semibold rounded-sm shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm tracking-wide uppercase disabled:bg-gray-400"
                                        >
                                            {lang == 'vi' ? 'Đóng' : 'Closed'}
                                        </button>
                                    }
                                </>
                            ) : [StatusApplicationFormEnum.Complete, StatusApplicationFormEnum.Reject].includes(formDataDetail?.resignationLetter?.applicationForm?.requestStatusId) ? (null) : (
                                mode != 'view' && <>
                                    <button
                                        onClick={() => setStatusModalConfirm('reject')}
                                        disabled={approvalResignationLetter.isPending}
                                        className="mr-2 cursor-pointer w-full sm:w-auto py-1 px-4 bg-red-600 text-white font-semibold rounded-sm shadow-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm tracking-wide uppercase disabled:bg-gray-400"
                                    >
                                        {lang == 'vi' ? 'Từ chối' : 'Reject'}
                                    </button>
                                    <button
                                        onClick={() => setStatusModalConfirm('approval')}
                                        disabled={approvalResignationLetter.isPending}
                                        className="cursor-pointer w-full sm:w-auto py-3 px-5 bg-blue-600 text-white font-semibold rounded-sm shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-base tracking-wide uppercase disabled:bg-gray-400"
                                    >
                                        {lang == 'vi' ? 'Duyệt đơn' : 'Approval'}
                                    </button>
                                </>
                            )
                        }
                    </div>
                </div>
                <div className="mb-0">
                    <span className="font-bold text-black">
                        {lang === 'vi' ? 'Quy trình' : 'Approval flow'}:
                    </span>{' '}
                    {formDataDetail?.defineAction
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        .map((item: any, idx: number) => (
                            <span key={idx} className="font-bold text-orange-700">
                                ({idx + 1}) {item?.Name ?? item?.UserCode ?? 'HR'}
                                {idx < formDataDetail?.defineAction?.length - 1 ? ', ' : ''}
                            </span>
                        ))}
                </div>
                <HistoryApproval historyApplicationForm={formDataDetail?.resignationLetter?.applicationForm?.historyApplicationForms}/>
            </div>
        </div>
    );
}

export default ViewApprovalRegisnation;