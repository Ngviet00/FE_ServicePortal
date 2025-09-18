import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import HistoryApproval from '../Approval/Components/HistoryApproval';
import PurchaseRequestForm from './Components/PurchaseRequestForm';
import { useApproval } from '@/api/approvalApi';
import costCenterApi from '@/api/costCenterApi';
import purchaseApi, { useAssignedTaskPurchaseForm } from '@/api/purchaseApi';
import { Label } from '@/components/ui/label';
import orgUnitApi from '@/api/orgUnitApi';

const ViewOnlyFormPurchase = () => {
    const { t } = useTranslation('purchase')
    const lang = useTranslation().i18n.language.split('-')[0]
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>();
    const isHasId = !!id;
    const approval = useApproval()
    const assignedTaskPurchase = useAssignedTaskPurchaseForm()

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

    const mode = 'view'
    const initialFormData = isHasId ? formData : {};

    const { data: purchaseMembers = [] } = useQuery({
        queryKey: ['get-all-purchase-member'],
        queryFn: async () => {
            const res = await purchaseApi.getMemberPurchaseAssigned()
            return res.data.data
        }
    });

    if (isHasId && isFormDataLoading) {
        return <div>{lang == 'vi' ? 'Đang tải' : 'Loading'}...</div>;
    }

    return (
        <div className="p-1 pl-1 pt-0 space-y-4">
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
                        departments={departments}
                        isPending={assignedTaskPurchase.isPending || approval.isPending}
                    />
                </div>

                {
                    formData?.applicationFormItem?.applicationForm?.assignedTasks.length > 0 ? (
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
                    ) : (<></>)
                }
                <HistoryApproval historyApplicationForm={formData?.applicationFormItem?.applicationForm?.historyApplicationForms}/>
            </div>
        </div>
    );
};

export default ViewOnlyFormPurchase;
