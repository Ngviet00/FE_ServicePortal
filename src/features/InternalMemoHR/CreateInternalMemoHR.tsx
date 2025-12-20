/* eslint-disable react-refresh/only-export-components */
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
import orgUnitApi from "@/api/orgUnitApi"
import Handsontable from "handsontable"
import DotRequireComponent from "@/components/DotRequireComponent"
import 'handsontable/styles/handsontable.css'
import 'handsontable/styles/ht-theme-main.css'
import { z } from 'zod';
import { SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod';

registerAllModules();

export const formSchemas: Record<string, { colHeaders: string[]; columns: Handsontable.ColumnSettings[] }> = {
    change_shift: {
        colHeaders: ["Mã nhân viên", "Họ tên", "Từ ngày", "Đến ngày", "Từ ca", "Đến ca"],
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
        colHeaders: ["Mã nhân viên", "Họ tên", "Thời gian chuyển", "Chủ nhật cũ", "Chủ nhật mới"],
        columns: [
            { data: "userCode", type: "text" },
            { data: "userName", type: "text" },
            { data: "timeChangeSunday", type: "date", dateFormat: "YYYY-MM-DD" },
            { data: "oldSunday", type: "date", dateFormat: "YYYY-MM-DD" },
            { data: "newSunday", type: "date", dateFormat: "YYYY-MM-DD" }
        ]
    },
    use_phone: {
        colHeaders: ["Mã nhân viên", "Họ tên", "Chức vụ", "Địa chỉ mac của điện thoại"],
        columns: [
            { data: "userCode", type: "text" },
            { data: "userName", type: "text" },
            { data: "position", type: "text" },
            { data: "macAddress", type: "text" },
        ]
    },
    register_door: {
        colHeaders: ["Mã nhân viên", "Họ tên", "Bộ phận", "Chức vụ", "Khu vực làm việc", "Chú thích"],
        columns: [
            { data: "userCode", type: "text" },
            { data: "userName", type: "text" },
            { data: "department", type: "text" },
            { data: "position", type: "text" },
            { data: "location", type: "text" },
            { data: "note", type: "text" },
        ]
    },
    register_restroom: {
        colHeaders: ["Mã nhân viên", "Họ tên", "Giới tính", "Chức vụ", "Bộ phận"],
        columns: [
            { data: "userCode", type: "text" },
            { data: "userName", type: "text" },
            { data: "sex", type: "text" },
            { data: "position", type: "text" },
            { data: "department", type: "text" },
        ]
    },
    other: {
        colHeaders: ["Mã nhân viên", "Họ tên", "Bộ phận", "Chức vụ", "", "", "", "", "", ""],
        columns: [
            { data: "userCode", type: "text" },
            { data: "userName", type: "text" },
            { data: "position", type: "text" },
        ]
    }
};

export const InternalMemoSchema = z.object({
    title: z.string().min(1, "Bắt buộc"),
    titleE: z.string().min(1, "Bắt buộc"),
    titleCode: z.string().min(1, "Bắt buộc"),
    otherTitle: z.string().nullable().optional(),
    departmentId: z.string().min(1, 'Bắt buộc').optional(),
    save: z.string().optional(),
    note: z.string().optional(),
    metaData: z.object({
        headers: z.array(z.string()),
        rows: z.array(z.array(z.any())),
        registerDoorOptions: z.array(z.object({
            code: z.string(),
            name: z.string().optional(),
            isSpecial: z.boolean().optional(),
        })).optional()
    })
})

export const listDoors = [
    { code: 'BIG_OFF_DOOR', name: 'Big office Door' },
    { code: 'OFF_TO_PROD', name: 'Office To Production (VP ra SX)' },
    { code: 'LOCAL_CANTEEN', name: 'Local Canteen (Cửa nhà ăn tầng 2)' },
    { code: '3F_FIN', name: '3rd Floor Kế toán' },
    { code: 'IT', name: 'IT Door' },
    { code: 'CMPBU_OPERATION', name: 'CMPBU Operation Room (cửa chính)' },
    { code: 'QA_CMM', name: 'QA Door (CMM)' },
    { code: 'MAN_CANTEEN_MALAY', name: 'Manager Canteen (Cửa nhà ăn Malaysia)' },
    { code: 'CMPBU_OFF', name: 'CMPBU OFFICE (cạnh phòng IT)', isSpecial: true },
    { code: 'ASSEMBLY', name: 'Assembly In/Out', isSpecial: true },
    { code: '3F_CUSTOM_GLASS_DOOR', name: '3rd Floor Customer Glass Door', isSpecial: true },
    { code: 'CT1', name: 'Cooling tower 1' },
    { code: 'CT2', name: 'Cooling tower 2' },
    { code: 'CT3', name: 'Cooling tower 3' }
];

export const listTypeInternalMemoHRs = [
    { code: 'change_shift', name: 'Đổi ca', nameE: 'Change shift' },
    { code: 'change_sunday', name: 'Đổi chủ nhật', nameE: 'Change sunday' },
    { code: 'use_phone', name: 'Sử dụng điện thoại', nameE: 'Use phone' },
    { code: 'register_door', name: 'Đăng ký ra vào cửa', nameE: 'Register door' },
    { code: 'register_restroom', name: 'Đăng ký sử dụng nhà vệ sinh', nameE: 'Register to use the restroom' },
    { code: 'other', name: 'Khác', nameE: 'Other' }
]

export default function CreateInternalMemoHR() {
    const { t } = useTranslation('hr')
    const lang = useTranslation().i18n.language.split('-')[0]
    const user = useAuthStore((state) => state.user)
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;

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

    const { watch, setValue, getValues, register, handleSubmit, reset, formState: { errors }, } = form;

    const [tableData, setTableData] = useState<string[][]>([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    const createInternalMemoHr = useCreateInternalMemo()
    const updateInternalMemoHr = useUpdateInternalMemo()

    const { data: formDataDetail, isLoading: isFormDataLoading } = useQuery({
        queryKey: ['internal-memo-hr', id],
        queryFn: async () => {
            const res = await internalMemoHrApi.getDetailInternalMemoHr(id ?? '');
            return res.data.data;
        },
        enabled: isEdit,
    });

    const detechFormType = watch('titleCode')
    const selectedDoors = watch('metaData.registerDoorOptions') ?? [];

    useEffect(() => {
        if (isEdit && formDataDetail) {
            const meta = JSON.parse(formDataDetail?.internalMemoHr?.metaData);
            const headers: string[] = meta.headers ?? [];
            const rows: any[][] = meta.rows ?? [];
            const doorOptions = meta?.registerDoorOptions ?? [];
            const emptyRows = Array.from({ length: 15 }, () =>
                Array(headers.length).fill("")
            );
            setTableData([headers, ...rows, ...emptyRows]);

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
    }, [formDataDetail, isDataLoaded, isEdit]);

    useEffect(() => {
        if (!isEdit) {
            const titleCode = getValues('titleCode')
            const headers = [...formSchemas[titleCode].colHeaders];
            const emptyRows = Array.from({ length: 15 }, () =>
                Array(headers.length).fill("")
            );
            setTableData([headers, ...emptyRows]);
            setIsDataLoaded(true);

            reset({
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
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEdit]);

    useEffect(() => {
        if (!isDataLoaded) {
            return;
        }

        const currentSchema = formSchemas[detechFormType];
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

        if (isEdit && formDataDetail && detechFormType === formDataDetail.metaData?.Title) {
            // Đã được khởi tạo ở useEffect 1, không làm gì ở đây
        } else {
            setTableData([newHeaders, ...rowsToKeep, ...emptyRows]);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [detechFormType, isDataLoaded]);

    const mode = isEdit ? 'edit' : 'create';

    const handleOnChangeTitle = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value

        const found = listTypeInternalMemoHRs.find(x => x.code === code)
        if (!found) return

        setValue("titleCode", found.code, { shouldDirty: true })
        setValue("title", found.name, { shouldDirty: true })
        setValue("titleE", found.nameE, { shouldDirty: true })

        if (code != 'register_door') {
            setValue('metaData.registerDoorOptions', [])
        }
    }

    const onSubmit: SubmitHandler<z.infer<typeof InternalMemoSchema>> = async (data) => {
        const hot = hotRef.current?.hotInstance;
        if (!hot) return

        const allData = hot.getData();

        const headers = allData[0];
        const rows = allData.slice(1).filter(
            (r: any) => r.some((cell: string | null) => cell !== null && cell !== "")
        );

        const payload = {
            UserCodeCreatedForm: user?.userCode ?? '',
            UserNameCreatedForm: user?.userName ?? '',
            OrgPositionIdUserCreatedForm: user?.orgPositionId,
            DepartmentId: Number(data?.departmentId ?? -1),
            Title: data?.title ?? '',
            TitleE: data?.titleE,
            TitleCode: data?.titleCode,
            OtherTitle: data?.otherTitle ?? '',
            Save: data?.save,
            Note: data?.note,
            MetaData: JSON.stringify({
                headers,
                rows,
                registerDoorOptions: data?.metaData?.registerDoorOptions ?? []
            })
        }

        if (isEdit) {
            await updateInternalMemoHr.mutateAsync({applicationFormCode: id, data: payload})
        } else {
            await createInternalMemoHr.mutateAsync(payload)
        }
        navigate('/internal-memo-hr')
    };

    if (isEdit && isFormDataLoading) {
        return <div>{lang == 'vi' ? 'Loading' : 'Đang tải'}...</div>;
    }

    if (isEdit && !formDataDetail) {
        return  <div className='text-red-700 font-semibold'>{lang == 'vi' ? 'Không tìm thấy dữ liệu' : 'Not found data'}</div>;
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
            <div className="flex items-center mb-0">
                <div className="flex items-center">
                    <label className="block mr-2">{t('internal_memo_hr.department')} <DotRequireComponent/></label>
                    <select disabled={isEdit} {...register("departmentId")} className={`border cursor-pointer border-gray-300 rounded px-3 py-1 ${isEdit ? 'bg-gray-50' : ''} ${errors.departmentId ? 'border-red-500 bg-red-50' : ''}`}>
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
                        <select disabled={isEdit} {...register("titleCode")} onChange={handleOnChangeTitle} className={`${isEdit ? 'bg-gray-50' : ''} border cursor-pointer border-gray-300 rounded px-3 py-1`}>
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
                                placeholder={t('internal_memo_hr.title_other')}
                                className={`dark:bg-[#454545] w-full p-2 border-gray-300 text-sm border rounded`}
                            />
                        </div>
                    }
                </div>
                <div className="ml-2">
                    <label className="">{t('internal_memo_hr.created_by')}: <span className="font-semibold">{user?.userName} - {user?.userCode}</span></label> <br />
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mt-1">
                    <label className="block">{t('internal_memo_hr.save')}</label>
                    <input
                        {...register('save')}
                        placeholder={t('internal_memo_hr.save')}
                        className={`dark:bg-[#454545] w-full p-2 text-sm border rounded`}
                    />
                </div>
                <div className="mt-1.5">
                    <label className="block">{t('internal_memo_hr.note')}</label>
                    <textarea
                        {...register('note')}
                        placeholder={t('internal_memo_hr.note')}
                        className={`w-full p-2 border rounded`}
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