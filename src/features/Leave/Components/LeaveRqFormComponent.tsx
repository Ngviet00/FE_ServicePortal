/* eslint-disable @typescript-eslint/no-explicit-any */
import DateTimePicker from "@/components/ComponentCustom/Flatpickr";
import DotRequireComponent from "@/components/DotRequireComponent";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/store/authStore";
import { z } from "zod";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getErrorMessage, ShowToast, TIME_LEAVE } from "@/lib";
import leaveRequestApi from "@/api/leaveRequestApi";
import FullscreenLoader from "@/components/FullscreenLoader";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";

interface ILeaveRqFormProps {
    mode: 'create' | 'edit' | 'view' | 'approval' | 'hr',
    formData?: any,
    onSubmit?: (data: any) => void,
    typeLeaves?: { id: number, name: string, nameE: string , code: string}[],
    isPending?: boolean
}

const LeaveRqFormComponent: React.FC<ILeaveRqFormProps> = ({ mode, onSubmit, typeLeaves, formData, isPending }) => {
    const user = useAuthStore((state) => state.user)
    const lastUserCodesRef = useRef<Record<number, string>>({})
    const [isSearchingUser, setIsSearchingUser] = useState(false)
    const { t } = useTranslation('createLeaveOther')
    const { t: tCommon  } = useTranslation('common')
    const lang = useTranslation().i18n.language.split('-')[0]

    const isCreate = mode == 'create'
    const isEdit = mode == 'edit'

    const leaveRequestSchema = z.object({
        id: z.string().nullable().optional(),
        user_code: z.string().nonempty({ message: "Bắt buộc." }),
        user_code_register: z.string().nonempty({ message: "Bắt buộc." }),
        name: z.string().nonempty({ message: "Bắt buộc." }),
        department: z.string().nonempty({ message: "Bắt buộc." }),
        departmentId: z.number({ invalid_type_error: "Must be a number" }),
        position: z.string().nonempty({ message: "Bắt buộc." }),
        from_date: z.string().nonempty({ message: "Bắt buộc." }),
        to_date: z.string().nonempty({ message: "Bắt buộc." }),
        type_leave: z.string().nonempty({ message: "Bắt buộc." }),
        time_leave: z.string().nonempty({ message: "Bắt buộc." }),
        reason: z.string().nonempty({ message: "Bắt buộc." }),
    }).refine((data) => {
        const fromDate = new Date(data.from_date);
        const toDate = new Date(data.to_date);
        return toDate >= fromDate;
    }, {
        message: "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.",
        path: ["from_date"],
    });
     
    const leaveSchema = z.object({
        leaveRequests: z.array(leaveRequestSchema)
    });
    
    type LeaveForm = z.infer<typeof leaveSchema>;

    const defaultSingleLeaveRequest = useMemo(() => {
        return {
            id: formData?.id ?? null,
            user_code: formData?.applicationForm?.userCodeRequestor ?? "",
            user_code_register: user?.userCode ?? "",
            name: formData?.applicationForm?.userNameRequestor ?? '',
            department: formData?.orgUnit?.name ?? '',
            departmentId: formData?.orgUnit?.id ?? -1,
            position: formData?.position ?? '',
            from_date: formData?.fromDate ?? `${new Date().toISOString().slice(0, 10)} 08:00`,
            to_date: formData?.toDate ?? `${new Date().toISOString().slice(0, 10)} 17:00`,
            type_leave: formData?.typeLeave?.id,
            time_leave: formData?.timeLeave?.id,
            reason: formData?.reason,
        };
    }, [formData, user?.userCode]);

    const form = useForm<LeaveForm>({
        resolver: zodResolver(leaveSchema),
        defaultValues: {
            leaveRequests: [{ ...defaultSingleLeaveRequest, user_code_register: user?.userCode ?? "" }],
        },
    });

    const { control, handleSubmit, setValue, getValues, reset } = form;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "leaveRequests",
    });

    const handleSubmitForm = (data: any) => {
        if (onSubmit) {
            onSubmit(data);
        }
    };

    const handleFindUser = async (userCode: string, index: number) => {
        const lastCode = lastUserCodesRef.current[index];

        if (userCode === lastCode) return;

        lastUserCodesRef.current[index] = userCode;

        if (!userCode.trim()) {
            setValue(`leaveRequests.${index}.name`, "")
            setValue(`leaveRequests.${index}.department`, "")
            setValue(`leaveRequests.${index}.position`, "")
            setValue(`leaveRequests.${index}.type_leave`, "")
            setValue(`leaveRequests.${index}.time_leave`, "")
            setValue(`leaveRequests.${index}.reason`, "")
            setValue(`leaveRequests.${index}.departmentId`, -1)
            setValue(`leaveRequests.${index}.from_date`, `${new Date().toISOString().slice(0, 10)} 08:00`, { shouldValidate: true })
            setValue(`leaveRequests.${index}.to_date`, `${new Date().toISOString().slice(0, 10)} 17:00`, { shouldValidate: true })

            return;
        }

        try {
            setIsSearchingUser(true)
            // await new Promise(resolve => setTimeout(resolve, 200));
            const fetchData = await leaveRequestApi.SearchUserRegisterLeaveRequest({
                userCodeRegister: user?.userCode ?? "",
                usercode: userCode
            });
            const result = fetchData?.data?.data
            setValue(`leaveRequests.${index}.name`, result?.NVHoTen, { shouldValidate: true });
            setValue(`leaveRequests.${index}.department`, result?.DepartmentName, { shouldValidate: true });
            setValue(`leaveRequests.${index}.departmentId`, result?.DepartmentId, { shouldValidate: true });
            setValue(`leaveRequests.${index}.position`, result?.Position ?? '', { shouldValidate: true });
        }
        catch (err) {
            ShowToast(getErrorMessage(err), "error")
            setValue(`leaveRequests.${index}.name`, "")
            setValue(`leaveRequests.${index}.department`, "")
            setValue(`leaveRequests.${index}.position`, "")
            setValue(`leaveRequests.${index}.type_leave`, "")
            setValue(`leaveRequests.${index}.time_leave`, "")
            setValue(`leaveRequests.${index}.reason`, "")
            setValue(`leaveRequests.${index}.departmentId`, -1)
            setValue(`leaveRequests.${index}.from_date`, `${new Date().toISOString().slice(0, 10)} 08:00`, { shouldValidate: true })
            setValue(`leaveRequests.${index}.to_date`, `${new Date().toISOString().slice(0, 10)} 17:00`, { shouldValidate: true })
        }
        finally {
            setIsSearchingUser(false)
        }
    };

    useEffect(() => {
        if (mode == 'create') {
            reset({
                leaveRequests: [
                    {
                        ...defaultSingleLeaveRequest,
                        user_code: "",
                        user_code_register: user?.userCode ?? "",
                        name: "",
                        department: "",
                        departmentId: -1,
                        position: "",
                        from_date: `${new Date().toISOString().slice(0, 10)} 08:00`,
                        to_date: `${new Date().toISOString().slice(0, 10)} 17:00`,
                        type_leave: "",
                        time_leave: "",
                        reason: "",
                    },
                ],
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode]);

    useEffect(() => {
        if (isEdit && formData && formData.length > 0) {
            const mappedLeaveRequests = formData.map((item: any) => ({
                id: item.id.toString(),
                user_code: item.userCode ?? "",
                user_code_register: user?.userCode ?? "",
                name: item.userName ?? "",
                department: item.orgUnit?.name ?? "",
                departmentId: item.departmentId ?? -1,
                position: item.position ?? "",
                from_date: item.fromDate ? item.fromDate.replace('T', ' ').slice(0,16) : `${new Date().toISOString().slice(0, 10)} 08:00`,
                to_date: item.toDate ? item.toDate.replace('T', ' ').slice(0,16) : `${new Date().toISOString().slice(0, 10)} 17:00`,
                type_leave: item.typeLeaveId?.toString() ?? "",
                time_leave: item.timeLeaveId?.toString() ?? "",
                reason: item.reason ?? "",
                isEditable: false,
            }));

            reset({ leaveRequests: mappedLeaveRequests });
        }
        else if (isCreate && !formData) {
            reset({
                leaveRequests: [{
                    ...defaultSingleLeaveRequest,
                    user_code_register: user?.userCode ?? "",
                }],
            });
        }
    }, [defaultSingleLeaveRequest, formData, isCreate, isEdit, reset, user?.userCode]);
    
    return (
        <form 
            onSubmit={handleSubmit(handleSubmitForm)}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                }
            }}
        >
            {isSearchingUser && <FullscreenLoader />}

            <div className="my-1 hidden items-center md:flex">
                <button type="button" onClick={() => append({ ...defaultSingleLeaveRequest, user_code_register: user?.userCode ?? "", id: null})} className="my-1 px-4 py-2 mb-1 cursor-pointer bg-blue-600 text-white text-sm rounded hover:bg-blue-600">
                    {lang == 'vi' ? 'Thêm' : 'Add'}
                </button>

                <button type="submit" disabled={isPending} className="ml-2 px-4 py-2 bg-green-500 text-white cursor-pointer text-sm rounded hover:bg-green-600">
                    {isPending ? <Spinner size="small" className="text-white" /> : mode == 'create' ? (lang == 'vi' ? 'Đăng ký' : 'Register') : (lang == 'vi' ? 'Cập nhật' : 'Update')}
                </button>
            </div>

            <div className="space-y-3 border border-gray-200 rounded-lg p-3 bg-white">
                {fields.map((field, index) => {
                    const errors = form.formState.errors.leaveRequests?.[index];
                    const isNewRow = !getValues(`leaveRequests.${index}.id`);

                    return (
                        <div key={field.id} className="bg-white mb-1">
                            {isCreate && (
                                <h2 className="font-bold text-xl text-red-600 dark:text-white mb-1 block xl:hidden">
                                    {`#` + (index + 1)}
                                </h2>
                            )}
                            <div className="mb-1 grid grid-cols-2 sm:grid-cols-4 lg:flex lg:flex-wrap gap-3 items-start">
                                <div className="flex flex-col w-full sm:w-full lg:max-w-[120px]">
                                    <label className={`block mb-1 text-sm font-medium ${index !== 0 ? "xl:hidden" : ""} `}>
                                        {t("usercode")} <DotRequireComponent />
                                    </label>
                                    <input
                                        disabled={!isNewRow}
                                        {...control.register(`leaveRequests.${index}.user_code`)}
                                        placeholder={t("usercode")}
                                        className={`p-2 border rounded text-sm w-full ${
                                            errors?.user_code
                                            ? "border-red-500 bg-red-50"
                                            : "border-gray-300"
                                        } ${!(isCreate || isNewRow) ? "bg-gray-100" : ""}`}
                                        onBlur={() =>
                                            handleFindUser(getValues(`leaveRequests.${index}.user_code`), index)
                                        }
                                    />
                                </div>

                                <div className="flex flex-col w-full sm:w-full lg:max-w-[160px]">
                                    <label className={`block mb-1 text-sm font-medium ${index !== 0 ? "xl:hidden" : ""} `}>
                                        {t("name")} <DotRequireComponent />
                                    </label>
                                    <input
                                        {...control.register(`leaveRequests.${index}.name`)}
                                        disabled
                                        placeholder={t("name")}
                                        className={`dark:bg-[#454545] p-2 text-sm border rounded border-gray-300 bg-gray-100 w-full ${errors?.name ? 'border-red-500 bg-red-50' : 'border-gray-300' }`}
                                    />
                                </div>

                                <div className="flex flex-col w-full sm:w-full lg:max-w-[150px]">
                                    <label className={`block mb-1 text-sm font-medium ${index !== 0 ? "xl:hidden" : ""} `}>
                                        {t("department")} <DotRequireComponent />
                                    </label>
                                    <input
                                        {...control.register(`leaveRequests.${index}.department`)}
                                        disabled
                                        placeholder={t("department")}
                                        className={`dark:bg-[#454545] p-2 text-sm border rounded border-gray-300 bg-gray-100 w-full ${errors?.department ? 'border-red-500 bg-red-50' : 'border-gray-300' }`}
                                    />
                                </div>

                                <div className="flex flex-col w-full sm:w-full lg:max-w-[150px]">
                                    <label className={`block mb-1 text-sm font-medium ${index !== 0 ? "xl:hidden" : ""} `}>
                                        {t("position")} <DotRequireComponent />
                                    </label>
                                    <input
                                        disabled={!isCreate && !isEdit}
                                        {...control.register(`leaveRequests.${index}.position`)}
                                        placeholder={t("position")}
                                        className={`p-2 text-sm border rounded w-full ${
                                            errors?.position
                                            ? "border-red-500 bg-red-50"
                                            : "border-gray-300"
                                        } ${!isCreate && !isEdit ? "bg-gray-100" : ""}`}
                                    />
                                </div>

                                <div className="flex flex-col w-full sm:w-full lg:max-w-[185px]">
                                    <label className={`block mb-1 text-sm font-medium ${index !== 0 ? "xl:hidden" : ""} `}>
                                        {t("type_leave")} <DotRequireComponent />
                                    </label>
                                    <select
                                        disabled={!isCreate && !isEdit}
                                        {...control.register(`leaveRequests.${index}.type_leave`)}
                                        className={`p-2 text-sm border rounded hover:cursor-pointer w-full ${
                                            errors?.type_leave
                                            ? "border-red-500 bg-red-50"
                                            : "border-gray-300"
                                        } ${!isCreate && !isEdit ? "bg-gray-100" : ""}`}
                                    >
                                    <option value="">{t("choose")}</option>
                                        {typeLeaves?.map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {lang == "vi" ? t(item.name) : t(item.nameE)}_{item.code}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col w-full sm:w-full lg:max-w-[110px]">
                                    <label className={`block mb-1 text-sm font-medium ${index !== 0 ? "xl:hidden" : ""} `}>
                                        {t("time_leave")} <DotRequireComponent />
                                    </label>
                                    <select
                                        disabled={!isCreate && !isEdit}
                                        {...control.register(`leaveRequests.${index}.time_leave`)}
                                        className={`p-2 text-sm border rounded hover:cursor-pointer w-full ${
                                            errors?.time_leave
                                            ? "border-red-500 bg-red-50"
                                            : "border-gray-300"
                                        } ${!isCreate && !isEdit ? "bg-gray-100" : ""}`}
                                    >
                                    <option value="">{t("choose")}</option>
                                        {TIME_LEAVE.map((item) => (
                                            <option key={item.value} value={item.value}>
                                            {tCommon(item.label)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col w-full sm:w-full lg:max-w-[130px]">
                                    <label className={`block mb-1 text-sm font-medium ${index !== 0 ? "xl:hidden" : ""} `}>
                                        {t("from_date")} <DotRequireComponent />
                                    </label>
                                    <DateTimePicker
                                        disabled={!isCreate && !isEdit}
                                        enableTime={true}
                                        dateFormat="Y-m-d H:i"
                                        initialDateTime={getValues(`leaveRequests.${index}.from_date`)}
                                        onChange={(_selectedDates, dateStr) =>
                                            setValue(`leaveRequests.${index}.from_date`, dateStr)
                                        }
                                        className={`dark:bg-[#454545] text-sm border rounded border-gray-300 p-2 w-full`}
                                    />
                                </div>

                                <div className="flex flex-col w-full sm:w-full lg:max-w-[130px]">
                                    <label className={`block mb-1 text-sm font-medium ${index !== 0 ? "xl:hidden" : ""} `}>
                                        {t("to_date")} <DotRequireComponent />
                                    </label>
                                    <DateTimePicker
                                        disabled={!isCreate && !isEdit}
                                        enableTime={true}
                                        dateFormat="Y-m-d H:i"
                                        initialDateTime={getValues(`leaveRequests.${index}.to_date`)}
                                        onChange={(_selectedDates, dateStr) =>
                                            setValue(`leaveRequests.${index}.to_date`, dateStr)
                                        }
                                        className={`dark:bg-[#454545] text-sm border rounded border-gray-300 p-2 w-full`}
                                    />
                                </div>

                                <div className=" flex items-end gap-2 flex-1 sm:col-span-4 col-span-2 min-w-[200px]">
                                    <div className="flex-1">
                                        <label className={`block mb-1 text-sm font-medium ${index !== 0 ? "xl:hidden" : ""} `}>
                                            {t("reason")} <DotRequireComponent />
                                        </label>
                                        <input
                                            disabled={!isCreate && !isEdit}
                                            {...control.register(`leaveRequests.${index}.reason`)}
                                            placeholder={t("reason")}
                                            className={`p-2 text-sm border rounded w-full ${
                                            errors?.reason
                                                ? "border-red-500 bg-red-50"
                                                : "border-gray-300"
                                            } ${!isCreate && !isEdit ? "bg-gray-100" : ""}`}
                                        />
                                    </div>

                                    {(isCreate || isEdit) && fields.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="bg-red-500 text-white rounded p-2 hover:bg-red-600 transition hover:cursor-pointer"
                                            title={t("delete")}
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="my-1 items-center md:hidden justify-end text-right">
                <button type="button" onClick={() => append({ ...defaultSingleLeaveRequest, user_code_register: user?.userCode ?? "", id: null})} className="my-1 px-4 py-2 mb-1 cursor-pointer bg-blue-600 text-white text-sm rounded hover:bg-blue-600">
                    {lang == 'vi' ? 'Thêm' : 'Add'}
                </button>

                <button type="submit" disabled={isPending} className="ml-2 px-4 py-2 bg-green-500 text-white cursor-pointer text-sm rounded hover:bg-green-600">
                    {isPending ? <Spinner size="small" className="text-white" /> : mode == 'create' ? (lang == 'vi' ? 'Đăng ký' : 'Register') : (lang == 'vi' ? 'Cập nhật' : 'Update')}
                </button>
            </div>
        </form>
    )
}

export default LeaveRqFormComponent;