import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Spinner } from '@/components/ui/spinner';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ModalConfirm from '@/components/ModalConfirm';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import HistoryApproval from '../Approval/Components/HistoryApproval';
import PurchaseRequestForm from './Components/PurchaseRequestForm';
import { useApproval } from '@/api/approvalApi';
import costCenterApi from '@/api/costCenterApi';
import purchaseApi, { useAssignedTaskPurchaseForm, useResolvedTaskPurchaseForm, useResponseForQuote } from '@/api/purchaseApi';
import { getErrorMessage, ShowToast, STATUS_ENUM } from '@/lib';
import orgUnitApi from '@/api/orgUnitApi';
import requestStatusApi from '@/api/requestStatusApi';
import { UploadedFileType } from '@/components/ComponentCustom/FileListPreviewMemoNotify';

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
    const responseQuotePurchase = useResponseForQuote()

    const { data: requestStatuses = [] } = useQuery({
		queryKey: ['get-all-status'],
		queryFn: async () => {
			const res = await requestStatusApi.getAll()
            const results = res.data.data.filter((status: { id: number }) => 
                status.id == STATUS_ENUM.WAIT_DELIVERY 
                || status.id == STATUS_ENUM.WAIT_PO || status.id == STATUS_ENUM.WAIT_QUOTE || status.id == STATUS_ENUM.COMPLETED)
			return results
		}
	});

    const { data: formData, isLoading: isFormDataLoading } = useQuery({
        queryKey: ['purchaseForm', id],
        queryFn: async () => {
            const res = await purchaseApi.getById(id ?? '');
            return res.data.data;
        },
        enabled: isHasId,
    });

    const { data: departments = [] } = useQuery({
		queryKey: ['get-all-department'],
		queryFn: async () => {
			const res = await orgUnitApi.GetAllDepartment()
			return res.data.data
		}
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

    const mode = isHasId && formData?.applicationForm?.requestStatusId == STATUS_ENUM.FINAL_APPROVAL ? 'manager_purchase_approval' : 'assigned'
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
        if (statusModalConfirm == 'response_quote') {
            const formDataSend = new FormData()

            formDataSend.append("UserCode", user?.userCode ?? '');
            formDataSend.append("UserName", user?.userName ?? '');
            formDataSend.append("Note", note);
            formDataSend.append("ApplicationFormId", formData?.applicationFormItem?.applicationForm?.id);
            
            dataResponseQuote?.uploadedFiles?.forEach((item: UploadedFileType, index: number) => {
                formDataSend.append(`AvailableQuotes[${index}]`, item?.id.toString());
            });

            dataResponseQuote.newFiles?.forEach((file: File) => {
                formDataSend.append("NewQuotes", file);
            });
            await responseQuotePurchase.mutateAsync(formDataSend)
            navigate('/purchase/list-item-wait-quote')
        }
        else
        {
            if (formData?.purchaseOrder == null || formData?.purchaseOrder == undefined || formData?.purchaseOrder == '') {
                ShowToast(lang == 'vi' ? 'Phải có PO thì mới có thể đóng đơn được' : 'PO is required to close the order', 'error')
                return
            }

            await resolvedTask.mutateAsync({
                UserCodeApproval: user?.userCode,
                UserNameApproval: user?.userName ?? '',
                Note: note,
                ApplicationFormId: formData?.applicationFormItem?.applicationForm?.id,
                ApplicationFormCode: formData?.applicationFormItem?.applicationForm?.code,
            })
            
            navigate("/approval/assigned-tasks")
        }

        queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });
    };

    const handleUpdatePOAndStatus = async (data: { purchaseOrder: string; status: number }) => {
        try {
            await purchaseApi.updatePOAndStatus(formData?.applicationFormItem?.applicationForm?.code ?? '', {
                userCode: user?.userCode ?? '',
                userName: user?.userName ?? '',
                purchaseOrder: data.purchaseOrder,
                statusId: data.status
            })
            queryClient.invalidateQueries({ queryKey: ['purchaseForm', id] });
            navigate("/approval/assigned-tasks")
            ShowToast('Success')
        }
        catch(err) {
            ShowToast(getErrorMessage(err), 'error')
        }
    }

    const [dataResponseQuote, setDataResponseQuote] = useState<{
        uploadedFiles: UploadedFileType[];
        newFiles: File[];
    }>({
        uploadedFiles: [],
        newFiles: [],
    });

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
                        formData={initialFormData}
                        departments={departments}
                        requestStatuses={requestStatuses}
                        isPending={assignedTaskPurchase.isPending || approval.isPending}
                        onUpdatePOAndStatus={(data) => {handleUpdatePOAndStatus(data)}}
                        onChangeResponseQuote={setDataResponseQuote}
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
                    formData?.applicationFormItem?.applicationForm?.assignedTasks?.length > 0 ? (
                        <div className='w-full mt-5'>
                            <Label className='mb-1'>{t('create.assigned')} </Label>
                            <div className="flex flex-col gap-2 mt-2">
                                {purchaseMembers?.map((item: {nvMaNV: string, nvHoTen: string, email: string}, idx: number) => {                                             
                                    const isExist = formData?.applicationFormItem?.applicationForm?.assignedTasks.some((e: { userCode: string; }) => e.userCode === item.nvMaNV)
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
                    {
                        formData?.applicationFormItem?.applicationForm?.requestStatusId == STATUS_ENUM.ASSIGNED ? (
                            <Button
                                onClick={() => setStatusModalConfirm('approval')}
                                disabled={resolvedTask.isPending}
                                type='submit'
                                className='px-6 py-2 bg-blue-600 hover:bg-blue-700 border border-transparent rounded-md text-sm font-medium text-white cursor-pointer'
                            >
                                {resolvedTask.isPending ? <Spinner size="small" className='text-white'/> : lang == 'vi' ? 'Đã xử lý' : 'Resolved'}
                            </Button>
                        ) : (
                            <Button
                                onClick={() => setStatusModalConfirm('response_quote')}
                                disabled={responseQuotePurchase.isPending}
                                type='submit'
                                className='px-6 py-2 bg-blue-600 hover:bg-blue-700 border border-transparent rounded-md text-sm font-medium text-white cursor-pointer'
                            >
                                {responseQuotePurchase.isPending ? <Spinner size="small" className='text-white'/> : lang == 'vi' ? 'Phản hồi báo giá' : 'Response quote'}
                            </Button>
                        )
                    }
                </div>
                <HistoryApproval historyApplicationForm={formData?.applicationFormItem?.applicationForm?.historyApplicationForms}/>
            </div>
        </div>
    );
};

export default AssignedFormPurchase;
