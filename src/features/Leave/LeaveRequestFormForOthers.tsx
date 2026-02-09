/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getErrorMessage, ShowToast, TIME_LEAVE } from "@/lib";
import { useAuthStore } from "@/store/authStore";
import leaveRequestApi, { useCreateLeaveRequest, useUpdateLeaveRq } from "@/api/leaveRequestApi";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import typeLeaveApi, { ITypeLeave } from "@/api/typeLeaveApi";
import { Checkbox } from "@/components/ui/checkbox";
import userConfigApi from "@/api/userConfigApi";
import FullscreenLoader from "@/components/FullscreenLoader";
import { z } from "zod";
import * as XLSX from 'xlsx';
import { Controller, SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DotRequireComponent from "@/components/DotRequireComponent";
import DateTimePicker from "@/components/ComponentCustom/Flatpickr";
import { Trash2, X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export const userLeaveRequestSchema = z.object({
    id: z.number().nullable().optional(),
    userCode: z.string().nonempty({ message: "Bắt buộc." }),
    userName: z.string().nonempty({ message: "Bắt buộc." }),
    department: z.string().nonempty({ message: "Bắt buộc." }),
    departmentId: z.number({ invalid_type_error: "Must be a number" }),
    position: z.string().nonempty({ message: "Bắt buộc." }),
    fromDate: z.string().nonempty({ message: "Bắt buộc." }),
    toDate: z.string().nonempty({ message: "Bắt buộc." }),
    dateJoinCompany: z.string().nonempty({ message: "Bắt buộc." }),
    typeLeave: z.string().nonempty({ message: "Bắt buộc." }),
    timeLeave: z.string().nonempty({ message: "Bắt buộc." }),
    reason: z.string().nonempty({ message: "Bắt buộc." }),
    images: z.array(z.instanceof(File)).optional(),
    isUrgent: z.boolean().optional(),
    existingImgs: z
        .array(
            z.object({
                id: z.number(),
                fileName: z.string().nullable().optional(),
                contentType: z.string().nullable().optional(),
                createdAt: z.string().optional(),
            })
        )
        .optional().nullable()
})
export const leaveSchema = z.object({
    userLeaveRequest: z.array(userLeaveRequestSchema)
})
export type LeaveRequestForm = z.infer<typeof leaveSchema>;

export default function LeaveRequestFormForOthers() {
    const { t } = useTranslation('createLeaveOther')
    const { t: tCommon  } = useTranslation('common')
    const lang = useTranslation().i18n.language.split('-')[0]
    const user = useAuthStore((state) => state.user)
    const navigate = useNavigate();
    const createLeaveRequest = useCreateLeaveRequest()
    const updateLeaveRequest = useUpdateLeaveRq()
    const [checkReceiveEmail, setCheckReceiveEmail] = useState(false)
    const [selfRegister, setSelfRegister] = useState(false)
    const lastUserCodesRef = useRef<Record<number, string>>({})
    const [isSearchingUser, setIsSearchingUser] = useState(false)
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;
    
    const { data: formData, isLoading: isFormDataLoading } = useQuery({
        queryKey: ['leaveRequestForm', id],
        queryFn: async () => {
            const res = await leaveRequestApi.getLeaveByAppliationFormCode(id ?? '');
            return res.data.data;
        },
        enabled: isEdit,
    });

    const today = new Date();
    const formatDate = (date: Date) => date.toISOString().split("T")[0];
    const todayStr = formatDate(today);

    // 3 ngày tiếp theo (cho phép AL)
    const next3DaysDate = new Date(today);
    next3DaysDate.setDate(today.getDate() + 3);
    const next3DaysStr = formatDate(next3DaysDate);

    const normalMinDate = (() => {
        const d = new Date(today);
        d.setDate(d.getDate() + 3);
        return d.toLocaleDateString('sv-SE')
    })();

    const form = useForm<LeaveRequestForm>({
        resolver: zodResolver(leaveSchema),
        defaultValues: {
            userLeaveRequest: [
                {
                    userCode: user?.userCode ?? '',
                    userName: user?.userName ?? '',
                    department: user?.departmentName ?? '',
                    departmentId: user?.departmentId ?? -1,
                    position: user?.unitNameV,
                    fromDate: `${normalMinDate} 08:00`,
                    toDate: `${normalMinDate} 17:00`,
                    dateJoinCompany: user?.dateJoinCompany ?? new Date().toISOString().split("T")[0],
                    typeLeave: '',
                    timeLeave: '',
                    reason: '',
                    images: [],
                    isUrgent: false
                }
            ]
        },
    });

    const { control, watch, handleSubmit,  setValue, getValues, reset, formState: { errors } } = form;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "userLeaveRequest",
    });

    const watchedRequests = watch("userLeaveRequest");

    const handleAddRow = () => {
        append({
            userCode: '',
            userName: '',
            department: '',
            departmentId: -1,
            position: '',
            fromDate: `${normalMinDate} 08:00`,
            toDate: `${normalMinDate} 17:00`,
            dateJoinCompany: new Date().toISOString().split("T")[0],
            typeLeave: '',
            timeLeave: '',
            reason: '',
            images: [],
            isUrgent: false
        })
    };

    const handleCheckSeftRegister = (value: boolean) => {
        setSelfRegister(value)
        if (!value) {
            reset({
                userLeaveRequest: [
                    {
                        userCode: user?.userCode ?? '',
                        userName: user?.userName ?? '',
                        department: user?.departmentName ?? '',
                        departmentId: user?.departmentId ?? -1,
                        position: user?.unitNameV,
                        fromDate: `${new Date().toISOString().slice(0, 10)} 08:00`,
                        toDate: `${new Date().toISOString().slice(0, 10)} 17:00`,
                        dateJoinCompany: user?.dateJoinCompany ?? new Date().toISOString().split("T")[0],
                        typeLeave: '',
                        timeLeave: '',
                        reason: '',
                        images: [],
                        isUrgent: false
                    }
                ]
            })
            lastUserCodesRef.current = {};
        }
    }

    const handleFindUser = async (userCode: string, index: number) => {
        userCode = userCode.trim();
        if (!userCode) {
            setValue(`userLeaveRequest.${index}.userCode`, "");
            setValue(`userLeaveRequest.${index}.userName`, "");
            setValue(`userLeaveRequest.${index}.department`, "", {shouldValidate: true});
            setValue(`userLeaveRequest.${index}.departmentId`, -1, {shouldValidate: true});
            setValue(`userLeaveRequest.${index}.position`, "");
            setValue(`userLeaveRequest.${index}.dateJoinCompany`, "");
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
            setValue(`userLeaveRequest.${index}.userName`, result?.userName ?? "", {shouldValidate: true});
            setValue(`userLeaveRequest.${index}.department`, result?.departmentName ?? "", {shouldValidate: true});
            setValue(`userLeaveRequest.${index}.departmentId`, result?.departmentId ?? -1, {shouldValidate: true});
            setValue(`userLeaveRequest.${index}.position`, result?.positionV ?? "", {shouldValidate: true});
            setValue(`userLeaveRequest.${index}.dateJoinCompany`, result?.entryDate ?? '', {shouldValidate: true});
        } catch (err) {
            ShowToast(getErrorMessage(err), "error");
            setValue(`userLeaveRequest.${index}.userName`, '', {shouldValidate: true});
            setValue(`userLeaveRequest.${index}.department`, '', {shouldValidate: true});
            setValue(`userLeaveRequest.${index}.departmentId`, -1, {shouldValidate: true});
            setValue(`userLeaveRequest.${index}.position`, '', {shouldValidate: true});
            setValue(`userLeaveRequest.${index}.dateJoinCompany`, '', {shouldValidate: true});
        } finally {
            setIsSearchingUser(false);
        }
    }

    const { data: typeLeaves } = useQuery<ITypeLeave[], Error>({
        queryKey: ['get-all-type-leave'],
        queryFn: async () => {
            const res = await typeLeaveApi.getAll({});
            return res.data.data;
        },
        select: (data) => data.filter(item => item.typeGroup === 'USER')
    });

    const { data: receiveEmail } = useQuery({
        queryKey: ['get-email-by-usercode-and-key'],
        queryFn: async () => {
            const res = await userConfigApi.getConfigByUsercodeAndkey({ userCode: user?.userCode, key: "RECEIVE_MAIL_LEAVE_REQUEST" });
            return res.data.data;
        },
        enabled: false// mode == 'create'
    });

    useEffect(() => {
        if (receiveEmail) {
            setCheckReceiveEmail(receiveEmail.value == "true")
        } else {
            setCheckReceiveEmail(true); 
        }
    }, [receiveEmail])
    
    const handleCheckChange = async (checked: boolean) => {
        try {
            await userConfigApi.saveOrUpdate({
                userCode: user?.userCode,
                key: "RECEIVE_MAIL_LEAVE_REQUEST",
                value: checked ? "true" : "false",
            });
            setCheckReceiveEmail(checked)
            ShowToast(lang == 'vi' ? "Cập nhật thành công" : "Success")
        } catch (error) {
            ShowToast(getErrorMessage(error), "error")
        }
    }

    const isRowEmpty = (row: any[], colCount = 9) => {
        if (!row) return true;
        for (let i = 0; i < colCount; i++) {
            const cell = row[i];
            if (cell !== undefined && cell !== null && String(cell).trim() !== "") {
                return false; 
            }
        }
        return true;
    };

    const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, {
            header: 1,
            raw: false
        });
        const imported: any[] = [];
        for (let i = 2; i < rows.length; i++) {
            const r = rows[i];
            if (isRowEmpty(r, 9)) break;
            const [
                userCode,
                userName,  
                department,    
                position,      
                leaveType,   
                leaveTime,    
                fromDate,    
                toDate,     
                reason      
            ] = r;

            const timeLeaveId = leaveTime == 'CN' ? '1' : leaveTime == 'S' ? '2' : '3'
            const typeLeave = typeLeaves?.find(e => e.code == leaveType);

            imported.push({
                userCode: userCode?.trim() ?? "",
                userName: userName?.trim() ?? "",
                department: department?.trim() ?? "",
                position: position?.trim() ?? "",
                typeLeave: typeLeave?.id ?? '',
                timeLeave: timeLeaveId ?? '',
                fromDate: fromDate?.trim() ?? "",
                toDate: toDate?.trim() ?? "",
                reason: reason?.trim() ?? "",
            });
        }
        if (imported.length === 0) {
            ShowToast("Không có dữ liệu để import", "error");
            return;
        }
        reset({
            ...getValues(),    
            userLeaveRequest: imported     
        });
        ShowToast(`Import thành công ${imported.length} dòng`, "success");
    };

    const onSubmit: SubmitHandler<LeaveRequestForm> = async (data) => {
        const fd = new FormData()
        fd.append('OrgPositionIdUserCreatedForm', String(user?.orgPositionId ?? ''))
        fd.append('UserCodeCreatedForm', user?.userCode ?? '')
        fd.append('UserNameCreatedForm', user?.userName ?? '')
        fd.append('DepartmentIdUserCreatedForm', String(user?.departmentId ?? '-1'))
        data?.userLeaveRequest?.forEach((item, index) => {
            fd.append(`CreateListLeaveRequests[${index}].Id`, String(item?.id ?? ''));
            fd.append(`CreateListLeaveRequests[${index}].UserCode`, item?.userCode);
            fd.append(`CreateListLeaveRequests[${index}].UserName`, item?.userName);
            fd.append(`CreateListLeaveRequests[${index}].DepartmentId`, String(item?.departmentId ?? -1));
            fd.append(`CreateListLeaveRequests[${index}].Position`, item?.position);
            fd.append(`CreateListLeaveRequests[${index}].FromDate`, item?.fromDate);
            fd.append(`CreateListLeaveRequests[${index}].ToDate`, item?.toDate);
            fd.append(`CreateListLeaveRequests[${index}].DateJoinCompany`, item?.dateJoinCompany);
            fd.append(`CreateListLeaveRequests[${index}].TypeLeaveId`, item?.typeLeave);
            fd.append(`CreateListLeaveRequests[${index}].TimeLeaveId`, item?.timeLeave);
            fd.append(`CreateListLeaveRequests[${index}].Reason`, item?.reason);
            fd.append(`CreateListLeaveRequests[${index}].IsUrgent`, String(item?.isUrgent));

            item.existingImgs?.forEach((img, i) => {
                fd.append(
                    `CreateListLeaveRequests[${index}].ExistingImgIds[${i}]`,
                    img?.id?.toString()
                );
            });

            item?.images?.forEach(file => {
                fd.append(`CreateListLeaveRequests[${index}].Images`, file);
            });
        });

        if (isEdit) {
            await updateLeaveRequest.mutateAsync({id: id, data: fd})
        } else {
            await createLeaveRequest.mutateAsync(fd);
        }

        navigate("/leave/leave-registered");
    }

    useEffect(() => {
        if (formData) {
            const userLeaveRequest = (formData.leaveRequests ?? []).map(
                (e: any) => ({
                    id: e?.id ?? null,
                    userCode: e?.userCode ?? '',
                    userName: e?.userName ?? '',
                    department: e?.departmentName ?? '',
                    departmentId: e?.departmentId ?? -1,
                    position: e?.position ?? '',
                    fromDate: e?.fromDate?.replace('T', ' ').slice(0,16) ?? `${new Date().toISOString().slice(0, 10)} 08:00`,
                    toDate: e?.toDate?.replace('T', ' ').slice(0,16) ?? `${new Date().toISOString().slice(0, 10)} 17:00`,
                    dateJoinCompany: e?.dateJoinCompany,
                    typeLeave: e?.typeLeaveId?.toString(),
                    timeLeave: e?.timeLeaveId?.toString(),
                    reason: e?.reason,
                    isUrgent: e?.isUrgent,
                    existingImgs: e?.files ?? []
                })
            );
            reset({
                userLeaveRequest
            })
        }        
    }, [formData, reset])

    useEffect(() => {
        if (!isEdit) {
            reset({
                userLeaveRequest: [
                    {
                        userCode: user?.userCode ?? '',
                        userName: user?.userName ?? '',
                        department: user?.departmentName ?? '',
                        departmentId: user?.departmentId ?? -1,
                        position: user?.unitNameV,
                        fromDate: `${normalMinDate} 08:00`,
                        toDate: `${normalMinDate} 17:00`,
                        dateJoinCompany: user?.dateJoinCompany ?? new Date().toISOString().split("T")[0],
                        typeLeave: '',
                        timeLeave: '',
                        reason: '',
                        images: [],
                        isUrgent: false
                    }
                ]
            });

            lastUserCodesRef.current = {};
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEdit]);

    if (isEdit && isFormDataLoading) {
        return <div>{lang == 'vi' ? 'Loading' : 'Đang tải'}...</div>;
    }

    if (isEdit && !formData) {
        return  <div className='text-red-700 font-semibold'>{lang == 'vi' ? 'Không tìm thấy dữ liệu' : 'Not found data'}</div>;
    }

    return (
        <div className="p-1 space-y-6 leave-request-form">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-3">
                <div className="flex flex-col gap-2 w-full md:w-auto"> 
                    <div className="flex flex-wrap items-center">
                        <h3 className="font-bold text-xl md:text-2xl mr-4">
                            <span>{ isEdit ? t('title_update') : t('sub_title') } </span>
                        </h3>
                        {
                            !isEdit && (
                                <div className="flex items-center mt-2 md:mt-0">
                                    <Checkbox
                                        checked={checkReceiveEmail}
                                        onCheckedChange={(checked) => handleCheckChange(!!checked)}
                                        id="receive-mail"
                                        className="w-5 h-5 md:w-6 md:h-6 hover:cursor-pointer"
                                    />
                                    <label
                                        htmlFor="receive-mail"
                                        className="ml-2 text-sm md:text-base font-medium leading-tight hover:cursor-pointer"
                                    >
                                        {lang == 'vi' ? 'Nhận thông báo qua email' : 'Receive notifications via email'}
                                    </label>
                                </div>
                            )
                        }
                    </div>
                </div>
                <div>
                    <Button onClick={() => navigate("/leave")} className="w-full md:w-auto hover:cursor-pointer mr-1 mb-1">{ lang == 'vi' ? 'Đơn nghỉ phép của tôi' : 'My Leave Requests'}</Button>
                    <Button onClick={() => navigate("/leave/leave-registered")} className="w-full md:w-auto hover:cursor-pointer"> { lang == 'vi' ? 'Danh sách đơn đã đăng ký' : 'Registered Leave Requests'}</Button>
                </div>
            </div>
            {
                !isEdit && (
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-1">
                        <div className="flex items-center">
                            <input id="cb_self_register" onChange={(e) => handleCheckSeftRegister(e.target.checked)} checked={selfRegister} type="checkbox"  className="h-5 w-5 accent-black cursor-pointer"/>
                            <label htmlFor="cb_self_register" className="select-none cursor-pointer ml-1">{lang == 'vi' ? 'Đăng ký nghỉ cho người khác' : 'Request leave for someone else'}</label>
                        </div>
                        <div className="lg:mt-0">
                            <div className="bg-red-400 p-2 text-sm text-white rounded-[3px] w-full lg:w-auto">
                                ** {
                                    lang == 'vi'
                                        ? 'Lưu ý: Người đăng ký chỉ được nhập dữ liệu cho bản thân hoặc các thành viên thuộc cùng tổ'
                                        : 'Note: Registrants are only allowed to enter data for themselves or for members of the same team'
                                }
                            </div>
                        </div>
                    </div>
                )
            }
            <form onSubmit={handleSubmit(onSubmit, (errors) => {console.log("Submit bị chặn vì lỗi:", errors)})}>
                {isSearchingUser && <FullscreenLoader />}
                <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className="mt-1 flex">
                        {
                            !isEdit && selfRegister && <button type="button" onClick={handleAddRow} className="px-4 py-2 mb-1 mr-1 cursor-pointer bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center justify-center">
                                {lang == 'vi' ? 'Thêm' : 'Add'}
                            </button>
                        }
                        {
                            isEdit ? (
                                <button type="submit" disabled={updateLeaveRequest.isPending}  className="px-4 py-2 mb-1 bg-green-500 text-white cursor-pointer text-sm rounded hover:bg-green-600 disabled:bg-gray-400 flex items-center justify-center">
                                    {updateLeaveRequest.isPending ? <Spinner/> : lang == 'vi' ? 'Cập nhật' : 'Update'}
                                </button>
                            ) : (
                                <button type="submit" disabled={createLeaveRequest.isPending} className="px-4 py-2 mb-1 bg-green-500 text-white cursor-pointer text-sm rounded hover:bg-green-600 disabled:bg-gray-400 flex items-center justify-center">
                                    {createLeaveRequest.isPending ? <Spinner/> : lang == 'vi' ? 'Lưu' : 'Save'}
                                </button>
                            )
                        }
                    </div>
                    {/* {
                        !isEdit && selfRegister && 
                        <div>
                            <span className="text-lg font-bold">{lang == 'vi' ? 'Nhập bằng excel' : 'Import excel'}: </span>
                            <label htmlFor="excel_leave_request_import" className="bg-blue-500 hover:bg-blue-600 py-2 px-2 text-sm text-white rounded-sm cursor-pointer">
                                {lang == 'vi' ? 'Chọn file excel' : 'Select file excel'}
                            </label>
                            <input
                                className="hidden"
                                id="excel_leave_request_import"
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleImportExcel}
                            />
                            <button 
                                type="button" 
                                onClick={() => handleDownloadTemplate(`/template_excel/template_nghi_phep_di_tre_ve_som.xlsx`)} 
                                className="bg-green-500 hover:bg-green-600 p-2 text-sm rounded-sm ml-2 text-white cursor-pointer"
                            >
                                {lang == 'vi' ? 'Tải file mẫu' : 'Download template'} 
                            </button>
                        </div>
                    } */}
                </div>
                <div className="text-red-400 italic under">
                    {lang == 'vi' ? 'Nghỉ phép năm và nghỉ bù không cần đính kèm ảnh' : 'Annual leave and compensatory leave do not require attach image'}
                </div>
                <div className="space-y-3 border border-gray-200 rounded-lg p-3 bg-white">
                    {fields.map((_field, index) => {
                        // const isDisabledUserCode = (!isEdit && !selfRegister);

                        // const currentTypeLeaveId = watch(`userLeaveRequest.${index}.typeLeave`);

                        // const urgent = watch(`userLeaveRequest.${index}.isUrgent`);
                        // const from = getValues(`userLeaveRequest.${index}.fromDate`);
                        // let minDate = ''
                        // if (!isEdit) { //create
                        //     minDate = urgent
                        //     ? (() => {
                        //         const d = new Date();
                        //         d.setDate(d.getDate() - 7);
                        //         return d.toLocaleDateString('sv-SE');
                        //     })()
                        //     : (() => {
                        //         const d = new Date();
                        //         d.setDate(d.getDate() + 3);
                        //         return d.toLocaleDateString('sv-SE');
                        //     })();
                        // } else { //edit
                        //     minDate = urgent ? (() => {
                        //         const d = new Date(from);
                        //         d.setDate(d.getDate() - 7);
                        //         return d.toLocaleDateString('sv-SE');
                        //     })() : from
                        // }
                        const isDisabledUserCode = (!isEdit && !selfRegister);
    
                        // Theo dõi loại phép để ẩn/hiện và tính ngày
                        const currentTypeLeaveId = watch(`userLeaveRequest.${index}.typeLeave`);
                        const selectedType = typeLeaves?.find(t => t.id.toString() === currentTypeLeaveId);
                        const isAL = selectedType?.code === 'AL' || selectedType?.code === 'W';

                        // Tính minDate: AL thì +3, còn lại là hôm nay
                        let minDate = '';
                        if (!isEdit) {
                            const d = new Date();
                            if (isAL) {
                                d.setDate(d.getDate() + 3);
                            }
                            minDate = d.toLocaleDateString('sv-SE');
                        } else {
                            // Chế độ Edit: giữ nguyên ngày cũ làm mốc min hoặc tùy logic dự án
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            minDate = getValues(`userLeaveRequest.${index}.fromDate`)?.split(' ')[0];
                        }

                        const userCodeErr = errors?.userLeaveRequest?.[index]?.userCode;
                        const userNameErr = errors?.userLeaveRequest?.[index]?.userName;
                        const departmentErr = errors?.userLeaveRequest?.[index]?.department;
                        const positionErr = errors?.userLeaveRequest?.[index]?.position;
                        // const typeLeaveErr = errors?.userLeaveRequest?.[index]?.typeLeave;
                        const timeLeaveErr = errors?.userLeaveRequest?.[index]?.timeLeave;
                        const reasonErr = errors?.userLeaveRequest?.[index]?.reason;

                        return (
                            <div key={index} className="bg-white mb-3">
                                <div className="mb-1 grid grid-cols-2 sm:grid-cols-4 lg:flex lg:flex-wrap gap-1 items-center">
                                    <h2 className="font-bold text-xl text-red-600 dark:text-white mb-1 block">
                                        {`#` + (index + 1)}
                                    </h2>
                                    <div className="flex flex-col w-full sm:w-full lg:max-w-[105px]">
                                        <label className={`block mb-1 text-sm font-medium ${index !== 0 ? "xl:hidden" : ""} `}>{t("usercode")} <DotRequireComponent /></label>
                                        <Controller
                                            control={control}
                                            name={`userLeaveRequest.${index}.userCode`}
                                            render={({ field }) => (
                                                <input
                                                    type="text"
                                                    disabled={isDisabledUserCode}
                                                    className={`border border-gray-300 rounded text-sm px-2 py-1 w-full h-[38px] ${isDisabledUserCode ? 'bg-gray-50' : ''} ${userCodeErr ? 'border border-red-300 bg-red-100' : ''}`}
                                                    placeholder={t("usercode")}
                                                    {...field}
                                                    {...control.register(`userLeaveRequest.${index}.userCode`, {
                                                        onBlur: (e) => handleFindUser(e.target.value, index)
                                                    })}
                                                />
                                            )}
                                        />
                                    </div>

                                    <div className="flex flex-col w-full sm:w-full lg:max-w-[160px]">
                                        <label className={`block mb-1 text-sm font-medium ${index !== 0 ? "xl:hidden" : ""} `}>
                                            {t("name")} <DotRequireComponent />
                                        </label>
                                        <input
                                            {...control.register(`userLeaveRequest.${index}.userName`)}
                                            disabled
                                            placeholder={t("name")}
                                            className={`dark:bg-[#454545] p-2 text-sm border rounded border-gray-300 bg-gray-50 w-full ${userNameErr ? 'border border-red-300 bg-red-100' : ''}`}
                                        />
                                    </div>

                                    <div className="flex flex-col w-full sm:w-full lg:max-w-[150px]">
                                        <label className={`block mb-1 text-sm font-medium ${index !== 0 ? "xl:hidden" : ""} `}>
                                            {t("department")} <DotRequireComponent />
                                        </label>
                                        <input
                                            {...control.register(`userLeaveRequest.${index}.department`)}
                                            disabled
                                            placeholder={t("department")}
                                            className={`dark:bg-[#454545] p-2 text-sm border rounded border-gray-300 bg-gray-50 w-full ${departmentErr ? 'border border-red-300 bg-red-100' : ''}`}
                                        />
                                    </div>

                                    <div className="flex flex-col w-full sm:w-full lg:max-w-[150px]">
                                        <label className={`block mb-1 text-sm font-medium ${index !== 0 ? "xl:hidden" : ""} `}>
                                            {t("position")} <DotRequireComponent />
                                        </label>
                                        <input
                                            {...control.register(`userLeaveRequest.${index}.position`)}
                                            placeholder={t("position")}
                                            className={`p-2 text-sm border rounded w-full ${positionErr ? 'border border-red-300 bg-red-100' : ''}`}
                                        />
                                    </div>

                                    {/* 1. Loại phép */}
                                    <div className="flex flex-col w-full sm:w-full lg:max-w-[260px]">
                                        <label className={`block mb-1 text-sm font-medium ${index !== 0 ? "xl:hidden" : ""} `}>
                                            {t("type_leave")} <DotRequireComponent />
                                        </label>
                                        <select
                                            {...control.register(`userLeaveRequest.${index}.typeLeave`)}
                                            onChange={(e) => {
                                                const selectedId = e.target.value;
                                                const selectedType = typeLeaves?.find(t => t.id.toString() === selectedId);
                                                
                                                // Logic: Nếu code là AL thì set +3 ngày, ngược lại set ngày hôm nay
                                                const baseDate = (selectedType?.code === 'AL' || selectedType?.code === 'W') ? next3DaysStr : todayStr;
                                                
                                                setValue(`userLeaveRequest.${index}.typeLeave`, selectedId);
                                                setValue(`userLeaveRequest.${index}.fromDate`, `${baseDate} 08:00`);
                                                setValue(`userLeaveRequest.${index}.toDate`, `${baseDate} 17:00`);
                                            }}
                                            className={`p-2 text-sm border rounded hover:cursor-pointer w-full ${errors.userLeaveRequest?.[index]?.typeLeave ? 'border-red-300 bg-red-100' : ''}`}
                                        >
                                            <option value="">{t("choose")}</option>
                                            {typeLeaves?.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {lang == "vi" ? item.name : item.nameE}_{item.code}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* <div className="flex flex-col w-full sm:w-full lg:max-w-[260px]">
                                        <label className={`block mb-1 text-sm font-medium ${index !== 0 ? "xl:hidden" : ""} `}>
                                            {t("type_leave")} <DotRequireComponent />
                                        </label>
                                        <select
                                            {...control.register(`userLeaveRequest.${index}.typeLeave`)}
                                            className={`p-2 text-sm border rounded hover:cursor-pointer w-full ${typeLeaveErr ? 'border border-red-300 bg-red-100' : ''}`}
                                        >
                                        <option value="">{t("choose")}</option>
                                            {typeLeaves?.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {lang == "vi" ? t(item.name) : t(item.nameE)}_{item.code}
                                                </option>
                                            ))}
                                        </select>
                                    </div> */}

                                    <div className="flex flex-col w-full sm:w-full lg:max-w-[110px]">
                                        <label className={`block mb-1 text-sm font-medium ${index !== 0 ? "xl:hidden" : ""} `}>
                                            {t("time_leave")} <DotRequireComponent />
                                        </label>
                                        <select
                                            {...control.register(`userLeaveRequest.${index}.timeLeave`)}
                                            className={`p-2 text-sm border rounded hover:cursor-pointer w-full ${timeLeaveErr ? 'border border-red-300 bg-red-100' : ''}`}
                                        >
                                        <option value="">{t("choose")}</option>
                                            {TIME_LEAVE.map((item) => (
                                                <option key={item.value} value={item.value}>
                                                {tCommon(item.label)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* <div className="flex flex-col w-full sm:w-full lg:max-w-[130px]">
                                        <label className={`block mb-1 text-sm font-medium ${index !== 0 ? "xl:hidden" : ""} `}>
                                            {t("from_date")} <DotRequireComponent />
                                        </label>
                                        <DateTimePicker
                                            enableTime={true}
                                            minDate={minDate}
                                            dateFormat="Y-m-d H:i"
                                            initialDateTime={getValues(`userLeaveRequest.${index}.fromDate`)}
                                            onChange={(_selectedDates, dateStr) =>
                                                setValue(`userLeaveRequest.${index}.fromDate`, dateStr)
                                            }
                                            className={`dark:bg-[#454545] text-sm border rounded border-gray-300 p-2 w-full`}
                                        />
                                    </div>

                                    <div className="flex flex-col w-full sm:w-full lg:max-w-[130px]">
                                        <label className={`block mb-1 text-sm font-medium ${index !== 0 ? "xl:hidden" : ""} `}>
                                            {t("to_date")} <DotRequireComponent />
                                        </label>
                                        <DateTimePicker
                                            enableTime={true}
                                            minDate={minDate}
                                            dateFormat="Y-m-d H:i"
                                            initialDateTime={getValues(`userLeaveRequest.${index}.toDate`)}
                                            onChange={(_selectedDates, dateStr) =>
                                                setValue(`userLeaveRequest.${index}.toDate`, dateStr)
                                            }
                                            className={`dark:bg-[#454545] text-sm border rounded border-gray-300 p-2 w-full`}
                                        />
                                    </div> */}

                                    {/* 2. From Date & To Date: Chỉ hiển thị khi đã chọn typeLeave */}
                                    {watchedRequests[index]?.typeLeave && (
                                        <>
                                            <div className="flex flex-col w-full sm:w-full lg:max-w-[135px]">
                                                <label className={`block mb-1 text-sm font-medium ${index !== 0 ? "xl:hidden" : ""} `}>
                                                    {t("from_date")} <DotRequireComponent />
                                                </label>
                                                <DateTimePicker
                                                    enableTime={true}
                                                    minDate={watchedRequests[index]?.typeLeave === typeLeaves?.find(t => t.code === 'AL' || t.code == 'W')?.id?.toString() ? next3DaysStr : todayStr}
                                                    dateFormat="Y-m-d H:i"
                                                    initialDateTime={getValues(`userLeaveRequest.${index}.fromDate`)}
                                                    onChange={(_selectedDates, dateStr) =>
                                                        setValue(`userLeaveRequest.${index}.fromDate`, dateStr)
                                                    }
                                                    className={`dark:bg-[#454545] text-sm border rounded border-gray-300 p-2 w-full`}
                                                />
                                            </div>

                                            <div className="flex flex-col w-full sm:w-full lg:max-w-[135px]">
                                                <label className={`block mb-1 text-sm font-medium ${index !== 0 ? "xl:hidden" : ""} `}>
                                                    {t("to_date")} <DotRequireComponent />
                                                </label>
                                                <DateTimePicker
                                                    enableTime={true}
                                                    minDate={getValues(`userLeaveRequest.${index}.fromDate`)}
                                                    dateFormat="Y-m-d H:i"
                                                    initialDateTime={getValues(`userLeaveRequest.${index}.toDate`)}
                                                    onChange={(_selectedDates, dateStr) =>
                                                        setValue(`userLeaveRequest.${index}.toDate`, dateStr)
                                                    }
                                                    className={`dark:bg-[#454545] text-sm border rounded border-gray-300 p-2 w-full`}
                                                />
                                            </div>
                                        </>
                                    )}
                                    
                                    <div className=" flex items-end gap-2 flex-1 sm:col-span-4 col-span-2 min-w-[200px]">
                                        <div className="flex-1">
                                            <label className={`block mb-1 text-sm font-medium ${index !== 0 ? "xl:hidden" : ""} `}>
                                                {t("reason")} <DotRequireComponent />
                                            </label>
                                            <input
                                                {...control.register(`userLeaveRequest.${index}.reason`)}
                                                placeholder={t("reason")}
                                                className={`p-2 text-sm border rounded w-full ${reasonErr ? 'border border-red-300 bg-red-100' : ''}`}
                                            />
                                        </div>

                                        {fields.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => {remove(index); lastUserCodesRef.current[index] = "";}}
                                                className="bg-red-500 text-white rounded p-2 hover:bg-red-600 transition hover:cursor-pointer"
                                                title={t("delete")}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="pl-9 mt-2 flex">
                                    {/* <div className="flex items-start">
                                        <input {...control.register(`userLeaveRequest.${index}.isUrgent`)} id={`lbl_check_urgent_${index}`} className="w-5 h-5 mr-1 accent-black" type="checkbox" />
                                        <label htmlFor={`lbl_check_urgent_${index}`} className="select-none cursor-pointer">{lang == 'vi' ? 'Yêu cầu khẩn cấp' : 'Urgent request'}</label>
                                    </div> */}
                                    <div className="">
                                        <Controller
                                            name={`userLeaveRequest.${index}.images` as const}
                                            control={control}
                                            render={({ field }) => {
                                                const imgs = field.value || [];
                                                const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                                                    const files = e.target.files;
                                                    if (!files) return;
                                                    field.onChange([...imgs, ...Array.from(files)]);
                                                };

                                                const handleRemoveFile = (i: number) => {
                                                    field.onChange(imgs.filter((_, j) => j !== i));
                                                };
                    
                                                return (
                                                    <div className="flex items-start">
                                                        <button
                                                            type="button"
                                                            className="btn bg-blue-500 p-1.5 rounded-sm text-sm text-white cursor-pointer hover:bg-blue-600 select-none shrink-0"
                                                            onClick={() =>
                                                            document.getElementById(`file-upload-${index}`)?.click()
                                                            }
                                                        >
                                                            {lang == 'vi' ? 'Chọn ảnh' : 'Select image'}
                                                        </button>

                                                        <input
                                                            id={`file-upload-${index}`}
                                                            type="file"
                                                            accept="image/*"
                                                            multiple
                                                            onChange={handleFileChange}
                                                            className="hidden"
                                                        />

                                                        <div className="ml-2 flex">
                                                            {(watch(`userLeaveRequest.${index}.existingImgs`) ?? []).map((f: any, i: number) => (
                                                                <div key={`server-${f.id}`} className="relative">
                                                                    <img
                                                                        src={`${import.meta.env.VITE_API_URL}/vote/get-file/${f.id}`}
                                                                        alt={f.fileName}
                                                                        className="w-17 h-17 object-cover rounded-md border cursor-pointer"
                                                                        onClick={() =>
                                                                            setPreviewImage(`${import.meta.env.VITE_API_URL}/vote/get-file/${f.id}`)
                                                                        }
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const cur = watch(`userLeaveRequest.${index}.existingImgs`) || [];
                                                                            setValue(
                                                                                `userLeaveRequest.${index}.existingImgs`,
                                                                                cur.filter((_: any, j: number) => j !== i)
                                                                            );
                                                                        }}
                                                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center cursor-pointer"
                                                                    >
                                                                        <X size={18} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            <div className="flex flex-wrap gap-2 ml-1">
                                                                {imgs.map((file: File, i: number) => {
                                                                    const url = URL.createObjectURL(file);
                                                                    return (
                                                                        <div key={i} className="relative">
                                                                            <img
                                                                                src={url}
                                                                                alt={file.name}
                                                                                className="w-17 h-17 object-cover rounded-md border cursor-pointer"
                                                                                onClick={() => setPreviewImage(url)}
                                                                            />
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleRemoveFile(i)}
                                                                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                                                                            >
                                                                                <X size={18} />
                                                                            </button>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div>
                    {previewImage && <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-999" onClick={() => setPreviewImage(null)}>
                        <img
                            src={previewImage}
                            alt="preview"
                            className="max-h-[90vh] max-w-[90vw] rounded-md shadow-lg"
                            />
                        </div>
                    }
                </div>
            </form>
        </div>
    );
}