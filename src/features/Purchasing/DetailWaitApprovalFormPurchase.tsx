 import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useNavigate, useParams } from 'react-router-dom';
import PurchaseRequestForm from './Components/PurchaseRequestForm';
import purchaseApi, { useAssignedTaskPurchaseForm } from '@/api/purchaseApi';
import costCenterApi from '@/api/costCenterApi';
import ModalConfirm from '@/components/ModalConfirm';
import { useState } from 'react';
import { ShowToast, STATUS_ENUM } from '@/lib';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import HistoryApproval from '../Approval/Components/HistoryApproval';
import { Spinner } from '@/components/ui/spinner';
import { ISelectedUserAssigned } from '@/api/userApi';
import { useApproval } from '@/api/approvalApi';
import DotRequireComponent from '@/components/DotRequireComponent';

const DetailWaitApprovalFormPurchase = () => {
    const { t } = useTranslation('purchase')
    const { t:tCommon} = useTranslation('common')
    const lang = useTranslation().i18n.language.split('-')[0]
    const { user } = useAuthStore()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [statusModalConfirm, setStatusModalConfirm] = useState('')
    const [note, setNote] = useState('')
    const [selectedUserAssigned, setSelectedUserAssigned] = useState<ISelectedUserAssigned[]>([])
    const { id } = useParams<{ id: string }>();
    const isHasId = !!id;
    const approval = useApproval()
    const assignedTaskPurchase = useAssignedTaskPurchaseForm()

    const { data: formData, isLoading: isFormDataLoading } = useQuery({
        queryKey: ['purchaseForm', id],
        queryFn: async () => {
            const res = await purchaseApi.getById(id ?? '');
            return res.data.data;
        },
        enabled: isHasId,
    });

    const { data: costCenters } = useQuery({
        queryKey: ['get-all-cost-center'],
        queryFn: async () => {
            const res = await costCenterApi.getAll()

            const options: { value: string; label: string }[] = res?.data?.data?.map((center: { id: number; code: string }) => ({
                value: center.id,
                label: center.code
            })) || [];

            options.unshift({ value: '', label: '--Chọn--' });

            return options
        }
    });

    const mode = isHasId && formData?.applicationForm?.requestStatusId == STATUS_ENUM.FINAL_APPROVAL ? 'manager_purchase_approval' : 'approval'
    const isManagerPurchaseApproval = mode == 'manager_purchase_approval'
    const initialFormData = isHasId ? formData : {};

    const { data: purchaseMembers = [] } = useQuery({
        queryKey: ['get-all-purchase-member'],
        queryFn: async () => {
            const res = await purchaseApi.getMemberPurchaseAssigned()
            return res.data.data
        },
        enabled: isManagerPurchaseApproval
    });

    const handleSaveModalConfirm = async (type: string) => {
        if (isManagerPurchaseApproval) {
            if (selectedUserAssigned.length == 0) {
                ShowToast(lang == 'vi' ? 'Vui lòng chọn ít nhất 1 người để làm công việc này' : 'Please select at least one person to assign the task.', "error")
                setStatusModalConfirm('')
                return
            }
        }

        try {
            if (isManagerPurchaseApproval) {
                await assignedTaskPurchase.mutateAsync({
                    UserCodeApproval: user?.userCode,
                    UserNameApproval: user?.userName ?? '',
                    NoteManager: note,
                    OrgPositionId: user?.orgPositionId,
                    PurchaseId: id,
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
                    PurchaseId: id,
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

    const handleCheckboxChangeUserAssigned = (event: React.ChangeEvent<HTMLInputElement>, item: {nvMaNV: string, nvHoTen: string, email: string}) => {
        const isChecked = event.target.checked;
        if (isChecked) {
            setSelectedUserAssigned(prevSelected => [...prevSelected, { userCode: item.nvMaNV, email: item.email }]);
        } else {
            setSelectedUserAssigned(prevSelected => prevSelected.filter(u => u.userCode !== item.nvMaNV));
        }
    };

    if (isHasId && isFormDataLoading) {
        return <div>{lang == 'vi' ? 'Đang tải' : 'Loading'}...</div>;
    }

    return (
        <div className="p-1 pl-1 pt-0 space-y-4">
            <ModalConfirm
                type={statusModalConfirm}
                isOpen={statusModalConfirm != ''}
                onClose={() => setStatusModalConfirm('')}
                onSave={handleSaveModalConfirm}
            />
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0">{isHasId ? 'Cập nhật' : t('create.title')}</h3>
                <Button onClick={() => navigate("/purchase")} className="w-full md:w-auto hover:cursor-pointer">
                    {t('create.btn_list')}
                </Button>
            </div>

            <div className="flex flex-col min-h-screen">
                <div className="w-full bg-white rounded-xl pl-0">
                    <PurchaseRequestForm
                        mode={mode}
                        costCenter={costCenters} 
                        formData={initialFormData}
                        isPending={assignedTaskPurchase.isPending || approval.isPending}
                    />
                </div>
                <div className='mt-8 border-t border-dashed border-gray-300 pt-5'>
                    <div className='w-full'>
                        <Label className='mb-1'>{t('create.note')}</Label>
                        <Textarea 
                            placeholder={t('create.note')} 
                            value={note} 
                            onChange={(e) => setNote(e.target.value)} 
                            className={`border-gray-300`}
                        />
                    </div>
                </div>

                {
                    isManagerPurchaseApproval && (
                        <div className='mt-4'>
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700">
                                    {t('create.assigned')}<DotRequireComponent />
                                </label>
                                <div className="flex flex-wrap gap-2 mt-2 max-w-[50%]">
                                    {purchaseMembers?.map((item: {nvMaNV: string, nvHoTen: string, email: string}, idx: number) => {                                            
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
                
                <div className='flex justify-end mt-5'>
                    <Button
                        disabled={approval.isPending || assignedTaskPurchase.isPending}
                        onClick={() => setStatusModalConfirm('approval')}
                        className="px-4 py-2 mr-2 bg-blue-700 text-white rounded-[3px] shadow-lg hover:bg-blue-800 hover:shadow-xl transition-all duration-200 text-base hover:cursor-pointer"
                    >
                        {approval.isPending || assignedTaskPurchase.isPending ? <Spinner size="small" className='text-white'/> : tCommon('approval')}
                    </Button>
                    {
                        !isManagerPurchaseApproval && (
                            <Button onClick={() => setStatusModalConfirm('reject')} className="flex items-center justify-center hover:cursor-pointer px-8 py-4 bg-red-600 text-white rounded-[3px] shadow-lg hover:bg-red-700 hover:shadow-xl transform transition-all duration-200 text-base">
                                {tCommon('reject')}
                            </Button>
                        )
                    }
                </div>
                <HistoryApproval historyApplicationForm={formData?.applicationForm?.historyApplicationForms[0]}/>
            </div>
        </div>
    );
};

export default DetailWaitApprovalFormPurchase;
