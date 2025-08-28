/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/store/authStore";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { z } from 'zod';
import DateTimePicker from "@/components/ComponentCustom/Flatpickr";
import DotRequireComponent from "@/components/DotRequireComponent";
import { Plus, Trash2 } from "lucide-react";

interface PurchaseRequestFormProps {
    mode: 'create' | 'edit' | 'view' | 'approval' | 'manager_it_approval' | 'assigned' 
    formData?: any
    onSubmit?: (data: any) => void,
    costCenter?: { id: number, code: string, description: string }[],
    isPending?: boolean;
}

const PurchaseRequestForm: React.FC<PurchaseRequestFormProps> = ({ mode, formData, onSubmit, costCenter, isPending }) => {
    const { t } = useTranslation('purchase')
    const { t: tCommon  } = useTranslation('common')
    const { user } = useAuthStore()
    const lang = useTranslation().i18n.language.split('-')[0]
    const navigate = useNavigate()
    const [requestDate, setRequestDate] = useState(new Date().toISOString().split('T')[0])

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
            purchases: [{ ...defaultSinglePurchaseRequest }],
        },
    });

    const { control, handleSubmit, setValue, getValues, reset } = form;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "purchases",
    });

    useEffect(() => {
        if (formData) {
            // reset({
            //     requester: {
            //         userCode: formData?.userCodeRequestor ?? '',
            //         name: formData?.userNameRequestor ?? '',
            //         email: formData?.email ?? '',
            //         department: formData?.orgUnit?.name ?? '',
            //         departmentId: formData?.orgUnit?.id ?? -1,
            //         orgPositionId: user?.orgPositionId,
            //         position: formData?.position ?? ''
            //     },
            //     itRequest: {
            //         dateRequired: formData?.requestDate ?? new Date().toISOString().split('T')[0],
            //         dateCompleted: formData?.requiredCompletionDate ?? new Date().toISOString().split('T')[0],
            //         itCategory: formData?.itFormCategories?.map((item: {itCategoryId: number}) => item.itCategoryId) ?? [],
            //         reason: formData?.reason ?? '',
            //         priority: formData?.priorityId ?? 1,
            //     }
            // });
        }
    }, [formData, reset, user?.orgPositionId]);

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
                                disabled
                                type="text"
                                id="usercode"
                                value={user?.userCode}
                                placeholder={tCommon('usercode')}
                                className={`border-gray-300 bg-gray-100 mt-1 w-full p-2 rounded-md text-sm border`}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="requester.name" className="block text-sm font-medium text-gray-700">
                                {tCommon('name')}<DotRequireComponent />
                            </label>
                            <input
                                value={user?.userName ?? ''}
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
                                disabled
                                value={user?.departmentName}
                                type="text"
                                id="department"
                                placeholder={tCommon('department')}
                                className={`border-gray-300 mt-1 w-full p-2 rounded-md text-sm border bg-gray-100`}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="requester.department" className="block text-sm font-medium text-gray-700 mb-1">
                                {tCommon('Ngày yêu cầu')}<DotRequireComponent />
                            </label>
                            <DateTimePicker
                                enableTime={false}
                                dateFormat="Y-m-d"
                                initialDateTime={requestDate}
                                onChange={(_selectedDates, dateStr) => setRequestDate(dateStr)}
                                className={`dark:bg-[#454545] w-full shadow-xs border border-gray-300 p-2 text-sm rounded-[5px] hover:cursor-pointer`}
                            />
                        </div>
                    </div>
                    <h2 className="font-semibold text-2xl">Danh sách mục mua</h2>
                    {
                        fields.map((item, index) => {
                            const errors = form.formState.errors.purchases?.[index];

                            return (
                                <div key={item.id}>
                                    <h3 className="text-red-500 font-semibold text-xl">#{index + 1}</h3>
                                    <div>
                                        <div key={index} className="flex justify-start mb-2">
                                            <div className="w-[22%] mr-2">
                                                <label className="block mb-1">{ t('Tên danh mục') } <DotRequireComponent /></label>
                                                <input
                                                    {...control.register(`purchases.${index}.name_category`)}
                                                    placeholder={ t('name') }
                                                    className={`dark:bg-[#454545] w-full p-2 text-sm border rounded ${errors?.name_category ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                                                />
                                                {errors?.name_category && (
                                                    <p className="text-sm text-red-500 mt-1">{errors.name_category.message}</p>
                                                )}
                                            </div>
                                            <div className="w-[22%] mr-2">
                                                <label className="block mb-1">{ t('Đặc điểm') }</label>
                                                <input
                                                    {...control.register(`purchases.${index}.description`)}
                                                    placeholder={ t('name') }
                                                    className={`dark:bg-[#454545] w-full p-2 text-sm border rounded ${errors?.description ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                                                />
                                                {errors?.description && (
                                                    <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                                                )}
                                            </div>
                                            <div className="w-[5%] mr-2">
                                                <label className="block mb-1">{ t('Số lượng') } <DotRequireComponent /></label>
                                                <input
                                                    {...control.register(`purchases.${index}.quantity`)}
                                                    placeholder={ t('name') }
                                                    className={`dark:bg-[#454545] w-full p-2 text-sm border rounded ${errors?.quantity ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                                                />
                                                {errors?.quantity && (
                                                    <p className="text-sm text-red-500 mt-1">{errors.quantity.message}</p>
                                                )}
                                            </div>
                                            <div className="w-[8%] mr-2">
                                                <label className="block mb-1">{ t('Đơn vị') } <DotRequireComponent /></label>
                                                <input
                                                    {...control.register(`purchases.${index}.unit_measurement`)}
                                                    placeholder={ t('name') }
                                                    className={`dark:bg-[#454545] w-full p-2 text-sm border rounded ${errors?.unit_measurement ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                                                />
                                                {errors?.unit_measurement && (
                                                    <p className="text-sm text-red-500 mt-1">{errors.unit_measurement.message}</p>
                                                )}
                                            </div>
                                            <div className="w-[7%] mr-2">
                                                <label className="block mb-1">{ t('Ngày nhu cầu') }</label>
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
                                                <label className="block mb-1">{ t('Trung tâm chi phí') } <DotRequireComponent /></label>
                                                    <select
                                                        id="abc"
                                                        className={`dark:bg-[#454545] border ${errors?.cost_center ? 'border-red-500' : 'border-gray-300'}  p-2 rounded-[5px] w-full text-sm`}
                                                    >
                                                        <option value="">--Chọn--</option>
                                                        {
                                                            costCenter?.map((item: { id: number, code: string, description: string }) => (
                                                                <option key={item.id} value={item.id}>{item.code}__{item.description}</option>
                                                            ))
                                                        }
                                                    </select>
                                                {errors?.cost_center && (
                                                    <p className="text-sm text-red-500 mt-1">{errors.cost_center.message}</p>
                                                )}
                                            </div>
                                            <div className="w-[24%]">
                                                <label className="block mb-1">{ t('Ghi chú') }</label>
                                                <input
                                                    {...control.register(`purchases.${index}.note`)}
                                                    placeholder={ t('name') }
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