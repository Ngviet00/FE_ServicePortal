import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Spinner } from '@/components/ui/spinner';
import { useNavigate, useParams } from 'react-router-dom';
import ModalConfirm from '@/components/ModalConfirm';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import HistoryApproval from '../Approval/Components/HistoryApproval';
import PurchaseRequestForm from './Components/PurchaseRequestForm';
import { useApproval } from '@/api/approvalApi';
import costCenterApi from '@/api/costCenterApi';
import purchaseApi, { useAssignedTaskPurchaseForm, useResolvedTaskPurchaseForm } from '@/api/purchaseApi';
import { STATUS_ENUM } from '@/lib';

const AssignedFormPurchase = () => {
    const { t } = useTranslation('purchase')
    const lang = useTranslation().i18n.language.split('-')[0]
    const { user } = useAuthStore()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [statusModalConfirm, setStatusModalConfirm] = useState('')
    const [note, setNote] = useState('')
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
    const initialFormData = isHasId ? formData : {};

    const { data: purchaseMembers = [] } = useQuery({
        queryKey: ['get-all-purchase-member'],
        queryFn: async () => {
            const res = await purchaseApi.getMemberPurchaseAssigned()
            return res.data.data
        }
    });

    const resolvedTask = useResolvedTaskPurchaseForm()
    
    const handleSaveModalConfirm = async () => {
        await resolvedTask.mutateAsync({
            UserCodeApproval: user?.userCode,
            UserNameApproval: user?.userName ?? '',
            PurchaseId: id, 
            UrlFrontend: window.location.origin,
        })

        navigate("/approval/assigned-tasks")
        queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });
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
                    formData?.applicationForm?.assignedTasks?.length > 0 ? (
                        <div className='w-full mt-5'>
                            <Label className='mb-1'>{t('create.assigned')} </Label>
                            <div className="flex flex-col gap-2 mt-2">
                                {purchaseMembers?.map((item: {nvMaNV: string, nvHoTen: string, email: string}, idx: number) => {                                             
                                    const isExist = formData?.applicationForm?.assignedTasks.some((e: { userCode: string; }) => e.userCode === item.nvMaNV)
                                    if (isExist) {
                                        return (
                                            <label key={idx} className="w-[48%] flex items-center space-x-2 cursor-pointer">
                                                <span><strong>({item.nvMaNV})</strong> {item.nvHoTen}</span>
                                            </label>
                                        );
                                    }
                                })}
                            </div>
                        </div>
                    ) : (
                        <></>
                    )
                }
                
                <div className='flex gap-4 justify-end mt-4'>
                    <Button
                        onClick={() => setStatusModalConfirm('approval')}
                        disabled={resolvedTask.isPending}
                        type='submit'
                        className='px-6 py-2 bg-blue-600 hover:bg-blue-700 border border-transparent rounded-md text-sm font-medium text-white cursor-pointer'
                    >
                        {resolvedTask.isPending ? <Spinner size="small" className='text-white'/> : lang == 'vi' ? 'Đã xử lý' : 'Resolved'}
                    </Button>
                </div>
                <HistoryApproval historyApplicationForm={formData?.applicationForm?.historyApplicationForms[0]}/>
            </div>
        </div>
    );
};

export default AssignedFormPurchase;
