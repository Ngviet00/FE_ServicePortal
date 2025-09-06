import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ShowToast, STATUS_ENUM } from '@/lib';
import { useAuthStore } from '@/store/authStore';
import itFormApi, { useAssignedTaskITForm } from '@/api/itFormApi';
import { useNavigate, useParams } from 'react-router-dom';
import ModalConfirm from '@/components/ModalConfirm';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ISelectedUserAssigned } from '@/api/userApi';
import { useApproval } from '@/api/approvalApi';
import { Spinner } from '@/components/ui/spinner';
import HistoryApproval from '../Approval/Components/HistoryApproval';
import ITRequestForm from './Components/ITRequestForm';
import priorityApi from '@/api/priorityApi';
import itCategoryApi from '@/api/itCategoryApi';
import DotRequireComponent from '@/components/DotRequireComponent';

const DetailWaitApprovalFormIT = () => {
    const { t } = useTranslation('formIT');
    const { t:tCommon} = useTranslation('common');
    const { user } = useAuthStore()
    const lang = useTranslation().i18n.language.split('-')[0]
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [statusModalConfirm, setStatusModalConfirm] = useState('')
    const [note, setNote] = useState("")
    const [selectedUserAssigned, setSelectedUserAssigned] = useState<ISelectedUserAssigned[]>([]);
    const { id } = useParams<{ id: string }>()
    const isHasId = !!id
    
    const approval = useApproval() //approval normal
    const assignTask = useAssignedTaskITForm() //manager assign task for staff

    const { data: formData, isLoading: isFormDataLoading } = useQuery({
        queryKey: ['itForm', id],
        queryFn: async () => {
            const res = await itFormApi.getById(id ?? '');
            return res.data.data;
        }
    });

    const mode = isHasId && formData?.applicationForm?.requestStatusId == STATUS_ENUM.FINAL_APPROVAL ? 'manager_it_approval' : 'approval'
    const isManagerITapproval = mode == 'manager_it_approval'
    const initialFormData = isHasId ? formData : {};

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
            const res = await itFormApi.getMemberITAssigned()
            return res.data.data
        },
        enabled: isManagerITapproval
    });

    const handleCheckboxChangeUserAssigned = (event: React.ChangeEvent<HTMLInputElement>, item: {nvMaNV: string, nvHoTen: string, email: string}) => {
        const isChecked = event.target.checked;
        if (isChecked) {
            setSelectedUserAssigned(prevSelected => [...prevSelected, { userCode: item.nvMaNV, email: item.email }]);
        } else {
            setSelectedUserAssigned(prevSelected => prevSelected.filter(u => u.userCode !== item.nvMaNV));
        }
    };

    const handleSaveModalConfirm = async (type: string) => {
        if (isManagerITapproval) {
            if (selectedUserAssigned.length == 0) {
                ShowToast(lang == 'vi' ? 'Vui lòng chọn ít nhất 1 người để làm công việc này' : 'Please select at least one person to assign the task.', "error")
                setStatusModalConfirm('')
                return
            }
        }

        try {
            if (isManagerITapproval) {
                await assignTask.mutateAsync({
                    UserCodeApproval: user?.userCode,
                    UserNameApproval: user?.userName ?? '',
                    NoteManager: note,
                    OrgPositionId: user?.orgPositionId,
                    ITFormId: id,
                    UrlFrontend: window.location.origin,
                    UserAssignedTasks: selectedUserAssigned
                })
                
            }
            else {
                await approval.mutateAsync({
                    UserCodeApproval: user?.userCode,
                    UserNameApproval: user?.userName ?? "",
                    OrgPositionId: user?.orgPositionId,
                    Status: type == 'approval' ? true : false,
                    Note: note,
                    ITFormId: id,
                    urlFrontend: window.location.origin,
                    RequestTypeId: formData?.applicationForm?.requestTypeId,
                })
            }
            navigate("/approval/pending-approval")
            setStatusModalConfirm('')
            queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });
        } catch (err) {
            console.log(err);
        }
    }

    if (isHasId && isFormDataLoading) {
        return <div>Đang tải dữ liệu...</div>;
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
                    <ITRequestForm
                        mode={mode}
                        priorities={priorities} 
                        itCategories={ItCategories}
                        formData={initialFormData}
                    />
                </div>
                <div className='pl-5 border-l-1 ml-5 w-full'>
                    <div className="flex justify-end flex-col gap-4 mt-8">
                        <div className='flex-1'>
                            <div className='w-full'>
                                <Label className='mb-1'>{t('create.note')} <span className='italic text-red-500'>{isManagerITapproval ? '(Manager IT)' : ''}</span></Label>
                                <Textarea 
                                    placeholder={t('create.note')} 
                                    value={note} 
                                    onChange={(e) => setNote(e.target.value)} 
                                    className={`border-gray-300`}
                                />
                            </div>
                        </div>
                        {
                            isManagerITapproval && (
                                <div>
                                    <div className="form-group">
                                        <label className="block text-sm font-medium text-gray-700">
                                            {t('create.assigned')}<DotRequireComponent />
                                        </label>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {ItMembers?.map((item: {nvMaNV: string, nvHoTen: string, email: string}, idx: number) => {                                            
                                                return (
                                                    <label key={idx} className="w-[48%] flex items-center space-x-2 cursor-pointer">
                                                        <input
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
                                    </div>
                                </div>
                            )
                        }
                        <div className='flex justify-end'>
                            <Button
                                disabled={assignTask.isPending}
                                onClick={() => setStatusModalConfirm('approval')}
                                className="px-4 py-2 mr-2 bg-blue-700 text-white rounded-[3px] shadow-lg hover:bg-blue-800 hover:shadow-xl transition-all duration-200 text-base hover:cursor-pointer"
                            >
                                {assignTask.isPending ? <Spinner size="small" className='text-white'/> : tCommon('approval')}
                            </Button>
                            {
                                !isManagerITapproval && (
                                    <Button onClick={() => setStatusModalConfirm('reject')} className="flex items-center justify-center hover:cursor-pointer px-8 py-4 bg-red-600 text-white rounded-[3px] shadow-lg hover:bg-red-700 hover:shadow-xl transform transition-all duration-200 text-base">
                                        {tCommon('reject')}
                                    </Button>
                                )
                            }
                        </div>
                        <HistoryApproval historyApplicationForm={formData?.applicationForm?.historyApplicationForms[0]}/>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailWaitApprovalFormIT;
