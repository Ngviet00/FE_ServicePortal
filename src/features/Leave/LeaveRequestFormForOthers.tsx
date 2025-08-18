import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getErrorMessage, ShowToast, TIME_LEAVE } from "@/lib";
import { useAuthStore, User } from "@/store/authStore";
import leaveRequestApi, { LeaveRequestData, useCreateLeaveRequestForManyPeople } from "@/api/leaveRequestApi";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import FullscreenLoader from "@/components/FullscreenLoader";
import DateTimePicker from "@/components/ComponentCustom/Flatpickr";
import { useQuery } from "@tanstack/react-query";
import typeLeaveApi, { ITypeLeave } from "@/api/typeLeaveApi";
import { Spinner } from "@/components/ui/spinner";
import { SubmitHandler } from "react-hook-form";
import useHasPermission from "@/hooks/useHasPermission";

const leaveRequestSchema = z.object({
    user_code: z.string().nonempty({ message: "Bắt buộc." }),
    user_code_register: z.string().nonempty({ message: "Bắt buộc." }),
    name: z.string().nonempty({ message: "Bắt buộc." }),
    department: z.string().nonempty({ message: "Bắt buộc." }),
    departmentId: z.number({ invalid_type_error: "Must be a number" }),
    position: z.string().nonempty({ message: "Bắt buộc." }),
    from_date: z.string().nonempty({ message: "Bắt buộc.." }),
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
    path: ["to_date"],
});
 
const leaveSchema = z.object({
    leaveRequests: z.array(leaveRequestSchema)
});

type LeaveForm = z.infer<typeof leaveSchema>;
type SingleLeaveRequest = z.infer<typeof leaveRequestSchema>;

