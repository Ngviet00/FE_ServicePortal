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
import { StatusApplicationFormEnum } from '@/lib';
import DateTimePicker from '@/components/ComponentCustom/Flatpickr';
import { Spinner } from '@/components/ui/spinner';
import HistoryApproval from '@/features/Approval/Components/HistoryApproval';
import terminationLetterApi, { useApprovalTerminationLetter, useExportExcelTerminationLetter, useResolvedTaskTerminationLetter } from '@/api/HR/terminationLetterApi';
import { TerminationFormSchema, TTerminationLetterForm } from './CreateTermination';

interface ViewApprovalTerminationLetterProps {
    id: string;
    mode?: string
}

const ViewApprovalTermination: React.FC<ViewApprovalTerminationLetterProps> = ({id, mode}) => {
    const { t } = useTranslation('hr')
    const user = useAuthStore(u => u.user)
    const lang = useTranslation().i18n.language.split('-')[0]
    const navigate = useNavigate()
    const [note, setNote] = useState("")
    const [statusModalConfirm, setStatusModalConfirm] = useState('')
    const queryClient = useQueryClient()
    const { 
        register,
        watch, 
        formState: { errors },
        setValue, 
        getValues,
        reset
    } = useForm<TTerminationLetterForm>({
        resolver: zodResolver(TerminationFormSchema),
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
            contractTerminationDate: new Date().toISOString().split("T")[0],
            reasons: {
                reason_contractExpired: false,
                reason_expulsion: false,
                reason_dismiss: false,
                reason_absent: false,
                reason_failedProbation: false,
                reason_disciplinary: false,
                reason_contractExpireNotRenew: false,
                reason_otherReason: false,
                reason_absent_text: new Date().toISOString().split("T")[0],
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
        queryKey: ['termination-letter-detail', id],
        queryFn: async () => {
            try {
                const res = await terminationLetterApi.getByApplicationFormCode(id ?? '');
                return res.data.data;
            } catch {
                return
            }
        },
        enabled: isEdit,
    });

    useEffect(() => {
        if (formDataDetail) {
            const handOverParse = JSON.parse(formDataDetail?.terminationLetter?.handOver ?? "{}");
            const reasonParse = JSON.parse(formDataDetail?.terminationLetter?.reason ?? "{}");

            reset({
                userCode: formDataDetail?.terminationLetter?.userCode ?? '',
                userName: formDataDetail?.terminationLetter?.userName ?? '',
                department: formDataDetail?.terminationLetter?.departmentName ?? '',
                departmentId: formDataDetail?.terminationLetter?.departmentId ?? 0,
                position: formDataDetail?.terminationLetter?.position ?? '',
                unit: formDataDetail?.terminationLetter?.unit ?? '',
                dateJoinCompany: formDataDetail?.terminationLetter?.dateJoinCompany,
                lastWorkingDate: formDataDetail?.terminationLetter?.lastWorkingDate,
                contractTerminationDate: formDataDetail?.terminationLetter?.contractTerminationDate,
                reasons: {
                    reason_contractExpired: reasonParse?.reason_contractExpired,
                    reason_expulsion: reasonParse?.reason_expulsion,
                    reason_dismiss: reasonParse?.reason_dismiss,
                    reason_absent: reasonParse?.reason_absent,
                    reason_failedProbation: reasonParse?.reason_failedProbation,
                    reason_disciplinary: reasonParse?.reason_disciplinary,
                    reason_contractExpireNotRenew: reasonParse?.reason_contractExpireNotRenew,
                    reason_otherReason: reasonParse?.reason_otherReason,
                    reason_absent_text: reasonParse?.reason_absent_text,
                },
                handover: {
                    handover_uniform: handOverParse?.handover_uniform,
                    handover_id_card: handOverParse?.handover_id_card,
                    handover_other_checked: handOverParse.handover_other_checked,
                    handover_other1: handOverParse.handover_other1,
                    handover_other2: handOverParse.handover_other2,
                    handover_other3: handOverParse.handover_other3,
                }
            });
        }
    }, [formDataDetail, reset])
    
    const handoverOtherChecked = watch("handover.handover_other_checked");
    const absentWatch = watch("reasons.reason_absent");

    const handleSaveModalConfirm = async (type: string) => {
        setStatusModalConfirm('')
        const payload = {
            RequestTypeId: formDataDetail?.terminationLetter?.applicationForm?.requestTypeId,
            RequestStatusId: formDataDetail?.terminationLetter?.applicationForm?.requestStatusId,
            applicationFormId: formDataDetail?.terminationLetter?.applicationForm?.id,
            applicationFormCode: formDataDetail?.terminationLetter?.applicationForm?.code,
            UserCodeApproval: user?.userCode,
            UserNameApproval: user?.userName ?? "",
            OrgPositionId: user?.orgPositionId,
            Status: type == 'approval' ? true : false,
            Note: note
        }

        if (type == 'resolved') {
            await resolvedTask.mutateAsync(payload)
        }
        else if (type == 'reject' || type == 'approval') {
            await approvalTerminationLetter.mutateAsync(payload);
        }

        if (formDataDetail?.terminationLetter?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Assigned) {
            navigate("/approval/assigned-tasks")
        } else {
            navigate("/approval/pending-approval")
        }
        
        queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] })
    }
      
    const CheckboxItem: React.FC<{ name: keyof TTerminationLetterForm['reasons'] | keyof TTerminationLetterForm['handover'], label: string, isParent?: boolean }> = ({ name, label, isParent }) => {
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

    const approvalTerminationLetter = useApprovalTerminationLetter()
    const resolvedTask = useResolvedTaskTerminationLetter()

    const exportExcel = useExportExcelTerminationLetter()
    const handleExport = async () => {
        await exportExcel.mutateAsync(id)
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
                <h3 className="font-bold text-xl md:text-2xl m-0">{t('termination.create.title')}</h3>
                {
                    [StatusApplicationFormEnum.Assigned, StatusApplicationFormEnum.Complete].includes(formDataDetail?.terminationLetter?.applicationForm?.requestStatusId)
                     &&
                        <button disabled={exportExcel.isPending} onClick={handleExport} className='btn bg-blue-600 cursor-pointer p-2 rounded-sm text-white hover:bg-blue-700 disabled:bg-gray-400'>
                            {exportExcel.isPending ? <Spinner/> : lang == 'vi' ? 'Xuất excel' : 'Export excel'}
                        </button>
                }
            </div>
            <div>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('termination.create.usercode')}</label>
                            <input
                                disabled={isEdit}
                                {...register("userCode")}
                                type='text'
                                placeholder={t('termination.create.usercode')}
                                className={`w-full p-2 border rounded-md transition duration-150 ease-in-out text-sm ${isEdit ? 'bg-gray-50' : ''} ${errors.userCode ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'}`}
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('termination.create.username')}</label>
                            <input
                                {...register("userName")}
                                disabled
                                type='text'
                                placeholder={t('termination.create.username')}
                                className={`w-full p-2 border rounded-md transition duration-150 ease-in-out text-sm bg-gray-50 border-gray-300 ${errors.userName ? 'border-red-500 bg-red-50' : ''}`}
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('termination.create.department')}</label>
                            <input
                                {...register("department")}
                                disabled
                                type='text'
                                placeholder={t('termination.create.department')}
                                className={`w-full p-2 border rounded-md transition duration-150 ease-in-out text-sm bg-gray-50 border-gray-300 ${errors.department ? 'border-red-500 bg-red-50' : ''}`}
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('termination.create.position')}</label>
                            <input
                                {...register("position")}
                                type='text'
                                disabled
                                placeholder={t('termination.create.position')}
                                className={`w-full p-2 border rounded-md transition duration-150 ease-in-out text-sm bg-gray-50 border-gray-300 focus:border-blue-500 ${errors.position ? 'border-red-500 bg-red-50' : ''}`}
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('termination.create.unit')}</label>
                            <input
                                disabled
                                {...register("unit")}
                                type='text'
                                placeholder={t('termination.create.unit')}
                                className={`w-full p-2 border rounded-md transition duration-150 ease-in-out text-sm bg-gray-50 border-gray-300 ${errors.unit ? 'border-red-500 bg-red-50' : ''}`}
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('termination.create.date_join_company')}</label>
                            <DateTimePicker
                                disabled
                                {...register("dateJoinCompany")}
                                enableTime={false}
                                dateFormat="Y-m-d"
                                initialDateTime={getValues(`dateJoinCompany`)}
                                onChange={(_selectedDates, dateStr) => setValue("dateJoinCompany", dateStr)}
                                className={`dark:bg-[#454545] bg-gray-50 text-sm border rounded-md border-gray-300 p-2 w-full`}
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('termination.create.last_working_date')}</label>
                            <DateTimePicker
                                {...register("lastWorkingDate")}
                                enableTime={false}
                                disabled
                                dateFormat="Y-m-d"
                                initialDateTime={getValues(`lastWorkingDate`)}
                                onChange={(_selectedDates, dateStr) => setValue("lastWorkingDate", dateStr)}
                                className={`dark:bg-[#454545] text-sm border rounded-md bg-gray-50 border-gray-300 p-2 w-full`}
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('termination.create.contract_expire_date')}</label>
                            <DateTimePicker
                                {...register("contractTerminationDate")}
                                enableTime={false}
                                disabled
                                dateFormat="Y-m-d"
                                initialDateTime={getValues(`contractTerminationDate`)}
                                onChange={(_selectedDates, dateStr) => setValue("contractTerminationDate", dateStr)}
                                className={`dark:bg-[#454545] text-sm border rounded-md bg-gray-50 border-gray-300 p-2 w-full`}
                            />
                        </div>
                    </div>
                    <div className={`${errors.reasons ? 'bg-red-50 border border-red-300' : 'bg-white border border-gray-200'} p-4 mt-4 rounded-lg shadow-sm transition-all duration-300`}>
                        <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-4 text-gray-800">
                            {t('termination.create.reason')} 
                            <span className='text-base italic text-red-500 ml-2'>
                                {errors.reasons ? lang === 'vi' ? '(Bắt buộc)' : '(Required)' : ''}
                            </span>
                        </h2>
                        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-10`}>
                            <div className="flex items-start">
                                <CheckboxItem name="reason_contractExpired" label={`${t('termination.create.contract_expired')}`} isParent={true} />
                            </div>
                            <div className="flex items-start">
                                <CheckboxItem name="reason_expulsion" label={`${t('termination.create.expulsion')}`} isParent={true}/>
                            </div>
                            <div className="flex items-start">
                                <CheckboxItem name="reason_dismiss" label={`${t('termination.create.dismiss')}`} isParent={true} />
                            </div>
                            <div className="flex items-start">
                                <CheckboxItem name="reason_failedProbation" label={`${t('termination.create.failed_probation')}`} isParent={true} />
                            </div>
                            <div className="flex items-start">
                                <CheckboxItem name="reason_disciplinary" label={`${t('termination.create.disciplinary')}`} isParent={true}/>
                            </div>
                            <div className="flex items-start">
                                <CheckboxItem name="reason_contractExpireNotRenew" label={`${t('termination.create.contract_expireNotRenew')}`} isParent={true} />
                            </div>
                            <div className="flex items-start">
                                <CheckboxItem name="reason_otherReason" label={`${t('termination.create.other_reason')}`} isParent={true} />
                            </div>
                            <div className="flex items-start flex-col">
                                <CheckboxItem name="reason_absent" label={`${t('termination.create.absent')}`} isParent={true} />
                                {
                                    absentWatch &&
                                    <div className="mt-2 w-full max-w-xs">
                                        <DateTimePicker
                                            {...register("reasons.reason_absent_text")}
                                            enableTime={false}
                                            dateFormat="Y-m-d"
                                            disabled
                                            initialDateTime={getValues(`reasons.reason_absent_text`)}
                                            onChange={(_selectedDates, dateStr) => setValue("reasons.reason_absent_text", dateStr)}
                                            className={`dark:bg-[#454545] text-sm border bg-gray-50 rounded-md border-gray-300 p-2 w-full`}
                                        />
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                    <div className='p-4 pt-0 border border-gray-200 rounded-lg shadow-sm bg-white'>
                        <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-4 text-gray-800">{t('resignation.create.handover')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-10">
                            <div className="flex flex-col space-y-3">
                                <CheckboxItem name="handover_uniform" label={t('resignation.create.uniform')} />
                                <CheckboxItem name="handover_id_card" label={t('resignation.create.ID_card')} />
                            </div>
                            <div className="flex flex-col space-y-3">
                                <div className="flex items-start space-x-4">
                                    <div className='flex flex-col w-full'>
                                        <CheckboxItem name="handover_other_checked" label={t('resignation.create.other')} />
                                        <div className='mt-2 pl-6 space-y-2'>
                                            <input 
                                                type="text" 
                                                {...register("handover.handover_other1")}
                                                disabled
                                                className={`w-full border-b border-dotted border-gray-500 focus:border-solid focus:outline-none p-0.5 text-sm ${!handoverOtherChecked ? 'bg-gray-100 text-gray-400' : 'bg-transparent'}`}
                                                placeholder="1."
                                            />
                                            <input 
                                                type="text" 
                                                {...register("handover.handover_other2")}
                                                disabled
                                                className={`w-full border-b border-dotted border-gray-500 focus:border-solid focus:outline-none p-0.5 text-sm ${!handoverOtherChecked ? 'bg-gray-100 text-gray-400' : 'bg-transparent'}`}
                                                placeholder="2."
                                            />
                                            <input 
                                                type="text" 
                                                {...register("handover.handover_other3")}
                                                disabled
                                                className={`w-full border-b border-dotted border-gray-500 focus:border-solid focus:outline-none p-0.5 text-sm ${!handoverOtherChecked ? 'bg-gray-100 text-gray-400' : 'bg-transparent'}`}
                                                placeholder="3."
                                            />
                                        </div>
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
                        isPending={approvalTerminationLetter.isPending || resolvedTask.isPending}
                    />
                    <div className='flex justify-end mt-2'>
                        {
                            formDataDetail?.terminationLetter?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Assigned ?
                            (
                                 mode != 'view' &&
                                    <button
                                        onClick={() => setStatusModalConfirm('resolved')}
                                        disabled={approvalTerminationLetter.isPending || resolvedTask.isPending}
                                        className="mr-2 cursor-pointer w-full sm:w-auto py-3 px-4 bg-blue-600 text-white font-semibold rounded-sm shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm tracking-wide uppercase disabled:bg-gray-400"
                                    >
                                        {lang == 'vi' ? 'Đóng' : 'Closed'}
                                    </button>
                            ) : [StatusApplicationFormEnum.Complete, StatusApplicationFormEnum.Reject].includes(formDataDetail?.terminationLetter?.applicationForm?.requestStatusId) ? (null) : (
                                 mode != 'view' && <>
                                    <button
                                        onClick={() => setStatusModalConfirm('reject')}
                                        disabled={approvalTerminationLetter.isPending}
                                        className="mr-2 cursor-pointer w-full sm:w-auto py-1 px-4 bg-red-600 text-white font-semibold rounded-sm shadow-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm tracking-wide uppercase disabled:bg-gray-400"
                                    >
                                        {lang == 'vi' ? 'Từ chối' : 'Reject'}
                                    </button>
                                    <button
                                        onClick={() => setStatusModalConfirm('approval')}
                                        disabled={approvalTerminationLetter.isPending}
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
                <HistoryApproval historyApplicationForm={formDataDetail?.terminationLetter?.applicationForm?.historyApplicationForms}/>
            </div>
        </div>
    );
}

export default ViewApprovalTermination;