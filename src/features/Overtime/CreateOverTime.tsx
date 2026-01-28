/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getErrorMessage, handleDownloadTemplate, ShowToast } from "@/lib";
import { useAuthStore } from "@/store/authStore";
import leaveRequestApi from "@/api/leaveRequestApi";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import DateTimePicker from "@/components/ComponentCustom/Flatpickr";
import orgUnitApi from "@/api/orgUnitApi";
import overTimeApi, { useCreateOverTime, useUpdateOverTime } from "@/api/overTimeApi";
import { useEffect, useRef, useState } from "react";
import FullscreenLoader from "@/components/FullscreenLoader";
import DotRequireComponent from "@/components/DotRequireComponent";
import { z } from "zod"
import { Controller, SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react"
import * as XLSX from 'xlsx';

export const infoOverTimeSchema = z.object({
    unit: z.object({
        id: z.string(),
        name: z.string()
    }),
    type_overtime: z.object({
        id: z.string(),
        name: z.string()
    }),
    date_register: z.string(),
    department: z.object({
        id: z.string().min(1, 'Bắt buộc'),
        name: z.string()
    })
})

export const userOverTimeSchema = z.object({
    id: z.number().nullable().optional(),
    userCode: z.string().min(1, 'Bắt buộc'),
    userName: z.string().min(1, 'Bắt buộc'),
    position: z.string().min(1, 'Bắt buộc'),
    fromHour: z.string().min(1, 'Bắt buộc'),
    toHour: z.string().min(1, 'Bắt buộc'),
    numberHour: z.string().min(1, 'Bắt buộc'),
    note: z.string().nullable().optional()
})

export const overTimeSchema = z.object({
    infoOverTime: infoOverTimeSchema,
    userOverTime: z.array(userOverTimeSchema)
})

export type OverTimeForm = z.infer<typeof overTimeSchema>;

export default function CreateOverTime() {
    const { t } = useTranslation('hr')
    const lang = useTranslation().i18n.language.split('-')[0]
    const user = useAuthStore((state) => state.user)
    const navigate = useNavigate()
    const lastUserCodesRef = useRef<Record<number, string>>({})

    const [isSearchingUser, setIsSearchingUser] = useState(false)
    const createOverTime = useCreateOverTime();
    const updateOverTime = useUpdateOverTime();
    
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

    const form = useForm<OverTimeForm>({
        resolver: zodResolver(overTimeSchema),
        defaultValues: {
            infoOverTime: {
                unit: {
                    id: '',
                    name: ''
                },
                type_overtime: {
                    id: '',
                    name: '',
                },
                date_register: new Date().toISOString().split("T")[0],
                department: {
                    id: '',
                    name: ''
                }
            },
            userOverTime: [{
                id: null,
                userCode: user?.userCode,
                userName: user?.userName ?? '',
                position: user?.unitNameV,
                fromHour: '',
                toHour: '',
                numberHour: '',
                note: '',
            }],
        },
    });

    const { control, watch, handleSubmit,  setValue, getValues, reset, formState: { errors } } = form;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "userOverTime",
    });

    const unit = form.watch("infoOverTime.unit");
    const typeOverTime = form.watch("infoOverTime.type_overtime");
    const dateRegister = form.watch("infoOverTime.date_register");
    const department = form.watch("infoOverTime.department");
    
    const { data: unitCompanys = [] } = useQuery({ 
        queryKey: ['get-unit-company'], 
        queryFn: async () => { 
            const res = await orgUnitApi.getUnitCompany();
            return res.data.data;
        }
    });

    useEffect(() => {
        if (unitCompanys.length > 0 && !unit?.id) {
            const first = unitCompanys[0];
            setValue("infoOverTime.unit", {
                id: first?.id?.toString(),
                name: first?.name
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [unitCompanys])

    const { data: typeOverTimes = [] } = useQuery({ 
        queryKey: ['get-type-overtimes'], 
        queryFn: async () => { 
            const res = await overTimeApi.getTypeOverTime();
            return res.data.data; 
        }
    });

    useEffect(() => {
        if (typeOverTimes.length > 0 && !typeOverTime?.id) {
            const first = typeOverTimes[0];
            setValue("infoOverTime.type_overtime", {
                id: first?.id?.toString(),
                name: first?.name
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [typeOverTimes])

    const { data: departments = [] } = useQuery({ 
        queryKey: ['get-all-department'], 
        queryFn: async () => { 
            const res = await orgUnitApi.GetAllDepartment(); 
            return res.data.data;
        }
    })

    const handleAddRow = () => {
        append({
            userCode: '',
            userName: '',
            position: '',
            fromHour: '',
            toHour: '',
            numberHour: '',
            note: '',
        })
    };

    useEffect(() => {
        if (formDataDetail) {
            const metaData = JSON.parse(formDataDetail?.applicationForm?.metaData ?? '{}')

            const userOverTime = (formDataDetail.overTimes ?? []).map(
                (e: any) => ({
                    id: e?.Id ?? null,
                    userCode: e.UserCode,
                    userName: e.UserName,
                    position: e.Position,
                    fromHour: e.FromHour,
                    toHour: e.ToHour,
                    numberHour: e.NumberHour,
                    note: e.Note ?? '',
                })
            );

            reset({
                infoOverTime: {
                    unit: {
                        id: metaData?.unit?.id,
                        name: metaData?.unit?.name
                    },
                    type_overtime: {
                        id: metaData?.type_overtime?.id,
                        name: metaData?.type_overtime?.name
                    },
                    date_register: metaData?.date_register,
                    department: {
                        id: metaData?.department?.id,
                        name: metaData?.department?.name
                    }
                },
                userOverTime
            })
        }
    }, [formDataDetail, reset])

    const onSubmit: SubmitHandler<OverTimeForm> = async (data) => {
        const payload = {
            orgPositionIdUserCreatedForm: user?.orgPositionId,
            userCodeCreatedForm: user?.userCode,
            userNameCreatedForm: user?.userName,
            departmentIdUserCreatedForm: user?.departmentId,
            infoOverTime: JSON.stringify(data.infoOverTime),
            createListOverTimeRequests: data.userOverTime
        }

        if (isEdit) {
            await updateOverTime.mutateAsync({
                applicationFormCode: id,
                data: payload
            })
        } else {
            await createOverTime.mutateAsync(payload)
        }

        navigate('/overtime/overtime-registered')
    }

    const handleFindUser = async (userCode: string, index: number) => {
        userCode = userCode.trim();

        if (!userCode) {
            setValue(`userOverTime.${index}.userCode`, "");
            setValue(`userOverTime.${index}.userName`, "");
            setValue(`userOverTime.${index}.position`, "");
            lastUserCodesRef.current[index] = "";
            return;
        }

        const lastCode = lastUserCodesRef.current[index];
        if (userCode === lastCode) return;
        lastUserCodesRef.current[index] = userCode;

        try {
            setIsSearchingUser(true);

            const fetchData = await leaveRequestApi.SearchUserRegisterLeaveRequest({
                userCodeRegister: user?.userCode ?? "",
                usercode: userCode,
            });

            const result = fetchData?.data?.data;
            setValue(`userOverTime.${index}.userName`, result?.nvHoTen ?? "", {shouldValidate: true});
            setValue(`userOverTime.${index}.position`, result?.positionV ?? "", {shouldValidate: true});

        } catch (err) {
            ShowToast(getErrorMessage(err), "error");
            setValue(`userOverTime.${index}.userName`, "", {shouldValidate: true});
            setValue(`userOverTime.${index}.position`, "", {shouldValidate: true});
        } finally {
            setIsSearchingUser(false);
        }
    }

    const calculatorNumberHour = (fromHour: string, toHour: string) => {
        if (!fromHour || !toHour) return "";
        const normalize = (t: string) => {
            const parts = t.split(":");
            if (parts.length === 1) return `${parts[0]}:00`;
            return t;
        };
        const [fh, fm] = normalize(fromHour).split(":").map(Number);
        const [th, tm] = normalize(toHour).split(":").map(Number);
        if ([fh, fm, th, tm].some(isNaN)) return "";
        let diff = (th * 60 + tm) - (fh * 60 + fm);
        if (diff < 0) diff += 24 * 60;
        return (diff / 60).toFixed(2) ?? 0;
    }

    const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, });

        const imported: any[] = [];

        for (let i = 3; i < rows.length; i++) {
            const r = rows[i];

            if (!r || r.every(cell => cell === undefined || cell === "")) break;

            const [
                userCode,
                userName,
                position,
                fromHour,
                toHour,
                numberHour,
                note
            ] = r

            imported.push({
                userCode: userCode ?? "",
                userName: userName ?? "",
                position: position ?? "",
                fromHour: fromHour ?? "",
                toHour: toHour ?? "",
                numberHour: numberHour ?? "",
                note: note ?? "",
            });
        }

        if (imported.length === 0) {
            ShowToast("Không có dữ liệu để import", "error");
            return;
        }

        reset({
            ...getValues(),    
            userOverTime: imported     
        });

        ShowToast(`Import thành công ${imported.length} dòng`, "success");
    };

    if (isEdit && isFormDataLoading) {
        return <div>{lang == 'vi' ? 'Loading' : 'Đang tải'}...</div>;
    }

    if (isEdit && !formDataDetail) {
        return  <div className='text-red-700 font-semibold'>{lang == 'vi' ? 'Không tìm thấy dữ liệu' : 'Not found data'}</div>;
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
                            <span>{ !isEdit ? t('overtime.create.title_create') : t('overtime.create.title_update') } </span>
                        </h3>
                    </div>
                </div>
                <div>
                    <Button onClick={() => navigate("/overtime")} className="w-full md:w-auto hover:cursor-pointer mr-1 mb-1">
                        { lang == 'vi' ? 'Đơn tăng ca của tôi' : 'My Overtime Requests' }
                    </Button>
                    <Button onClick={() => navigate("/overtime/overtime-registered")} className="w-full md:w-auto hover:cursor-pointer">
                        { lang == 'vi' ? 'Danh sách đơn tăng ca đã đăng ký' : 'Registered Overtime Requests' }
                    </Button>
                </div>
            </div>
            <form onSubmit={handleSubmit(onSubmit, (errors) => {console.log("⛔ Submit bị chặn vì lỗi:", errors)})}>
                {
                    !isEdit && 
                    <div className="inline-block bg-red-400 p-1.5 text-sm text-white rounded-[3px] mb-1">
                        ** {
                            lang == 'vi'
                                ? 'Lưu ý: Người đăng ký chỉ được nhập dữ liệu cho bản thân hoặc các thành viên thuộc cùng tổ. Thời hạn đăng ký là trước 14:00'
                                : 'Note: Registrants are only allowed to enter data for themselves or for members of the same team. The registration deadline is before 14:00'
                        }
                    </div>
                }
                <div className="flex flex-col md:flex-row md:justify-start mb-0">
                    <div className="mb-4 mr-15">
                        <label className="block mb-2 font-semibold text-gray-700">{t('overtime.list.unit')} <DotRequireComponent/></label>
                        <div className="flex space-x-4">
                            {
                                unitCompanys?.map((item: any) => (
                                    <label key={item?.id} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio" 
                                            className="accent-black cursor-pointer" 
                                            name="unit"
                                            value={item?.id} 
                                            checked={unit?.id == item?.id}
                                            onChange={() =>
                                                form.setValue('infoOverTime.unit', {
                                                    id: item?.id?.toString(),
                                                    name: item.name
                                                })
                                            } 
                                        />
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
                                            <input 
                                                type="radio" 
                                                className="accent-black cursor-pointer" 
                                                name="type_overtime" 
                                                value={item?.id} 
                                                checked={typeOverTime?.id == item?.id}
                                                onChange={() =>
                                                form.setValue('infoOverTime.type_overtime', {
                                                    id: item?.id?.toString(),
                                                    name: item.name
                                                })
                                            } 
                                            />
                                            <span>{lang == 'vi' ? item?.name : item?.nameE}</span>
                                        </label>
                                    )
                                })
                            }
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:space-x-8 items-start md:mt-0">
                        <div className="mb-4 md:mb-0">
                            <label className="block mb-2 font-semibold text-gray-700">{t('overtime.list.date_register')} <DotRequireComponent/></label>
                            <DateTimePicker
                                enableTime={false}
                                dateFormat="Y-m-d"
                                initialDateTime={dateRegister}
                                onChange={(_selectedDates, dateStr) => {
                                    form.setValue('infoOverTime.date_register', dateStr)
                                }}
                                className={`dark:bg-[#454545] text-sm border border-gray-300 p-1.5 rounded-[3px]`}
                                enableDate={[
                                    dateRegister ? dateRegister : new Date().toISOString().split("T")[0],
                                    new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0], // hôm qua
                                    new Date().toISOString().split("T")[0],                                // hôm nay
                                    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0] // ngày mai
                                ]}
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-semibold text-gray-700">{t('overtime.list.department')} <DotRequireComponent/></label>
                            <select
                                onChange={(e) => {
                                    form.setValue('infoOverTime.department', {
                                        id: e.target.value ?? '',
                                        name: e.target.options[e.target.selectedIndex].text ?? ''
                                    });
                                    form.clearErrors('infoOverTime.department');
                                }
                                }
                                className={`${errors.infoOverTime?.department ? 'border border-red-300 bg-red-100' : ''} border cursor-pointer border-gray-500 rounded px-3 py-1`}
                                value={department?.id}
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
                <div className="w-[100%] mt-3">
                    <div className="bg-white">
                        <div className="flex items-center justify-between space-x-2 mb-4">
                            <div>
                                <button type="button" onClick={handleAddRow} className="px-4 py-2 mb-1 mr-1 cursor-pointer bg-blue-600 text-white text-sm rounded hover:bg-blue-700">{t('overtime.create.add')}</button>
                                {
                                    isEdit ? (
                                        <button type="submit" disabled={updateOverTime.isPending}  className="px-4 py-2 mb-1 bg-green-500 text-white cursor-pointer text-sm rounded hover:bg-green-600 disabled:bg-gray-400">
                                            {t('overtime.create.update')}
                                        </button>
                                    ) : (
                                        <button type="submit" disabled={createOverTime.isPending} className="px-4 py-2 mb-1 bg-green-500 text-white cursor-pointer text-sm rounded hover:bg-green-600 disabled:bg-gray-400">
                                            {t('overtime.create.save')}
                                        </button>
                                    )
                                }
                            </div>
                            {
                                !isEdit && 
                                <div>
                                    <span className="text-lg font-bold">{lang == 'vi' ? 'Nhập bằng excel' : 'Import excel'}: </span>
                                    <label htmlFor="excel_overtime_import" className="bg-blue-500 hover:bg-blue-600 py-2 px-2 text-sm text-white rounded-sm cursor-pointer">
                                        {lang == 'vi' ? 'Chọn file excel' : 'Select file excel'}
                                    </label>
                                    <input
                                        className="hidden"
                                        id="excel_overtime_import"
                                        type="file"
                                        accept=".xlsx,.xls"
                                        onChange={handleImportExcel}
                                    />
                                    
                                    <button type="button" onClick={() => handleDownloadTemplate(`/template_excel/template_tang_ca.xlsx`)} className="bg-green-500 hover:bg-green-600 p-2 text-sm rounded-sm ml-2 text-white cursor-pointer">
                                        {lang == 'vi' ? 'Tải file mẫu' : 'Download template'} 
                                    </button>
                                </div>
                            }
                        </div>
                        
                        <div className="w-full overflow-x-auto">
                            <div className="min-w-[900px]">
                                <table className="w-full text-sm border border-gray-200 rounded-lg">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 border min-w-[120px]">{t('overtime.list.usercode')} <DotRequireComponent/></th>
                                            <th className="px-4 py-2 border min-w-[200px]">{t('overtime.list.username')} <DotRequireComponent/></th>
                                            <th className="px-4 py-2 border min-w-[180px]">{t('overtime.list.position')} <DotRequireComponent/></th>
                                            <th className="px-4 py-2 border w-[130px]">{t('overtime.list.from_hour')} <DotRequireComponent/></th>
                                            <th className="px-4 py-2 border w-[130px]">{t('overtime.list.to_hour')} <DotRequireComponent/></th>
                                            <th className="px-4 py-2 border w-[150px] text-center">{t('overtime.list.number_hour')} <DotRequireComponent/></th>
                                            <th className="px-4 py-2 border min-w-[200px]">{t('overtime.list.note')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            fields.map((_field, index) => {
                                                const userCodeErr = errors?.userOverTime?.[index]?.userCode;
                                                const userNameErr = errors?.userOverTime?.[index]?.userName;
                                                const positionErr = errors?.userOverTime?.[index]?.position;
                                                const fromHourErr = errors?.userOverTime?.[index]?.fromHour;
                                                const toHourErr = errors?.userOverTime?.[index]?.toHour;
                                                const numberHourErr = errors?.userOverTime?.[index]?.numberHour;

                                                return (
                                                    <tr key={index}>
                                                        <td className="border px-2 py-2">
                                                            <Controller
                                                                control={control}
                                                                name={`userOverTime.${index}.userCode`}
                                                                render={({ field }) => (
                                                                    <input
                                                                        type="text"
                                                                        className={`border rounded px-2 py-1 w-full ${userCodeErr ? 'border border-red-300 bg-red-100' : ''}`}
                                                                        placeholder={t('overtime.list.usercode')}
                                                                        {...field}
                                                                        {...control.register(`userOverTime.${index}.userCode`, {
                                                                            onBlur: (e) => handleFindUser(e.target.value, index)
                                                                        })}
                                                                    />
                                                                )}
                                                            />
                                                        </td>
                                                        <td className="border px-2 py-2 text-center">
                                                            <input
                                                                type="text"
                                                                disabled
                                                                {...control.register(`userOverTime.${index}.userName`)}
                                                                className={`rounded px-2 py-1 w-full text-center ${userNameErr ? 'border border-red-300 bg-red-100' : ''}`}
                                                                placeholder={`--`}
                                                            />
                                                        </td>
                                                        <td className="border px-2 py-2">
                                                            <input
                                                                type="text"
                                                                {...control.register(`userOverTime.${index}.position`)}
                                                                className={`border rounded px-2 py-1 w-full ${positionErr ? 'border border-red-300 bg-red-100' : ''}`}
                                                                placeholder={t('overtime.list.position')}
                                                            />
                                                        </td>
                                                        <td className="border px-2 py-2">
                                                            <Controller
                                                                control={control}
                                                                name={`userOverTime.${index}.fromHour`}
                                                                render={({field}) => (
                                                                    <input
                                                                        type="text"
                                                                        className={`border rounded px-2 py-1 w-full ${fromHourErr ? 'border border-red-300 bg-red-100' : ''}`}
                                                                        {...field}
                                                                        placeholder={t('overtime.list.from_hour')}
                                                                        inputMode="numeric"
                                                                        onChange={(e) => {
                                                                            const val = e.target.value;
                                                                            if (/^(?:\d{0,2})(?::\d{0,2})?$/.test(val)) {
                                                                                setValue(`userOverTime.${index}.fromHour`, val);
                                                                                const currentTo = watch(`userOverTime.${index}.toHour`);
                                                                                const hours = calculatorNumberHour(val, currentTo);
                                                                                setValue(`userOverTime.${index}.numberHour`, hours);
                                                                                field.onChange(val);
                                                                            }
                                                                        }}
                                                                    />
                                                                )}
                                                            />
                                                        </td>
                                                        <td className="border px-2 py-2">
                                                            <Controller
                                                                control={control}
                                                                name={`userOverTime.${index}.toHour`}
                                                                render={({field}) => (
                                                                    <input
                                                                        type="text"
                                                                        className={`border rounded px-2 py-1 w-full ${toHourErr ? 'border border-red-300 bg-red-100' : ''}`}
                                                                        {...field}
                                                                        placeholder={t('overtime.list.to_hour')}
                                                                        inputMode="numeric"
                                                                        onChange={(e) => {
                                                                            const val = e.target.value;
                                                                            if (/^(?:\d{0,2})(?::\d{0,2})?$/.test(val)) {
                                                                                setValue(`userOverTime.${index}.toHour`, val);
                                                                                const currentFrom = watch(`userOverTime.${index}.fromHour`);
                                                                                const hours = calculatorNumberHour(currentFrom, val);
                                                                                setValue(`userOverTime.${index}.numberHour`, hours);
                                                                                field.onChange(val);
                                                                            }
                                                                        }}
                                                                    />
                                                                )}
                                                            />
                                                        </td>
                                                        <td className="border px-2 py-2 text-center">
                                                            <input
                                                                {...control.register(`userOverTime.${index}.numberHour`)}
                                                                disabled
                                                                type="text"
                                                                className={`border bg-gray-100 rounded px-2 py-1 w-full ${numberHourErr ? 'border border-red-300 bg-red-100' : ''}`}
                                                                placeholder={t('overtime.list.number_hour')}
                                                            />
                                                        </td>
                                                        <td className="px-2 py-2 flex">
                                                            <input
                                                                type="text"
                                                                {...control.register(`userOverTime.${index}.note`)}
                                                                className="border rounded px-2 py-1 w-full"
                                                                placeholder={t('overtime.list.note')}
                                                            />
                                                            {
                                                                fields.length > 1 && 
                                                                <button
                                                                    type="button"
                                                                    onClick={() => remove(index)}
                                                                    className="bg-red-500 text-white rounded ml-1 p-2 hover:bg-red-600 transition hover:cursor-pointer"
                                                                    title={t("delete")}
                                                                >
                                                                    <Trash2 size={15} />
                                                                </button>
                                                            }
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}