/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import { HotTable, HotTableRef } from '@handsontable/react-wrapper'
import { registerAllModules } from 'handsontable/registry'
import internalMemoHrApi, { useCreateInternalMemo, useUpdateInternalMemo } from "@/api/internalMemoHrApi"
import { Spinner } from "@/components/ui/spinner"
import { ShowToast } from "@/lib"
import orgUnitApi from "@/api/orgUnitApi"
import Handsontable from "handsontable"
import DotRequireComponent from "@/components/DotRequireComponent"
import 'handsontable/styles/handsontable.css'
import 'handsontable/styles/ht-theme-main.css'

registerAllModules();

// eslint-disable-next-line react-refresh/only-export-components
export const formSchemas: Record<string, { colHeaders: string[]; columns: Handsontable.ColumnSettings[] }> = {
    change_shift: {
        colHeaders: ["Mã NV", "Họ tên", "Từ ngày", "Đến ngày", "Từ ca", "Đến ca"],
        columns: [
            { data: "userCode", type: "text" },
            { data: "userName", type: "text" },
            { data: "fromDate", type: "date", dateFormat: "YYYY-MM-DD", },
            { data: "toDate", type: "date" },
            { data: "fromShift", type: "text" },
            { data: "toShift", type: "text" }
        ]
    },
    change_sunday: {
        colHeaders: ["Mã NV", "Họ tên", "Thời gian chuyển", "Chủ nhật cũ", "Chủ nhật mới"],
        columns: [
            { data: "userCode", type: "text" },
            { data: "userName", type: "text" },
            { data: "timeChangeSunday", type: "date", dateFormat: "YYYY-MM-DD" },
            { data: "oldSunday", type: "date", dateFormat: "YYYY-MM-DD" },
            { data: "newSunday", type: "date", dateFormat: "YYYY-MM-DD" }
        ]
    },
    use_phone: {
        colHeaders: ["Mã NV", "Họ tên", "Chức vụ"],
        columns: [
            { data: "userCode", type: "text" },
            { data: "userName", type: "text" },
            { data: "position", type: "text" },
        ]
    },
    register_gate: {
        colHeaders: ["Mã NV", "Họ tên", "Chức vụ", "Khu vực làm việc", "Chú thích"],
        columns: [
            { data: "userCode", type: "text" },
            { data: "userName", type: "text" },
            { data: "position", type: "text" },
            { data: "location", type: "text" },
            { data: "note", type: "text" },
        ]
    },
    other: {
        colHeaders: ["Mã NV", "Họ tên", "Bộ phận", "Chức vụ", "", "", "", "", "", ""],
        columns: [
            { data: "userCode", type: "text" },
            { data: "userName", type: "text" },
            { data: "position", type: "text" },
        ]
    }
};

