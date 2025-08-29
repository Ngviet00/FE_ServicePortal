/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/store/authStore";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useMemo } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { z } from 'zod';
import DateTimePicker from "@/components/ComponentCustom/Flatpickr";
import DotRequireComponent from "@/components/DotRequireComponent";
import { Plus, Trash2 } from "lucide-react";
import Select from 'react-select'
import { NumericInput } from "@/components/NumericInput";
interface PurchaseRequestFormProps {
    mode: 'create' | 'edit' | 'view' | 'approval' | 'manager_it_approval' | 'assigned' 
    formData?: any
    onSubmit?: (data: any) => void,
    costCenter?: { value: string, label: string }[],
    isPending?: boolean;
}

const PurchaseRequestForm: React.FC<PurchaseRequestFormProps> = ({ mode, formData, onSubmit, costCenter, isPending }) => {
    const { t } = useTranslation('purchase')
    const { t: tCommon  } = useTranslation('common')
    const { user } = useAuthStore()
    // const lang = useTranslation().i18n.language.split('-')[0]
    const navigate = useNavigate()

    const isCreate = mode == 'create'
    const isEdit = mode == 'edit'

    const purchaseRequestSchema = z.object({
        name_category: z.string().nonempty({ message: "Bắt buộc." }),
        description: z.string().optional(),
        quantity: z.string().nonempty({ message: "Bắt buộc." }),
        unit_measurement: z.string().nonempty({ message: "Bắt buộc." }),
        required_date: z.string().optional(),
        cost_center: z.string().nonempty({ message: "Bắt buộc." }),
        note: z.string().optional()
    });
     
    const purchaseSchema = z.object({
        usercode: z.string().nonempty({ message: "Bắt buộc." }),
        username: z.string().nonempty({ message: "Bắt buộc." }),
        departmentName: z.string().optional(),
        departmentId: z.coerce.number(),
        request_date: z.string().nonempty({ message: "Bắt buộc." }),
        purchases: z.array(purchaseRequestSchema)
    });
    
    type PurchaseForm = z.infer<typeof purchaseSchema>;

    const defaultSinglePurchaseRequest = useMemo(() => {
        return {
            name_category: '',
            description: '',
            quantity: '',
            unit_measurement: '',
            required_date: `${new Date().toISOString().slice(0, 10)}`,
            cost_center: '',
            note: '',
        };
    }, []);

    const form = useForm<PurchaseForm>({
        resolver: zodResolver(purchaseSchema),
        defaultValues: {
            usercode: user?.userCode ?? '',
            username: user?.userName ?? '',
            departmentId: user?.departmentId ?? -1,
            departmentName: user?.departmentName ?? '',
            request_date: new Date().toISOString().split('T')[0],
            purchases: [{ ...defaultSinglePurchaseRequest }],
        },
    });

    const { register, control, handleSubmit, reset } = form;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "purchases",
    });

    useEffect(() => {
        if (formData && isEdit) {
            reset({
                usercode: formData.userCode,
                username: formData.userName,
                departmentId: formData.departmentId,
                departmentName: formData.orgUnit?.name ?? '',
                request_date: formData.requestedDate?.split('T')[0] ?? '',
                purchases: formData.purchaseDetails?.map((pd: { itemName: any; itemDescription: any; quantity: { toString: () => any; }; unitMeasurement: any; requiredDate: string; costCenterId: { toString: () => any; }; note: any; }) => ({
                    name_category: pd.itemName ?? '',
                    description: pd.itemDescription ?? '',
                    quantity: pd.quantity?.toString() ?? '',
                    unit_measurement: pd.unitMeasurement ?? '',
                    required_date: pd.requiredDate
                    ? pd.requiredDate.split('T')[0]
                    : new Date().toISOString().slice(0, 10),
                    cost_center: pd.costCenterId?.toString() ?? '',
                    note: pd.note ?? '',
                })) ?? [defaultSinglePurchaseRequest],
            });
        }
    }, [defaultSinglePurchaseRequest, formData, isEdit, reset]);

    const onInternalSubmit = (data: any) => {
        if (onSubmit) {
            onSubmit(data);
        }
    };

    const onCancel = () => {
        if (isEdit) {
            navigate("/form-it")
        }
        else {
            reset()
        }
    }

    return (
        <form onSubmit={handleSubmit(onInternalSubmit)} >
            <div className="space-y-6">
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 max-w-4xl">
                        <div className="form-group">
                            <label htmlFor="requester.employeeId" className="block text-sm font-medium text-gray-700">
                                {tCommon('usercode')}<DotRequireComponent />
                            </label>
                            <input
                                {...register('usercode')}
                                disabled
                                type="text"
                                id="usercode"
                                placeholder={tCommon('usercode')}
                                className={`border-gray-300 bg-gray-100 mt-1 w-full p-2 rounded-md text-sm border`}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="requester.name" className="block text-sm font-medium text-gray-700">
                                {tCommon('name')}<DotRequireComponent />
                            </label>
                            <input
                                {...register('username')}
                                disabled
                                type="text"
                                id="username"
                                placeholder={tCommon('name')}
                                className={`border-gray-300 bg-gray-100 mt-1 w-full p-2 rounded-md text-sm border`}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="requester.department" className="block text-sm font-medium text-gray-700">
                                {tCommon('department')}<DotRequireComponent />
                            </label>
                            <input
                                {...register('departmentName')}
                                disabled
                                type="text"
                                id="department"
                                placeholder={tCommon('department')}
                                className={`border-gray-300 mt-1 w-full p-2 rounded-md text-sm border bg-gray-100`}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="requester.department" className="block text-sm font-medium text-gray-700 mb-1">
                                {t('create.request_date')}<DotRequireComponent />
                            </label>
                            <Controller
                                name="request_date"
                                control={control}
                                render={({ field }) => (
                                    <DateTimePicker
                                        enableTime={false}
                                        dateFormat="Y-m-d"
                                        initialDateTime={field.value}
                                        onChange={(_selectedDates, dateStr) => field.onChange(dateStr)}
                                        className={`dark:bg-[#454545] w-full shadow-xs border border-gray-300 p-2 text-sm rounded-[5px] hover:cursor-pointer ${mode != 'create' && mode != 'edit' ? 'bg-gray-100' : ''}`}
                                    />
                                )}
                            />
                        </div>
                    </div>
                    <h2 className="font-semibold text-xl text-[#007cc0]">{t('create.text_title_category_buy')}</h2>
                    {
                        fields.map((item, index) => {
                            const errors = form.formState.errors.purchases?.[index];

                            return (
                                <div key={item.id}>
                                    <h3 className="text-red-500 font-semibold text-xl">#{index + 1}</h3>
                                    <div>
                                        <div key={index} className="flex justify-start mb-2">
                                            <div className="w-[22%] mr-2">
                                                <label className="block mb-1">{t('create.name_category')} <DotRequireComponent /></label>
                                                <input
                                                    {...control.register(`purchases.${index}.name_category`)}
                                                    placeholder={ t('create.name_category') }
                                                    className={`dark:bg-[#454545] w-full p-2 text-sm border rounded ${errors?.name_category ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                                                />
                                                {errors?.name_category && (
                                                    <p className="text-sm text-red-500 mt-1">{errors.name_category.message}</p>
                                                )}
                                            </div>
                                            <div className="w-[22%] mr-2">
                                                <label className="block mb-1">{t('create.description')}</label>
                                                <input
                                                    {...control.register(`purchases.${index}.description`)}
                                                    placeholder={ t('create.description') }
                                                    className={`dark:bg-[#454545] w-full p-2 text-sm border rounded ${errors?.description ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                                                />
                                                {errors?.description && (
                                                    <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                                                )}
                                            </div>
                                            <div className="w-[5%] mr-2">
                                                <label className="block mb-1">{t('create.qty')} <DotRequireComponent /></label>
                                                <NumericInput
                                                    name={`purchases.${index}.quantity`}
                                                    control={control}
                                                    placeholder="1, 2,.."
                                                />
                                                {errors?.quantity && (
                                                    <p className="text-sm text-red-500 mt-1">{errors.quantity.message}</p>
                                                )}
                                            </div>
                                            <div className="w-[8%] mr-2">
                                                <label className="block mb-1">{t('create.unit_measurement')} <DotRequireComponent /></label>
                                                <input
                                                    {...control.register(`purchases.${index}.unit_measurement`)}
                                                    placeholder='pcs, ea,..'
                                                    className={`dark:bg-[#454545] w-full p-2 text-sm border rounded ${errors?.unit_measurement ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                                                />
                                                {errors?.unit_measurement && (
                                                    <p className="text-sm text-red-500 mt-1">{errors.unit_measurement.message}</p>
                                                )}
                                            </div>
                                            <div className="w-[7%] mr-2">
                                                <label className="block mb-1">{t('create.required_date')}</label>
                                                <Controller
                                                    name={`purchases.${index}.required_date`}
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
                                                {errors?.required_date && (
                                                    <p className="text-sm text-red-500 mt-1">{errors.required_date.message}</p>
                                                )}
                                            </div>
                                            <div className="mr-2">
                                                <label className="block mb-1">{t('create.cost_center')} <DotRequireComponent /></label>
                                                <Controller
                                                    name={`purchases.${index}.cost_center`}
                                                    control={control}
                                                    render={({ field, fieldState }) => (
                                                        <>
                                                            <Select
                                                                {...field}
                                                                options={costCenter}
                                                                className="cursor-pointer"
                                                                value={costCenter?.find(option => option.value == field.value) || null}
                                                                onChange={(selectedOption) => {field.onChange(selectedOption?.value?.toString())}}
                                                                styles={{
                                                                    control: (base) => ({
                                                                        ...base,
                                                                        background: fieldState.error ? "#fef2f2" : "",
                                                                        borderColor: fieldState.error ? "red" : "#d1d5dc",
                                                                        boxShadow: "none",
                                                                        "&:hover": {
                                                                            borderColor: fieldState.error ? "red" : "#d1d5dc",
                                                                        },
                                                                    }),
                                                                }}
                                                            />
                                                            {fieldState.error && (
                                                                <p className="text-sm text-red-500 mt-1">
                                                                {fieldState.error.message}
                                                                </p>
                                                            )}
                                                        </>
                                                    )}
                                                />
                                            </div>
                                            <div className="w-[24%]">
                                                <label className="block mb-1">{t('create.note')}</label>
                                                <input
                                                    {...control.register(`purchases.${index}.note`)}
                                                    placeholder={ t('create.note') }
                                                    className={`dark:bg-[#454545] w-full p-2 text-sm border rounded ${errors?.note ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                                                />
                                                {errors?.note && (
                                                    <p className="text-sm text-red-500 mt-1">{errors.note.message}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className={`flex justify-end`} >
                                        {fields.length > 1 && (
                                            <div className={`flex`}>
                                                <button
                                                    type="button"
                                                    className="bg-red-500 text-white rounded px-2 hover:cursor-pointer hover:bg-red-700"
                                                    onClick={() => remove(index)}
                                                >
                                                    <Trash2 size={20} className="h-[30px]"/>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>

            <div className="mt-5">
                <button type="button" className="dark:bg-black bg-gray-300 px-4 py-2 rounded hover:cursor-pointer hover:bg-gray-400" onClick={() => append({...defaultSinglePurchaseRequest})}>
                    <Plus size={16}/>
                </button>
            </div>
            {
                isCreate || isEdit ? (
                    <div className='flex gap-4 justify-end'>
                        <Button
                            type="button"
                            onClick={onCancel}
                            className='px-6 py-2 border bg-white border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer'
                        >
                            {tCommon('cancel')}
                        </Button>
                        <Button
                            disabled={isPending}
                            type='submit'
                            className='px-6 py-2 bg-black border border-transparent rounded-md text-sm font-medium text-white cursor-pointer'
                        >
                            {isPending ? <Spinner size="small" className='text-white'/> : tCommon('save')}
                        </Button>
                    </div>
                ) : (<></>)
            }            
        </form>
    )
}

export default PurchaseRequestForm;