/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useAuthStore } from "@/store/authStore"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import { HotTable, HotTableRef } from '@handsontable/react-wrapper'
import { registerAllModules } from 'handsontable/registry'
import internalMemoHrApi, { useApprovalInternalMemo, useAssignedTaskInternalMemo, useExportExcelInternalMemo, useResolvedTaskInternalMemo } from "@/api/internalMemoHrApi"
import orgUnitApi from "@/api/orgUnitApi"
import Handsontable from "handsontable"
import DotRequireComponent from "@/components/DotRequireComponent"
import 'handsontable/styles/handsontable.css'
import 'handsontable/styles/ht-theme-main.css'
import { z } from 'zod';
import { useForm } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod';
import { StatusApplicationFormEnum, ViewApprovalProps } from "@/lib"
import { InternalMemoSchema, listDoors, listTypeInternalMemoHRs } from "./CreateInternalMemoHR"
import HistoryApproval from "../Approval/Components/HistoryApproval"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import ModalConfirm from "@/components/ModalConfirm"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { ISelectedUserAssigned } from "@/api/userApi"
import itFormApi from "@/api/itFormApi"

registerAllModules();

export default function ViewApprovalInternalMemoHR({id, mode}: ViewApprovalProps) {
    const { t } = useTranslation('hr')
    const lang = useTranslation().i18n.language.split('-')[0]
    const user = useAuthStore((state) => state.user)
    const navigate = useNavigate()
    const hasId = !!id;
    const [userCodeCreatedForm, setUserCodeCreatedForm] = useState('')
    const [userNameCreatedForm, setUserNameCreatedForm] = useState('')
    const [statusModalConfirm, setStatusModalConfirm] = useState('')
    const [note, setNote] = useState('')
    const queryClient = useQueryClient()
    const [selectedUserAssigned, setSelectedUserAssigned] = useState<ISelectedUserAssigned[]>([]);

    const { data: departments = [] } = useQuery({ 
        queryKey: ['get-all-department'], 
        queryFn: async () => { 
            const res = await orgUnitApi.GetAllDepartment();
            return res.data.data;
        }
    });

    const hotRef = useRef<HotTableRef>(null);

    const form = useForm<z.infer<typeof InternalMemoSchema>>({
        resolver: zodResolver(InternalMemoSchema),
        defaultValues: {
            title: 'Đổi ca',
            titleE: 'Change Shift',
            titleCode: 'change_shift',
            otherTitle: null,
            departmentId: '',
            save: '',
            note: '',
            metaData: {
                headers: [],
                rows: [],
                registerDoorOptions: []
            }
        },
    });

    const { watch, register, reset, setValue, formState: { errors }, } = form;

    const [tableData, setTableData] = useState<string[][]>([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    const approvalInternalMemoHr = useApprovalInternalMemo();
    const assignedInternalMemoHr = useAssignedTaskInternalMemo();
    const resolvedInternalMemoHr = useResolvedTaskInternalMemo();
    
    const { data: formDataDetail, isLoading: isFormDataLoading } = useQuery({
        queryKey: ['internal-memo-hr', id],
        queryFn: async () => {
            const res = await internalMemoHrApi.getDetailInternalMemoHr(id ?? '');
            return res.data.data;
        },
        enabled: hasId,
    });

    const { data: ItMembers = [] } = useQuery({
        queryKey: ['get-all-it-member'],
        queryFn: async () => {
            const res = await itFormApi.getMemberITAssigned();
            return res.data.data;
        },
        enabled: formDataDetail?.applicationForm?.requestStatusId == StatusApplicationFormEnum.FinalApproval
    });

    const detechFormType = watch('titleCode')
    const selectedDoors = watch('metaData.registerDoorOptions') ?? [];

    useEffect(() => {
        if (hasId && formDataDetail) {
            const meta = JSON.parse(formDataDetail?.internalMemoHr?.metaData);
            const headers: string[] = meta.headers ?? [];
            const rows: any[][] = meta.rows ?? [];
            const doorOptions = meta?.registerDoorOptions ?? [];
            const emptyRows = Array.from({ length: 15 }, () =>
                Array(headers.length).fill("")
            );
            setTableData([headers, ...rows, ...emptyRows]);

            setUserCodeCreatedForm(formDataDetail?.applicationForm?.userCodeCreatedForm)
            setUserNameCreatedForm(formDataDetail?.applicationForm?.userNameCreatedForm)

            reset({
                title: formDataDetail?.internalMemoHr?.title,
                titleE: formDataDetail?.internalMemoHr?.titleE,
                titleCode: formDataDetail?.internalMemoHr?.titleCode,
                otherTitle: formDataDetail?.internalMemoHr?.otherTitle ?? null,
                departmentId: String(formDataDetail?.internalMemoHr?.departmentId ?? ''),
                save: formDataDetail?.internalMemoHr?.save,
                note: formDataDetail?.internalMemoHr?.note,
                metaData: {
                    headers: headers,
                    rows: rows,
                    registerDoorOptions: doorOptions
                }
            })
        } else if (!isDataLoaded) {
            setIsDataLoaded(true);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formDataDetail, isDataLoaded, hasId]);

    const handleSaveModalConfirm = async (type: string) => {
        const meta = JSON.parse(formDataDetail?.internalMemoHr?.metaData);
        const headers: string[] = meta.headers ?? [];
        const rows: any[][] = meta.rows ?? [];

        const payload = {
            UserCodeApproval: user?.userCode,
            UserNameApproval: user?.userName ?? "",
            OrgPositionId: user?.orgPositionId,
            Status: type == 'approval' ? true : false,
            Note: note,
            applicationFormId: formDataDetail?.applicationForm?.id,
            RequestTypeId: formDataDetail?.applicationForm?.requestTypeId,
            RequestStatusId: formDataDetail?.applicationForm?.requestStatusId,
            UserAssignedTasks: selectedUserAssigned ?? [],
            MetaData: JSON.stringify({
                headers: headers,
                rows: rows,
                registerDoorOptions: selectedDoors
            })
        }

        setStatusModalConfirm('')

        try {
            if (type == 'resolved') {
                await resolvedInternalMemoHr.mutateAsync(payload);

                if (formDataDetail?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Assigned) {
                    navigate('/approval/assigned-tasks')
                } else {
                    navigate('/approval/pending-approval')
                }
                queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });
            }
            else if (type == 'assigned') {
                await assignedInternalMemoHr.mutateAsync(payload)
                navigate('/approval/pending-approval')
                queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });
            }
            else {
                await approvalInternalMemoHr.mutateAsync(payload)
                if (formDataDetail?.defineInstance?.currentStep == 5) { //hr confirm
                    navigate("/approval/assigned-tasks")
                } else {
                    navigate("/approval/pending-approval")
                }
                queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });
            }
            
        } catch (err) {
            console.log(err);
        }
    }

    const hrExportExcelInternalMemo = useExportExcelInternalMemo();
    const handleExport = async () => {
        await hrExportExcelInternalMemo.mutateAsync(formDataDetail?.applicationForm?.id)
    };
    
    const handleCheckboxChangeUserAssigned = (event: React.ChangeEvent<HTMLInputElement>, item: {nvMaNV: string, nvHoTen: string, email: string}) => {
        const isChecked = event.target.checked;
        if (isChecked) {
            setSelectedUserAssigned(prevSelected => [...prevSelected, { userCode: item.nvMaNV, userName: item.nvHoTen, email: item.email }]);
        } else {
            setSelectedUserAssigned(prevSelected => prevSelected.filter(u => u.userCode !== item.nvMaNV));
        }
    };

    if (hasId && isFormDataLoading) {
        return <div>{lang == 'vi' ? 'Loading' : 'Đang tải'}...</div>;
    }

    if (hasId && !formDataDetail) {
        return  <div className='text-red-700 font-semibold'>{lang == 'vi' ? 'Không tìm thấy dữ liệu' : 'Not found data'}</div>;
    }
    
    return (
        <div className="p-4 pl-1 pt-0 space-y-4 leave-request-form">
            <div className="flex justify-between">
                <h3 className="font-bold text-xl md:text-2xl">
                    <span>{lang == 'vi' ? 'Đơn nội bộ HR' : 'Internal memo HR'} </span>
                </h3>
                {
                    [StatusApplicationFormEnum.Assigned, StatusApplicationFormEnum.Complete].includes(formDataDetail?.applicationForm?.requestStatusId) && (
                        <Button
                            variant="outline"
                            disabled={hrExportExcelInternalMemo.isPending}
                            onClick={handleExport}
                            className="text-base p-4 bg-blue-600 text-white hover:cursor-pointer hover:bg-dark hover:text-white w-full sm:w-auto"
                        >
                            {hrExportExcelInternalMemo.isPending ? <Spinner className="text-white" size="small"/> : lang == 'vi' ? 'Xuất excel' : 'Export excel' }
                        </Button>
                    )
                }
            </div>
            <div className="flex items-center mb-0">
                <div className="flex items-center">
                    <label className="block mr-2">{t('internal_memo_hr.department')} <DotRequireComponent/></label>
                    <select disabled {...register("departmentId")} className={`border cursor-pointer border-gray-300 rounded px-3 py-1 bg-gray-50 ${errors.departmentId ? 'border-red-500 bg-red-50' : ''}`}>
                        <option value="">--{lang == 'vi' ? 'Chọn' : 'Select'}--</option>
                        {
                            departments?.map((item: any, idx: number) => {
                                return (
                                    <option key={idx} value={item?.id ?? ''}>{item?.name}</option>
                                )
                            })
                        }
                    </select>
                </div>
                <div className=" ml-3 flex">
                    <div className="flex items-center">
                        <label className="block mr-2">{t('internal_memo_hr.title')} <DotRequireComponent/></label>
                        <select disabled {...register("titleCode")} className={`bg-gray-50 border cursor-pointer border-gray-300 rounded px-3 py-1`}>
                            {
                                listTypeInternalMemoHRs?.map((item: any, idx: number) => {
                                    return (
                                        <option key={idx} value={item?.code}>{lang == 'vi' ? item?.name : item?.nameE}</option>
                                    )
                                })
                            }
                        </select>
                    </div>
                    {
                        detechFormType == 'other' && 
                        <div className="flex items-center ml-2">
                            <label className="inline-block w-[150px] mr-1">{t('internal_memo_hr.title_other')} <DotRequireComponent/></label>
                            <input
                                {...register("otherTitle")}
                                disabled
                                placeholder={t('internal_memo_hr.title_other')}
                                className={`dark:bg-[#454545] w-full p-2 border-gray-300 text-sm border rounded bg-gray-50`}
                            />
                        </div>
                    }
                </div>
                <div className="ml-2">
                    <label className="">{t('internal_memo_hr.created_by')}: <span className="font-semibold">{userNameCreatedForm} - {userCodeCreatedForm}</span></label> <br />
                </div>
            </div>

            <div>
                <div className="mt-1">
                    <label className="block">{t('internal_memo_hr.save')}</label>
                    <input
                        {...register('save')}
                        disabled
                        placeholder={t('internal_memo_hr.save')}
                        className={`dark:bg-[#454545] w-full p-2 text-sm border rounded bg-gray-50`}
                    />
                </div>
                <div className="mt-1.5">
                    <label className="block">{t('internal_memo_hr.note')}</label>
                    <textarea
                        {...register('note')}
                        disabled
                        placeholder={t('internal_memo_hr.note')}
                        className={`w-full p-2 border rounded bg-gray-50`}
                    />
                </div>
                {detechFormType === 'register_door' && (
                    <div className="mb-2">
                        <h3 className="text-base font-bold">
                            {lang === 'vi' ? 'Danh sách cửa' : 'List doors'}
                        </h3>
                        <span className="mb-2 inline-block italic text-yellow-600">({lang == 'vi' ? 'Những cửa có chữ màu vàng cần qua giám đốc điều hành phê duyệt' : 'Doors marked in yellow require Operations General Manager approval.'})</span>
                        <div className="flex flex-wrap gap-x-6 gap-y-3">
                            {listDoors?.map((item: any, idx: number) => (
                                <label
                                    key={idx}
                                    htmlFor={`cb-door-${item?.code}`}
                                    className="flex items-start gap-2 cursor-pointer min-w-[180px] max-w-full"
                                >
                                    <input
                                        disabled={mode == 'view' || (formDataDetail?.defineInstance?.currentStep >= 5 && item?.isSpecial == true) || formDataDetail?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Assigned}
                                        checked={selectedDoors.some((d: any) => d.code == item.code)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                            setValue('metaData.registerDoorOptions', [
                                                ...selectedDoors,
                                                {
                                                    code: item.code,
                                                    name: item.name,
                                                    isSpecial: item.isSpecial ?? false
                                                }
                                            ]);
                                            } else {
                                                setValue(
                                                    'metaData.registerDoorOptions',
                                                    selectedDoors.filter((d: any) => d.code !== item.code)
                                                );
                                            }
                                        }}
                                        id={`cb-door-${item?.code}`}
                                        type="checkbox"
                                        className="mt-1 w-5 h-5 accent-black cursor-pointer shrink-0"
                                    />
                                    <span className={`leading-snug break-words ${item.isSpecial ? 'text-yellow-600': ''}`}>
                                        {item.name}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
                <div className="mt-1">
                    <label htmlFor="" className="inline-block mb-1">{t('internal_memo_hr.list')}</label>
                    <HotTable
                        readOnly={true}
                        ref={hotRef}
                        data={tableData}
                        fixedRowsTop={1}
                        rowHeaders={true}
                        colHeaders={false}
                        licenseKey="non-commercial-and-evaluation"
                        width="90%"
                        height="280"
                        stretchH="all"
                        colWidths={130}
                        cells={(row) => {
                            const cellProperties = {} as Handsontable.CellProperties;
                            if (row === 0) {
                                if (detechFormType !== "other") {
                                    cellProperties.readOnly = true;
                                }
                                cellProperties.renderer = (instance, td, r, c, prop, value, cellProps) => {
                                    Handsontable.renderers.TextRenderer(instance, td, r, c, prop, value, cellProps);
                                    td.style.fontWeight = "bold";
                                    td.style.textAlign = "center";
                                };
                            } else {
                                cellProperties.className = "htCenter";
                            }

                            return cellProperties;
                        }}
                    />
                </div>
            </div>
            <div>
                <Label className='mb-1'>{lang == 'vi' ? 'Ghi chú' : 'Note'}</Label>
                <Textarea placeholder='Note' value={note} onChange={(e) => setNote(e.target.value)} className="border-gray-300"/>
            </div>

            <ModalConfirm
                type={statusModalConfirm}
                isOpen={statusModalConfirm != ''}
                onClose={() => setStatusModalConfirm('')}
                onSave={handleSaveModalConfirm}
            />
            {
                (formDataDetail?.defineAssigned?.length > 0 
                    || formDataDetail?.applicationForm?.requestStatusId == StatusApplicationFormEnum.FinalApproval
                )
                    && 
                    <label className="block text-sm font-medium text-gray-700 mb-0">
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
                    formDataDetail?.applicationForm?.requestStatusId == StatusApplicationFormEnum.FinalApproval 
                    ? (
                        ItMembers?.map((item: {nvMaNV: string, nvHoTen: string, email: string}, idx: number) => (
                            <label
                                key={idx}
                                className="flex items-center space-x-2 cursor-pointer w-full sm:w-[48%]"
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
            <div className="flex justify-end">
                {
                    formDataDetail?.applicationForm?.requestStatusId == StatusApplicationFormEnum.FinalApproval ?
                    (
                        mode != 'view' &&
                            <button
                                onClick={() => setStatusModalConfirm('assigned')}
                                disabled={assignedInternalMemoHr.isPending}
                                className="mr-2 cursor-pointer w-full sm:w-auto py-3 px-4 bg-blue-600 text-white font-semibold rounded-sm shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm tracking-wide uppercase disabled:bg-gray-400"
                            >
                                {lang == 'vi' ? 'Giao việc' : 'Assigned task'}
                            </button>
                    )
                    : formDataDetail?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Assigned ?
                    (
                        mode != 'view' &&
                            <button
                                onClick={() => setStatusModalConfirm('resolved')}
                                disabled={resolvedInternalMemoHr.isPending}
                                className="mr-2 cursor-pointer w-full sm:w-auto py-3 px-4 bg-blue-600 text-white font-semibold rounded-sm shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm tracking-wide uppercase disabled:bg-gray-400"
                            >
                                {lang == 'vi' ? 'Đóng' : 'Closed'}
                            </button>
                    ) : [StatusApplicationFormEnum.Complete, StatusApplicationFormEnum.Reject].includes(formDataDetail?.applicationForm?.requestStatusId) ? (null) : (
                            mode != 'view' && <>
                            {
                                formDataDetail?.defineInstance?.currentStep <= 4 && 
                                <button
                                    onClick={() => setStatusModalConfirm('reject')}
                                    disabled={approvalInternalMemoHr.isPending}
                                    className="mr-2 cursor-pointer w-full sm:w-auto py-3 px-5 bg-red-600 text-white font-semibold rounded-sm shadow-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm tracking-wide uppercase disabled:bg-gray-400"
                                >
                                    {lang == 'vi' ? 'Từ chối' : 'Reject'}
                                </button>
                            }
                            {
                                <button
                                    onClick={() => setStatusModalConfirm('approval')}
                                    disabled={approvalInternalMemoHr.isPending}
                                    className="cursor-pointer w-full sm:w-auto py-3 px-5 bg-blue-600 text-white font-semibold rounded-sm shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-base tracking-wide uppercase disabled:bg-gray-400"
                                >
                                    {lang == 'vi' ? 'Duyệt đơn' : 'Approval'}
                                </button>
                            }
                        </>
                    )
                }
            </div>
            <div className="mb-0">
                <span className="font-bold text-black">
                    {lang === 'vi' ? 'Quy trình' : 'Approval flow'}:
                </span>{' '}
                {formDataDetail?.defineAction
                    .map((item: any, idx: number) => (
                        <span key={idx} className="font-bold text-orange-700">
                            ({idx + 1}) {item?.Name ?? item?.UserCode ?? (item?.StepOrder == 3 ? 'Admin' : 'HR')}
                            {idx < formDataDetail?.defineAction?.length - 1 ? ', ' : ''}
                        </span>
                    ))}
            </div>
            <HistoryApproval historyApplicationForm={formDataDetail?.applicationForm?.historyApplicationForms}/>
        </div>
    );
}