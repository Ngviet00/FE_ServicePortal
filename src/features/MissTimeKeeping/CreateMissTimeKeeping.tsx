/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getErrorMessage, ShowToast } from "@/lib";
import { useAuthStore } from "@/store/authStore";
import leaveRequestApi from "@/api/leaveRequestApi";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import orgUnitApi from "@/api/orgUnitApi";
import { useEffect, useRef, useState } from "react";
import FullscreenLoader from "@/components/FullscreenLoader";
import DotRequireComponent from "@/components/DotRequireComponent";
import { Spinner } from "@/components/ui/spinner";
import DateTimePicker from "@/components/ComponentCustom/Flatpickr";
import missTimeKeepingApi, { useCreateMissTimeKeeping, useUpdateMissTimeKeeping } from "@/api/missTimeKeepingApi";

const createNewRow = (_data: Partial<any> = {}) => ({
    id: `miss_timekeeping_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    userCode: '',
    userName: '',
    dateRegister: new Date().toISOString().split("T")[0],
    shift: '',
    additionalIn: '',
    additionalOut: '',
    facialRecognitionIn: '',
    facialRecognitionOut:'',
    gateIn: '',
    gateOut:'',
    reason: ''
});

export default function CreateMissTimeKeeping() {
    const { t } = useTranslation('hr')
    const lang = useTranslation().i18n.language.split('-')[0]
    const user = useAuthStore((state) => state.user)
    const navigate = useNavigate()
    const lastUserCodesRef = useRef<Record<number, string>>({})
    const [departmentId, setDepartmentId] = useState<number | null>(null);
    const [isSearchingUser, setIsSearchingUser] = useState(false)
    const [errorFields, setErrorFields] = useState<{ [key: string]: string[] }>({});
    const createMissTimeKeeping = useCreateMissTimeKeeping();
    const updateMissTimeKeeping = useUpdateMissTimeKeeping();
    
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;

    const { data: formDataDetail, isLoading: isFormDataLoading } = useQuery({
        queryKey: ['overtime', id],
        queryFn: async () => {
            const res = await missTimeKeepingApi.getDetailMissTimeKeeping(id ?? '');
            return res.data.data;
        },
        enabled: isEdit,
    });

    useEffect(() => {
        if (formDataDetail && isEdit) {
            const mappedRows = formDataDetail.missTimeKeepings.map((item: any) => ({
                id: `${item.id}`,
                userCode: item?.userCode ?? '',
                userName: item?.userName ?? '',
                dateRegister: item?.dateRegister,
                shift: item?.shift,
                additionalIn: item?.additionalIn,
                additionalOut: item?.additionalOut,
                facialRecognitionIn: item?.facialRecognitionIn,
                facialRecognitionOut: item?.facialRecognitionOut,
                gateIn: item?.gateIn,
                gateOut: item?.gateOut,
                reason: item?.reason ?? ''
            }));
            setRows(mappedRows);
            setDepartmentId(formDataDetail?.applicationForm?.orgUnit?.id)
        }
    }, [formDataDetail, isEdit]);
    
    const { data: departments = [] } = useQuery({ queryKey: ['get-all-department'], queryFn: async () => { const res = await orgUnitApi.GetAllDepartment(); return res.data.data; } });
    
    const mode = isEdit ? 'edit' : 'create';

    useEffect(() => {
        if (mode == "create") {
            setRows([
                {
                    id: `miss_timekeeping_${Date.now()}`,
                    userCode: '',
                    userName: '',
                    dateRegister: new Date().toISOString().split("T")[0],
                    shift: '',
                    additionalIn: '',
                    additionalOut: '',
                    facialRecognitionIn: '',
                    facialRecognitionOut:'',
                    gateIn: '',
                    gateOut:'',
                    reason: ''
                }
            ]);
            setDepartmentId(null);
        }
    }, [mode]);

    const [errorMsg, setErrorMsg] = useState('')
    const [rows, setRows] = useState<any[]>([]);
    useEffect(() => {
        if (!isEdit && rows.length === 0) {
            setRows([createNewRow()])
        }
    }, [isEdit, rows.length])

    const handleAddRow = () => { setRows([...rows, createNewRow()])};

    const handleDeleteRows = () => {
        if (selectedIds.length === 0) {
            ShowToast(lang == 'vi' ? 'Vui lòng chọn mục cần xóa' : 'Please choose item to delete', 'error');
            return;
        }
        setErrorMsg('');
        setRows(rows.filter((row) => !selectedIds.includes(row.id)));
        setSelectedIds([]);
    };

    const toggleCheck = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const updateRow = (id: any, key: string, value: string) => {
        setRows(rows.map(row => row.id === id ? { ...row, [key]: value } : row));
    };

    const handleSubmit = async () => {
        if (departmentId == null) {
            ShowToast(lang == 'vi' ? 'Vui lòng chọn bộ phận' : 'Please select department', 'error')
            return
        }

        if (rows.length <= 0) {
            ShowToast(lang == 'vi' ? 'Vui lòng chọn ít nhất 1 người' : 'Please select at least 1 person', 'error')
            return
        }

        const newErrors: { [key: string]: string[] } = {};
        let hasError = false;

        for (const row of rows) {
            const missing: string[] = [];
            if (!row.userCode) missing.push('userCode');
            if (!row.userName) missing.push('userName');
            if (!row.dateRegister) missing.push('date');
            if (!row.shift) missing.push('shift');

            if (missing.length > 0) {
                newErrors[row.id] = missing;
                hasError = true;
            }
        }

        if (hasError) {
            setErrorFields(newErrors);
            ShowToast(lang == 'vi' ? 'Chưa nhập đủ dữ liệu' : 'Missing required data', 'error');
            return;
        }

        setErrorFields({});

        rows.forEach(item => {
            if (item?.id.startsWith("miss_timekeeping")) {
                item.id = null
            }
        });

        const payLoad = {
            OrgPositionId: user?.orgPositionId,
            UserCodeCreated: user?.userCode,
            UserNameCreated: user?.userName,
            Email: user?.email,
            DepartmentId: departmentId,
            ListCreateMissTimeKeepings: rows
        };

        try {
            if (isEdit) {   
                await updateMissTimeKeeping.mutateAsync({applicationFormCode: id, data: payLoad})
            } else {
                await createMissTimeKeeping.mutateAsync(payLoad)
            }
            navigate("/miss-timekeeping/registered");
        }
        catch (err) {
            console.log(err);
        }
    }

    const handleFindUser = async (userCode: string, index: number) => {
        userCode = userCode.trim()

        if (userCode == '') {
            setRows(rows.map(row => row.id === index ? { ...row, userName: '', userCode: '' } : row));
            lastUserCodesRef.current[index] = '';
            return
        }
        const lastCode = lastUserCodesRef.current[index];
        if (userCode === lastCode) return;
        lastUserCodesRef.current[index] = userCode;
        try {
            setIsSearchingUser(true)
            const fetchData = await leaveRequestApi.SearchUserRegisterLeaveRequest({
                userCodeRegister: user?.userCode ?? "",
                usercode: userCode
            });
            const result = fetchData?.data?.data
            setRows(rows.map(row => row.id === index ? { ...row, userName: result?.NVHoTen } : row));
        }
        catch(err) {
            ShowToast(getErrorMessage(err), 'error')
        }
        finally {
            setIsSearchingUser(false)
        }
    }

    if (isEdit && isFormDataLoading) {
        return <div>{lang == 'vi' ? 'Loading' : 'Đang tải'}...</div>;
    }

    return (
        <div className="p-4 pl-1 pt-0 space-y-4 leave-request-form">
            {
                isSearchingUser && <FullscreenLoader />
            }
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-2">
                <div className="flex flex-col gap-2">
                    <div className="flex">
                        <h3 className="font-bold text-xl md:text-2xl">
                            <span>{ mode == 'create' ? t('miss_timekeeping.create.title_create') : t('miss_timekeeping.create.title_update') } </span>
                        </h3>
                    </div>
                </div>
                <Button onClick={() => navigate("/miss-timekeeping")} className="w-full md:w-auto hover:cursor-pointer">
                    { lang == 'vi' ? 'Danh sách bù chấm công của tôi' : 'My list miss timekeeping' }
                </Button>
            </div>

            <div className="flex items-end">
                <div className="mb-3">
                    <label className="block mb-2 font-semibold text-gray-700">{t('miss_timekeeping.list.department')} <DotRequireComponent/></label>
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
                <div className="ml-5">
                    <div className="flex space-x-2 mb-4">
                        <button type="button" onClick={handleAddRow} className="px-2 py-1 cursor-pointer bg-blue-600 text-white text-sm rounded hover:bg-blue-600">{t('overtime.create.add')}</button>
                        <button type="button" onClick={handleDeleteRows} className="px-2 py-1 bg-red-600 cursor-pointer text-white text-sm rounded hover:bg-red-600">{t('overtime.create.delete')}</button>
                        {
                            selectedIds.length == 0 ? (
                                <>
                                    {
                                        isEdit ? (
                                            <button type="button" disabled={updateMissTimeKeeping.isPending} onClick={handleSubmit} className="px-2 py-1 bg-green-500 text-white cursor-pointer text-sm rounded hover:bg-green-600">
                                                {updateMissTimeKeeping.isPending ? <Spinner className="text-white" size="small"/> : t('overtime.create.update')}
                                            </button>
                                        ) : (
                                            <button type="button" disabled={createMissTimeKeeping.isPending} onClick={handleSubmit} className="px-2 py-1 bg-green-500 text-white cursor-pointer text-sm rounded hover:bg-green-600">
                                                {createMissTimeKeeping.isPending ? <Spinner className="text-white" size="small"/> : t('overtime.create.save')}
                                            </button>
                                        )
                                    }
                                </>
                            ) : (<></>)
                        }
                    </div>
                </div>
            </div>

            <div className="w-[100%]">
                <div className="bg-white">
                    {errorMsg && <div className="mb-4 text-red-600 font-semibold">{errorMsg}</div>}
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-fixed text-sm border border-gray-200 rounded-lg">
                            <thead className="bg-gray-100 rounded-t-lg">
                                <tr>
                                    <th className="px-4 py-2 border text-center w-[20px]" rowSpan={2}>
                                        <input 
                                            type="checkbox" 
                                            className="scale-[1.2] hover:cursor-pointer"
                                            checked={rows.length > 0 && rows.every((row) => selectedIds.includes(row.id))}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedIds(rows.map((row) => row.id))
                                                } else {
                                                    setSelectedIds([]);
                                                }
                                            }}
                                        />
                                    </th>
                                    <th rowSpan={2} className="px-4 py-2 border w-[70px]">{ t('miss_timekeeping.list.usercode')} <DotRequireComponent/></th>
                                    <th rowSpan={2} className="px-4 py-2 border w-[200px]">{t('miss_timekeeping.list.username')} <DotRequireComponent/></th>
                                    <th rowSpan={2} className="px-4 py-2 border w-[100px]">{t('miss_timekeeping.list.date')} <DotRequireComponent/></th>
                                    <th rowSpan={2} className="px-4 py-2 border w-[80px]">{t('miss_timekeeping.list.shift')} <DotRequireComponent/></th>
                                    <th colSpan={2} className="px-4 py-2 border">{t('miss_timekeeping.list.additional')}</th>
                                    <th colSpan={2} className="px-4 py-2 border text-center w-[200px]">{t('miss_timekeeping.list.facial_recognition')}</th>
                                    <th colSpan={2} className="px-4 py-2 border w-[130px]">{t('miss_timekeeping.list.gate')}</th>
                                    <th rowSpan={2} className="px-4 py-2 border">{t('miss_timekeeping.list.reason')}</th>
                                </tr>
                                <tr>
                                    <th className="py-1 border-r w-[30px]">{t('miss_timekeeping.list.in')}</th>
                                    <th className="border-r w-[30px]">{t('miss_timekeeping.list.out')}</th>
                                    <th className="border-r w-[30px]">{t('miss_timekeeping.list.in')}</th>
                                    <th className="border-r w-[30px]">{t('miss_timekeeping.list.out')}</th>
                                    <th className="border-r w-[30px]">{t('miss_timekeeping.list.in')}</th>
                                    <th className="w-[30px]">{t('miss_timekeeping.list.out')}</th>
                                </tr>
                            </thead>

                            <tbody>
                                {rows.map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-50">
                                        <td className="border px-2 py-2 text-center">
                                            <input
                                                className="scale-[1.2] hover:cursor-pointer"
                                                type="checkbox"
                                                checked={selectedIds.includes(row.id)}
                                                onChange={() => toggleCheck(row.id)}
                                            />
                                        </td>
                                        <td className="border px-2 py-2">
                                            <input
                                                type="text"
                                                className={`border rounded px-2 py-1 ${errorFields[row.id]?.includes('userCode') ? 'border-red-500' : '' }`}
                                                value={row.userCode ?? ''}
                                                onChange={(e) => updateRow(row.id, 'userCode', e.target.value)}
                                                onBlur={(e) => handleFindUser(e.target.value, row.id)}
                                                placeholder={t('miss_timekeeping.list.usercode')}
                                            />
                                        </td>
                                        <td className={`border rounded px-2 py-1 text-center`}>{row.userName || '--'}</td> 
                                        <td className="border px-2 py-2">
                                            <DateTimePicker
                                                enableTime={false}
                                                dateFormat="Y-m-d"
                                                initialDateTime={row.dateRegister || new Date().toISOString().split('T')[0]}
                                                onChange={(_selectedDates, dateStr) => {
                                                    updateRow(row.id, 'dateRegister', dateStr)
                                                }}
                                                className={`dark:bg-[#454545] text-sm border border-gray-300 p-1.5 rounded-[3px] w-[120px]`}
                                            />
                                        </td>
                                        
                                        <td className="border px-2 py-2">
                                            <input
                                                type="text"
                                                className={`border rounded w-[50px] px-2 py-1 ${errorFields[row.id]?.includes('shift') ? 'border-red-500' : '' }`}
                                                value={row.shift ?? ''}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    updateRow(row.id, 'shift', val);
                                                }}
                                                placeholder={t('miss_timekeeping.list.shift')}
                                            />
                                        </td>

                                        <td className="border px-2 py-2 text-center">
                                            <input
                                                type="text"
                                                className={`border rounded px-2 py-1 w-[70px] ${errorFields[row.id]?.includes('additionalIn') ? 'border-red-500' : '' }`}
                                                value={row.additionalIn}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (/^(?:\d{0,2})(?::\d{0,2})?$/.test(val)) {
                                                        updateRow(row.id, 'additionalIn', e.target.value)
                                                    }
                                                }}
                                                placeholder={t('miss_timekeeping.list.in')}
                                                inputMode="numeric"
                                                pattern="^\d{1,2}(:\d{1,2})?$"
                                            />
                                        </td>

                                        <td className="border px-2 py-2">
                                            <input
                                                type="text"
                                                className={`border rounded px-2 py-1 w-[70px] ${errorFields[row.id]?.includes('additionalOut') ? 'border-red-500' : '' }`}
                                                value={row.additionalOut}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (/^(?:\d{0,2})(?::\d{0,2})?$/.test(val)) {
                                                        updateRow(row.id, 'additionalOut', val);
                                                    }
                                                }}
                                                placeholder={t('miss_timekeeping.list.out')}
                                                inputMode="numeric"
                                                pattern="^\d{1,2}(:\d{1,2})?$"
                                            />
                                        </td>

                                        <td className="border px-2 py-2 text-center">
                                            <input
                                                type="text"
                                                className={`border rounded px-2 py-1 w-[70px] ${errorFields[row.id]?.includes('facialRecognitionIn') ? 'border-red-500' : '' }`}
                                                value={row.facialRecognitionIn}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (/^(?:\d{0,2})(?::\d{0,2})?$/.test(val)) {
                                                        updateRow(row.id, 'facialRecognitionIn', e.target.value)
                                                    }
                                                }}
                                                placeholder={t('miss_timekeeping.list.in')}
                                                inputMode="numeric"
                                                pattern="^\d{1,2}(:\d{1,2})?$"
                                            />
                                        </td>

                                        <td className="border px-2 py-2">
                                            <input
                                                type="text"
                                                className={`border rounded px-2 py-1 w-[70px] ${errorFields[row.id]?.includes('facialRecognitionOut') ? 'border-red-500' : '' }`}
                                                value={row.facialRecognitionOut}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (/^(?:\d{0,2})(?::\d{0,2})?$/.test(val)) {
                                                        updateRow(row.id, 'facialRecognitionOut', val);
                                                    }
                                                }}
                                                placeholder={t('miss_timekeeping.list.out')}
                                                inputMode="numeric"
                                                pattern="^\d{1,2}(:\d{1,2})?$"
                                            />
                                        </td>
                                        <td className="border px-2 py-2 text-center">
                                            <input
                                                type="text"
                                                className={`border rounded px-2 py-1 w-[70px] ${errorFields[row.id]?.includes('gateIn') ? 'border-red-500' : '' }`}
                                                value={row.gateIn}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (/^(?:\d{0,2})(?::\d{0,2})?$/.test(val)) {
                                                        updateRow(row.id, 'gateIn', e.target.value)
                                                    }
                                                }}
                                                placeholder={t('miss_timekeeping.list.in')}
                                                inputMode="numeric"
                                                pattern="^\d{1,2}(:\d{1,2})?$"
                                            />
                                        </td>

                                        <td className="border px-2 py-2">
                                            <input
                                                type="text"
                                                className={`border rounded px-2 py-1 w-[70px] ${errorFields[row.id]?.includes('gateOut') ? 'border-red-500' : '' }`}
                                                value={row.gateOut}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (/^(?:\d{0,2})(?::\d{0,2})?$/.test(val)) {
                                                        updateRow(row.id, 'gateOut', val);
                                                    }
                                                }}
                                                placeholder={t('miss_timekeeping.list.out')}
                                                inputMode="numeric"
                                                pattern="^\d{1,2}(:\d{1,2})?$"
                                            />
                                        </td>
                                        
                                        <td className="border px-2 py-2">
                                            <input
                                                type="text"
                                                className="border rounded px-2 py-1 w-full"
                                                value={row.reason}
                                                onChange={(e) => updateRow(row.id, 'reason', e.target.value)}
                                                placeholder={t('miss_timekeeping.list.reason')}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}