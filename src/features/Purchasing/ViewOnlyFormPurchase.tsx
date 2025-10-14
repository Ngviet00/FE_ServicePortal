import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import HistoryApproval from '../Approval/Components/HistoryApproval';
import PurchaseRequestForm from './Components/PurchaseRequestForm';
import { useApproval } from '@/api/approvalApi';
import costCenterApi from '@/api/costCenterApi';
import purchaseApi, { useAssignedTaskPurchaseForm } from '@/api/purchaseApi';
import { Label } from '@/components/ui/label';
import orgUnitApi from '@/api/orgUnitApi';
import { STATUS_ENUM } from '@/lib';
import { useAuthStore } from '@/store/authStore';

const ViewOnlyFormPurchase = () => {
    const { t } = useTranslation('purchase')
    const lang = useTranslation().i18n.language.split('-')[0]
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>();
    const isHasId = !!id;
    const approval = useApproval()
    const assignedTaskPurchase = useAssignedTaskPurchaseForm()
    const user = useAuthStore(state => state.user)

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

    if (!formData) {
        return  <div className='text-red-700 font-semibold'>{lang == 'vi' ? 'Không tìm thấy dữ liệu' : 'Not found data'}</div>;
    }

    return (
        <div className="p-1 pl-1 pt-0 space-y-4">
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

            {
                formData?.applicationFormItem?.applicationForm?.requestStatusId == STATUS_ENUM.REJECT && formData?.applicationFormItem?.applicationForm?.reference?.code && formData?.applicationFormItem?.applicationForm?.userCodeCreatedForm == user?.userCode && (<div>
                    <span className='text-sm text-red-700 underline'>{lang == 'vi' ? '(Đơn mua hàng liên kết với đơn IT)' : '(The purchase order will be linked to the IT order)'}</span>
                    <Link to={`/purchase/create?applicationFormCode=${formData?.applicationFormItem?.applicationForm?.reference?.code}`} 
                        className="px-4 py-2 ml-1 bg-orange-600 text-white rounded-[3px] shadow-lg hover:bg-orange-700 hover:shadow-xl transition-all duration-200 text-base hover:cursor-pointer">
                        {lang == 'vi' ? 'Tạo lại đơn mua bán' : 'Recreate purchase Request'}
                    </Link>
                </div>)
            }

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
