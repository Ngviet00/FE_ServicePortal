/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ChevronDown } from 'lucide-react';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from 'react-i18next';
import unionApi from '@/api/unionApi';
import warningLetterApi, { useApprovalWarningLetter, useAssignedTaskWarningLetter, useExportExcel, useResolvedTaskWarningLetter } from '@/api/HR/warningLetterApi';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ModalConfirm from '@/components/ModalConfirm';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import HistoryApproval from '../../Approval/Components/HistoryApproval';
import { StatusApplicationFormEnum } from '@/lib';
import DateTimePicker from '@/components/ComponentCustom/Flatpickr';
import { Spinner } from '@/components/ui/spinner';

const formSchema = z.object({
    userCode: z.string().min(1, "Bắt buộc nhập"),
    userName: z.string().min(1, "Bắt buộc nhập"),
    department: z.string().min(1, "Bắt buộc nhập"),
    departmentId: z.number(),
    orgPositionId: z.number(),
    position: z.string().min(1, "Bắt buộc nhập"),
    unit: z.string().min(1, "Bắt buộc nhập"),
    reason: z.string().min(1, "Bắt buộc nhập"),
    dateWarningLetter: z.string(),
    verbalReprimand: z.boolean(),
    suspensionWithoutPay: z.boolean(),
    writtenDisciplinaryNotice: z.boolean(),
    jobReassignmentWithSalaryReduction: z.boolean(),
    dateFromverbalReprimandAndSuspensionWithoutPay: z.string(),
    dateToverbalReprimandAndSuspensionWithoutPay: z.string(),
    dateFromWrittenDisciplinaryNoticeAndjobReassignmentWithSalaryReduction: z.string(),
    dateToWrittenDisciplinaryNoticeAndjobReassignmentWithSalaryReduction: z.string(),
    memberUnion: z.string().min(1, "Bắt buộc nhập"),
})
.refine(
    (data) =>
        data.verbalReprimand ||
        data.suspensionWithoutPay ||
        data.writtenDisciplinaryNotice ||
        data.jobReassignmentWithSalaryReduction,
    {
        message: "Phải chọn ít nhất 1 hình thức kỷ luật",
        path: ["verbalReprimand"],
    }
);

type IFormSchema = z.infer<typeof formSchema>;

interface ViewApprovalWarningLetterProps {
    id: string;
    mode?: string
}

