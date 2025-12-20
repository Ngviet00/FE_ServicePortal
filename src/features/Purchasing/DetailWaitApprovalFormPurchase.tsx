 import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PurchaseRequestForm from './Components/PurchaseRequestForm';
import purchaseApi, { useApprovalPurchase, useAssignedTaskPurchaseForm } from '@/api/purchaseApi';
import costCenterApi from '@/api/costCenterApi';
import ModalConfirm from '@/components/ModalConfirm';
import { useState } from 'react';
import { ShowToast, StatusApplicationFormEnum, UnitEnum } from '@/lib';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import HistoryApproval from '../Approval/Components/HistoryApproval';
import { Spinner } from '@/components/ui/spinner';
import { ISelectedUserAssigned } from '@/api/userApi';
import DotRequireComponent from '@/components/DotRequireComponent';
import orgUnitApi from '@/api/orgUnitApi';
import { useAppStore } from '@/store/appStore';

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
    const approval = useApprovalPurchase()
    const assignedTaskPurchase = useAssignedTaskPurchaseForm()
    const [hasQuoteFiles, setHasQuoteFiles] = useState(false);
    const selectedQuoteId = useAppStore(s => s.selectedQuoteId)
    const setSelectedQuoteId = useAppStore(s => s.setSelectedQuoteId);
    
    const { data: departments = [] } = useQuery({
		queryKey: ['get-all-department'],
		queryFn: async () => {
			const res = await orgUnitApi.GetAllDepartment()
			return res.data.data
		}
	});

    const { data: formData, isLoading: isFormDataLoading } = useQuery({
        queryKey: ['purchaseForm', id],
        queryFn: async () => {
            try {
                const res = await purchaseApi.getById(id ?? '');
                return res.data.data;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                if (error.response?.status === 404) {
                    console.warn('Purchase not found');
                    return null;
                }
                throw error;
            }
        },
        enabled: isHasId,
    });

    const { data: costCenters } = useQuery({
        queryKey: ['get-all-cost-center'],
        queryFn: async () => {
            const res = await costCenterApi.getAll()

            const options: { value: string; label: string, departmentId: number | null }[] = res?.data?.data?.map((center: { id: number; code: string, departmentId: number, orgUnit?: { name?: string } }) => ({
                value: center.id,
                label: center?.orgUnit ? `${center.code}__${center?.orgUnit?.name}` : `${center?.code}`,
                departmentId: center.departmentId,
            })) || [];

            options.unshift({ value: '', label: '--Chọn--', departmentId: null });

            return options
        }
    });

    const mode = isHasId && formData?.applicationFormItem?.applicationForm?.requestStatusId == StatusApplicationFormEnum.WAIT_QUOTE 
        || formData?.applicationFormItem?.applicationForm?.requestStatusId == StatusApplicationFormEnum.FINAL_APPROVAL
        ? 'manager_purchase_approval'
        : 'approval'

    const isManagerPurchaseApproval = mode == 'manager_purchase_approval'
    const initialFormData = isHasId ? formData : {};

    const { data: purchaseMembers = [] } = useQuery({
        queryKey: ['get-all-purchase-member'],
        queryFn: async () => {
            const res = await purchaseApi.getMemberPurchaseAssigned()
            return res.data.data
        }
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
                    ApplicationFormId: formData?.applicationFormItem?.applicationForm?.id,
                    ApplicationFormCode: formData?.applicationFormItem?.applicationForm?.code,
                    UserAssignedTasks: selectedUserAssigned
                })
            }
            else {
                if (type == 'approval' && user?.unitId == UnitEnum.GM) {
                    if (formData?.quotes?.length > 0 && (!selectedQuoteId || selectedQuoteId === 0)) {
                        ShowToast(lang == 'vi' ? 'Vui lòng chọn báo giá' : 'Please select a quote', 'error')
                        return
                    }
                }
                await approval.mutateAsync({
                    UserCodeApproval: user?.userCode,
                    UserNameApproval: user?.userName ?? "",
                    OrgPositionId: user?.orgPositionId,
                    StatusRequest: type == 'approval' ? StatusApplicationFormEnum.IN_PROCESS : type == 'reject' ? StatusApplicationFormEnum.REJECT : StatusApplicationFormEnum.WAIT_QUOTE,
                    Note: note,
                    ApplicationFormId: formData?.applicationFormItem?.applicationForm?.id,
                    ApplicationFormCode: formData?.applicationFormItem?.applicationForm?.code,
                    RequestTypeId: formData?.applicationFormItem?.applicationForm?.requestTypeId,
                    SelectedQuoteId: selectedQuoteId
                })
                setSelectedQuoteId(0)
            }
            navigate("/approval/pending-approval")
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

    if (!formData) {
        return  <div className='text-red-700 font-semibold'>{lang == 'vi' ? 'Không tìm thấy dữ liệu' : 'Not found data'}</div>;
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
                <h3 className="font-bold text-xl md:text-2xl m-0">{lang == 'vi' ? 'Chi tiết' : 'Detail'}</h3>
                <Button onClick={() => navigate("/purchase")} className="w-full md:w-auto hover:cursor-pointer">
                    {t('create.btn_list')}
                </Button>
            </div>

            {
                formData?.applicationFormItem?.applicationForm?.reference?.code && (
                    <div className='mb-4 mt-2 text-base text-black bg-orange-200 p-2 rounded'>
                        <span>
                            {lang == 'vi' ? 'Đơn mua bán này liên kết với đơn IT' : 'The purchase order linked to IT order'}: <Link className='text-purple-600 font-bold underline' to={`/view/form-it/${formData?.applicationFormItem?.applicationForm?.reference?.code}`}>{formData?.applicationFormItem?.applicationForm?.reference?.code}</Link> 
                        </span>
                    </div>
                )
            }

            <div className="flex flex-col min-h-screen">
                <div className="w-full bg-white rounded-xl pl-0">
                    <PurchaseRequestForm
                        mode={mode}
                        costCenter={costCenters}
                        departments={departments}
                        formData={initialFormData}
                        isPending={assignedTaskPurchase.isPending || approval.isPending}
                        onHasUploadedFilesChange={setHasQuoteFiles}
                    />
                </div>
                <div className='mt-2 border-gray-300 pt-5'>
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
                        <div className="mt-4">
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700">
                                    {t('create.assigned')} <DotRequireComponent />
                                </label>

                                <div className="mt-2 flex flex-wrap gap-3 sm:max-w-[100%] lg:max-w-[70%]">
                                    {purchaseMembers?.map(
                                        (item: { nvMaNV: string; nvHoTen: string; email: string }, idx: number) => (
                                            <label
                                                key={idx}
                                                className="w-full sm:w-[48%] flex items-center space-x-2 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUserAssigned.some((e) => e.userCode == item.nvMaNV)}
                                                    value={item.nvMaNV}
                                                    className="border-gray-300 scale-[1.2] accent-blue-600"
                                                    onChange={(e) => handleCheckboxChangeUserAssigned(e, item)}
                                                />
                                                <span className="text-base">
                                                    <strong>({item.nvMaNV})</strong> {item.nvHoTen}
                                                </span>
                                            </label>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                }
                
                <div className='flex justify-end mt-3'>
                    {
                        user?.unitId == UnitEnum.GM && hasQuoteFiles == false && (
                            <Button
                                disabled={approval.isPending || assignedTaskPurchase.isPending}
                                onClick={() => setStatusModalConfirm('need_quote')}
                                className="px-4 py-2 mr-2 bg-purple-700 text-white rounded-[3px] shadow-lg hover:bg-purple-800 hover:shadow-xl transition-all duration-200 text-base hover:cursor-pointer"
                            >
                                {approval.isPending || assignedTaskPurchase.isPending ? <Spinner size="small" className='text-white'/> : (lang == 'vi' ? 'Cần báo giá' : 'Need quote')}
                            </Button>
                        )
                    }

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
                <HistoryApproval historyApplicationForm={formData?.applicationFormItem?.applicationForm?.historyApplicationForms}/>
            </div>
        </div>
    );
};

export default DetailWaitApprovalFormPurchase;