export default function CreateInternalMemoHR() {
    const { t } = useTranslation('hr')
    const lang = useTranslation().i18n.language.split('-')[0]
    const user = useAuthStore((state) => state.user)
    const navigate = useNavigate()

    const hotRef = useRef<HotTableRef>(null);
    const [formType, setFormType] = useState<keyof typeof formSchemas>("change_shift");
    const [departmentId, setDepartmentId] = useState<number | null>(null);
    const [note, setNote] = useState<string | null>(null);
    const [save, setSave] = useState<string | null>(null);
    const [formTypeOther, setFormTypeOther] = useState<string | null>(null);
    const [tableData, setTableData] = useState<string[][]>([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    const createInternalMemoHr = useCreateInternalMemo()
    const updateInternalMemoHr = useUpdateInternalMemo()
    
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;

    const { data: formDataDetail, isLoading: isFormDataLoading } = useQuery({
        queryKey: ['internal-memo-hr', id],
        queryFn: async () => {
            const res = await internalMemoHrApi.getDetailInternalMemoHr(id ?? '');
            return res.data.data;
        },
        enabled: isEdit,
    });

    useEffect(() => {
        if (isEdit && formDataDetail) {
            const meta = JSON.parse(formDataDetail?.metaData);

            const headers: string[] = meta.Headers ?? [];
            const rows: any[][] = meta.Rows ?? [];
            const emptyRows = Array.from({ length: 15 }, () =>
                Array(headers.length).fill("")
            );
            setTableData([headers, ...rows, ...emptyRows]);

            setDepartmentId(formDataDetail?.departmentId)
            setFormType(meta?.Title)
            setNote(formDataDetail?.note)
            setSave(meta?.Save)
            setIsDataLoaded(true);
        } else if (!isDataLoaded) {
            setIsDataLoaded(true);
        }
    }, [formDataDetail, isDataLoaded, isEdit]);

    useEffect(() => {
        if (!isEdit) {
            const headers = [...formSchemas[formType].colHeaders];
            const emptyRows = Array.from({ length: 15 }, () =>
                Array(headers.length).fill("")
            );
            setTableData([headers, ...emptyRows]);
            setFormType("change_shift");
            setDepartmentId(null);
            setNote(null);
            setSave(null);
            setFormTypeOther(null);
            setIsDataLoaded(true);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEdit]);

    useEffect(() => {
        if (!isDataLoaded) {
            return;
        }
        const currentSchema = formSchemas[formType];
        const newHeaders = [...currentSchema.colHeaders];
        const newColsCount = newHeaders.length;

        const currentData = hotRef.current?.hotInstance?.getData() ?? tableData;

        let rowsToKeep: any[][] = [];
        if (currentData.length > 1) {
            rowsToKeep = currentData.slice(1);
        }
        
        rowsToKeep = rowsToKeep
            .map(row => {
                return [...row.slice(0, newColsCount), ...Array(Math.max(0, newColsCount - row.length)).fill("")];
            })
            .filter((r: any) => r.some((cell: string | null) => cell !== null && cell !== ""));
        const minRows = 14;
        const emptyRowsToAdd = Math.max(0, minRows - rowsToKeep.length);

        const emptyRows = Array.from({ length: emptyRowsToAdd }, () =>
            Array(newColsCount).fill("")
        );

        if (isEdit && formDataDetail && formType === formDataDetail.metaData?.Title) {
            // Đã được khởi tạo ở useEffect 1, không làm gì ở đây
        } else {
            setTableData([newHeaders, ...rowsToKeep, ...emptyRows]);
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formType, isDataLoaded]);

    const mode = isEdit ? 'edit' : 'create';

    const { data: departments = [] } = useQuery({ queryKey: ['get-all-department'], queryFn: async () => { const res = await orgUnitApi.GetAllDepartment(); return res.data.data; } });

    const handleSave = async () => {
        const hot = hotRef.current?.hotInstance;
        
        if (!hot) return

        if (departmentId == null) {
            ShowToast(lang == 'vi' ? 'Vui lòng chọn phòng ban' : 'Please select department', 'error')
            return
        }

        if (formType == 'other' && (formTypeOther == '' || formTypeOther == null)) {
            ShowToast(lang == 'vi' ? 'Vui lòng nhập tiêu đề khác' : 'Please input title other', 'error')
            return
        }

        const allData = hot.getData();

        const headers = allData[0];
        const rows = allData.slice(1).filter(
            (r: any) => r.some((cell: string | null) => cell !== null && cell !== "")
        );

        const payload = {
            OrgPositionId: user?.orgPositionId,
            DepartmentId: departmentId,
            UserCodeCreated: user?.userCode,
            UserNameCreated: user?.userName,
            Title: formType,
            TitleOther: formTypeOther ?? null,
            Note: note,
            Save: save,
            Headers: headers,
            Rows: rows,
        };
        if (isEdit) {
            await updateInternalMemoHr.mutateAsync({
                applicationFormCode: formDataDetail?.code,
                data: payload
            })
        }
        else {
            await createInternalMemoHr.mutateAsync(payload)
        }

        navigate('/internal-memo-hr')
    };

    if (isEdit && isFormDataLoading) {
        return <div>{lang == 'vi' ? 'Loading' : 'Đang tải'}...</div>;
    }
    
    return (
        <div className="p-4 pl-1 pt-0 space-y-4 leave-request-form">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-2">
                <div className="flex flex-col gap-2">
                    <div className="flex">
                        <h3 className="font-bold text-xl md:text-2xl">
                            <span>{ mode == 'create' ? t('internal_memo_hr.title_create') : t('internal_memo_hr.title_update') } </span>
                        </h3>
                    </div>
                </div>
                <Button onClick={() => navigate("/internal-memo-hr")} className="w-full md:w-auto hover:cursor-pointer">
                    { lang == 'vi' ? 'Danh sách nội bộ' : 'List internal memo' }
                </Button>
            </div>
            <div className="flex items-center">
                <label className="block mb-2 mr-2">{t('internal_memo_hr.department')} <DotRequireComponent/></label>
                <select
                    onChange={(e) => setDepartmentId(Number(e.target.value))}
                    className="border cursor-pointer border-gray-300 rounded px-3 py-1"
                    value={departmentId ?? ''}
                >
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

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSave();
                }}
            >
                 <div>
                    <label className="">{t('internal_memo_hr.created_by')}: <span className="font-semibold">{user?.userName} - {user?.userCode}</span></label> <br />
                </div>
                <div className="mt-2">
                    <label className="block mb-1">{t('internal_memo_hr.title')} <DotRequireComponent/></label>
                    <select
                        className="border cursor-pointer border-gray-300 rounded px-3 py-1"
                        value={formType}
                        onChange={(e) =>
                        setFormType(e.target.value as keyof typeof formSchemas)
                        }
                        style={{ marginBottom: 10 }}
                    >
                        <option value="change_shift">{t('internal_memo_hr.change_shift')}</option>
                        <option value="change_sunday">{t('internal_memo_hr.change_sunday')}</option>
                        <option value="use_phone">{t('internal_memo_hr.use_phone')}</option>
                        <option value="register_gate">{t('internal_memo_hr.register_gate')}</option>
                        <option value="other">{t('internal_memo_hr.other')}</option>
                    </select>
                    {
                        formType == 'other' && (
                            <div>
                                <label htmlFor="" className="mb-1 inline-block">{t('internal_memo_hr.title_other')} <DotRequireComponent/></label>
                                <input
                                    value={formTypeOther ?? ''}
                                    onChange={(e) => setFormTypeOther(e.target.value)}
                                    placeholder={t('internal_memo_hr.title_other')}
                                    className={`dark:bg-[#454545] w-full p-2 text-sm border rounded`}
                                />
                            </div>
                        )
                    }
                </div>

                <div className="mt-1">
                    <label className="block mb-1">{t('internal_memo_hr.save')}</label>
                    <input
                        value={save ?? ''}
                        onChange={(e) => setSave(e.target.value)}
                        placeholder={t('internal_memo_hr.save')}
                        className={`dark:bg-[#454545] w-full p-2 text-sm border rounded`}
                    />
                </div>

                <div className="mt-3">
                    <label className="block mb-1">{t('internal_memo_hr.note')}</label>
                    <textarea
                        value={note ?? ''}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder={t('internal_memo_hr.note')}
                        className={`w-full p-2 border rounded`}
                    />
                </div>

                <div className="mt-1">
                    <label htmlFor="" className="inline-block mb-2">{t('internal_memo_hr.list')}</label>
                    <HotTable
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
                                if (formType !== "other") {
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

                <div className="text-right">
                    <button
                        disabled={createInternalMemoHr.isPending || updateInternalMemoHr.isPending}
                        type="submit"
                        className={`bg-black mt-4 text-white px-7 py-2 rounded hover:cursor-pointer hover:opacity-70`}
                    >
                        { createInternalMemoHr.isPending || updateInternalMemoHr.isPending ? <Spinner className="text-white" size={`small`}/> : t('internal_memo_hr.save')}
                    </button>
                </div>
            </form>
        </div>
    );
}