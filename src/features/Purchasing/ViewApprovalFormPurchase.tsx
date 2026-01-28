/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import purchaseApi, { useApprovalPurchase, useAssignedTaskPurchaseForm, useConfirmQuote, useResolvedTaskPurchaseForm, useResponseForQuote, useUpdatePOAndStatus } from '@/api/purchaseApi';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import DotRequireComponent from '@/components/DotRequireComponent';
import orgUnitApi from '@/api/orgUnitApi';
import costCenterApi from '@/api/costCenterApi';
import { handleDownloadFile, RequestTypeEnum, ShowToast, StatusApplicationFormEnum, ViewApprovalProps } from '@/lib';
import DateTimePicker from '@/components/ComponentCustom/Flatpickr';
import { Label } from '@/components/ui/label';
import FileListPreview, { FileListPreviewDownload } from '@/components/ComponentCustom/FileListPreviewMemoNotify';
import Select from 'react-select'
import { NumericInput } from '@/components/NumericInput';
import { useEffect, useMemo, useState } from 'react';
import { PurchaseForm, purchaseSchema } from './CreateFormPurchase';
import { Textarea } from '@/components/ui/textarea';
import ModalConfirm from '@/components/ModalConfirm';
import HistoryApproval from '../Approval/Components/HistoryApproval';
import { ISelectedUserAssigned } from '@/api/userApi';
import { Button } from '@/components/ui/button';
import requestStatusApi, { IRequestStatus } from '@/api/requestStatusApi';

