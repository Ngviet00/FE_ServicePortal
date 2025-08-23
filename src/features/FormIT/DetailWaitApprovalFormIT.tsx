/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@/components/ComponentCustom/Flatpickr';
import { Button } from '@/components/ui/button';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import priorityApi, { IPriority } from '@/api/priorityApi';
import itCategoryApi, { ITCategoryInterface } from '@/api/itCategoryApi';
import { useEffect, useState } from 'react';
import DotRequireComponent from '@/components/DotRequireComponent';
import { getErrorMessage, ShowToast, STATUS_ENUM } from '@/lib';
import { useAuthStore } from '@/store/authStore';
import itFormApi, { useAssignedTaskITForm, useResolvedTaskITForm } from '@/api/itFormApi';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import ModalConfirm from '@/components/ModalConfirm';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import userApi, { ISelectedUserAssigned } from '@/api/userApi';
import { useApproval } from '@/api/approvalApi';
import { Spinner } from '@/components/ui/spinner';
import HistoryApproval from '../Approval/Components/HistoryApproval';

const DetailWaitApprovalFormIT = () => {
    const { t } = useTranslation('formIT');
    const { t:tCommon} = useTranslation('common');
    const { user } = useAuthStore()
    const lang = useTranslation().i18n.language.split('-')[0]
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { id } = useParams<{ id: string }>();
    const [statusModalConfirm, setStatusModalConfirm] = useState('')
    const [note, setNote] = useState("")
    const [searchParams] = useSearchParams();
    const mode = searchParams.get("mode") == 'approval' ? 'approval' : 'view'
    const [dataItForm, setDataITForm] = useState<any>(null);
    const [selectedUserAssigned, setSelectedUserAssigned] = useState<ISelectedUserAssigned[]>([]);
    const [targetDate, setTargetDate] = useState<any>(null);
    const [actualDate, setActualDate] = useState<any>(null);

    const approval = useApproval();
    const assignTask = useAssignedTaskITForm()
    const resolvedTask = useResolvedTaskITForm()

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

    const { data: ItMembers = [] } = useQuery({
        queryKey: ['get-all-it-member'],
        queryFn: async () => {
            const res = await userApi.GetMultipleUserViclockByOrgPositionId(8)
            return res.data.data
        },
    });

    useEffect(() => {
        if (id) {
            const fetchData = async () => {
                try {
                    const data = await itFormApi.getById(id);
                    const result = data.data.data;
                    setDataITForm(result)
                } catch (err) {
                    ShowToast(getErrorMessage(err), "error")
                }
            };
            fetchData();
        }
    }, [id])

    const isFinalApproval = dataItForm?.applicationForm?.requestStatusId == STATUS_ENUM.FINAL_APPROVAL
    const isAssigned = dataItForm?.applicationForm?.requestStatusId == STATUS_ENUM.ASSIGNED
    const isCompleted = dataItForm?.applicationForm?.requestStatusId == STATUS_ENUM.COMPLETED
    const isRejected = dataItForm?.applicationForm?.requestStatusId == STATUS_ENUM.REJECT

    const handleCheckboxChangeUserAssigned = (event: React.ChangeEvent<HTMLInputElement>, item: {nvMaNV: string, nvHoTen: string, email: string}) => {
        const isChecked = event.target.checked;
        if (isChecked) {
            setSelectedUserAssigned(prevSelected => [...prevSelected, { userCode: item.nvMaNV, email: item.email }]);
        } else {
            setSelectedUserAssigned(prevSelected => prevSelected.filter(u => u.userCode !== item.nvMaNV));
        }
    };

    const handleSaveModalConfirm = async (type: string) => {
        if (isFinalApproval) {
            if (selectedUserAssigned.length == 0) {
                ShowToast(lang == 'vi' ? 'Vui lòng chọn ít nhất 1 người để làm công việc này' : 'Please select at least one person to assign the task.', "error")
                setStatusModalConfirm('')
                return
            }
        }

        try {
            //final approval, manager approval assigned task to staff
            if (isFinalApproval) {
                await assignTask.mutateAsync({
                    UserCodeApproval: user?.userCode,
                    UserNameApproval: user?.userName ?? '',
                    NoteManager: note,
                    OrgPositionId: user?.orgPositionId,
                    ITFormId: id,
                    UrlFrontend: window.location.origin,
                    UserAssignedTasks: selectedUserAssigned
                })
                navigate("/approval/pending-approval")
            }
            else {
                //user is assigned task save
                if (isAssigned) {
                    await resolvedTask.mutateAsync({
                        UserCodeApproval: user?.userCode,
                        UserNameApproval: user?.userName ?? '',
                        ITFormId: id, 
                        UrlFrontend: window.location.origin,
                        TargetCompletionDate: targetDate,
                        ActualCompletionDate: actualDate
                    })
                    navigate("/approval/assigned-tasks")
                }
                else {
                    //status normal, approval for staff
                    await approval.mutateAsync({
                        UserCodeApproval: user?.userCode,
                        UserNameApproval: user?.userName ?? "",
                        OrgPositionId: user?.orgPositionId,
                        Status: type == 'approval' ? true : false,
                        Note: note,
                        ITFormId: id,
                        urlFrontend: window.location.origin,
                        RequestTypeId: dataItForm?.applicationForm?.requestTypeId,
                    })
                    navigate("/approval/pending-approval")
                }
            }

            setStatusModalConfirm('')
            
            queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div className="p-1 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0">{t('create.title_approval')}</h3>
            </div>

            <ModalConfirm
                type={statusModalConfirm}
                isOpen={statusModalConfirm != ''}
                onClose={() => setStatusModalConfirm('')}
                onSave={handleSaveModalConfirm}
            />

            <div className="flex">
                <div className="w-full max-w-3xl bg-white rounded-xl pl-0">
                    <form className="flex flex-col gap-6">
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
                                            type="text"
                                            id="requester.userCode"
                                            value={dataItForm?.userCodeRequestor ?? ''}
                                            placeholder={tCommon('usercode')}
                                            className={`border-gray-300 bg-gray-100 mt-1 w-full p-2 rounded-md text-sm border select-none`}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="requester.name" className="block text-sm font-medium text-gray-700">
                                            {tCommon('name')}<DotRequireComponent />
                                        </label>
                                        <input
                                            value={dataItForm?.userNameRequestor ?? ''}
                                            disabled
                                            type="text"
                                            id="requester.name"
                                            placeholder={tCommon('name')}
                                            className={`border-gray-300 bg-gray-100 mt-1 w-full p-2 rounded-md text-sm border`}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="requester.department" className="block text-sm font-medium text-gray-700">
                                            {tCommon('department')}<DotRequireComponent />
                                        </label>
                                        <input
                                            value={dataItForm?.orgUnit?.name ?? ''}
                                            disabled
                                            type="text"
                                            id="requester.department"
                                            placeholder={tCommon('department')}
                                            className={`border-gray-300 mt-1 w-full p-2 rounded-md text-sm border bg-gray-100`}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="form-group">
                                        <label htmlFor="requester.position" className="block text-sm font-medium text-gray-700">
                                            {t('create.position')}<DotRequireComponent />
                                        </label>
                                        <input
                                            value={dataItForm?.position ?? ''}
                                            disabled
                                            type="text"
                                            id="requester.position"
                                            placeholder={t('create.position')}
                                            className={`border-gray-300 bg-gray-100 mt-1 w-full p-2 rounded-md text-sm border`}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="requester.email" className="block text-sm font-medium text-gray-700">
                                            Email<DotRequireComponent />
                                        </label>
                                        <input
                                            value={dataItForm?.email ?? ''}
                                            disabled
                                            type="email"
                                            id="requester.email"
                                            placeholder="email@vsvn.com.vn"
                                            className={`border-gray-300 bg-gray-100 mt-1 w-full p-2 rounded-md text-sm border`}
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
                                        <DateTimePicker
                                            key={dataItForm?.requestDate}
                                            disabled={true}
                                            enableTime={false}
                                            dateFormat="Y-m-d"
                                            initialDateTime={dataItForm?.requestDate ?? ''}
                                            onChange={() => {}}
                                            className={`dark:bg-[#454545] w-full shadow-xs border border-gray-300 bg-gray-100 p-2 text-sm rounded-[5px] hover:cursor-pointer`}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="itRequest.dateCompleted" className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('create.date_required_completed')}<DotRequireComponent />
                                        </label>
                                        <DateTimePicker
                                            disabled={true}
                                            enableTime={false}
                                            dateFormat="Y-m-d"
                                            initialDateTime={dataItForm?.requiredCompletionDate ?? ''}
                                            onChange={() => {}}
                                            className={`dark:bg-[#454545] w-full shadow-xs border border-gray-300 bg-gray-100 p-2 text-sm rounded-[5px] hover:cursor-pointer`}
                                        />
                                    </div>
                                </div>

                                <div className="form-group mt-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                        {t('create.category')}<DotRequireComponent />
                                    </label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {ItCategories?.map((item: ITCategoryInterface, idx: number) => {
                                            const isChecked = !!dataItForm?.itFormCategories?.some((e: { itCategoryId: number }) => e.itCategoryId === item.id);

                                            return (
                                                <label key={idx} className="w-[48%] flex items-center space-x-2 cursor-pointer select-none">
                                                    <input
                                                        value={item.id}
                                                        disabled
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        className="border-gray-300 scale-[1.4] accent-black"
                                                    />
                                                    <span>{item.name}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="form-group mt-4">
                                    <label htmlFor="itRequest.reason" className="block text-sm font-medium text-gray-700">
                                        {tCommon('reason')}<DotRequireComponent />
                                    </label>
                                    <textarea
                                        disabled
                                        value={dataItForm?.reason}
                                        id="itRequest.reason"
                                        placeholder={tCommon('reason')}
                                        rows={4}
                                        className={`border-gray-300 bg-gray-100 mt-1 w-full p-2 rounded-md text-sm border`}
                                    ></textarea>
                                </div>

                                <div className="form-group mt-4">
                                    <label htmlFor="itRequest.priority" className="block text-sm font-medium text-gray-700">
                                        {t('create.priority')}
                                    </label>
                                    <select
                                        disabled
                                        value={dataItForm?.priorityId}
                                        id="itRequest.priority"
                                        className="mt-1 w-full p-2 rounded-md text-sm border border-gray-300 bg-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        {
                                            priorities?.map((item: IPriority, idx: number) => (
                                                <option value={item.id} key={idx}>{lang == 'vi' ? item.name : item.nameE}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div className='pl-5 border-l-1 ml-5 w-full'>
                    <div className="flex justify-end flex-col gap-4 mt-8">
                        <div className='flex-1'>
                            <div className='w-full'>
                                <Label className='mb-1'>{t('create.note')} <span className='italic text-red-500'>{isAssigned || isFinalApproval || isCompleted ? '(Manager IT)' : ''}</span></Label>
                                <Textarea 
                                    readOnly={mode == 'view' || isAssigned} 
                                    placeholder={t('create.note')} 
                                    value={isAssigned || isCompleted ? dataItForm?.noteManagerIT ?? note : note} 
                                    onChange={(e) => setNote(e.target.value)} 
                                    className={`${mode == 'view' || dataItForm?.applicationForm?.requestStatusId == STATUS_ENUM.ASSIGNED ? 'bg-gray-100': ''} border-gray-300`}
                                />
                            </div>
                        </div>
                        {
                            isFinalApproval || isAssigned ? (
                                <div>
                                    <div className="form-group">
                                        <label className="block text-sm font-medium text-gray-700">
                                            {t('create.assigned')}<DotRequireComponent />
                                        </label>
                                        {
                                            isAssigned ? (
                                                <div className="flex flex-col gap-2 mt-2">
                                                    {ItMembers?.map((item: {nvMaNV: string, nvHoTen: string, email: string}, idx: number) => {                                             
                                                        const isExist = dataItForm?.applicationForm?.assignedTasks.some((e: { userCode: string; }) => e.userCode === item.nvMaNV)

                                                        if (isExist) {
                                                            return (
                                                                <label key={idx} className="w-[48%] flex items-center space-x-2 cursor-pointer">
                                                                    <span><strong>({item.nvMaNV})</strong> {item.nvHoTen}</span>
                                                                </label>
                                                            );
                                                        }                                                        
                                                    })}
                                                </div>
                                            ) : isFinalApproval ? (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {ItMembers?.map((item: {nvMaNV: string, nvHoTen: string, email: string}, idx: number) => {                                            
                                                        return (
                                                            <label key={idx} className="w-[48%] flex items-center space-x-2 cursor-pointer">
                                                                <input
                                                                    disabled={mode == 'view' || isAssigned}
                                                                    type="checkbox"
                                                                    checked={selectedUserAssigned.some(e => e.userCode == item.nvMaNV)}
                                                                    value={item.nvMaNV}
                                                                    className="border-gray-300 scale-[1.4] accent-black"
                                                                    onChange={(e) => handleCheckboxChangeUserAssigned(e, item)}
                                                                />
                                                                <span><strong>({item.nvMaNV})</strong> {item.nvHoTen}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            ) : (<></>)
                                        }
                                        
                                    </div>
                                </div>
                            ) : (<></>)
                        }
                        {
                            isAssigned || isCompleted || isRejected ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="form-group">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('create.target_completion_date')}<DotRequireComponent />
                                        </label>
                                        <DateTimePicker
                                            disabled={!isAssigned}
                                            key={'target_date'}
                                            enableTime={false}
                                            dateFormat="Y-m-d"
                                            initialDateTime={targetDate ?? dataItForm?.targetCompletionDate ?? new Date().toISOString().split('T')[0]}
                                            onChange={(_selectedDates, dateStr) => setTargetDate(dateStr)}
                                            className={`dark:bg-[#454545] w-full shadow-xs border border-gray-300 ${!isAssigned ? 'bg-gray-100' : ''} p-2 text-sm rounded-[5px] hover:cursor-pointer`}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('create.actual_completion_date')}<DotRequireComponent />
                                        </label>
                                        <DateTimePicker
                                            disabled={!isAssigned}
                                            key={'actual_date'}
                                            enableTime={false}
                                            dateFormat="Y-m-d"
                                            initialDateTime={actualDate ?? dataItForm?.actualCompletionDate ?? new Date().toISOString().split('T')[0]}
                                            onChange={(_selectedDates, dateStr) => setActualDate(dateStr)}
                                            className={`dark:bg-[#454545] w-full shadow-xs border border-gray-300 ${!isAssigned ? 'bg-gray-100' : ''} p-2 text-sm rounded-[5px] hover:cursor-pointer`}
                                        />
                                    </div>
                                </div>
                            ) : (<></>)
                        }
                        {
                            mode != 'view' ? (
                                <div className='flex justify-end'>
                                    <Button
                                        disabled={assignTask.isPending}
                                        onClick={() => setStatusModalConfirm('approval')}
                                        className="px-4 py-2 mr-2 bg-blue-700 text-white rounded-[3px] shadow-lg hover:bg-blue-800 hover:shadow-xl transition-all duration-200 text-base hover:cursor-pointer"
                                    >
                                        {assignTask.isPending ? <Spinner size="small" className='text-white'/> : tCommon(isAssigned ? 'resolved' : 'approval')}
                                    </Button>
                                    {
                                        dataItForm?.applicationForm?.requestStatusId != STATUS_ENUM.FINAL_APPROVAL && dataItForm?.applicationForm?.requestStatusId != STATUS_ENUM.ASSIGNED ? (
                                            <Button onClick={() => setStatusModalConfirm('reject')} className="flex items-center justify-center hover:cursor-pointer px-8 py-4 bg-red-600 text-white rounded-[3px] shadow-lg hover:bg-red-700 hover:shadow-xl transform transition-all duration-200 text-base">
                                                    {tCommon('reject')}
                                            </Button>
                                        ) : (
                                            <></>
                                        )
                                    }
                                </div>
                            ) : (<></>)
                        }
                        <HistoryApproval historyApplicationForm={dataItForm?.applicationForm?.historyApplicationForms[0]}/>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailWaitApprovalFormIT;