export default function LeaveRequestFormForOthers() {
    const { t } = useTranslation('createLeaveOther');
    const { t: tCommon  } = useTranslation('common');
    const lang = useTranslation().i18n.language.split('-')[0];
    const user = useAuthStore((state) => state.user)
    const navigate = useNavigate();
    const [isSearchingUser, setIsSearchingUser] = useState(false)
    const saveLeaveRequestForManyPeople = useCreateLeaveRequestForManyPeople(); 

    const defaultSingleLeaveRequest: SingleLeaveRequest = {
        user_code: "",
        user_code_register: "",
        name: "",
        department: "",
        departmentId: user?.departmentId ?? -1,
        position: "",
        from_date: `${new Date().toISOString().slice(0, 10)} 08:00`,
        to_date: `${new Date().toISOString().slice(0, 10)} 17:00`,
        type_leave: "",
        time_leave: "",
        reason: "",
    };

    const hasPermission = useHasPermission(['leave_request.create_multiple_leave_request'])

    const form = useForm<LeaveForm>({
        resolver: zodResolver(leaveSchema),
        defaultValues: {
            leaveRequests: [{ ...defaultSingleLeaveRequest, user_code_register: user?.userCode ?? "" }],
        },
    });

    const { control, handleSubmit, setValue, getValues } = form;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "leaveRequests",
    });

    const onSubmit: SubmitHandler<LeaveForm> = async (data) => {
        const currentUser: User | null = user

        const formatSingleLeaveRequest = (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            values: any,
            user: User | null
        ): LeaveRequestData => ({
            userCodeRequestor: values.user_code ?? null,
            writeLeaveUserCode: user?.userCode ?? "",
            userNameWriteLeaveRequest: user?.userName ?? "",
            userNameRequestor: values.name,
            department: values.department,
            departmentId: values.departmentId,
            position: values.position,
            fromDate: values.from_date.replace(" ", "T") + ":00+07:00",
            toDate: values.to_date.replace(" ", "T") + ":00+07:00",
            reason: values.reason,
            typeLeaveId: parseInt(values.type_leave),
            timeLeaveId: parseInt(values.time_leave),
            urlFrontend: window.location.origin,
        });

        const payload = {
            OrgPositionId: user?.orgPositionId,
            Leaves: data.leaveRequests.map((leaveRequest) =>
                formatSingleLeaveRequest(leaveRequest, currentUser)
            ),
        };

        try {
            await saveLeaveRequestForManyPeople.mutateAsync(payload);
            navigate("/leave");
        } catch (err) {
            console.log(err);
        }
    };

    const { data: typeLeaves = [], isPending, isError } = useQuery<ITypeLeave[], Error>({
        queryKey: ['get-all-type-leave'],
        queryFn: async () => {
            const res = await typeLeaveApi.getAll({});
            return res.data.data;
        },
    });

    const lastUserCodesRef = useRef<Record<number, string>>({});

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
            setValue(`leaveRequests.${index}.position`, result?.Position, { shouldValidate: true });
        } 
        catch (err) {
            ShowToast(getErrorMessage(err), "error");
            setValue(`leaveRequests.${index}.name`, "")
            setValue(`leaveRequests.${index}.department`, "")
            setValue(`leaveRequests.${index}.position`, "")
            setValue(`leaveRequests.${index}.type_leave`, "")
            setValue(`leaveRequests.${index}.time_leave`, "")
            setValue(`leaveRequests.${index}.reason`, "")
            setValue(`leaveRequests.${index}.from_date`, `${new Date().toISOString().slice(0, 10)} 08:00`, { shouldValidate: true })
            setValue(`leaveRequests.${index}.to_date`, `${new Date().toISOString().slice(0, 10)} 17:00`, { shouldValidate: true })
        }
        finally {
            setIsSearchingUser(false)
        }
    };

    return (
        <div className="p-4 pl-1 pt-0 space-y-4 leave-request-form">
            {isSearchingUser && <FullscreenLoader />}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-2">
                <div className="flex flex-col gap-2">
                    <h3 className="font-bold text-xl md:text-2xl">
                        { t('title') } 
                        {
                            !hasPermission ? (
                                <span className="ml-3 text-red-600 font-bold">
                                    ({t('not_allow')})
                                </span>    
                            ) : (<></>)
                        }
                    </h3>
                </div>
                <Button onClick={() => navigate("/leave")} className="w-full md:w-auto hover:cursor-pointer">
                    { t('list_leave') }
                </Button>
            </div>

            <div className="w-[100%]">
                <form 
                    onSubmit={handleSubmit(onSubmit)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                        }
                    }}>
                    {
                        fields.map((field, index) => {
                            const errors = form.formState.errors.leaveRequests?.[index];

                            return (
                                <div key={field.id} className="space-y-4">
                                    <h2 className="font-bold text-xl text-red-600 dark:text-white">{ t('sub_title') } {`#` + (index + 1)}</h2>
                                    <div className="flex flex-wrap gap-4">
                                        <div>
                                            <label htmlFor={`usercode-${index}`} className="block mb-1">{ t('usercode') }</label>
                                            <input
                                                readOnly={!hasPermission}
                                                id={`usercode-${index}`}
                                                {...control.register(`leaveRequests.${index}.user_code`)}
                                                placeholder={ t('usercode') }
                                                className={`w-full p-2 border rounded text-sm ${errors?.user_code ? "border-red-500 bg-red-50" : ""}`}
                                                onBlur={() => handleFindUser(getValues(`leaveRequests.${index}.user_code`), index)}
                                            />
                                            {errors?.user_code && (
                                                <p className="text-sm text-red-500 mt-1">{errors.user_code.message}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block mb-1">{ t('name') }</label>
                                            <input
                                                {...control.register(`leaveRequests.${index}.name`)}
                                                placeholder={ t('name') }
                                                className={`dark:bg-[#454545] w-full p-2 text-sm border rounded ${errors?.name ? "border-red-500 bg-red-50" : "border-gray-300 bg-gray-100"}`}
                                                readOnly
                                            />
                                            {errors?.name && (
                                                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block mb-1">{ t('department') }</label>
                                            <input
                                                {...control.register(`leaveRequests.${index}.department`)}
                                                placeholder={ t('department') }
                                                className={`dark:bg-[#454545] w-full p-2 text-sm border rounded ${errors?.department ? "border-red-500 bg-red-50" : "border-gray-300 bg-gray-100"}`}
                                                readOnly
                                            />
                                            {errors?.department && (
                                                <p className="text-sm text-red-500 mt-1">{errors.department.message}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block mb-1">{ t('position') }</label>
                                            <input
                                                {...control.register(`leaveRequests.${index}.position`)}
                                                placeholder={ t('position') }
                                                className={`w-full p-2 text-sm border rounded ${errors?.position ? "border-red-500 bg-red-50" : ""}`}
                                            />
                                            {errors?.position && (
                                                <p className="text-sm text-red-500 mt-1">{errors.position.message}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor={`type-leave-${index}`} className="block mb-1">{ t('type_leave') }</label>
                                            <select 
                                                id={`type-leave-${index}`} {...control.register(`leaveRequests.${index}.type_leave`)} 
                                                className={`w-full p-2 text-sm border hover:cursor-pointer rounded ${errors?.type_leave ? "border-red-500 bg-red-50" : ""}`}
                                            >
                                                <option value="">{t('choose')}</option>
                                                {
                                                    isPending ? (
                                                        <option>Loading...</option>
                                                    ) : isError || typeLeaves.length === 0 ? (
                                                        <option className="text-red-500">{t('no_data')}</option>
                                                    ) : (
                                                        typeLeaves.map((item) => (
                                                            <option key={item.id} value={item.id}>
                                                                {
                                                                    lang == 'vi' ? t(item.name) : t(item.nameE)
                                                                }
                                                                &nbsp;__&nbsp;{item.code}
                                                            </option>
                                                        ))
                                                    )
                                                }
                                            </select>
                                            {errors?.type_leave && (
                                                <p className="text-sm text-red-500 mt-1">{errors.type_leave.message}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block mb-1">{ t('time_leave') }</label>
                                            <select 
                                                {...control.register(`leaveRequests.${index}.time_leave`)} 
                                                className={`w-full p-2 text-sm border hover:cursor-pointer rounded ${errors?.time_leave ? "border-red-500 bg-red-50" : ""}`}
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
                                            <label className="block mb-1">{ t('from_date') }</label>
                                            <DateTimePicker
                                                enableTime={true}
                                                dateFormat="Y-m-d H:i"
                                                initialDateTime={getValues(`leaveRequests.${index}.from_date`)}
                                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                onChange={(_selectedDates, dateStr, _instance) => {
                                                    setValue(`leaveRequests.${index}.from_date`, dateStr);
                                                }}
                                                className={`dark:bg-[#454545] shadow-xs text-sm border rounded border-gray-300 p-2`}
                                            />
                                            {errors?.from_date && (
                                                <p className="text-sm text-red-500 mt-1">{errors.from_date.message}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block mb-1">{ t('to_date') }</label>
                                            <DateTimePicker
                                                enableTime={true}
                                                dateFormat="Y-m-d H:i"
                                                initialDateTime={getValues(`leaveRequests.${index}.to_date`)}
                                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                onChange={(_selectedDates, dateStr, _instance) => {
                                                    setValue(`leaveRequests.${index}.to_date`, dateStr);
                                                }}
                                                className={`dark:bg-[#454545] shadow-xs text-sm border rounded border-gray-300 p-2`}
                                            />
                                            {errors?.to_date && (
                                                <p className="text-sm text-red-500 mt-1">{errors.to_date.message}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block mb-1">{ t('reason') }</label>
                                        <textarea
                                            {...control.register(`leaveRequests.${index}.reason`)}
                                            placeholder={ t('reason') }
                                            className={`w-full p-2 border rounded ${errors?.reason ? "border-red-500 bg-red-50" : ""}`}
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
                        <button
                            type="button"
                            className="dark:bg-black bg-gray-300 px-4 py-2 rounded hover:cursor-pointer hover:bg-gray-400"
                            onClick={() =>
                                append({ ...defaultSingleLeaveRequest, user_code_register: user?.userCode ?? "", })
                            }
                        >
                            { t('add') }
                        </button>

                        <button
                            type="submit"
                            className={`bg-black text-white px-4 py-2 rounded ${!hasPermission ? 'hover:cursor-not-allowed' : 'hover:cursor-pointer'} hover:opacity-70`}
                            disabled={saveLeaveRequestForManyPeople.isPending || !hasPermission}
                        >
                            {saveLeaveRequestForManyPeople.isPending ? <Spinner size="small" className="text-white" /> : t('confirm')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}