/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useNavigate, useParams } from 'react-router-dom';
import PurchaseRequestForm from './Components/PurchaseRequestForm';
import costCenterApi from '@/api/costCenterApi';
import { useTranslation } from 'react-i18next';
import purchaseApi, { ICreatePurchase, useCreatePurchase, useUpdatePurchase } from '@/api/purchaseApi';
import orgUnitApi from '@/api/orgUnitApi';

const CreateFormPurchase = () => {
    const { t } = useTranslation('purchase')
    const lang = useTranslation().i18n.language.split('-')[0]
    const { user } = useAuthStore()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;

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

    const createPurchase = useCreatePurchase()
    const updatePurchase = useUpdatePurchase()

    const handleFormSubmit = async (data: any) => {
        const payload = formatPurchaseRequest(data)

        if (isEdit) {
            await updatePurchase.mutateAsync({id: id, data: payload})
        }
        else {
            await createPurchase.mutateAsync(payload)
        }

        navigate("/purchase")
        queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });
    }

    const mode = isEdit ? 'edit' : 'create';
    const initialFormData = isEdit ? formData : {};

    function formatPurchaseRequest(data: any): ICreatePurchase {
        return {
            UserCode: data.usercode,
            UserName: data.username,
            DepartmentId: data.departmentId,
            RequestedDate: data.request_date,
            UrlFrontend: window.location.origin,
            OrgPositionId: user?.orgPositionId,
            CreatePurchaseDetailRequests: data.purchases.map((p: { id: any, name_category: any; description: any; quantity: any; unit_measurement: any; required_date: any; cost_center: any; note: any; }) => ({
                id: p.id,
                ItemName: p.name_category,
                ItemDescription: p.description,
                Quantity: p.quantity,
                UnitMeasurement: p.unit_measurement,
                RequiredDate: p.required_date,
                CostCenterId: p.cost_center,
                Note: p.note
            }))
        };
    }

    if (isEdit && isFormDataLoading) {
        return <div>{lang == 'vi' ? 'Đang tải' : 'Loading'}...</div>;
    }

    return (
        <div className="p-1 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0">{isEdit ? 'Cập nhật' : t('create.title')}</h3>
                <Button onClick={() => navigate("/purchase")} className="w-full md:w-auto hover:cursor-pointer">
                    {t('create.btn_list')}
                </Button>
            </div>

            <div className="flex flex-col min-h-screen">
                <div className="w-full bg-white rounded-xl pl-0">
                    <PurchaseRequestForm
                        mode={mode}
                        costCenter={costCenters}
                        departments={departments}
                        formData={initialFormData}
                        onSubmit={handleFormSubmit}
                        isPending={createPurchase.isPending || updatePurchase.isPending}
                    />
                </div>
            </div>
        </div>
    );
};

export default CreateFormPurchase;
