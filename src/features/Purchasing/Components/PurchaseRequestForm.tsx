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
import Select from 'react-select'
import { NumericInput } from "@/components/NumericInput";
import FileListPreview, { FileListPreviewDownload, UploadedFileType } from "@/components/ComponentCustom/FileListPreviewMemoNotify";
import { getErrorMessage, ShowToast, STATUS_ENUM } from "@/lib";
import memoNotificationApi from "@/api/memoNotificationApi";
import { Label } from "@/components/ui/label";

interface PurchaseRequestFormProps {
    mode: 'create' | 'edit' | 'view' | 'approval' | 'manager_purchase_approval' | 'assigned' 
    formData?: any,
    formDataIT?: any,
    onSubmit?: (data: any) => void,
    costCenter?: { value: string, label: string, departmentId: number | null }[],
    departments?: { id: number, name: string, nameE: string }[],
    requestStatuses?: { id: number, name: string, nameE: string }[],
    isPending?: boolean;
    onUpdatePOAndStatus?: (data: { purchaseOrder: string; status: number }) => void;
    onHasUploadedFilesChange?: (hasFiles: boolean) => void;
    onChangeResponseQuote?: (data: { uploadedFiles: UploadedFileType[]; newFiles: File[] }) => void;
}

const PurchaseRequestForm: React.FC<PurchaseRequestFormProps> = ({ 
    mode, formData, formDataIT, onSubmit, costCenter, departments, requestStatuses, isPending, onUpdatePOAndStatus, onHasUploadedFilesChange,
    onChangeResponseQuote
 }) => {
    const { t } = useTranslation('purchase')
    const { t: tCommon  } = useTranslation('common')
    const lang = useTranslation().i18n.language.split('-')[0]
    const { user } = useAuthStore()
    const navigate = useNavigate()
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFileType[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);

    const isCreateOrEdit = mode == 'create' || mode == 'edit'

    const purchaseRequestSchema = z.object({
        id: z.string().nullable().optional(),
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
        departmentId: z.string().nonempty({ message: "Bắt buộc." }),
        request_date: z.string().nonempty({ message: "Bắt buộc." }),
        purchases: z.array(purchaseRequestSchema),
        purchaseOrder: z.string().optional(),
        status: z.string().optional(),
    });
    
    type PurchaseForm = z.infer<typeof purchaseSchema>;

    const defaultSinglePurchaseRequest = useMemo(() => {
        return {
            id: null,
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
            departmentId: '',
            departmentName: user?.departmentName ?? '',
            request_date: new Date().toISOString().split('T')[0],
            purchases: [{ ...defaultSinglePurchaseRequest }],
        },
    });

    const { register, control, handleSubmit, reset, watch } = form;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "purchases",
    });

    useEffect(() => {
        if (formData && mode != 'create') {
            const appForm = formData.applicationFormItem?.applicationForm;
            reset({
                usercode: appForm?.userCodeCreatedForm ?? '',
                username: appForm?.userNameCreatedForm ?? '',
                departmentId: 
                    appForm?.departmentId?.toString() ??
                    appForm?.orgUnit?.id?.toString() ??
                    '',
                departmentName: appForm?.orgUnit?.name ?? '',
                request_date: formData?.requestedDate?.split('T')[0] ?? '',
                purchases: formData.purchaseDetails?.map((pd: any) => ({
                    id: pd.id?.toString() ?? null,
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
                purchaseOrder: formData?.purchaseOrder ?? '',
                status: formData?.requestStatusId?.toString() ?? ''
            });

            if (formData.quotes?.length > 0) {
                const allQuoteFiles = formData.quotes.flatMap((q: any) =>
                    (q.files || []).map((f: any) => ({
                        id: f.id,
                        fileName: f.fileName,
                        contentType: f.contentType,
                        filePath: f.filePath ?? null,
                        quoteId: q.id,
                        isSelectedQuote: q.isSelected
                    }))
                );
                setUploadedFiles(allQuoteFiles);
            } else {
                setUploadedFiles([]);
            }
        }
        if (mode === "create") {
            reset({
                usercode: user?.userCode ?? "",
                username: user?.userName ?? "",
                departmentId: '',
                departmentName: user?.departmentName ?? "",
                request_date: new Date().toISOString().split("T")[0],
                purchases: [{ ...defaultSinglePurchaseRequest }],
            });
        }
    }, [defaultSinglePurchaseRequest, formData, mode, reset, user]);

    const onInternalSubmit = (data: any) => {
        if (onSubmit) {
            onSubmit({
                ...data,
                AvailableQuotes: uploadedFiles.map(f => f.id),
                NewQuotes: newFiles
            });
        }
    };

    const onCancel = () => {
        if (mode == 'edit') {
            navigate("/purchase")
        }
        else {
            reset()
        }
    }

    const handleUpdateStatusAndPO = () => {
        const { purchaseOrder, status } = form.getValues();
        if (onUpdatePOAndStatus) {
            onUpdatePOAndStatus({ purchaseOrder: purchaseOrder ?? '', status: Number(status) });
        }
    }

    const departmentId = watch('departmentId');

    const filteredCostCenters = useMemo(() => {
        if (!departmentId) return costCenter ?? [];
        const filtered = costCenter?.filter(
            (cc: any) => cc.departmentId?.toString() == departmentId
        );
        return filtered?.length ? filtered : costCenter ?? [];
    }, [departmentId, costCenter]);

    const handleFileRemove = (index: number) => setNewFiles(prev => prev.filter((_, i) => i !== index));
    const handleUploadedRemove = (index: number) => setUploadedFiles(prev => prev.filter((_, i) => i !== index));

    const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        if (!files.length) return;

        const totalFiles = uploadedFiles.length + newFiles.length + files.length;
        if (totalFiles > 5) {
            ShowToast("Tổng số file không được vượt quá 5!", 'error');
            e.target.value = "";
            return;
        }

        const invalid = files.find(f => f.size > 2 * 1024 * 1024);
        if (invalid) {
            ShowToast(`File "${invalid.name}" vượt quá 2MB!`, 'error');
            e.target.value = "";
            return;
        }

        setNewFiles(prev => [...prev, ...files]);
        e.target.value = "";
    };

    const handleDownloadFile = async (file: UploadedFileType) => {
        try {
            const result = await memoNotificationApi.downloadFile(file.id)
            const url = window.URL.createObjectURL(result.data);
            const a = document.createElement("a");
            a.href = url;
            a.download = file.fileName;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            ShowToast(`Download file failed, ${getErrorMessage(err)}`, "error")
        }
    };

    useEffect(() => {
        if (mode == 'create') {
            if (formDataIT) {
                const mappedFiles = formDataIT.applicationFormItem.applicationForm.files.map((f: any) => ({
                    id: f.id,
                    fileName: f.fileName,
                    contentType: f.contentType,
                    filePath: f.filePath,
                }));
                setUploadedFiles(mappedFiles);
            } else {
                setUploadedFiles([])
            }
        }
    }, [formDataIT, mode]);

    useEffect(() => {
        onHasUploadedFilesChange?.(uploadedFiles.length > 0);
    }, [uploadedFiles, onHasUploadedFilesChange]);

    useEffect(() => {
        if (onChangeResponseQuote) {
            onChangeResponseQuote?.({ uploadedFiles, newFiles });
        }
    }, [uploadedFiles, newFiles, onChangeResponseQuote]);

    return (
        <form onSubmit={handleSubmit(onInternalSubmit)}>
            <div className="space-y-6">
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-7 mb-4 max-w-8xl items-end">
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
                            <label htmlFor="requester.department" className="mb-1 block text-sm font-medium text-gray-700">
                                {lang == 'vi' ? 'Phòng ban yêu cầu' : 'Department request'}<DotRequireComponent />
                            </label>
                            
                            <select
                                {...register('departmentId')}
                                disabled={mode != 'create'}
                                className={`border w-full cursor-pointer rounded-[5px] ${mode != 'create' ? 'bg-gray-100': ''} ${form?.formState?.errors?.departmentId ? 'border-red-500' : 'border-gray-300'}`} style={{padding: '6.7px'}}>
                                <option value="">
                                    { lang == 'vi' ? '--Chọn--' : '--Select--' }
                                </option>
                                {
                                    departments?.map((item: { id: number, name: string }, idx: number) => (
                                        <option key={idx} value={item.id}>{item.name}</option>
                                    ))
                                }
                            </select>
                            {form?.formState?.errors?.departmentId && (
                                <p className="text-sm text-red-500 mt-1">{form?.formState?.errors?.departmentId?.message}</p>
                            )}
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
                                        disabled={mode != 'create' && mode != 'edit'}
                                        enableTime={false}
                                        dateFormat="Y-m-d"
                                        initialDateTime={field.value}
                                        onChange={(_selectedDates, dateStr) => field.onChange(dateStr)}
                                        className={`dark:bg-[#454545] w-full shadow-xs border border-gray-300 p-2 text-sm rounded-[5px] hover:cursor-pointer ${mode != 'create' && mode != 'edit' ? 'bg-gray-100' : ''}`}
                                    />
                                )}
                            />
                        </div>
                        {
                            (formData?.applicationFormItem?.applicationForm?.requestStatusId == STATUS_ENUM.ASSIGNED) || mode == 'view' ? (
                                <>
                                    <div className="form-group">
                                        <label htmlFor="requester.name" className="block text-sm font-medium text-gray-700">
                                            {'PO'}
                                        </label>
                                        <input
                                            {...register('purchaseOrder')}
                                            disabled={mode != 'assigned'}
                                            type="text"
                                            id="PO"
                                            placeholder={`PO`}
                                            className={`border-gray-300 mt-1 w-full p-2 rounded-[5px] text-sm border ${mode != 'assigned' ? 'bg-gray-100' : ''}`}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            {lang == 'vi' ? 'Trạng thái' : 'Status'}
                                        </label>
                                        
                                        <select
                                            {...register('status')}
                                            disabled={mode != 'assigned'}
                                            className={`border w-full cursor-pointer rounded-[5px] ${mode != 'assigned' ? 'bg-gray-100' : ''}`} style={{padding: '6.7px'}}>
                                            <option value="">--{ lang == 'vi' ? 'Chọn' : 'Select' }--</option>
                                            {
                                                requestStatuses?.map((item: { id: number, name: string, nameE: string }, idx: number) => (
                                                    <option key={idx} value={item.id}>{lang == 'vi' ? item.name : item.nameE}</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                </>
                            ) : (<></>)
                        }
                        {
                            formData?.applicationFormItem?.applicationForm?.requestStatusId == STATUS_ENUM.ASSIGNED && mode == 'assigned' ? (
                                <>
                                    <div>
                                        <Button onClick={handleUpdateStatusAndPO} className="rounded-[4px] hover:cursor-pointer">
                                            {lang == 'vi' ? 'Cập nhật' : 'Update'}
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <></>
                            )
                        }
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-end">
                            <div>
                                <Label className='mb-1 text-red-700 text-[16px]'>{lang == 'vi' ? 'Đính kèm file báo giá (nếu có)' : 'Attach quotation file (if any) '}</Label>
                            </div>
                            {
                                (mode == 'create' || mode == 'edit' || mode == 'assigned') && !uploadedFiles.some(f => f.quoteId) ? (
                                    <div className="ml-5">
                                        <div className="mt-1">
                                            <input
                                                id="quotation-files"
                                                type="file"
                                                multiple
                                                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                                                onChange={handleAddFiles}
                                                disabled={uploadedFiles.length + newFiles.length >= 5}
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor="quotation-files"
                                                className={`inline-flex items-center gap-2 border px-3 py-1 rounded-md text-sm font-medium 
                                                    ${uploadedFiles.length + newFiles.length >= 5
                                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                    : "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 cursor-pointer"}`}
                                            >
                                                + {lang === "vi" ? "Thêm file báo giá" : "Add quotation file"}
                                            </label>
                                        </div>
                                    </div>
                                ) : (<></>)
                            }
                        </div>

                        <div className="my-3">
                            {
                                uploadedFiles?.length > 0 && (
                                    <FileListPreviewDownload
                                        uploadedFiles={uploadedFiles}
                                        onDownload={handleDownloadFile}
                                        onRemoveUploaded={
                                            (mode === 'create' || mode === 'edit' || mode === 'assigned') &&
                                            !uploadedFiles.some(f => f.quoteId)
                                            ? handleUploadedRemove
                                            : undefined
                                        }
                                    />
                                )
                            }
                        </div>

                        <div>
                            {newFiles.length > 0 && (
                                <FileListPreview
                                    files={newFiles.map((f: any) => ({ name: f.name, type: f.type }))}
                                    uploadedFiles={[]}
                                    onRemove={handleFileRemove}
                                />
                            )}
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
                                                    disabled={mode != 'create' && mode != 'edit'}
                                                    {...control.register(`purchases.${index}.name_category`)}
                                                    placeholder={ t('create.name_category') }
                                                    className={`dark:bg-[#454545] w-full p-2 text-sm border rounded ${!isCreateOrEdit ? 'bg-gray-100' : ''} ${errors?.name_category ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                                                />
                                                {errors?.name_category && (
                                                    <p className="text-sm text-red-500 mt-1">{errors.name_category.message}</p>
                                                )}
                                            </div>
                                            <div className="w-[22%] mr-2">
                                                <label className="block mb-1">{t('create.description')}</label>
                                                <input
                                                    disabled={mode != 'create' && mode != 'edit'}
                                                    {...control.register(`purchases.${index}.description`)}
                                                    placeholder={ t('create.description') }
                                                    className={`dark:bg-[#454545] w-full p-2 text-sm border rounded ${!isCreateOrEdit ? 'bg-gray-100' : ''} ${errors?.description ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                                                />
                                                {errors?.description && (
                                                    <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                                                )}
                                            </div>
                                            <div className="w-[5%] mr-2">
                                                <label className="block mb-1">{t('create.qty')} <DotRequireComponent /></label>
                                                <NumericInput
                                                    className={`${!isCreateOrEdit ? 'bg-gray-100 pointer-events-none ' : ''}`}
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
                                                    disabled={mode != 'create' && mode != 'edit'}
                                                    {...control.register(`purchases.${index}.unit_measurement`)}
                                                    placeholder='pcs, ea,..'
                                                    className={`dark:bg-[#454545] w-full p-2 text-sm border rounded ${!isCreateOrEdit ? 'bg-gray-100' : ''} ${errors?.unit_measurement ? "border-red-500 bg-red-50" : "border-gray-300"}`}
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
                                                            disabled={mode != 'create' && mode != 'edit'}
                                                            enableTime={false}
                                                            dateFormat="Y-m-d"
                                                            initialDateTime={field.value}
                                                            onChange={(_selectedDates, dateStr) => field.onChange(dateStr)}
                                                            className={`dark:bg-[#454545] w-full shadow-xs border ${!isCreateOrEdit ? 'bg-gray-100' : ''} border-gray-300 p-2 text-sm rounded-[5px] hover:cursor-pointer`}
                                                        />
                                                    )}
                                                />
                                                {errors?.required_date && (
                                                    <p className="text-sm text-red-500 mt-1">{errors.required_date.message}</p>
                                                )}
                                            </div>
                                            <div className="mr-2 w-[12%]">
                                                <label className="block mb-1">{t('create.cost_center')} <DotRequireComponent /></label>
                                                <Controller
                                                    name={`purchases.${index}.cost_center`}
                                                    control={control}
                                                    render={({ field, fieldState }) => (
                                                        <>
                                                            <Select
                                                                isDisabled={!isCreateOrEdit}
                                                                {...field}
                                                                options={filteredCostCenters}
                                                                className={`cursor-pointer ${!isCreateOrEdit ? 'bg-gray-100' : ''}`}
                                                                value={filteredCostCenters?.find(option => option.value == field.value) || null}
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
                                                    disabled={!isCreateOrEdit}
                                                    {...control.register(`purchases.${index}.note`)}
                                                    placeholder={ t('create.note') }
                                                    className={`dark:bg-[#454545] w-full p-2 text-sm border rounded ${!isCreateOrEdit ? 'bg-gray-100' : ''} ${errors?.note ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                                                />
                                                {errors?.note && (
                                                    <p className="text-sm text-red-500 mt-1">{errors.note.message}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {
                                        isCreateOrEdit ? (
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
                                        ) : (<></>)
                                    }
                                </div>
                            )
                        })
                    }
                </div>
            </div>
            {
                isCreateOrEdit ? (
                    <>
                    
                        <div className="mt-5">
                            <button type="button" className="dark:bg-black bg-gray-300 px-4 py-2 rounded hover:cursor-pointer hover:bg-gray-400" onClick={() => append({...defaultSinglePurchaseRequest})}>
                                <Plus size={16}/>
                            </button>
                        </div>
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
                    </>
                    
                ) : (<></>)
            }            
        </form>
    )
}

export default PurchaseRequestForm;