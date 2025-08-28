/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import itFormApi, { CreateITFormRequest, useCreateITForm, useUpdateITForm } from '@/api/itFormApi';
import { useNavigate, useParams } from 'react-router-dom';
import PurchaseRequestForm from './Components/PurchaseRequestForm';
import costCenterApi from '@/api/costCenterApi';
import { useTranslation } from 'react-i18next';

const CreateFormPurchase = () => {
    const { t } = useTranslation('purchase');
    const { user } = useAuthStore()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;

    const { data: formData, isLoading: isFormDataLoading } = useQuery({
        queryKey: ['itForm', id],
        queryFn: async () => {
            const res = await itFormApi.getById(id ?? '');
            return res.data.data;
        },
        enabled: isEdit,
    });

    const { data: costCenters } = useQuery({
        queryKey: ['get-all-cost-center'],
        queryFn: async () => {
            const res = await costCenterApi.getAll()
            return res.data.data
        }
    });

    const createItForm = useCreateITForm()
    const updateItForm = useUpdateITForm()

    const handleFormSubmit = async (data: any) => {
        const payload: CreateITFormRequest = {
            UserCodeRequestor: data.requester.userCode,
            UserNameRequestor: data.requester.name,
            UserCodeCreated: user?.userCode,
            UserNameCreated: user?.userName ?? '',
            DepartmentId: data.requester.departmentId,
            Email: data.requester.email,
            Position: data.requester.position,
            Reason: data.itRequest.reason,
            PriorityId: data.itRequest.priority,
            OrgPositionId: user?.orgPositionId ?? 0,
            ITCategories: data.itRequest.itCategory,
            RequestDate: data.itRequest.dateRequired, 
            RequiredCompletionDate: data.itRequest.dateCompleted,
            UrlFrontend: window.location.origin,
        };

        if (isEdit) {
            await updateItForm.mutateAsync({id: id, data: payload})
        }
        else {
            await createItForm.mutateAsync(payload)
        }

        await queryClient.invalidateQueries({ queryKey: ['get-all-it-form'] });
        await queryClient.invalidateQueries({ queryKey: ['itForm'] });
        navigate("/form-it")
        queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });
    }

    const mode = isEdit ? 'edit' : 'create';
    const initialFormData = isEdit ? formData : {};

    if (isEdit && isFormDataLoading) {
        return <div>Đang tải dữ liệu...</div>;
    }

    return (
        <div className="p-1 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                1
                {/* <h3 className="font-bold text-xl md:text-2xl m-0">{isEdit ? 'Cập nhật' : t('create.title')}</h3> */}
                <Button onClick={() => navigate("/form-it")} className="w-full md:w-auto hover:cursor-pointer">
                    {/* {t('create.btn_list')} */}a
                </Button>
            </div>

            <div className="flex flex-col min-h-screen">
                <div className="w-full bg-white rounded-xl pl-0">
                    <PurchaseRequestForm
                        mode={mode}
                        costCenter={costCenters} 
                        formData={initialFormData}
                        onSubmit={handleFormSubmit}
                        isPending={createItForm.isPending || updateItForm.isPending}
                    />
                </div>
            </div>
        </div>
    );
};

export default CreateFormPurchase;
