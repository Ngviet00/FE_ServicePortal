/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getErrorMessage, ShowToast } from "@/lib";
import { useAuthStore } from "@/store/authStore";
import leaveRequestApi from "@/api/leaveRequestApi";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import RadioGroup, { RadioOption } from "@/components/RadioGroup";
import ExcelUploader from "@/components/ExcelUploader";
import DateTimePicker from "@/components/ComponentCustom/Flatpickr";
import orgUnitApi from "@/api/orgUnitApi";
import overTimeApi, { useCreateOverTime, useUpdateOverTime } from "@/api/overTimeApi";
import { useEffect, useRef, useState } from "react";
import FullscreenLoader from "@/components/FullscreenLoader";
import DotRequireComponent from "@/components/DotRequireComponent";
import { Spinner } from "@/components/ui/spinner";

export default function CreateMissTimeKeeping() {
    const { t } = useTranslation('hr')
    const lang = useTranslation().i18n.language.split('-')[0]
    const user = useAuthStore((state) => state.user)
    const navigate = useNavigate()
    const lastUserCodesRef = useRef<Record<number, string>>({})
    const [typeOvertimeId, setTypeOvertimeId] = useState<number | null>(null);
    const [orgUnitCompanyId, setOrgUnitCompanyId] = useState<number | null>(null);
    const [departmentId, setDepartmentId] = useState<number | null>(null);
    const [registerDate, setRegisterDate] = useState<string>("");
    const [isSearchingUser, setIsSearchingUser] = useState(false)
    const [errorFields, setErrorFields] = useState<{ [key: string]: string[] }>({});
    const createOverTime = useCreateOverTime();
    const updateOverTime = useUpdateOverTime();
    
    const [selectedRadio, setSelectedRadio] = useState<string>("normal")
    const options: RadioOption[] = [
        { label: lang == 'vi' ? 'Đăng ký thủ công' : 'Manual', value: "normal" },
        { label: lang == 'vi' ? "Đăng ký bằng excel" : 'Excel', value: "excel" },
    ];
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;

    const { data: formDataDetail, isLoading: isFormDataLoading } = useQuery({
        queryKey: ['overtime', id],
        queryFn: async () => {
            const res = await overTimeApi.getDetailOverTime(id ?? '');
            return res.data.data;
        },
        enabled: isEdit,
    });

    useEffect(() => {
        if (formDataDetail && isEdit) {
            const mappedRows = formDataDetail.overTimes.map((ot: any) => ({
                id: `${ot.id}`,
                userCode: ot.userCode ?? '',
                userName: ot.userName ?? '',
                position: ot.position ?? '',
                fromHour: ot.fromHour ?? '',
                toHour: ot.toHour ?? '',
                numberHour: ot.numberHour ?? '',
                note: ot.note ?? '',
                checked: false,
            }));
            setRows(mappedRows);
            setOrgUnitCompanyId(formDataDetail?.applicationForm?.orgUnitCompany?.id)
            setTypeOvertimeId(formDataDetail?.applicationForm?.typeOverTime?.id)
            setDepartmentId(formDataDetail?.applicationForm?.orgUnit?.id)
            setRegisterDate(formDataDetail?.applicationForm?.dateRegister)
        }
    }, [formDataDetail, isEdit]);
    
    const { data: unitCompanys = [] } = useQuery({ queryKey: ['get-unit-company'], queryFn: async () => { const res = await orgUnitApi.getUnitCompany(); return res.data.data; }, });
    const { data: typeOverTimes = [] } = useQuery({ queryKey: ['get-type-overtimes'], queryFn: async () => { const res = await overTimeApi.getTypeOverTime(); return res.data.data; }, });
    const { data: departments = [] } = useQuery({ queryKey: ['get-all-department'], queryFn: async () => { const res = await orgUnitApi.GetAllDepartment(); return res.data.data; } });
    
    const mode = isEdit ? 'edit' : 'create';

    useEffect(() => {
        if (mode == "create") {
            setRows([
                {
                    id: `ot_${Date.now()}`,
                    userCode: '',
                    userName: '',
                    position: '',
                    fromHour: '',
                    toHour: '',
                    numberHour: '',
                    note: '',
                    checked: false,
                }
            ]);
            setOrgUnitCompanyId(unitCompanys.length > 0 ? unitCompanys[0].id : null);
            setTypeOvertimeId(typeOverTimes.length > 0 ? typeOverTimes[0].id : null);
            setDepartmentId(null);
            setRegisterDate(new Date().toISOString().split("T")[0]);
        }
    }, [mode, typeOverTimes, unitCompanys]);
    
    const handleFormSubmitByExcel = async (file: File) => {
        if (departmentId == null) {
            ShowToast(lang == 'vi' ? 'Vui lòng chọn bộ phận' : 'Please select department', 'error')
            return false
        }

        const formData = new FormData()
        formData.append("EmailCreated", user?.email ?? "");
        formData.append("OrgPositionId", String(user?.orgPositionId ?? ""));
        formData.append("UserCodeCreated", user?.userCode ?? "");
        formData.append("UserNameCreated", user?.userName ?? "");
        formData.append("OrgUnitCompanyId", String(orgUnitCompanyId));
        formData.append("TypeOverTimeId", String(typeOvertimeId));
        formData.append("DateRegisterOT", String(registerDate));
        formData.append("DepartmentId", String(departmentId))
        formData.append("file", file)

        try {
            await createOverTime.mutateAsync(formData)
            navigate("/overtime/overtime-registered");
            return true
        } catch (err) {
            ShowToast(getErrorMessage(err), "error")
            return false
        }
    };

    const [errorMsg, setErrorMsg] = useState('')
    const [rows, setRows] = useState<any[]>([
        {
            id: `ot_${Date.now()}`,
            userCode: '',
            userName: '',
            position: '',
            fromHour: '',
            toHour: '',
            numberHour: '',
            note: '',
            checked: false,
        }
    ]);

    const handleAddRow = () => {
        const newRow = {
            id: `ot_${Date.now()}`,
            userCode: '',
            userName: '',
            position: '',
            fromHour: '',
            toHour: '',
            numberHour: '',
            note: '',
            checked: false,
        }
        setRows([...rows, newRow]);
    };

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
            if (!row.position) missing.push('position');
            if (!row.fromHour) missing.push('fromHour');
            if (!row.toHour) missing.push('toHour');
            if (!row.numberHour) missing.push('numberHour');

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

        const formData = new FormData()

        formData.append("EmailCreated", user?.email ?? "");
        formData.append("OrgPositionId", String(user?.orgPositionId ?? ""))
        formData.append("UserCodeCreated", user?.userCode ?? "")
        formData.append("UserNameCreated", user?.userName ?? "")
        formData.append("OrgUnitCompanyId", String(orgUnitCompanyId))
        formData.append("TypeOverTimeId", String(typeOvertimeId))
        formData.append("DateRegisterOT", String(registerDate))
        formData.append("DepartmentId", String(departmentId))

        rows.map((data: any, index: number) => {
            if (!data?.id.startsWith("ot")) {
                formData.append(`CreateListOverTimeRequests[${index}].Id`, data?.id ?? '-1');
            }
            formData.append(`CreateListOverTimeRequests[${index}].UserCode`, data.userCode ?? "");
            formData.append(`CreateListOverTimeRequests[${index}].UserName`, data.userName ?? "");
            formData.append(`CreateListOverTimeRequests[${index}].Position`, data.position ?? "");
            formData.append(`CreateListOverTimeRequests[${index}].FromHour`, data.fromHour );
            formData.append(`CreateListOverTimeRequests[${index}].ToHour`, data.toHour);
            formData.append(`CreateListOverTimeRequests[${index}].NumberHour`, data.numberHour ?? "");
            formData.append(`CreateListOverTimeRequests[${index}].Note`, data.note ?? "");
        })


        try {
            if (isEdit) {   
                await updateOverTime.mutateAsync({applicationFormCode: id, data: formData})
            } else {
                await createOverTime.mutateAsync(formData)
            }
            navigate("/overtime/overtime-registered");
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
                            <span>{ mode == 'create' ? t('overtime.create.title_create') : t('overtime.create.title_update') } </span>
                        </h3>
                    </div>
                </div>
                <Button onClick={() => navigate("/overtime")} className="w-full md:w-auto hover:cursor-pointer">
                    { lang == 'vi' ? 'Danh sách tăng ca của tôi' : 'My list overtime' }
                </Button>
            </div>
            {
                mode == 'create' && (
                    <div className="flex">
                        <RadioGroup
                            label={lang == 'vi' ? 'Chọn loại đăng ký' : 'Select type register'}
                            options={options}
                            value={selectedRadio}
                            onChange={setSelectedRadio}
                        />
                        <div className="ml-3">
                            <div className="bg-red-400 inline-block p-1 text-sm text-white rounded-[3px]">
                                **
                                {
                                    lang == 'vi' ? 'Lưu ý, chỉ nên nhập dữ liệu đăng ký cho chính mình hoặc thành viên cùng tổ' 
                                        : 'Note, you should only enter registration data for yourself or member of your team, organization.'
                                }
                            </div>
                        </div>
                    </div>
                )
            }
            <div className="flex flex-col md:flex-row md:justify-start mb-0">
                <div className="mb-4 mr-15">
                    <label className="block mb-2 font-semibold text-gray-700">{t('overtime.list.unit')} <DotRequireComponent/></label>
                    <div className="flex space-x-4">
                        {
                            unitCompanys?.map((item: any) => (
                                <label key={item?.id} className="flex items-center space-x-2 cursor-pointer">
                                    <input type="radio" className="accent-black cursor-pointer" name="unit" checked={orgUnitCompanyId === item.id} value={item?.id} onChange={() => setOrgUnitCompanyId(item.id)} />
                                    <span>{item?.name}</span>
                                </label>
                            ))
                        }
                    </div>
                </div>

                <div className="mb-4 mr-15">
                    <label className="block mb-2 font-semibold text-gray-700">{t('overtime.list.type_overtime')} <DotRequireComponent/></label>
                    <div className="flex space-x-4">
                        {
                            typeOverTimes?.map((item: any) => {
                                return (
                                    <label key={item?.id} className="flex items-center space-x-2 cursor-pointer">
                                        <input type="radio" className="accent-black cursor-pointer" name="type_overtime" value={item?.id} checked={typeOvertimeId === item.id} onChange={() => setTypeOvertimeId(item.id)} />
                                        <span>{lang == 'vi' ? item?.name : item?.nameE}</span>
                                    </label>
                                )
                            })
                        }
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:space-x-8 items-start mt-4 md:mt-0">
                    <div className="mb-4 md:mb-0">
                        <label className="block mb-2 font-semibold text-gray-700">{t('overtime.list.date_register')} <DotRequireComponent/></label>
                        <DateTimePicker
                            enableTime={false}
                            dateFormat="Y-m-d"
                            initialDateTime={registerDate || new Date().toISOString().split('T')[0]}
                            onChange={(_selectedDates, dateStr) => {
                                setRegisterDate(dateStr);
                            }}
                            className={`dark:bg-[#454545] text-sm border border-gray-300 p-1.5 rounded-[3px]`}
                        />
                    </div>

                    <div>
                        <label className="block mb-2 font-semibold text-gray-700">{t('overtime.list.department')} <DotRequireComponent/></label>
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
                </div>
            </div>
            {
                selectedRadio == "normal" ? (
                    <div className="w-[100%]">
                        <div className="bg-white">
                            {errorMsg && <div className="mb-4 text-red-600 font-semibold">{errorMsg}</div>}
                            <div className="flex space-x-2 mb-4">
                                <button type="button" onClick={handleAddRow} className="px-2 py-1 cursor-pointer bg-blue-600 text-white text-sm rounded hover:bg-blue-600">{t('overtime.create.add')}</button>
                                <button type="button" onClick={handleDeleteRows} className="px-2 py-1 bg-red-600 cursor-pointer text-white text-sm rounded hover:bg-red-600">{t('overtime.create.delete')}</button>
                                {
                                    selectedIds.length == 0 ? (
                                        <>
                                            {
                                                isEdit ? (
                                                    <button type="button" disabled={updateOverTime.isPending} onClick={handleSubmit} className="px-2 py-1 bg-green-500 text-white cursor-pointer text-sm rounded hover:bg-green-600">
                                                        {updateOverTime.isPending ? <Spinner className="text-white" size="small"/> : t('overtime.create.update')}
                                                    </button>
                                                ) : (
                                                    <button type="button" disabled={createOverTime.isPending} onClick={handleSubmit} className="px-2 py-1 bg-green-500 text-white cursor-pointer text-sm rounded hover:bg-green-600">
                                                        {createOverTime.isPending ? <Spinner className="text-white" size="small"/> : t('overtime.create.save')}
                                                    </button>
                                                )
                                            }
                                        </>
                                    ) : (<></>)
                                }
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm border border-gray-200 rounded-lg">
                                    <thead className="bg-gray-100 rounded-t-lg">
                                        <tr>
                                            <th className="px-4 py-2 border w-12 text-center">
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
                                            <th className="px-4 py-2 border">{ t('overtime.list.usercode')} <DotRequireComponent/></th>
                                            <th className="px-4 py-2 border w-[350px]">{t('overtime.list.username')} <DotRequireComponent/></th>
                                            <th className="px-4 py-2 border">{t('overtime.list.position')} <DotRequireComponent/></th>
                                            <th className="px-4 py-2 border w-40">{t('overtime.list.from_hour')} <DotRequireComponent/></th>
                                            <th className="px-4 py-2 border w-40">{t('overtime.list.to_hour')} <DotRequireComponent/></th>
                                            <th className="px-4 py-2 border w-40 text-center">{t('overtime.list.number_hour')} <DotRequireComponent/></th>
                                            <th className="px-4 py-2 border">{t('overtime.list.note')}</th>
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
                                                        className={`border rounded px-2 py-1 w-full ${errorFields[row.id]?.includes('userCode') ? 'border-red-500' : '' }`}
                                                        value={row.userCode ?? ''}
                                                        onChange={(e) => updateRow(row.id, 'userCode', e.target.value)}
                                                        onBlur={(e) => handleFindUser(e.target.value, row.id)}
                                                        placeholder={t('overtime.list.usercode')}
                                                    />
                                                </td>
                                                <td className={`border rounded px-2 py-1 text-center`}>{row.userName || '--'}</td> 
                                                <td className="border px-2 py-2">
                                                    <input
                                                        type="text"
                                                        className={`border rounded px-2 py-1 w-full ${errorFields[row.id]?.includes('position') ? 'border-red-500' : '' }`}
                                                        value={row.position}
                                                        onChange={(e) => updateRow(row.id, 'position', e.target.value)}
                                                        placeholder={t('overtime.list.position')}
                                                    />
                                                </td>
                                                
                                                <td className="border px-2 py-2">
                                                    <input
                                                        type="text"
                                                        className={`border rounded px-2 py-1 w-full ${errorFields[row.id]?.includes('fromHour') ? 'border-red-500' : '' }`}
                                                        value={row.fromHour}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (/^(?:\d{0,2})(?::\d{0,2})?$/.test(val)) {
                                                                updateRow(row.id, 'fromHour', val);
                                                            }
                                                        }}
                                                        placeholder={t('overtime.list.from_hour')}
                                                        inputMode="numeric"
                                                        pattern="^\d{1,2}(:\d{1,2})?$"
                                                    />
                                                </td>
                                                
                                                <td className="border px-2 py-2">
                                                    <input
                                                        type="text"
                                                        className={`border rounded px-2 py-1 w-full ${errorFields[row.id]?.includes('toHour') ? 'border-red-500' : '' }`}
                                                        value={row.toHour}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (/^(?:\d{0,2})(?::\d{0,2})?$/.test(val)) {
                                                                updateRow(row.id, 'toHour', val);
                                                            }
                                                        }}
                                                        placeholder={t('overtime.list.to_hour')}
                                                        inputMode="numeric"
                                                        pattern="^\d{1,2}(:\d{1,2})?$"
                                                    />
                                                </td>
                                            
                                                <td className="border px-2 py-2 text-center">
                                                    <input
                                                        type="text"
                                                        className={`border rounded px-2 py-1 w-full ${errorFields[row.id]?.includes('numberHour') ? 'border-red-500' : '' }`}
                                                        value={row.numberHour}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (/^(?:\d+([.,]\d{0,1})?)?$/.test(val)) { 
                                                                updateRow(row.id, 'numberHour', e.target.value)
                                                            }
                                                        }}
                                                        placeholder={t('overtime.list.number_hour')}
                                                        inputMode="decimal"
                                                        pattern="^\d+([.,]\d{1})?$"
                                                    />
                                                </td>
                                                
                                                <td className="border px-2 py-2">
                                                    <input
                                                        type="text"
                                                        className="border rounded px-2 py-1 w-full"
                                                        value={row.note}
                                                        onChange={(e) => updateRow(row.id, 'note', e.target.value)}
                                                        placeholder={t('overtime.list.note')}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <ExcelUploader
                        templateFileUrl={`/template_excel/template_tang_ca.xlsx`}
                        onSubmit={handleFormSubmitByExcel}
                    />
                )
            }
        </div>
    );
}