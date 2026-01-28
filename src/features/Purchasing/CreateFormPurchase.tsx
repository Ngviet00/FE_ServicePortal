/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import { Button } from '@/components/ui/button';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import purchaseApi, { useCreatePurchase, useUpdatePurchase } from '@/api/purchaseApi';
import { z } from 'zod';
import { Controller, SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { Trash2 } from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod";
import DotRequireComponent from '@/components/DotRequireComponent';
import orgUnitApi from '@/api/orgUnitApi';
import costCenterApi from '@/api/costCenterApi';
import { RequestTypeEnum } from '@/lib';
import DateTimePicker from '@/components/ComponentCustom/Flatpickr';
import Select from 'react-select'
import { NumericInput } from '@/components/NumericInput';
import { useEffect, useMemo } from 'react';
import { Spinner } from '@/components/ui/spinner';

export const purchaseDetailSchema = z.object({
    id: z.number().nullable().optional(),
    nameCategory: z.string().nonempty({ message: "Bắt buộc." }),
    description: z.string().optional(),
    quantity: z.string().nonempty({ message: "Bắt buộc." }),
    unitMeasurement: z.string().nonempty({ message: "Bắt buộc." }),
    requiredDate: z.string().optional(),
    costCenter: z.string().nonempty({ message: "Bắt buộc." }),
    note: z.string().optional()
});
     
export const purchaseSchema = z.object({
    usercode: z.string().nonempty({ message: "Bắt buộc." }),
    username: z.string().nonempty({ message: "Bắt buộc." }),
    departmentName: z.string().optional(),
    departmentId: z.string().nonempty({ message: "Bắt buộc." }),
    requestDate: z.string().nonempty({ message: "Bắt buộc." }),
    referenceAppFormCodeFormIT: z.string().optional().nullable(),
    purchaseOrder: z.string().optional(),
    status: z.string().optional(),
    newQuotes: z.any().optional(),
    quotesUploaded: z.any().optional().nullable(),
    purchaseDetails: z.array(purchaseDetailSchema),
});

export type PurchaseForm = z.infer<typeof purchaseSchema>;

const CreateFormPurchase = () => {
    const { t } = useTranslation('purchase')
    const { t: tCommon  } = useTranslation('common')
    const lang = useTranslation().i18n.language.split('-')[0]
    const { user } = useAuthStore()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { id } = useParams<{ id: string }>();
    const hasId = !!id;
    const [searchParams] = useSearchParams();
    const applicationFormCode = searchParams.get("applicationFormCode");

    const { data: departments = [] } = useQuery({
		queryKey: ['get-all-department'],
		queryFn: async () => {
			const res = await orgUnitApi.GetAllDepartment()
			return res.data.data
		}
	});

    const { data: formDataDetail, isLoading: isFormDataLoading } = useQuery({
        queryKey: ['purchaseForm', id],
        queryFn: async () => {
            const res = await purchaseApi.getById(id ?? '');
            return res.data.data
        },
        enabled: hasId,
    });

    useEffect(() => {
        if (hasId && formDataDetail) {
            reset({
                usercode: formDataDetail?.purchase?.applicationForm?.userCodeCreatedForm ?? '',
                username: formDataDetail?.purchase?.applicationForm?.userNameCreatedForm ?? '',
                departmentId: formDataDetail?.purchase?.departmentId.toString(),
                departmentName: formDataDetail?.purchase?.orgUnit?.name,
                requestDate: formDataDetail?.purchase?.requestedDate,
                purchaseDetails: formDataDetail?.purchase?.purchaseDetails?.map((item: any) => ({
                    id: item.id ?? null,
                    nameCategory: item?.itemName ?? '',
                    description: item.itemDescription ?? '',
                    quantity: item.quantity?.toString() ?? '',
                    unitMeasurement: item.unitMeasurement ?? '',
                    requiredDate: item.requiredDate ? item.requiredDate.split('T')[0] : undefined,
                    costCenter: item.costCenterId?.toString() ?? '',
                    note: item.note ?? ''
                }))
            })
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formDataDetail, hasId])

    useEffect(() => {
        if (!hasId) {
            reset({
                usercode: user?.userCode ?? '',
                username: user?.userName ?? '',
                departmentId: '',
                departmentName: user?.departmentName ?? '',
                requestDate: new Date().toISOString().split('T')[0],
                referenceAppFormCodeFormIT: '',
                purchaseDetails: [
                    {
                        id: null,
                        nameCategory: '',
                        description: '',
                        quantity: '',
                        unitMeasurement: '',
                        requiredDate: `${new Date().toISOString().slice(0, 10)}`,
                        costCenter: '',
                        note: ''
                    }
                ]
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasId]);

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

    const form = useForm<PurchaseForm>({
        resolver: zodResolver(purchaseSchema),
        defaultValues: {
            usercode: user?.userCode ?? '',
            username: user?.userName ?? '',
            departmentId: '',
            departmentName: user?.departmentName ?? '',
            requestDate: new Date().toISOString().split('T')[0],
            referenceAppFormCodeFormIT: '',
            newQuotes: [],
            quotesUploaded: [],
            purchaseDetails: [
                {
                    id: null,
                    nameCategory: '',
                    description: '',
                    quantity: '',
                    unitMeasurement: '',
                    requiredDate: `${new Date().toISOString().slice(0, 10)}`,
                    costCenter: '',
                    note: ''
                }
            ]
        },
    });

    const { register, control, handleSubmit, reset, watch, formState: { isSubmitting }  } = form;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "purchaseDetails",
    });

    const departmentId = watch('departmentId');

    const filteredCostCenters = useMemo(() => {
        if (!departmentId) return costCenters ?? [];
        const filtered = costCenters?.filter(
            (cc: any) => cc.departmentId?.toString() == departmentId
        );
        return filtered?.length ? filtered : costCenters ?? [];
    }, [departmentId, costCenters]);

    const createPurchase = useCreatePurchase()
    const updatePurchase = useUpdatePurchase()

    const onSubmit: SubmitHandler<PurchaseForm> = async (data) => {
        const formDataToSend = new FormData();

        formDataToSend.append("UserCodeCreatedForm", user?.userCode ?? '');
        formDataToSend.append("UserNameCreatedForm", user?.userName ?? '');
        formDataToSend.append("OrgPositionUserCreated", user?.orgPositionId?.toString() || "");
        formDataToSend.append("DepartmentId", data.departmentId);
        formDataToSend.append("RequestedDate", data.requestDate);
        formDataToSend.append("ApplicationFormCodeReference", applicationFormCode || '');

        data?.purchaseDetails?.forEach((p: any, index: number) => {
            formDataToSend.append(`CreatePurchaseDetailRequests[${index}].Id`, p.id ?? '');
            formDataToSend.append(`CreatePurchaseDetailRequests[${index}].ItemName`, p.nameCategory ?? "");
            formDataToSend.append(`CreatePurchaseDetailRequests[${index}].ItemDescription`, p.description ?? "");
            formDataToSend.append(`CreatePurchaseDetailRequests[${index}].Quantity`, p.quantity ?? "");
            formDataToSend.append(`CreatePurchaseDetailRequests[${index}].UnitMeasurement`, p.unitMeasurement ?? "");
            formDataToSend.append(`CreatePurchaseDetailRequests[${index}].RequiredDate`, p.requiredDate ?? "");
            formDataToSend.append(`CreatePurchaseDetailRequests[${index}].CostCenterId`, p.costCenter ?? "");
            formDataToSend.append(`CreatePurchaseDetailRequests[${index}].Note`, p.note ?? "");
        })

        if (hasId) {
            await updatePurchase.mutateAsync({id: formDataDetail?.purchase?.applicationFormId, data: formDataToSend})
        }
        else {
            await createPurchase.mutateAsync(formDataToSend);
        }
        navigate("/purchase")
        queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });
    }

    const handAddNewPurchaseItem = () => {
        append({
            id: null,
            nameCategory: '',
            description: '',
            quantity: '',
            unitMeasurement: '',
            requiredDate: new Date().toISOString().slice(0, 10),
            costCenter: '',
            note: '',
        });
    }

    if (hasId && isFormDataLoading) {
        return <div>{lang === 'vi' ? 'Đang tải dữ liệu...' : 'Loading data...'}</div>;
    }

    if (hasId && !formDataDetail) {
        return  <div className='text-red-700 font-semibold'>{lang == 'vi' ? 'Không tìm thấy dữ liệu' : 'Not found data'}</div>;
    }

    return (
        <div className="p-1 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0"> {hasId ? t('update.title') : t('create.title')}</h3>
                <Button onClick={() => navigate("/purchase")} className="w-full md:w-auto hover:cursor-pointer">
                    {t('create.btn_list')}
                </Button>
            </div>
            {
                formDataDetail?.purchase?.applicationForm?.reference && (
                    <div className='mb-4 mt-2 text-base text-black bg-orange-200 p-2 rounded'>
                        {lang == 'vi' ? 'Đơn mua hàng liên kết với đơn IT' : 'Purchase order linked to IT order'}: 
                        <Link className='text-purple-600 font-bold underline' to={`/view/${formDataDetail?.purchase?.applicationForm?.reference?.code}?requestType=${RequestTypeEnum.FormIT}`}>{formDataDetail?.purchase?.applicationForm?.reference?.code}</Link> 
                    </div>
                )
            }
            {
                (!hasId && applicationFormCode) && (
                    <div className='mb-4 mt-2 text-base text-black bg-orange-200 p-2 rounded'>
                        <span>
                            {lang == 'vi' ? 'Đơn mua hàng liên kết với đơn IT' : 'Purchase order linked to IT order'}: 
                            <Link className='text-purple-600 font-bold underline' to={`/view/${applicationFormCode}?requestType=${RequestTypeEnum.FormIT}`}>{applicationFormCode}</Link> 
                        </span>
                    </div>
                )
            }

            <div className="flex flex-col">
                <div className="w-full bg-white rounded-xl pl-0">
                    <form onSubmit={handleSubmit(onSubmit, (errors) => {console.log("Submit bị chặn vì lỗi:", errors)})}>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-4 items-end">
                                <div className="form-group">
                                    <label htmlFor="usercode" className="block text-sm font-medium text-gray-700">
                                        {tCommon('usercode')}<DotRequireComponent />
                                    </label>
                                    <input
                                        {...register('usercode')}
                                        disabled
                                        type="text"
                                        id="usercode"
                                        placeholder={tCommon('usercode')}
                                        className="border-gray-300 bg-gray-100 mt-1 w-full p-2 rounded-md text-sm border"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                        {tCommon('name')}<DotRequireComponent />
                                    </label>
                                    <input
                                        {...register('username')}
                                        disabled
                                        type="text"
                                        id="username"
                                        placeholder={tCommon('name')}
                                        className="border-gray-300 bg-gray-100 mt-1 w-full p-2 rounded-md text-sm border"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        {lang == 'vi' ? 'Phòng ban yêu cầu' : 'Department request'}<DotRequireComponent />
                                    </label>
                                    <select disabled={hasId} {...register('departmentId')} className={`border w-full cursor-pointer rounded-[5px] p-1.5 ${form?.formState?.errors?.departmentId ? 'border-red-500 bg-red-50': ''} ${hasId ? 'bg-gray-100' : ''}`}>
                                        <option value="">{lang == 'vi' ? '--Chọn--' : '--Select--'}</option>
                                        {departments?.map((item: {id: string, name: string}, idx: number) => (
                                            <option key={idx} value={item.id}>{item.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('create.request_date')}<DotRequireComponent />
                                    </label>
                                    <Controller
                                        name="requestDate"
                                        control={control}
                                        render={({ field }) => (
                                            <DateTimePicker
                                                enableTime={false}
                                                dateFormat="Y-m-d"
                                                initialDateTime={field.value}
                                                onChange={(_selectedDates, dateStr) => field.onChange(dateStr)}
                                                className={`dark:bg-[#454545] w-full shadow-xs border border-gray-300 p-2 text-sm rounded-[5px] hover:cursor-pointer`}
                                            />
                                        )}
                                    />
                                </div>
                            </div>

                        <div className="space-y-3">
                            <div className="flex items-center content-center">
                                <h2 className="font-semibold text-xl text-[#007cc0] mr-1">
                                    {t('create.text_title_category_buy')}
                                </h2>
                                <div className="my-1 hidden md:flex justify-end items-center gap-2 mt-2">
                                    <button
                                        type="button"
                                        onClick={handAddNewPurchaseItem}
                                        className="h-[40px] px-4 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center justify-center cursor-pointer"
                                    >
                                        {lang === 'vi' ? 'Thêm' : 'Add'}
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="h-[40px] px-4 bg-green-500 text-white text-sm rounded hover:bg-green-600 flex items-center justify-center disabled:opacity-70 cursor-pointer"
                                    >
                                        {isSubmitting ? <Spinner/> : !hasId ? (lang == 'vi' ? 'Đăng ký' : 'Register') :  (lang == 'vi' ? 'Cập nhật' : 'Update')}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 border border-gray-200 rounded-lg p-3 bg-white">
                                {fields.map((item, index) => {
                                    const errors = form.formState.errors.purchaseDetails?.[index];
                                    const showLabel = index === 0;

                                    return (
                                        <div key={item.id} className="bg-white mb-1">
                                            <h2 className="font-bold text-xl text-red-600 dark:text-white mb-1 block xl:hidden">
                                                {`#` + (index + 1)}
                                            </h2>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:flex-wrap gap-3 items-end">
                                                <div className="flex flex-col w-full sm:w-full lg:max-w-[250px]">
                                                    <label className={`block mb-1 text-sm font-medium ${!showLabel ? "xl:hidden" : ""}`}>{t("create.name_category")} <DotRequireComponent /></label>
                                                    <input
                                                        {...control.register(`purchaseDetails.${index}.nameCategory`)}
                                                        placeholder={t("create.name_category")}
                                                        className={`p-2 text-sm border rounded w-full ${errors?.nameCategory ? 'border-red-500 bg-red-50' : ''}`}
                                                    />
                                                </div>

                                                <div className="flex flex-col w-full sm:w-full lg:max-w-[270px]">
                                                    <label className={`block mb-1 text-sm font-medium ${!showLabel ? "xl:hidden" : ""}`}>
                                                        {t("create.description")}
                                                    </label>
                                                    <input
                                                        {...control.register(`purchaseDetails.${index}.description`)}
                                                        placeholder={t("create.description")}
                                                        className={`p-2 text-sm border rounded w-full`}
                                                    />
                                                </div>

                                                <div className="flex flex-col w-full sm:w-full lg:max-w-[80px]">
                                                    <label className={`block mb-1 text-sm font-medium ${!showLabel ? "xl:hidden" : ""}`}>
                                                        {t("create.qty")} <DotRequireComponent />
                                                    </label>
                                                    <NumericInput
                                                        name={`purchaseDetails.${index}.quantity`}
                                                        control={control}
                                                        placeholder="1, 2,.."
                                                    />
                                                </div>

                                                <div className="flex flex-col w-full sm:w-full lg:max-w-[90px]">
                                                    <label className={`block mb-1 text-sm font-medium ${!showLabel ? "xl:hidden" : ""}`}>
                                                        {t("create.unit_measurement")} <DotRequireComponent />
                                                    </label>
                                                    <input
                                                        {...control.register(`purchaseDetails.${index}.unitMeasurement`)}
                                                        placeholder="pcs, ea,.."
                                                        className={`p-2 text-sm border rounded w-full ${errors?.unitMeasurement ? 'border-red-500 bg-red-50' : ''}`}
                                                    />
                                                </div>

                                                <div className="flex flex-col w-full sm:w-full lg:max-w-[110px]">
                                                    <label className={`block mb-1 text-sm font-medium ${!showLabel ? "xl:hidden" : ""}`}>
                                                        {t("create.required_date")}
                                                    </label>
                                                    <Controller
                                                        name={`purchaseDetails.${index}.requiredDate`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <DateTimePicker
                                                                enableTime={false}
                                                                dateFormat="Y-m-d"
                                                                initialDateTime={field.value}
                                                                onChange={(_selectedDates, dateStr) => field.onChange(dateStr)}
                                                                className={`w-full border border-gray-300 p-2 text-sm rounded`}
                                                            />
                                                        )}
                                                    />
                                                </div>

                                                <div className="flex flex-col w-full sm:w-full lg:max-w-[180px] hover:cursor-pointer">
                                                    <label className={`block mb-1 text-sm font-medium ${!showLabel ? "xl:hidden" : ""}`}>
                                                        {t("create.cost_center")} <DotRequireComponent />
                                                    </label>
                                                    <Controller
                                                        name={`purchaseDetails.${index}.costCenter`}
                                                        control={control}
                                                        render={({ field, fieldState }) => (
                                                            <>
                                                                <Select
                                                                    className="cursor-pointer"
                                                                    {...field}
                                                                    options={filteredCostCenters}
                                                                    value={filteredCostCenters?.find((o) => o.value == field.value) || null}
                                                                    onChange={(selected) => field.onChange(selected?.value?.toString())}
                                                                    styles={{
                                                                        control: (base) => ({
                                                                            ...base,
                                                                            minHeight: "36px",
                                                                            background: fieldState.error ? "#fef2f2" : "",
                                                                            borderColor: fieldState.error ? "red" : "#d1d5dc",
                                                                            boxShadow: "none",
                                                                            cursor:  "pointer"
                                                                        }),
                                                                    }}
                                                                />
                                                            </>
                                                        )}
                                                    />
                                                </div>

                                                <div className="flex items-end gap-2 flex-1 sm:col-span-4 col-span-2 min-w-[180px]">
                                                    <div className="flex-1">
                                                        <label className={`block mb-1 text-sm font-medium ${!showLabel ? "xl:hidden" : ""}`}>
                                                            {t("create.note")}
                                                        </label>
                                                        <input
                                                            {...control.register(`purchaseDetails.${index}.note`)}
                                                            placeholder={t("create.note")}
                                                            className={`p-2 text-sm border rounded w-full`}
                                                        />
                                                    </div>

                                                    {fields.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => remove(index)}
                                                            className="bg-red-500 text-white rounded p-2 hover:bg-red-600 transition hover:cursor-pointer"
                                                            title={t("delete")}
                                                        >
                                                            <Trash2 size={20} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateFormPurchase;
