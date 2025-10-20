/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import PurchaseRequestForm from './Components/PurchaseRequestForm';
import costCenterApi from '@/api/costCenterApi';
import { useTranslation } from 'react-i18next';
import purchaseApi, { useCreatePurchase, useUpdatePurchase } from '@/api/purchaseApi';
import orgUnitApi from '@/api/orgUnitApi';
import itFormApi from '@/api/itFormApi';

const CreateFormPurchase = () => {
    const { t } = useTranslation('purchase')
    const lang = useTranslation().i18n.language.split('-')[0]
    const { user } = useAuthStore()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;
    const [searchParams] = useSearchParams();
    const applicationFormCode = searchParams.get("applicationFormCode");

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
        enabled: isEdit,
    });

    const { data: formDataIT, isLoading: isFormDataITLoading } = useQuery({
        queryKey: ['itForm', applicationFormCode],
        queryFn: async () => {
            const res = await itFormApi.getById(applicationFormCode ?? '');
            return res.data.data;
        },
        enabled: applicationFormCode != null,
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

    const createPurchase = useCreatePurchase()
    const updatePurchase = useUpdatePurchase()

    const handleFormSubmit = async (data: any) => {
        const formDataToSend = new FormData();

        formDataToSend.append("UserCode", data.usercode);
        formDataToSend.append("UserName", data.username);
        formDataToSend.append("DepartmentId", data.departmentId);
        formDataToSend.append("RequestedDate", data.request_date);
        formDataToSend.append("OrgPositionId", user?.orgPositionId?.toString() || "");
        formDataToSend.append("ApplicationFormCodeReference", applicationFormCode || "");

        data.purchases.forEach((p: any, index: number) => {
            formDataToSend.append(`CreatePurchaseDetailRequests[${index}].Id`, p.id ?? "");
            formDataToSend.append(`CreatePurchaseDetailRequests[${index}].ItemName`, p.name_category ?? "");
            formDataToSend.append(`CreatePurchaseDetailRequests[${index}].ItemDescription`, p.description ?? "");
            formDataToSend.append(`CreatePurchaseDetailRequests[${index}].Quantity`, p.quantity ?? "");
            formDataToSend.append(`CreatePurchaseDetailRequests[${index}].UnitMeasurement`, p.unit_measurement ?? "");
            formDataToSend.append(`CreatePurchaseDetailRequests[${index}].RequiredDate`, p.required_date ?? "");
            formDataToSend.append(`CreatePurchaseDetailRequests[${index}].CostCenterId`, p.cost_center ?? "");
            formDataToSend.append(`CreatePurchaseDetailRequests[${index}].Note`, p.note ?? "");
        });

        data.AvailableQuotes?.forEach((id: number, index: number) => {
            formDataToSend.append(`AvailableQuotes[${index}]`, id.toString());
        });

        data.NewQuotes?.forEach((file: File) => {
            formDataToSend.append("NewQuotes", file);
        });

        if (isEdit) {
            await updatePurchase.mutateAsync({id: id, data: formDataToSend})
        }
        else {
            await createPurchase.mutateAsync(formDataToSend);
        }
        navigate("/purchase")
        queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });
    }

    const mode = isEdit ? 'edit' : 'create';
    const initialFormData = isEdit ? formData : {};

    if ((isEdit && isFormDataLoading) || (applicationFormCode && isFormDataITLoading)) {
        return <div>{lang === 'vi' ? 'Đang tải dữ liệu...' : 'Loading data...'}</div>;
    }

    if (applicationFormCode && !formDataIT) {
        return <div>{lang === 'vi' ? 'Đang tải IT Form...' : 'Loading IT Form...'}</div>;
    }

    return (
        <div className="p-1 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0">{isEdit ? 'Cập nhật' : t('create.title')}</h3>
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
                applicationFormCode && (
                    <div className='mb-4 mt-2 text-base text-black bg-orange-200 p-2 rounded'>
                        <span>
                            {lang == 'vi' ? 'Đơn mua hàng liên kết với đơn IT' : 'The purchase order will be linked to the IT order'}: <Link className='text-purple-600 font-bold underline' to={`/view/form-it/${applicationFormCode}`}>{applicationFormCode}</Link> 
                        </span>
                    </div>
                )
            }

            <div className="flex flex-col">
                <div className="w-full bg-white rounded-xl pl-0">
                    <PurchaseRequestForm
                        mode={mode}
                        costCenter={costCenters}
                        departments={departments}
                        formData={initialFormData}
                        formDataIT={formDataIT}
                        onSubmit={handleFormSubmit}
                        isPending={createPurchase.isPending || updatePurchase.isPending}
                    />
                </div>
            </div>
        </div>
    );
};

export default CreateFormPurchase;