const ViewApprovalFormPurchase = ({id, mode}: ViewApprovalProps) => {
    const { t } = useTranslation('purchase')
    const { t: tCommon  } = useTranslation('common')
    const lang = useTranslation().i18n.language.split('-')[0]
    const { user } = useAuthStore()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const hasId = !!id;
    const [note, setNote] = useState("")
    const [statusModalConfirm, setStatusModalConfirm] = useState('')
    const [selectedUserAssigned, setSelectedUserAssigned] = useState<ISelectedUserAssigned[]>([]);
    const [quoteSelected, setQuoteSelected] = useState<number>(0);

    const handleSetSelectedQuote = (quoteSelectedId: number) => {
        setQuoteSelected(quoteSelectedId);
    };

    const { data: departments = [] } = useQuery({
        queryKey: ['get-all-department'],
        queryFn: async () => {
            const res = await orgUnitApi.GetAllDepartment()
            return res.data.data
        }
    });

    const { data: requestStatus } = useQuery({
        queryKey: ['get-all-request-status'],
        queryFn: async () => {
            const res = await requestStatusApi.getAll();
            return res.data.data.filter(
                (item: IRequestStatus) => [10, 11, 3].includes(item.id)
            );
        }
    });

    const { data: formDataDetail, isLoading: isFormDataLoading } = useQuery({
        queryKey: ['purchaseForm', id],
        queryFn: async () => {
            const res = await purchaseApi.getById(id ?? '');
            return res.data.data
        },
        enabled :hasId && !!requestStatus,
    });
    
    useEffect(() => {
        if (formDataDetail) {
            reset({
                usercode: formDataDetail?.purchase?.applicationForm?.userCodeCreatedForm ?? '',
                username: formDataDetail?.purchase?.applicationForm?.userNameCreatedForm ?? '',
                departmentId: formDataDetail?.purchase?.departmentId.toString(),
                departmentName: formDataDetail?.purchase?.orgUnit?.name,
                requestDate: formDataDetail?.purchase?.requestedDate,
                purchaseOrder: formDataDetail?.purchase?.purchaseOrder,
                status: formDataDetail?.purchase?.requestStatusId,
                purchaseDetails: formDataDetail?.purchase?.purchaseDetails?.map((item: any) => ({
                    id: item.id ?? null,
                    nameCategory: item?.itemName ?? '',
                    description: item.itemDescription ?? '',
                    quantity: item.quantity?.toString() ?? '',
                    unitMeasurement: item.unitMeasurement ?? '',
                    requiredDate: item.requiredDate ? item.requiredDate.split('T')[0] : undefined,
                    costCenter: item.costCenterId?.toString() ?? '',
                    note: item.note ?? ''
                })),
                quotesUploaded: formDataDetail?.filesQuote,
                newQuotes: []
            })

            const fileQuoteSelect = formDataDetail?.filesQuote?.find((e: any) => e.isSelected);

            if (fileQuoteSelect != undefined) {
                setQuoteSelected(fileQuoteSelect?.entityId)
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formDataDetail, hasId])

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

    const { register, control, reset, getValues, setValue, watch  } = form;

    const { fields } = useFieldArray({
        control,
        name: "purchaseDetails",
    });
    
    const quotesUpload = watch('quotesUploaded');
    const departmentId = watch('departmentId');

    const filteredCostCenters = useMemo(() => {
        if (!departmentId) return costCenters ?? [];
        const filtered = costCenters?.filter(
            (cc: any) => cc.departmentId?.toString() == departmentId
        );
        return filtered?.length ? filtered : costCenters ?? [];
    }, [departmentId, costCenters]);

    const approvalPurchase = useApprovalPurchase()
    const assignPurchase = useAssignedTaskPurchaseForm()
    const responseQuote = useResponseForQuote()
    const confirmQuote = useConfirmQuote()
    const updatePOAndStatus = useUpdatePOAndStatus()
    const resolvedTask = useResolvedTaskPurchaseForm()

    const handleSaveModalConfirm = async (type: string) => {
        const payload: any = {
            RequestTypeId: formDataDetail?.purchase?.applicationForm?.requestTypeId,
            RequestStatusId: formDataDetail?.purchase?.applicationForm?.requestStatusId,
            applicationFormId: formDataDetail?.purchase?.applicationFormId,
            applicationFormCode: formDataDetail?.purchase?.applicationForm?.code,
            UserCodeApproval: user?.userCode,
            UserNameApproval: user?.userName ?? "",
            OrgPositionId: user?.orgPositionId,
            Status: type == 'approval' ? true : false,
            Note: note,
            UserAssignedTasks: selectedUserAssigned ?? [],
        }

        setStatusModalConfirm('')

        if (type == 'update_po_status') {
            const { status, purchaseOrder } = form.getValues();
            if (purchaseOrder?.trim() == '' || purchaseOrder == null) {
                ShowToast(lang == 'vi' ? 'Chưa nhập PO' : 'Please input PO', 'error')
                return
            }
            if (status == '') {
                ShowToast(lang == 'vi' ? 'Trạng thái không được để trống' : 'The status can not empty', 'error')
                return
            }

            const payload = {
                ApplicationFormId: formDataDetail?.purchase?.applicationFormId,
                UserCode: user?.userCode ?? '',
                UserName: user?.userName ?? '',
                StatusId: status ? Number(status) : -1,
                PurchaseOrder: purchaseOrder ?? ''
            }

            await updatePOAndStatus.mutateAsync(payload)

            navigate('/approval/assigned-tasks')
        }
        else if (type == 'choose_quote') {
            if (quoteSelected <= 0) {
                ShowToast(lang == 'vi' ? 'Vui lòng báo giá' : 'Please select quote', 'error')
                return
            }
            const paylConfirmQuote = {
                UserCode: user?.userCode,
                UserName: user?.userName ?? "",
                OrgPositionId: user?.orgPositionId,
                Note: note,
                ApplicationFormId: formDataDetail?.purchase?.applicationFormId,
                SelectedQuoteId: quoteSelected
            }
            await confirmQuote.mutateAsync(paylConfirmQuote)
            navigate("/approval/wait-confirm")
        }
        else if (type == 'response_quote') {
            if (newQuotes.length <= 0) {
                ShowToast(lang == 'vi' ? 'Chưa đính kèm file báo giá' : 'Please attach file quote', 'error')
                return
            }
            const formResponseQuote = new FormData()

            formResponseQuote.append('UserCode', user?.userCode ?? '')
            formResponseQuote.append('UserName', user?.userName ?? '')
            formResponseQuote.append('Note', note)
            formResponseQuote.append('ApplicationFormId', formDataDetail?.purchase?.applicationFormId)

            newQuotes?.forEach((file: File) => {
                formResponseQuote.append("NewQuotes", file);
            });

            await responseQuote.mutateAsync(formResponseQuote)
            navigate("/purchase/list-item-wait-quote")
        }
        else if (type == 'assigned') {
            if (selectedUserAssigned.length <= 0) {
                ShowToast(lang == 'vi' ? 'Chọn 1 thành viên để thực hiện yêu cầu này' : 'Please select at least one person to this task', 'error')
                return
            }
            await assignPurchase.mutateAsync(payload)
            navigate('/approval/pending-approval')
            queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });
        }
        else if (type == 'request_quote') {
            payload.StatusRequest = StatusApplicationFormEnum.WaitQuote
            payload.Status = true
            await approvalPurchase.mutateAsync(payload);
            navigate('/approval/pending-approval')
        }
        else if (type == 'resolved') {
            await resolvedTask.mutateAsync(payload)
            navigate("/approval/wait-confirm")
        }
        else if (type == 'reject' || type == 'approval') {
            await approvalPurchase.mutateAsync(payload);
            navigate("/approval/pending-approval")
        }

        queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] })
    }

    const { data: purchaseMembers = [] } = useQuery({
        queryKey: ['get-all-purchase-member'],
        queryFn: async () => {
            const res = await purchaseApi.getMemberPurchaseAssigned()
            return res.data.data
        }
    });

    const handleCheckboxChangeUserAssigned = (event: React.ChangeEvent<HTMLInputElement>, item: {nvMaNV: string, nvHoTen: string, email: string}) => {
        const isChecked = event.target.checked;
        if (isChecked) {
            setSelectedUserAssigned(prevSelected => [...prevSelected, { userCode: item.nvMaNV, userName: item.nvHoTen, email: item.email }]);
        } else {
            setSelectedUserAssigned(prevSelected => prevSelected.filter(u => u.userCode !== item.nvMaNV));
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newFiles = Array.from(files);
        const current = getValues('newQuotes');

        setValue('newQuotes', [...current, ...newFiles]);
        e.target.value = "";
    };

    const newQuotes = watch('newQuotes')
    
    if (hasId && isFormDataLoading) {
        return <div>{lang === 'vi' ? 'Đang tải dữ liệu...' : 'Loading data...'}</div>;
    }

    if (hasId && !formDataDetail) {
        return  <div className='text-red-700 font-semibold'>{lang == 'vi' ? 'Không tìm thấy dữ liệu' : 'Not found data'}</div>;
    }

    return (
        <div className="p-1 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0">{lang == 'vi' ? 'Chi tiết đơn mua hàng' : 'Detail purchase'}</h3>
            </div>

            <ModalConfirm
                type={statusModalConfirm}
                isOpen={statusModalConfirm != ''}
                onClose={() => setStatusModalConfirm('')}
                onSave={handleSaveModalConfirm}
                //isPending={approvalTerminationLetter.isPending || resolvedTask.isPending}
            />

            {
                formDataDetail?.purchase?.applicationForm?.reference && (
                    <div className='mb-4 mt-2 text-base text-black bg-orange-200 p-2 rounded'>
                        {lang == 'vi' ? 'Đơn mua hàng liên kết với đơn IT' : 'Purchase order linked to IT order'}: 
                        <Link className='text-purple-600 font-bold underline' to={`/view/${formDataDetail?.purchase?.applicationForm?.reference?.code}?requestType=${RequestTypeEnum.FormIT}`}>{formDataDetail?.purchase?.applicationForm?.reference?.code}</Link> 
                    </div>
                )
            }

            <div className="flex flex-col">
                <div className="w-full bg-white rounded-xl pl-0">
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
                                        disabled
                                        enableTime={false}
                                        dateFormat="Y-m-d"
                                        initialDateTime={field.value}
                                        onChange={(_selectedDates, dateStr) => field.onChange(dateStr)}
                                        className={`dark:bg-[#454545] w-full shadow-xs border border-gray-300 bg-gray-100 p-2 text-sm rounded-[5px] hover:cursor-pointer`}
                                    />
                                )}
                            />
                        </div>
                        {
                            (
                                formDataDetail?.filesQuote?.length > 0 && formDataDetail?.filesQuote?.some((e: any) => e.isSelected)
                            )
                            && <>
                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700">PO</label>
                                    <input
                                        {...register('purchaseOrder')}
                                        disabled={mode == 'view' || formDataDetail?.purchase?.requestStatusId == StatusApplicationFormEnum.Complete}
                                        type="text"
                                        id="purchaseOrder"
                                        placeholder={`PO`}
                                        className={`border-gray-300 mt-1 w-full p-2 rounded-md text-sm border ${mode == 'view' || formDataDetail?.purchase?.requestStatusId == StatusApplicationFormEnum.Complete ? 'bg-gray-100': ''}`}
                                    />
                                </div>

                                <div className="form-group col-span-1">
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        {lang == 'vi' ? 'Trạng thái' : 'Status'}
                                    </label>
                                    <select
                                        {...register('status')}
                                        disabled={mode == 'view' || formDataDetail?.purchase?.requestStatusId == StatusApplicationFormEnum.Complete}
                                        className={`border w-full cursor-pointer rounded-[5px] ${mode == 'view' || formDataDetail?.purchase?.requestStatusId == StatusApplicationFormEnum.Complete ? 'bg-gray-100' : ''}`}
                                        style={{ padding: '6.7px' }}
                                    >
                                        {requestStatus?.map((item: any, idx: number) => (
                                            <option key={idx} value={item.id}>
                                                {lang == 'vi' ? item.name : item.nameE}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {
                                    (mode != 'view' && formDataDetail?.purchase?.requestStatusId != StatusApplicationFormEnum.Complete) && <div className="col-span-1">
                                        <Button disabled={updatePOAndStatus.isPending} onClick={() => setStatusModalConfirm('update_po_status')} className="rounded-[4px] hover:cursor-pointer disabled:bg-gray-400 bg-orange-600">
                                            {lang == 'vi' ? 'Cập nhật' : 'Update'}
                                        </Button>
                                    </div>
                                }
                            </>
                        }
                    </div>

                    <div className="space-y-3">
                        <div className="flex flex-wrap md:flex-nowrap md:items-end gap-2">
                            <Label className="text-red-700 text-[16px]">
                                {lang == 'vi' ? 'Đính kèm file báo giá' : 'Attach quotation file'}
                            </Label>
                            {
                                mode != 'view' && formDataDetail?.filesQuote?.length == 0 && formDataDetail?.purchase?.applicationForm?.requestStatusId == StatusApplicationFormEnum.WaitQuote &&
                                <div className='flex items-center'>
                                    <input
                                        id="quotation-files"
                                        type="file"
                                        multiple
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <label htmlFor="quotation-files" className={`inline-flex items-center gap-2 border px-3 py-1 rounded-md text-sm font-medium cursor-pointer`}>
                                        + {lang === 'vi' ? 'Thêm file báo giá' : 'Add quotation file'}
                                    </label>
                                </div>
                            }
                            
                        </div>
                        
                        <FileListPreview 
                            files={newQuotes}
                            onRemove={(index) => {
                                const newFiles = [...newQuotes];
                                newFiles.splice(index, 1);
                                setValue('newQuotes', newFiles);
                            }}
                        />
                        <div className='mt-1'>
                            <FileListPreviewDownload
                                key={quotesUpload?.length || 0}
                                onDownload={(file) => {handleDownloadFile(file)}} 
                                uploadedFiles={quotesUpload} 
                                isShowCheckbox={formDataDetail?.filesQuote?.length > 0}
                                quoteSelected={quoteSelected}
                                handleSetSelectedQuote={handleSetSelectedQuote}
                                isDisabled={mode == 'view'}
                            />
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
                                                    disabled
                                                    {...control.register(`purchaseDetails.${index}.nameCategory`)}
                                                    placeholder={t("create.name_category")}
                                                    className={`p-2 text-sm border rounded w-full bg-gray-100  ${errors?.nameCategory ? 'border-red-500 bg-red-50' : ''}`}
                                                />
                                            </div>

                                            <div className="flex flex-col w-full sm:w-full lg:max-w-[270px]">
                                                <label className={`block mb-1 text-sm font-medium ${!showLabel ? "xl:hidden" : ""}`}>
                                                    {t("create.description")}
                                                </label>
                                                <input
                                                    disabled
                                                    {...control.register(`purchaseDetails.${index}.description`)}
                                                    placeholder={t("create.description")}
                                                    className={`p-2 text-sm border rounded w-full bg-gray-100`}
                                                />
                                            </div>

                                            <div className="flex flex-col w-full sm:w-full lg:max-w-[80px]">
                                                <label className={`block mb-1 text-sm font-medium ${!showLabel ? "xl:hidden" : ""}`}>
                                                    {t("create.qty")} <DotRequireComponent />
                                                </label>
                                                <NumericInput
                                                    className='bg-gray-100'
                                                    disabled={true}
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
                                                    disabled
                                                    {...control.register(`purchaseDetails.${index}.unitMeasurement`)}
                                                    placeholder="pcs, ea,.."
                                                    className={`p-2 text-sm border rounded w-full bg-gray-100 ${errors?.unitMeasurement ? 'border-red-500 bg-red-50' : ''}`}
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
                                                            disabled
                                                            enableTime={false}
                                                            dateFormat="Y-m-d"
                                                            initialDateTime={field.value}
                                                            onChange={(_selectedDates, dateStr) => field.onChange(dateStr)}
                                                            className={`w-full border border-gray-300 p-2 text-sm rounded bg-gray-100`}
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
                                                                isDisabled
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
                                                        disabled
                                                        {...control.register(`purchaseDetails.${index}.note`)}
                                                        placeholder={t("create.note")}
                                                        className={`p-2 text-sm border rounded w-full bg-gray-100`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    );
                                })}
                        </div>
                    </div>
                    <div className='mt-2'>
                        <Label className='mb-1'>{lang == 'vi' ? 'Ghi chú' : 'Note'}</Label>
                        <Textarea placeholder='Note' value={note} onChange={(e) => setNote(e.target.value)} className="border-gray-300"/>
                    </div>
                    <div className="mt-2">
                        <span className="font-bold text-black">
                            {lang === 'vi' ? 'Quy trình' : 'Approval flow'}:
                        </span>{' '}
                        {formDataDetail?.defineAction
                            .map((item: any, idx: number) => (
                                <span key={idx} className="font-bold text-orange-700">
                                    ({idx + 1}) {item?.Name ?? item?.UserCode}
                                    {idx < formDataDetail?.defineAction?.length - 1 ? ', ' : ''}
                                </span>
                            ))}
                    </div>
                    {
                        (formDataDetail?.defineAssigned?.length > 0 
                            || (mode != 'view' && formDataDetail?.purchase?.applicationForm?.requestStatusId == StatusApplicationFormEnum.FinalApproval)
                        )
                            && 
                            <label className="block text-sm font-medium text-gray-700 mb-0 mt-3">
                                {lang == 'vi' ? 'Được giao cho' : 'Assigned to'}<DotRequireComponent />
                            </label>
                    }
                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 mt-1">
                        {
                            formDataDetail?.defineAssigned?.length > 0 ? (
                                formDataDetail?.defineAssigned?.map((item: any, idx: number) => (
                                    <label
                                        key={idx}
                                        className="flex cursor-pointer"
                                    >
                                        <span>
                                            <strong>({item.UserCode})</strong> {item.UserName}
                                        </span>
                                    </label>
                                ))
                            ) :
                            mode != 'view' && formDataDetail?.purchase?.applicationForm?.requestStatusId == StatusApplicationFormEnum.FinalApproval 
                            ? (
                                purchaseMembers?.map((item: {nvMaNV: string, nvHoTen: string, email: string}, idx: number) => (
                                    <label
                                        key={idx}
                                        className="flex items-center space-x-2 cursor-pointer w-full sm:w-[48%] select-none"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedUserAssigned.some(
                                                (e) => e.userCode == item.nvMaNV
                                            )}
                                            value={item.nvMaNV}
                                            className="border-gray-300 scale-[1.4] accent-black"
                                            onChange={(e) =>
                                                handleCheckboxChangeUserAssigned(e, item)
                                            }
                                        />
                                        <span>
                                            <strong>({item.nvMaNV})</strong> {item.nvHoTen}
                                        </span>
                                    </label>
                                ))
                            ) : (null)
                        }
                    </div>
                    <div className='flex justify-end mt-2'>
                        {
                            formDataDetail?.purchase?.requestStatusId == StatusApplicationFormEnum.Complete ?
                            (
                                 mode != 'view' &&
                                    <button
                                        onClick={() => setStatusModalConfirm('resolved')}
                                        disabled={assignPurchase.isPending}
                                        className="mr-2 cursor-pointer w-full sm:w-auto py-3 px-4 bg-blue-600 text-white font-semibold rounded-sm shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm tracking-wide uppercase disabled:bg-gray-400"
                                    >
                                        {lang == 'vi' ? 'Đóng' : 'Closed'}
                                    </button>
                            )
                            : formDataDetail?.filesQuote?.length > 0 && formDataDetail.filesQuote.every((e: any) => e.isSelected === false) ?
                            (
                                mode != 'view' &&
                                    <button
                                        onClick={() => setStatusModalConfirm('choose_quote')}
                                        disabled={assignPurchase.isPending}
                                        className="mr-2 cursor-pointer w-full sm:w-auto py-3 px-4 bg-blue-600 text-white font-semibold rounded-sm shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm tracking-wide uppercase disabled:bg-gray-400"
                                    >
                                        {lang == 'vi' ? 'Xác nhận báo giá' : 'Confirm quote'}
                                    </button>
                            )
                            : formDataDetail?.purchase?.applicationForm?.requestStatusId == StatusApplicationFormEnum.WaitQuote ?
                            (
                                mode != 'view' &&
                                    <button
                                        onClick={() => setStatusModalConfirm('response_quote')}
                                        disabled={assignPurchase.isPending}
                                        className="mr-2 cursor-pointer w-full sm:w-auto py-3 px-4 bg-blue-600 text-white font-semibold rounded-sm shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm tracking-wide uppercase disabled:bg-gray-400"
                                    >
                                        {lang == 'vi' ? 'Phản hồi báo giá' : 'Response quote'}
                                    </button>
                            )
                            : formDataDetail?.purchase?.applicationForm?.requestStatusId == StatusApplicationFormEnum.FinalApproval ?
                            (
                                mode != 'view' &&
                                    <button
                                        onClick={() => setStatusModalConfirm('assigned')}
                                        disabled={assignPurchase.isPending}
                                        className="mr-2 cursor-pointer w-full sm:w-auto py-3 px-4 bg-blue-600 text-white font-semibold rounded-sm shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm tracking-wide uppercase disabled:bg-gray-400"
                                    >
                                        {lang == 'vi' ? 'Giao việc' : 'Assigned task'}
                                    </button>
                            )
                            : formDataDetail?.purchase?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Assigned ?
                            (
                                    mode != 'view' && (<></>)
                                    // <button
                                    //     onClick={() => setStatusModalConfirm('resolved')}
                                    //     //disabled={approvalTerminationLetter.isPending || resolvedTask.isPending}
                                    //     className="mr-2 cursor-pointer w-full sm:w-auto py-3 px-4 bg-blue-600 text-white font-semibold rounded-sm shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm tracking-wide uppercase disabled:bg-gray-400"
                                    // >
                                    //     {lang == 'vi' ? 'Đóng' : 'Closed'}
                                    // </button>
                            )
                             : [StatusApplicationFormEnum.Complete, StatusApplicationFormEnum.Reject].includes(formDataDetail?.purchase?.applicationForm?.requestStatusId) ? (null) : (
                                    mode != 'view' && <>
                                    <button
                                        onClick={() => setStatusModalConfirm('reject')}
                                        disabled={approvalPurchase.isPending}
                                        className="mr-2 cursor-pointer w-full sm:w-auto py-1 px-4 bg-red-600 text-white font-semibold rounded-sm shadow-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm tracking-wide uppercase disabled:bg-gray-400"
                                    >
                                        {lang == 'vi' ? 'Từ chối' : 'Reject'}
                                    </button>
                                    {
                                        formDataDetail?.defineInstance?.currentStep == 2 && 
                                        <button
                                            onClick={() => setStatusModalConfirm('request_quote')}
                                            disabled={approvalPurchase.isPending}
                                            className="mr-2 cursor-pointer w-full sm:w-auto py-1 px-4 bg-yellow-500 text-white font-semibold rounded-sm shadow-lg hover:bg-yellow-600 focus:outline-none focus:ring-4 focus:ring-yellow-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm tracking-wide uppercase disabled:bg-gray-400"
                                        >
                                            {lang == 'vi' ? 'Cần báo giá' : 'Need quote'}
                                        </button>
                                    }
                                    <button
                                        onClick={() => setStatusModalConfirm('approval')}
                                        disabled={approvalPurchase.isPending}
                                        className="cursor-pointer w-full sm:w-auto py-3 px-5 bg-blue-600 text-white font-semibold rounded-sm shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-base tracking-wide uppercase disabled:bg-gray-400"
                                    >
                                        {lang == 'vi' ? 'Duyệt đơn' : 'Approval'}
                                    </button>
                                </>
                            )
                        }
                    </div>
                    <HistoryApproval historyApplicationForm={formDataDetail?.purchase?.applicationForm?.historyApplicationForms}/>
                </div>
            </div>
        </div>
    );
};

export default ViewApprovalFormPurchase;
