/* eslint-disable @typescript-eslint/no-unused-vars */
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
            await new Promise(resolve => setTimeout(resolve, 200));
            const fetchData = await leaveRequestApi.SearchUserRegisterLeaveRequest({
                userCodeRegister: user?.userCode ?? "",
                usercode: userCode
            });
            const result = fetchData?.data?.data
            setValue(`leaveRequests.${index}.name`, result?.NVHoTen, { shouldValidate: true });
            setValue(`leaveRequests.${index}.department`, result?.DepartmentName, { shouldValidate: true });
            setValue(`leaveRequests.${index}.departmentId`, result?.DepartmentId);
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
        if (isEdit && formData) {
            const mappedLeaveRequests = formData.map((item: any) => ({
                id: item.id,
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
        else if (isCreate) {
            reset({
                leaveRequests: [{
                    ...defaultSingleLeaveRequest,
                    user_code_register: user?.userCode ?? "",
                }],
            });
        }
    }, [defaultSingleLeaveRequest, formData, isCreate, isEdit, reset, user?.userCode]);
    
    return (
        <form onSubmit={handleSubmit(handleSubmitForm)}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                }
            }}>
            {
                isSearchingUser && <FullscreenLoader />
            }
            {
                fields.map((field, index) => {
                    
                    const errors = form.formState.errors.leaveRequests?.[index];

                    const isNewRow = !getValues(`leaveRequests.${index}.id`);

                    return (
                        <div key={field.id} className="space-y-4">
                            {
                                isCreate && (<h2 className="font-bold text-xl text-red-600 dark:text-white mb-1">{`#` + (index + 1)}</h2>)
                            }
                            <div className="flex flex-wrap gap-4">
                                <div>
                                    <label htmlFor={`usercode-${index}`} className="block mb-1">{ t('usercode') } <DotRequireComponent /></label>
                                    <input
                                        disabled={!isNewRow}
                                        id={`usercode-${index}`}
                                        {...control.register(`leaveRequests.${index}.user_code`)}
                                        placeholder={ t('usercode') }
                                        className={`w-full p-2 border rounded text-sm ${errors?.user_code ? "border-red-500 bg-red-50" : ""} ${!(isCreate || isNewRow) ? 'bg-gray-100' : ''}`}
                                        onBlur={() => handleFindUser(getValues(`leaveRequests.${index}.user_code`), index)}
                                    />
                                    {errors?.user_code && (
                                        <p className="text-sm text-red-500 mt-1">{errors.user_code.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block mb-1">{ t('name') } <DotRequireComponent /></label>
                                    <input
                                        {...control.register(`leaveRequests.${index}.name`)}
                                        placeholder={ t('name') }
                                        className={`dark:bg-[#454545] w-full p-2 text-sm border rounded ${errors?.name ? "border-red-500 bg-red-50" : "border-gray-300 bg-gray-100"}`}
                                        disabled
                                    />
                                    {errors?.name && (
                                        <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block mb-1">{ t('department') } <DotRequireComponent /></label>
                                    <input
                                        {...control.register(`leaveRequests.${index}.department`)}
                                        placeholder={ t('department') }
                                        className={`dark:bg-[#454545] w-full p-2 text-sm border rounded ${errors?.department ? "border-red-500 bg-red-50" : "border-gray-300 bg-gray-100"}`}
                                        disabled
                                    />
                                    {errors?.department && (
                                        <p className="text-sm text-red-500 mt-1">{errors.department.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block mb-1">{ t('position') } <DotRequireComponent /></label>
                                    <input
                                        disabled={!isCreate && !isEdit}
                                        {...control.register(`leaveRequests.${index}.position`)}
                                        placeholder={ t('position') }
                                        className={`w-full p-2 text-sm border rounded ${errors?.position ? "border-red-500 bg-red-50" : ""} ${!isCreate && !isEdit ? 'bg-gray-100' : ''}`}
                                    />
                                    {errors?.position && (
                                        <p className="text-sm text-red-500 mt-1">{errors.position.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor={`type-leave-${index}`} className="block mb-1">{ t('type_leave') } <DotRequireComponent /></label>
                                    <select
                                        disabled={!isCreate && !isEdit}
                                        id={`type-leave-${index}`} {...control.register(`leaveRequests.${index}.type_leave`)} 
                                        className={`w-full p-2 text-sm border hover:cursor-pointer rounded ${errors?.type_leave ? "border-red-500 bg-red-50" : ""} ${!isCreate && !isEdit ? 'bg-gray-100' : ''}`}
                                    >
                                        <option value="">{t('choose')}</option>
                                        {
                                            typeLeaves?.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {
                                                        lang == 'vi' ? t(item.name) : t(item.nameE)
                                                    }
                                                    &nbsp;__&nbsp;{item.code}
                                                </option>
                                            ))
                                        }
                                    </select>
                                    {errors?.type_leave && (
                                        <p className="text-sm text-red-500 mt-1">{errors.type_leave.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block mb-1">{ t('time_leave') } <DotRequireComponent /></label>
                                    <select
                                        disabled={!isCreate && !isEdit}
                                        {...control.register(`leaveRequests.${index}.time_leave`)} 
                                        className={`w-full p-2 text-sm border hover:cursor-pointer rounded ${errors?.time_leave ? "border-red-500 bg-red-50" : ""} ${!isCreate && !isEdit ? 'bg-gray-100' : ''}`}
                                    >
                                        <option value="">{t('choose')}</option>
                                        {
                                            TIME_LEAVE.map((item) => (
                                                <option key={item.value} value={item.value}>
                                                    {tCommon(item.label)}
                                                </option>
                                            ))
                                        }
                                    </select>
                                    {errors?.time_leave && (
                                        <p className="text-sm text-red-500 mt-1">{errors.time_leave.message}</p>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="block mb-1">{ t('from_date') } <DotRequireComponent /></label>
                                    <DateTimePicker
                                        disabled={!isCreate && !isEdit}
                                        enableTime={true}
                                        dateFormat="Y-m-d H:i"
                                        initialDateTime={getValues(`leaveRequests.${index}.from_date`)}
                                        onChange={(_selectedDates, dateStr, _instance) => {
                                            setValue(`leaveRequests.${index}.from_date`, dateStr);
                                        }}
                                        className={`dark:bg-[#454545] shadow-xs text-sm border rounded border-gray-300 p-2 ${!isCreate && !isEdit ? 'bg-gray-100' : ''}`}
                                    />
                                    {errors?.from_date && (
                                        <p className="text-sm text-red-500 mt-1 max-w-[170px]">{errors.from_date.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block mb-1">{ t('to_date') } <DotRequireComponent /></label>
                                    <DateTimePicker
                                        disabled={!isCreate && !isEdit}
                                        enableTime={true}
                                        dateFormat="Y-m-d H:i"
                                        initialDateTime={getValues(`leaveRequests.${index}.to_date`)}
                                        onChange={(_selectedDates, dateStr, _instance) => {
                                            setValue(`leaveRequests.${index}.to_date`, dateStr);
                                        }}
                                        className={`dark:bg-[#454545] shadow-xs text-sm border rounded border-gray-300 p-2 ${!isCreate && !isEdit ? 'bg-gray-100' : ''}`}
                                    />
                                    {errors?.to_date && (
                                        <p className="text-sm text-red-500 mt-1">{errors.to_date.message}</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block mb-1">{ t('reason') } <DotRequireComponent /></label>
                                <textarea
                                    disabled={!isCreate && !isEdit}
                                    {...control.register(`leaveRequests.${index}.reason`)}
                                    placeholder={ t('reason') }
                                    className={`w-full p-2 border rounded ${errors?.reason ? "border-red-500 bg-red-50" : ""} ${!isCreate && !isEdit ? 'bg-gray-100' : ''}`}
                                />
                                {errors?.reason && (
                                    <p className="text-sm text-red-500 mt-1">{errors.reason.message}</p>
                                )}
                            </div>

                            {fields.length > 1 && (
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:cursor-pointer hover:bg-red-700"
                                        onClick={() => remove(index)}
                                    >
                                        { t('delete') }
                                    </button>
                                </div>
                            )}
                        </div>
                    )
                })
            }
            <div className="mb-4 flex space-x-2 mt-2">
                {
                    isCreate || isEdit && (
                        <button type="button" className="dark:bg-black bg-gray-300 px-4 py-2 rounded hover:cursor-pointer hover:bg-gray-400"
                            onClick={() =>
                                append({ ...defaultSingleLeaveRequest, user_code_register: user?.userCode ?? "", id: null})
                            }
                        >
                            +
                    </button>
                    )
                }
                {
                    isCreate || isEdit ? (
                        <button
                            type="submit"
                            className={`bg-black text-white px-4 py-2 rounded hover:cursor-pointer hover:opacity-70`}
                            disabled={isPending}
                        >
                            {isPending ? <Spinner size="small" className="text-white" /> : t('confirm')}
                        </button>
                    ) : (<></>)
                }
            </div>
        </form>
    )
}

export default LeaveRqFormComponent;