const ViewApprovalWarningLetter: React.FC<ViewApprovalWarningLetterProps> = ({id, mode}) => {
    const { t } = useTranslation('hr')
    const user = useAuthStore(u => u.user)
    const lang = useTranslation().i18n.language.split('-')[0]
    const [memberUnions, setMemberUnions] = useState<{userCode: string, userName: string}[]>([])

    const queryClient = useQueryClient()
    const navigate = useNavigate()

    const { register, reset, getValues, setValue, formState: { errors } } =
    useForm<IFormSchema>({
        resolver: zodResolver(formSchema)
    });

    const [note, setNote] = useState("")
    const [statusModalConfirm, setStatusModalConfirm] = useState('')

    const { data: formDataDetail, isLoading: isLoadingFormDataDetail } = useQuery({
        queryKey: ['warning-letter-detail', id],
        queryFn: async () => {
            try {
                const res = await warningLetterApi.getByApplicationFormCode(id ?? '');
                return res.data.data;
            } catch {
                return
            }
        }
    });

    useEffect(() => {
        if (formDataDetail?.warningLetter?.departmentId > 0) {
            const load = async () => {
                try {
                    const res = await unionApi.getMemberUnionByDepartment(formDataDetail?.warningLetter?.departmentId);
                    setMemberUnions(res.data.data);
                } catch {
                    setMemberUnions([]);
                }
            };
            load();
        }
    }, [formDataDetail]);

    useEffect(() => {
        if (formDataDetail && memberUnions.length > 0) {
            reset({
                userCode: formDataDetail?.warningLetter?.userCode ?? '',
                userName: formDataDetail?.warningLetter?.userName ?? '',
                department: formDataDetail?.warningLetter?.departmentName ?? '',
                departmentId: formDataDetail?.warningLetter?.departmentId ?? 0,
                orgPositionId: formDataDetail?.warningLetter?.orgPositionId ?? 0,
                position: formDataDetail?.warningLetter?.position ?? '',
                unit: formDataDetail?.warningLetter?.unit ?? '',
                reason: formDataDetail?.warningLetter?.reason ?? '',
                dateWarningLetter: formDataDetail?.warningLetter?.dateWarningLetter ?? formDataDetail?.warningLetter?.applicationForm?.createdAt,
                verbalReprimand: formDataDetail?.warningLetter?.verbalReprimand ?? false,
                suspensionWithoutPay: formDataDetail?.warningLetter?.suspensionWithoutPay ?? false,
                writtenDisciplinaryNotice: formDataDetail?.warningLetter?.writtenDisciplinaryNotice ?? false,
                jobReassignmentWithSalaryReduction: formDataDetail?.warningLetter?.jobReassignmentWithSalaryReduction ?? false,
                dateFromverbalReprimandAndSuspensionWithoutPay: formDataDetail?.warningLetter?.dateFromVerbalReprimandAndSuspensionWithoutPay ?? '',
                dateToverbalReprimandAndSuspensionWithoutPay: formDataDetail?.warningLetter?.dateToVerbalReprimandAndSuspensionWithoutPay ?? '',
                dateFromWrittenDisciplinaryNoticeAndjobReassignmentWithSalaryReduction: formDataDetail?.warningLetter?.dateFromWrittenDisciplinaryNoticeAndjobReassignmentWithSalaryReduction ?? '',
                dateToWrittenDisciplinaryNoticeAndjobReassignmentWithSalaryReduction: formDataDetail?.warningLetter?.dateToWrittenDisciplinaryNoticeAndjobReassignmentWithSalaryReduction ?? '',
                memberUnion: formDataDetail?.warningLetter?.userCodeUnionMemberResponsibility ?? '',
            });
        }
    }, [formDataDetail, reset, memberUnions])

    const approvalWarningLetter = useApprovalWarningLetter()
    const assignWarningLetter = useAssignedTaskWarningLetter()
    const resolvedTask = useResolvedTaskWarningLetter()

    const handleSaveModalConfirm = async (type: string) => {
        setStatusModalConfirm('')
        const payload = {
            RequestTypeId: formDataDetail?.warningLetter?.applicationForm?.requestTypeId,
            applicationFormId: formDataDetail?.warningLetter?.applicationForm?.id,
            applicationFormCode: formDataDetail?.warningLetter?.applicationForm?.code,
            UserCodeApproval: user?.userCode,
            UserNameApproval: user?.userName ?? "",
            OrgPositionId: user?.orgPositionId,
            Status: type == 'approval' ? true : false,
            Note: note
        }

        await approvalWarningLetter.mutateAsync(payload);
        queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] })
        navigate("/approval/pending-approval")
    }

    const exportExcel = useExportExcel()
    const handleExport = async () => {
        await exportExcel.mutateAsync(id)
    };

    const activeStep = formDataDetail?.defineSteps?.find((step: any) => step.IsActive === true);
    const isFinalStep = activeStep?.IsFinal === true;

    if (id && isLoadingFormDataDetail) {
        return <div>{lang === 'vi' ? 'Đang tải dữ liệu...' : 'Loading data...'}</div>;
    }

    if (id && !formDataDetail) {
        return  <div className='text-red-700 font-semibold'>{lang == 'vi' ? 'Không tìm thấy dữ liệu' : 'Not found data'}</div>;
    }

    return (
        <div className="p-1 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-3">
                <h3 className="font-bold text-xl md:text-2xl m-0">{t('warning_letter.create.title')}</h3>
                {
                    (formDataDetail?.warningLetter.applicationForm?.requestStatusId == StatusApplicationFormEnum.Complete || isFinalStep)
                     &&
                        <button disabled={exportExcel.isPending} onClick={handleExport} className='btn bg-blue-600 cursor-pointer p-2 rounded-sm text-white hover:bg-blue-700 disabled:bg-gray-400'>
                            {exportExcel.isPending ? <Spinner/> : lang == 'vi' ? 'Xuất excel' : 'Export excel'}
                        </button>
                }
            </div>

            <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-3">
                    <div className="flex-1 min-w-[150px] relative">
                        <label className="block text-sm font-medium text-gray-500 mb-1">{t('warning_letter.create.usercode')}</label>
                        <div className="relative">
                            <input
                                disabled
                                {...register("userCode")}
                                type='text'
                                placeholder={t('warning_letter.create.usercode')}
                                className={`w-full p-2 border rounded-sm border-gray-300 transition duration-150 ease-in-out text-sm bg-gray-50 ${errors.userCode ? 'border-red-500 bg-red-50' : ''}`}
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 min-w-[150px] relative">
                        <label className="block text-sm font-medium text-gray-500 mb-1">{t('warning_letter.create.username')}</label>
                        <div className="relative">
                            <input
                                {...register("userName")}
                                disabled
                                type='text'
                                placeholder={t('warning_letter.create.username')}
                                className={`w-full p-2 border rounded-sm border-gray-300 transition duration-150 ease-in-out text-sm bg-gray-50 ${errors.userName ? 'border-red-500 bg-red-50' : ''}`}
                            />
                        </div>
                    </div>
                    <div className="flex-1 min-w-[150px] relative">
                        <label className="block text-sm font-medium text-gray-500 mb-1">{t('warning_letter.create.department')}</label>
                        <div className="relative">
                            <input
                                {...register("department")}
                                disabled
                                type='text'
                                placeholder={t('warning_letter.create.department')}
                                className={`w-full p-2 border rounded-sm border-gray-300 transition duration-150 ease-in-out text-sm bg-gray-50 ${errors.department ? 'border-red-500 bg-red-50' : ''}`}
                            />
                        </div>
                    </div>
                    <div className="flex-1 min-w-[150px] relative">
                        <label className="block text-sm font-medium text-gray-500 mb-1">{t('warning_letter.create.position')}</label>
                        <div className="relative">
                            <input
                                disabled
                                {...register("position")}
                                type='text'
                                placeholder={t('warning_letter.create.position')}
                                className={`w-full p-2 border rounded-sm border-gray-300 transition duration-150 ease-in-out text-sm bg-gray-50 ${errors.position ? 'border-red-500 bg-red-50' : ''}`}
                            />
                        </div>
                    </div>
                    <div className="flex-1 min-w-[150px] relative">
                        <label className="block text-sm font-medium text-gray-500 mb-1">{t('warning_letter.create.unit')}</label>
                        <div className="relative">
                            <input
                                {...register("unit")}
                                disabled
                                type='text'
                                placeholder={t('warning_letter.create.unit')}
                                className={`w-full p-2 border rounded-sm border-gray-300 transition duration-150 ease-in-out text-sm bg-gray-50 ${errors.unit ? 'border-red-500 bg-red-50' : ''}`}
                            />
                        </div>
                    </div>
                    <div className="flex-1 min-w-[150px] relative">
                        <label className="block text-sm font-medium text-gray-500 mb-1">{t('warning_letter.create.unit')}</label>
                        <div className="relative">
                            <DateTimePicker
                                disabled={true}
                                {...register("dateWarningLetter")}
                                enableTime={false}
                                dateFormat="Y-m-d"
                                initialDateTime={getValues(`dateWarningLetter`)}
                                onChange={(_selectedDates, dateStr) =>
                                    setValue("dateWarningLetter", dateStr, { shouldValidate: true })
                                }
                                className={`text-sm border rounded border-gray-300 bg-gray-50 p-2 w-full`}
                            />
                        </div>
                    </div>
                </div>

                <div className='mb-3'>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('warning_letter.create.reason')}</label>
                    <textarea
                        {...register("reason")}
                        id="lyDo"
                        rows={3} 
                        disabled
                        placeholder={t('warning_letter.create.reason')}
                        className={`w-full p-2 border rounded-sm border-gray-300 transition bg-gray-50 duration-150 ease-in-out text-sm ${errors.reason ? 'border-red-500 bg-red-50' : ''}`}
                    ></textarea>
                </div>

                <div className={`border border-gray-200 py-2 px-4 rounded-xl bg-gray-50 shadow-inner mb-3 ${errors.verbalReprimand ? 'border-red-500 bg-red-50' : ''}`}>
                    <p className="text-lg font-bold text-gray-800 mb-4">{t('warning_letter.create.handling_method')}</p> 
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-3">
                        <div className="space-y-3">
                            <div className="flex items-center">
                                <input id='cb1' type="checkbox" disabled {...register("verbalReprimand")} className={`h-5 w-5 accent-black`}/>
                                <label htmlFor={`cb1`} className="ml-2 block text-base text-gray-700 cursor-pointer select-none">{t('warning_letter.create.verbal_reprimand')}</label>
                            </div>
                            <div className="flex items-center">
                                <input type="checkbox" id='cb2' disabled {...register("suspensionWithoutPay")} className={`h-5 w-5 accent-black`}/>
                                <label htmlFor={`cb2`} className="ml-2 block text-base text-gray-700 cursor-pointer select-none">{t('warning_letter.create.suspension_without_pay')}</label>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center">
                                <input type="checkbox" id='cb3' disabled {...register("writtenDisciplinaryNotice")} className={`h-5 w-5 accent-black`}/>
                                <label htmlFor={`cb3`} className="ml-2 block text-base text-gray-700 cursor-pointer select-none">{t('warning_letter.create.written_disciplinary_notice')}</label>
                            </div>
                            <div className="flex items-center">
                                <input type="checkbox" id='cb4' disabled {...register("jobReassignmentWithSalaryReduction")} className={`h-5 w-5 accent-black`}/>
                                <label htmlFor={`cb4`} className="ml-2 block text-base text-gray-700 cursor-pointer select-none">{t('warning_letter.create.job_reassignment_with_salary_reduction')}</label>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4 border-gray-200"></div>
                </div>

                <div className="w-full relative mb-4">
                    <label htmlFor='unit' className="block text-sm font-medium text-gray-700 mb-1">{t('warning_letter.create.union_member_responsibility')}</label>
                    <div className="relative">
                        <select
                            disabled
                            {...register("memberUnion")}
                            className={`bg-gray-50 cursor-pointer appearance-none w-full p-2 border border-gray-300 rounded-sm shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-sm ${errors.memberUnion ? 'border-red-500 bg-red-50' : ''}`}
                        >
                            <option value="">--{t('warning_letter.create.choose')}--</option>
                            {
                                memberUnions?.map((item: {userCode: string, userName: string}, idx: number) => {
                                    return (
                                        <option value={item?.userCode} key={idx}>{item?.userName}</option>
                                    )
                                })
                            }
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
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
                    isPending={approvalWarningLetter.isPending || assignWarningLetter.isPending || resolvedTask.isPending}
                />

                <div className='flex justify-end mt-2'>
                    {
                        [StatusApplicationFormEnum.Complete, StatusApplicationFormEnum.Reject].includes(formDataDetail?.warningLetter?.applicationForm?.requestStatusId) ? (null) : (
                            mode != 'view' && <>
                                {
                                    !isFinalStep &&
                                    (<button
                                        onClick={() => setStatusModalConfirm('reject')}
                                        disabled={approvalWarningLetter.isPending}
                                        className="mr-2 cursor-pointer w-full sm:w-auto py-1 px-4 bg-red-600 text-white font-semibold rounded-sm shadow-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm tracking-wide uppercase disabled:bg-gray-400"
                                    >
                                        {lang == 'vi' ? 'Từ chối' : 'Reject'}
                                    </button>)
                                }
                                <button
                                    onClick={() => setStatusModalConfirm('approval')}
                                    disabled={approvalWarningLetter.isPending}
                                    className="cursor-pointer w-full sm:w-auto py-3 px-5 bg-blue-600 text-white font-semibold rounded-sm shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-base tracking-wide uppercase disabled:bg-gray-400"
                                >
                                    {lang === 'vi' ? (isFinalStep ? 'Xác nhận' : 'Duyệt đơn') : (isFinalStep ? 'Confirm' : 'Approve')}
                                </button>
                            </>
                        )
                    }
                </div>
                <div className="mb-0">
                    <span className="font-bold text-black">
                        {lang === 'vi' ? 'Quy trình' : 'Approval flow'}:
                    </span>{' '}
                    {formDataDetail?.defineSteps
                        .map((item: any, idx: number) => (
                            <span key={idx} className="font-bold text-orange-700">
                                ({idx + 1}) {item?.Name ?? item?.UserCode ?? 'HR'}
                                {idx < formDataDetail.defineSteps?.length - 1 ? ', ' : ''}
                            </span>
                        ))}
                </div>
                <HistoryApproval historyApplicationForm={formDataDetail?.warningLetter?.applicationForm?.historyApplicationForms}/>
            </div>
        </div>
    );
}

export default ViewApprovalWarningLetter;