/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { ShowToast, StatusApplicationFormEnum } from '@/lib';
import DateTimePicker from '@/components/ComponentCustom/Flatpickr';
import { Spinner } from '@/components/ui/spinner';
import requisitionLetterApi, { useApprovalRequisitionLetter, useAssignedTaskRequisitionLetter, useExportExcelRequisition, useResolvedTaskRequisitionLetter } from '@/api/HR/requisitionApi';
import { RequisitionFormSchema, TRequisitionLetterForm } from './CreateRequisition';
import HistoryApproval from '@/features/Approval/Components/HistoryApproval';
import { ISelectedUserAssigned } from '@/api/userApi';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ModalConfirm from '@/components/ModalConfirm';
import DotRequireComponent from '@/components/DotRequireComponent';
import warningLetterApi from '@/api/HR/warningLetterApi';

interface ViewApprovalTerminationLetterProps {
    id: string;
    mode?: string
}

const ViewApprovalRequisition: React.FC<ViewApprovalTerminationLetterProps> = ({id, mode}) => {
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
        formState: { errors },
        setValue, 
        getValues,
        reset
    } = useForm<TRequisitionLetterForm>({
        resolver: zodResolver(RequisitionFormSchema),
        defaultValues: {
            department: user?.departmentName || '',
            positionAdditional: '',
            additionalPeople: '1',
            dateRequired: new Date().toISOString().split("T")[0],
            reasons: {
                reason_expand: false,
                reason_replace: false,
                reason_temporary: false,
                reason_hr_reserve: false,
            },
            marriage: {
                marriage_marriage: false,
                marriage_unmarriage: false,
                marriage_un_important: false,
            },
            expertise: false,
            education: {
                education_primary: false,
                education_secondary: false,
                education_hightschool: false,
            },
            language: false,
            english: {
                acceptable: false,
                normal: false,
                good: false,
            },
            japanese: {
                acceptable: false,
                normal: false,
                good: false,
            },
            chinese: {
                acceptable: false,
                normal: false,
                good: false,
            },
            experience: '',
            personality: '',
            skills: '',
            descriptionJob: '',
        }
    });

    const isEdit = !!id;

    const { data: formDataDetail, isLoading: isLoadingFormDataDetail } = useQuery({
        queryKey: ['requisition-letter-detail', id],
        queryFn: async () => {
            try {
                const res = await requisitionLetterApi.getByApplicationFormCode(id ?? '');
                return res.data.data;
            } catch {
                return
            }
        },
        enabled: isEdit,
    });

    const approvalRequisitionLetter = useApprovalRequisitionLetter()
    const assignRequisitionLetter = useAssignedTaskRequisitionLetter()
    const resolvedTask = useResolvedTaskRequisitionLetter()

    const handleSaveModalConfirm = async (type: string) => {
        setStatusModalConfirm('')
        const payload = {
            RequestTypeId: formDataDetail?.requisitionLetter?.applicationForm?.requestTypeId,
            applicationFormId: formDataDetail?.requisitionLetter?.applicationForm?.id,
            applicationFormCode: formDataDetail?.requisitionLetter?.applicationForm?.code,
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
        else if (type == 'assigned') {
            if (selectedUserAssigned.length == 0) {
                ShowToast(lang == 'vi' ? 'Vui lòng chọn ít nhất 1 người để giao việc' : 'Please select at least 1 person', 'error')
                return 
            }
            await assignRequisitionLetter.mutateAsync(payload)
        } 
        else if (type == 'reject' || type == 'approval') {
            await approvalRequisitionLetter.mutateAsync(payload);
        }

        queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] })

        if (formDataDetail?.resignationLetter?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Assigned) {
            navigate("/approval/assigned-tasks")
        }
        else {
            navigate("/approval/pending-approval")
        }
    }

    useEffect(() => {
        if (formDataDetail) {
            const reasonParse = JSON.parse(formDataDetail?.requisitionLetter?.reason ?? "{}");
            const marriageParse = JSON.parse(formDataDetail?.requisitionLetter?.getMarriage ?? "{}");
            const educationParse = JSON.parse(formDataDetail?.requisitionLetter?.education ?? "{}");
            const englishParse = JSON.parse(formDataDetail?.requisitionLetter?.english ?? "{}");
            const chineseParse = JSON.parse(formDataDetail?.requisitionLetter?.chinese ?? "{}");
            const japaneseParse = JSON.parse(formDataDetail?.requisitionLetter?.japanese ?? "{}");

            reset({
                department: formDataDetail?.requisitionLetter?.departmentNameRequest || '',
                positionAdditional: formDataDetail?.requisitionLetter?.positionAdditional || '',
                additionalPeople: String(formDataDetail?.requisitionLetter?.additionalPeople || '1'),
                dateRequired: formDataDetail?.requisitionLetter?.dateRequired || '',
                reasons: {
                    reason_expand: reasonParse?.reason_expand || false,
                    reason_replace: reasonParse?.reason_replace || false,
                    reason_temporary: reasonParse?.reason_temporary || false,
                    reason_hr_reserve: reasonParse?.reason_hr_reserve || false,
                },
                marriage: {
                    marriage_marriage: marriageParse?.marriage_marriage || false,
                    marriage_unmarriage: marriageParse?.marriage_unmarriage || false,
                    marriage_un_important: marriageParse?.marriage_un_important || false,
                },
                expertise: formDataDetail?.requisitionLetter?.expertise || false,
                education: {
                    education_primary: educationParse?.education_primary || false,
                    education_secondary: educationParse?.education_secondary || false,
                    education_hightschool: educationParse?.education_hightschool || false,
                },
                language: formDataDetail?.requisitionLetter?.language || false,
                english: {
                    acceptable: englishParse?.acceptable || false,
                    normal: englishParse?.normal || false,
                    good: englishParse?.good || false,
                },
                japanese: {
                    acceptable: japaneseParse?.acceptable || false,
                    normal: japaneseParse?.normal || false,
                    good: japaneseParse?.good || false,
                },
                chinese: {
                    acceptable: chineseParse?.acceptable || false,
                    normal: chineseParse?.normal || false,
                    good: chineseParse?.good || false,
                },
                experience: formDataDetail?.requisitionLetter?.experience || '',
                personality: formDataDetail?.requisitionLetter?.personality || '',
                skills: formDataDetail?.requisitionLetter?.skills || '',
                descriptionJob: formDataDetail?.requisitionLetter?.descriptionJob || '',
            });
        }
    }, [formDataDetail, reset])

    const CheckboxItem: React.FC<{ name: string, label: string, isParent?: boolean }> = ({ name, label, isParent }) => {
        const fieldName = name;
        return (
            <div className="flex items-center space-x-2 pointer-events-none mb-1"> 
                <input
                    id={name}
                    type="checkbox"
                    {...register(fieldName as any)}
                    readOnly
                    className="form-checkbox h-5 w-5 accent-black rounded border-gray-300"
                />
                <label
                    htmlFor={name}
                    className={`${isParent ? 'text-base' : 'text-sm'} font-medium text-gray-700 select-none`}
                >
                    {label}
                </label>
            </div>
        );
    };
    
    const { data: hrMembers = [] } = useQuery({
        queryKey: ['get-all-hr-member'],
        queryFn: async () => {
            const res = await warningLetterApi.getMemberHrs()
            return res.data.data
        }
    });

    const handleCheckboxChangeUserAssigned = (event: React.ChangeEvent<HTMLInputElement>, item: {nvMaNV: string, nvHoTen: string, email: string}) => {
        const isChecked = event.target.checked;
        if (isChecked) {
            setSelectedUserAssigned(prevSelected => [...prevSelected, { userCode: item.nvMaNV, userName: item.nvHoTen, email: item.email }]);
        } else {
            setSelectedUserAssigned(prevSelected => prevSelected.filter(u => u.userCode !== item.nvMaNV));
        }
    };

    const exportExcel = useExportExcelRequisition()
    const handleExport = async () => {
        await exportExcel.mutateAsync(id)
    };

    if (id && isLoadingFormDataDetail) {
        return <div>{lang === 'vi' ? 'Đang tải dữ liệu...' : 'Loading data...'}</div>;
    }

    if (id && !formDataDetail) {
        return  <div className='text-red-700 font-semibold'>{lang == 'vi' ? 'Không tìm thấy dữ liệu' : 'Not found data'}</div>;
    }

    return (
        <div className="p-1 pl-1 pt-0 space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-y-3 gap-x-4 mb-2">
                <h3 className="font-bold text-xl md:text-2xl m-0">{t('requisition.create.title')}</h3>
                {
                    [StatusApplicationFormEnum.Assigned, StatusApplicationFormEnum.Complete].includes(formDataDetail?.requisitionLetter.applicationForm?.requestStatusId)
                        &&
                        <button disabled={exportExcel.isPending} onClick={handleExport} className='btn bg-blue-600 cursor-pointer p-2 rounded-sm text-white hover:bg-blue-700 disabled:bg-gray-400'>
                            {exportExcel.isPending ? <Spinner/> : lang == 'vi' ? 'Xuất excel' : 'Export excel'}
                        </button>
                }
            </div>
            <div>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('requisition.create.department')}</label>
                            <input
                                {...register("department")}
                                type='text'
                                disabled
                                placeholder={t('requisition.create.department')}
                                className={`w-full p-2 border rounded-md transition duration-150 ease-in-out text-sm bg-gray-50 border-gray-300 ${errors.department ? 'border-red-500 bg-red-50' : ''}`}
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('requisition.create.position_additional')}</label>
                            <input
                                {...register("positionAdditional")}
                                type='text'
                                disabled
                                placeholder={t('requisition.create.position_additional')}
                                className={`w-full p-2 border rounded-md transition duration-150 ease-in-out text-sm bg-gray-50 border-gray-300 ${errors.positionAdditional ? 'border-red-500 bg-red-50' : ''}`}
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('requisition.create.additional_people')}</label>
                            <input
                                {...register("additionalPeople")}
                                type="text"
                                disabled
                                inputMode="numeric"
                                onChange={(e) => {
                                    let value = e.target.value.replace(/\D/g, "");

                                    if (value !== "") {
                                        const num = Number(value);
                                        if (num > 500) value = "500";
                                    }

                                    e.target.value = value;
                                }}
                                placeholder={t('requisition.create.additional_people')}
                                className={`w-full p-2 border rounded-md transition duration-150 ease-in-out text-sm bg-gray-50 border-gray-300 focus:border-blue-500 ${errors.additionalPeople ? 'border-red-500 bg-red-50' : ''}`}
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('requisition.create.date_required')}</label>
                            <DateTimePicker
                                {...register("dateRequired")}
                                enableTime={false}
                                disabled
                                dateFormat="Y-m-d"
                                initialDateTime={getValues(`dateRequired`)}
                                onChange={(_selectedDates, dateStr) => setValue("dateRequired", dateStr)}
                                className={`dark:bg-[#454545] text-sm border rounded-md border-gray-300 p-2 w-full bg-gray-50`}
                            />
                        </div>
                    </div>

                    <div className={`bg-white transition-all duration-300 mb-2 flex **flex-wrap** **sm:justify-between** border-b border-gray-300 pb-4 pt-2`}>
                        <div className="w-full mb-4 sm:w-auto"> 
                            <div>
                                <h2 className="text-lg font-bold border-gray-300 pb-2 mb-1 text-gray-800">
                                    {t('requisition.create.reason')} 
                                    <span className='text-base italic text-red-500 ml-2'>
                                        {errors.reasons ? lang === 'vi' ? '(Bắt buộc)' : '(Required)' : ''}
                                    </span>
                                </h2>
                                <div className={`flex items-start flex-wrap`}>
                                    <div className="flex items-start mr-3">
                                        <CheckboxItem name="reasons.reason_expand" label={`${t('requisition.create.expand')}`} />
                                    </div>
                                    <div className="flex items-start mr-3">
                                        <CheckboxItem name="reasons.reason_replace" label={`${t('requisition.create.replace')}`} />
                                    </div>
                                    <div className="flex items-start mr-3">
                                        <CheckboxItem name="reasons.reason_temporary" label={`${t('requisition.create.temporary')}`} />
                                    </div>
                                    <div className="flex items-start mr-3">
                                        <CheckboxItem name="reasons.reason_hr_reserve" label={`${t('requisition.create.hr_reserve')}`} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full mb-4 sm:w-auto mx-5">
                            <div>
                                <h2 className="text-lg font-bold border-gray-300 pb-2 mb-1 text-gray-800">
                                    {t('requisition.create.marriage')} 
                                </h2>
                                <div className={`flex items-start flex-wrap`}>
                                    <div className="flex items-start mr-3">
                                        <CheckboxItem name="marriage.marriage_marriage" label={`${t('requisition.create.marriage')}`} />
                                    </div>
                                    <div className="flex items-start mr-3">
                                        <CheckboxItem name="marriage.marriage_unmarriage" label={`${t('requisition.create.unmarried')}`} />
                                    </div>
                                    <div className="flex items-start mr-3">
                                        <CheckboxItem name="marriage.marriage_un_important" label={`${t('requisition.create.no_important_marriage')}`} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full mb-4 sm:w-auto">
                            <div>
                                <h2 className="text-lg font-bold border-gray-300 pb-2 mb-1 text-gray-800">
                                    {t('requisition.create.education')}
                                </h2>
                                <div className={`flex items-start flex-wrap`}>
                                    <div className="flex items-start mr-3">
                                        <CheckboxItem name="education.education_primary" label={`${t('requisition.create.primary_school')}`} />
                                    </div>
                                    <div className="flex items-start mr-3">
                                        <CheckboxItem name="education.education_secondary" label={`${t('requisition.create.middle_school')}`} />
                                    </div>
                                    <div className="flex items-start mr-3">
                                        <CheckboxItem name="education.education_hightschool" label={`${t('requisition.create.high_school')}`} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={`bg-white transition-all duration-300 mb-3 flex **flex-wrap** **sm:justify-between** border-b border-gray-300 pb-4`}>
                        <div className='w-full mb-4 sm:w-auto flex content-center items-center'>
                            <h2 className="text-lg font-bold border-gray-300 text-gray-800 mr-2">
                                {t('requisition.create.expertise')}
                            </h2>
                            <CheckboxItem name="expertise" label={``} />
                        </div>
                        
                        <div className='w-full mb-4 sm:w-auto flex content-center items-center sm:mx-10'>
                            <h2 className="text-lg font-bold border-gray-300 text-gray-800 mr-2">
                                {t('requisition.create.language')}
                            </h2>
                            <CheckboxItem name="language" label={``} />
                        </div>
                        
                        <div className="w-full mb-4 sm:w-auto">
                            <h2 className="text-lg font-bold border-gray-300 pb-2 mb-1 text-gray-800">
                                {t('requisition.create.english')}
                            </h2>
                            <div className={`flex items-start flex-wrap`}>
                                <div className="flex items-start mr-3">
                                    <CheckboxItem name="english.acceptable" label={`${t('requisition.create.acceptable')}`} />
                                </div>
                                <div className="flex items-start mr-3">
                                    <CheckboxItem name="english.normal" label={`${t('requisition.create.normal')}`} />
                                </div>
                                <div className="flex items-start mr-3">
                                    <CheckboxItem name="english.good" label={`${t('requisition.create.good')}`} />
                                </div>
                            </div>
                        </div>
                        
                        <div className="w-full mb-4 sm:w-auto sm:mx-10">
                            <h2 className="text-lg font-bold border-gray-300 pb-2 mb-1 text-gray-800">
                                {t('requisition.create.japanese')}
                            </h2>
                            <div className={`flex items-start flex-wrap`}>
                                <div className="flex items-start mr-3">
                                    <CheckboxItem name="japanese.acceptable" label={`${t('requisition.create.acceptable')}`} />
                                </div>
                                <div className="flex items-start mr-3">
                                    <CheckboxItem name="japanese.normal" label={`${t('requisition.create.normal')}`} />
                                </div>
                                <div className="flex items-start mr-3">
                                    <CheckboxItem name="japanese.good" label={`${t('requisition.create.good')}`} />
                                </div>
                            </div>
                        </div>
                        
                        <div className="w-full mb-4 sm:w-auto">
                            <h2 className="text-lg font-bold border-gray-300 pb-2 mb-1 text-gray-800">
                                {t('requisition.create.chinese')}
                            </h2>
                            <div className={`flex items-start flex-wrap`}>
                                <div className="flex items-start mr-3">
                                    <CheckboxItem name="chinese.acceptable" label={`${t('requisition.create.acceptable')}`} />
                                </div>
                                <div className="flex items-start mr-3">
                                    <CheckboxItem name="chinese.normal" label={`${t('requisition.create.normal')}`} />
                                </div>
                                <div className="flex items-start mr-3">
                                    <CheckboxItem name="chinese.good" label={`${t('requisition.create.good')}`} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-600 mb-1">{t('requisition.create.experience')}</label>
                            <input
                                {...register("experience")}
                                type='text'
                                disabled
                                placeholder={t('requisition.create.experience')}
                                className={`w-full p-2 border rounded-md transition duration-150 bg-gray-50 ease-in-out text-sm border-gray-300 ${errors.experience ? 'border-red-500 bg-red-50' : ''}`}
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-600 mb-1">{t('requisition.create.personality')}</label>
                            <input
                                {...register("personality")}
                                type='text'
                                disabled
                                placeholder={t('requisition.create.personality')}
                                className={`w-full p-2 border rounded-md transition duration-150 bg-gray-50 ease-in-out text-sm border-gray-300 ${errors.personality ? 'border-red-500 bg-red-50' : ''}`}
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-600 mb-1">{t('requisition.create.skills')}</label>
                            <input
                                {...register("skills")}
                                type='text'
                                disabled
                                placeholder={t('requisition.create.skills')}
                                className={`w-full p-2 border rounded-md transition duration-150 bg-gray-50 ease-in-out text-sm border-gray-300 focus:border-blue-500 ${errors.skills ? 'border-red-500 bg-red-50' : ''}`}
                            />
                        </div>
                    </div>
                    <div className='mb-0'>
                        <label className="block text-sm font-medium text-gray-600 mb-1">{t('requisition.create.description_job')}</label>
                        <textarea 
                            {...register("descriptionJob")} 
                            className='border p-2 w-full border-gray-300 rounded-sm text-sm bg-gray-50' 
                            rows={3} 
                            disabled
                            placeholder={t('requisition.create.description_job')}/>
                    </div>
                    <div className='mb-1'>
                        <Label className='mb-1'>{lang == 'vi' ? 'Ghi chú' : 'Note'}</Label>
                        <Textarea placeholder='Note' value={note} onChange={(e) => setNote(e.target.value)} className="border-gray-300"/>
                    </div>

                    <ModalConfirm
                        type={statusModalConfirm}
                        isOpen={statusModalConfirm != ''}
                        onClose={() => setStatusModalConfirm('')}
                        onSave={handleSaveModalConfirm}
                        isPending={approvalRequisitionLetter.isPending || assignRequisitionLetter.isPending || resolvedTask.isPending}
                    />

                    <div className='mt-2'>
                    {
                        [StatusApplicationFormEnum.FinalApproval, StatusApplicationFormEnum.Assigned, StatusApplicationFormEnum.Complete]
                            .includes(formDataDetail?.requisitionLetter?.applicationForm?.requestStatusId) && 
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
                            ) : formDataDetail?.requisitionLetter?.applicationForm?.requestStatusId == StatusApplicationFormEnum.FinalApproval ?
                            (
                                hrMembers?.map((item: {nvMaNV: string, nvHoTen: string, email: string}, idx: number) => (
                                    <label
                                        key={idx}
                                        className="flex items-center space-x-2 cursor-pointer w-full sm:w-[48%]"
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
                </div>
                </div>
                <div className='flex justify-end mt-2'>
                    {
                        formDataDetail?.requisitionLetter?.applicationForm?.requestStatusId == StatusApplicationFormEnum.FinalApproval ?
                                mode != 'view' && <button
                                onClick={() => setStatusModalConfirm('assigned')}
                                disabled={approvalRequisitionLetter.isPending}
                                className="mr-2 cursor-pointer w-full sm:w-auto py-3 px-4 bg-blue-600 text-white font-semibold rounded-sm shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm tracking-wide uppercase disabled:bg-gray-400"
                            >
                                {lang == 'vi' ? 'Giao việc' : 'Assigned'}
                            </button>
                        :
                        formDataDetail?.requisitionLetter?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Assigned ?
                        (
                                mode != 'view' &&
                                <button
                                    onClick={() => setStatusModalConfirm('resolved')}
                                    disabled={approvalRequisitionLetter.isPending}
                                    className="mr-2 cursor-pointer w-full sm:w-auto py-3 px-4 bg-blue-600 text-white font-semibold rounded-sm shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm tracking-wide uppercase disabled:bg-gray-400"
                                >
                                    {lang == 'vi' ? 'Đóng' : 'Closed'}
                                </button>
                        ) : [StatusApplicationFormEnum.Complete, StatusApplicationFormEnum.Reject].includes(formDataDetail?.requisitionLetter?.applicationForm?.requestStatusId) ? (null) : (
                                mode != 'view' && <>
                                <button
                                    onClick={() => setStatusModalConfirm('reject')}
                                    disabled={approvalRequisitionLetter.isPending}
                                    className="mr-2 cursor-pointer w-full sm:w-auto py-1 px-4 bg-red-600 text-white font-semibold rounded-sm shadow-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm tracking-wide uppercase disabled:bg-gray-400"
                                >
                                    {lang == 'vi' ? 'Từ chối' : 'Reject'}
                                </button>
                                <button
                                    onClick={() => setStatusModalConfirm('approval')}
                                    disabled={approvalRequisitionLetter.isPending}
                                    className="cursor-pointer w-full sm:w-auto py-3 px-5 bg-blue-600 text-white font-semibold rounded-sm shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-base tracking-wide uppercase disabled:bg-gray-400"
                                >
                                    {lang == 'vi' ? 'Duyệt đơn' : 'Approval'}
                                </button>
                            </>
                        )
                    }
                </div>
                <div className="mb-0">
                    <span className="font-bold text-black">
                        {lang === 'vi' ? 'Quy trình' : 'Approval flow'}:
                    </span>{' '}
                    {formDataDetail?.defineAction
                        .map((item: any, idx: number) => (
                            <span key={idx} className="font-bold text-orange-700">
                                ({idx + 1}) {item?.Name ?? item?.UserCode ?? 'HR'}
                                {idx < formDataDetail?.defineAction?.length - 1 ? ', ' : ''}
                            </span>
                        ))}
                </div>
                <HistoryApproval historyApplicationForm={formDataDetail?.requisitionLetter?.applicationForm?.historyApplicationForms}/>
            </div>
        </div>
    );
}

export default ViewApprovalRequisition;