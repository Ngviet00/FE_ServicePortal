"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/store/authStore";
import { Spinner } from "@/components/ui/spinner";
import { getErrorMessage, ShowToast, TIME_LEAVE } from "@/lib";
import { Checkbox } from "@/components/ui/checkbox";
import typeLeaveApi, { ITypeLeave } from "@/api/typeLeaveApi";
import { useQuery } from "@tanstack/react-query";
import leaveRequestApi, { LeaveRequestData } from "@/api/leaveRequestApi";
import userConfigApi from "@/api/userConfigApi";
import DotRequireComponent from "@/components/DotRequireComponent";
import userApi from "@/api/userApi";
import DateTimePicker from "@/components/ComponentCustom/Flatpickr";

const formSchema = z.object({
    user_code: z.string().nonempty({ message: "Required" }),
    user_code_register: z.string().nonempty({ message: "Required" }),
    name_register: z.string().nonempty({ message: "Required" }),
    name: z.string().nonempty({ message: "Required" }),
    department: z.string().nonempty({ message: "Required" }),
    position: z.string().nonempty({ message: "Required" }),
    from_date: z.string().nonempty({ message: "Required" }),
    to_date: z.string().nonempty({ message: "Required" }),
    type_leave: z.string().nonempty({ message: "Required" }),
    time_leave: z.string().nonempty({ message: "Required" }),
    reason: z.string().nonempty({ message: "Required" }),
})
.refine(data => {
    const from = new Date(data.from_date);
    const to = new Date(data.to_date);

    return to >= from;
}, {
    path: ["to_date"],
    message: "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu",
});

const formatData = (values: z.infer<typeof formSchema>): LeaveRequestData => ({
    requesterUserCode: values.user_code ?? null,
    writeLeaveUserCode: values.user_code_register,
    userNameWriteLeaveRequest: values.name_register,
    name: values.name,
    department: values.department,
    position: values.position,
    fromDate: values.from_date.replace(" ", "T") + ":00+07:00",
    toDate: values.to_date.replace(" ", "T") + ":00+07:00",
    reason: values.reason,
    typeLeaveId: parseInt(values.type_leave),
    timeLeaveId: parseInt(values.time_leave),
    urlFrontend: window.location.origin,
});

export default function LeaveRequestForm() {
    const { t } = useTranslation();
    const { t: tCommon  } = useTranslation('common');
    const lang = useTranslation().i18n.language.split('-')[0];
    const [loading, setLoading] = useState(false);
    const { user } = useAuthStore();
    const [checkReceiveEmail, setCheckReceiveEmail] = useState(false);
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;
    const navigate = useNavigate();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            user_code: user?.userCode || "",
            user_code_register: user?.userCode || "",
            name_register: user?.userName || "",
            name: "",
            department: "",
            position: "",
            from_date: `${new Date().toISOString().slice(0, 10)} 08:00`,
            to_date: `${new Date().toISOString().slice(0, 10)} 17:00`,
            time_leave: '',
            type_leave: ''
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        try {
            const data = formatData(values);
            if (isEdit) {
                await leaveRequestApi.update(id, data);
            } else {
                await leaveRequestApi.create(data);
            }
            ShowToast("Success");
            navigate("/leave");
        } catch (err) {
            ShowToast(getErrorMessage(err), "error")
        } finally {
            setLoading(false);
        }
    };

    const { data: typeLeaves = [], isPending, isError, error } = useQuery({
        queryKey: ['get-all-type-leave'],
        queryFn: async () => {
            const res = await typeLeaveApi.getAll({});
            return res.data.data;
        },
    });

    //get status if receive email or not
    const { data: receiveEmail } = useQuery({
        queryKey: ['get-email-by-usercode-and-key'],
        queryFn: async () => {
            const res = await userConfigApi.getConfigByUsercodeAndkey({ userCode: user?.userCode, key: "RECEIVE_MAIL_LEAVE_REQUEST" });
            return res.data.data;
        },
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
            ShowToast("Success")
        } catch (error) {
            ShowToast(getErrorMessage(error), "error")
        }
    }

    useEffect(() => {
        const firstErrorField = Object.keys(form.formState.errors)[0];
        if (firstErrorField) {
            const el = document.querySelector(`[name="${firstErrorField}"]`);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
                (el as HTMLElement).focus?.();
            }
        }
    }, [form.formState.errors]);

    useEffect(() => {
        if (id) {
            const fetchData = async () => {
                try {
                    const data = await leaveRequestApi.getById(id);
                    const results = data.data.data;
                    form.setValue("user_code", user?.userCode || "")
                    form.setValue("name", results?.name)
                    form.setValue("department", results?.department)
                    form.setValue("position", results?.position ?? "Staff")
                    form.setValue("from_date", results.fromDate.split('T')[0] + ' ' + results.fromDate.split('T')[1].substring(0, 5))
                    form.setValue("to_date", results.toDate.split('T')[0] + ' ' + results.toDate.split('T')[1].substring(0, 5))
                    form.setValue("time_leave", results?.timeLeave?.id?.toString())
                    form.setValue("type_leave", results?.typeLeave?.id?.toString())
                    form.setValue("reason", results?.reason)
                } catch (err) {
                    ShowToast(getErrorMessage(err), "error")
                }
            };

            fetchData();
        }
    }, [form, id, user?.userCode])

    const { isPending: isPendingLoadUser } = useQuery({
        queryKey: ['get-me'],
        queryFn: async () => {
            const res = await userApi.getMe();
            const deptName = res?.data?.data?.bpTen;
            const position = res?.data?.data?.cvTen;

            form.setValue('user_code', user?.userCode || "")
            form.setValue('name', user?.userName ?? "")
            form.setValue('department', deptName)
            form.setValue('position', position == null || position == '' ? 'Staff' : position)

            return res.data.data;
        },
    });

    return (
        <div className="p-4 pl-1 pt-0 space-y-4 leave-request-form">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-7">
                <div className="flex flex-col gap-2">
                    <h3 className="font-bold text-xl md:text-2xl">
                        {isEdit ? t('leave_request.create.title_edit') : t('leave_request.create.title') }
                    </h3>

                    <div className="flex items-center">
                        <Checkbox
                            checked={checkReceiveEmail}
                            onCheckedChange={(checked) => handleCheckChange(!!checked)}
                            id="receive-mail"
                            className="w-[20px] h-[20px] md:w-[25px] md:h-[25px] hover:cursor-pointer"
                        />
                        <label
                            htmlFor="receive-mail"
                            className="ml-2 text-sm md:text-base font-medium leading-none hover:cursor-pointer"
                        >
                            {t('leave_request.create.receive_email')}
                        </label>
                    </div>
                </div>

                <Button onClick={() => navigate("/leave")} className="w-full md:w-auto hover:cursor-pointer">
                    {t("leave_request.create.link_to_list")}
                </Button>
            </div>

            <div className="w-[100%] mt-5">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
                        <div className="first-row flex flex-wrap gap-4 w-full">
                            <div className="w-full md:w-[48%] lg:w-[23%]">
                                <FormField
                                    control={form.control}
                                    name="user_code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t("leave_request.create.code")}
                                                <DotRequireComponent />
                                            </FormLabel>
                                            <FormControl>
                                                <Input className="bg-gray-100" readOnly placeholder={t("leave_request.create.code")} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                            </div>

                            <div className="w-full md:w-[48%] lg:w-[23%] flex-1">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('leave_request.create.name')}<DotRequireComponent/></FormLabel>
                                            <FormControl>
                                                <Input className="bg-gray-100" readOnly placeholder={isPendingLoadUser ? "Loading..." : t('leave_request.create.name')} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="w-full md:w-[48%] lg:w-[23%]">
                                <FormField
                                    control={form.control}
                                    name="department"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('leave_request.create.department')}<DotRequireComponent/></FormLabel>
                                            <FormControl>
                                                <Input placeholder={isPendingLoadUser ? "Loading..." : t('leave_request.create.department')} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="w-full md:w-[48%] lg:w-[23%]">
                                <FormField
                                    control={form.control}
                                    name="position"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('leave_request.create.position')}<DotRequireComponent/></FormLabel>
                                            <FormControl>
                                                <Input placeholder={isPendingLoadUser ? "Loading..." : t('leave_request.create.position')} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="second-row w-full flex flex-col gap-4 mb-5">
                            <div className="flex flex-wrap gap-4 w-full">
                                <div>
                                    <FormField
                                        control={form.control}
                                        name="from_date"
                                        render={({ field: rhfField, fieldState }) => (
                                            <FormItem className="flex flex-col w-[180px]">
                                                <FormLabel className="mb-1">{t('leave_request.create.from_date')} <DotRequireComponent/></FormLabel>
                                                <FormControl>
                                                    <DateTimePicker
                                                        enableTime={true}
                                                        dateFormat="Y-m-d H:i"
                                                        initialDateTime={rhfField.value as string || undefined}
                                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                        onChange={(_selectedDates, dateStr, _instance) => {
                                                            rhfField.onChange(dateStr);
                                                        }}
                                                        className={`dark:bg-[#454545] shadow-xs border ${fieldState.invalid ? "border-red-500" : "border-gray-300"} p-1 rounded-[5px] hover:cursor-pointer`}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-sm text-red-500 mt-1" />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div>
                                    <FormField
                                        control={form.control}
                                        name="to_date"
                                        render={({ field: rhfField, fieldState }) => (
                                            <FormItem className="flex flex-col w-[180px]">
                                                <FormLabel className="mb-1">{t('leave_request.create.to_date')} <DotRequireComponent/></FormLabel>
                                                <FormControl>
                                                    <DateTimePicker
                                                        enableTime={true}
                                                        dateFormat="Y-m-d H:i"
                                                        initialDateTime={rhfField.value as string || undefined}
                                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                        onChange={(_selectedDates, dateStr, _instance) => {
                                                            rhfField.onChange(dateStr);
                                                        }}
                                                        className={`dark:bg-[#454545] shadow-xs border ${fieldState.invalid ? "border-red-500" : "border-gray-300"} p-1 rounded-[5px] hover:cursor-pointer`}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-sm text-red-500 mt-1" />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div>
                                    <FormField
                                        control={form.control}
                                        name="type_leave"
                                        render={({ field, fieldState }) => (
                                            <FormItem className="hover:cursor-pointer">
                                                <FormLabel className="mb-1">{t('leave_request.create.type_leave.type_leave')} <DotRequireComponent/></FormLabel>
                                                <FormControl>
                                                    <select
                                                        ref={field.ref}
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        name={field.name}
                                                        id="type_leave" 
                                                        className={`w-[180px] hover:cursor-pointer dark:bg-[#454545] shadow-xs border p-1 rounded-[5px] ${fieldState.invalid ? "border-red-500" : "border-gray-300"}`}>
                                                        <option value="">--Select--</option>
                                                        {
                                                            isPending ? (
                                                                <option value="">Loading...</option>
                                                            ) : isError || typeLeaves.length == 0 ? (
                                                                <option value="" className="text-red-500">{isError ? error.message : "No results"}</option>
                                                            ) : (
                                                                typeLeaves.map((item: ITypeLeave) => (
                                                                    <option key={item.id} value={item.id}>
                                                                        {
                                                                            lang == 'vi' ? t(item.nameV) : t(item.name)
                                                                        }
                                                                    </option>
                                                                ))
                                                            )
                                                        }
                                                    </select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div>
                                    <FormField
                                        control={form.control}
                                        name="time_leave"
                                        render={({ field, fieldState }) => (
                                            <FormItem className="hover:cursor-pointer">
                                                <FormLabel className="mb-1">{t('leave_request.create.time_leave.time_leave')}<DotRequireComponent/></FormLabel>
                                                <FormControl>
                                                    <select
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        name={field.name}
                                                        id="time_leave" 
                                                        className={`dark:bg-[#454545] hover:cursor-pointer shadow-xs border ${fieldState.invalid ? "border-red-500" : "border-gray-300"} p-1 rounded-[5px] w-[120px]`}>
                                                        <option value="">--Select--</option>
                                                        {
                                                            TIME_LEAVE.map((item) => (
                                                                <option key={item.value} value={item.value}>
                                                                    {tCommon(item.label)}
                                                                </option>
                                                            ))
                                                        }
                                                    </select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="fourth-row flex flex-wrap w-full">
                            <div className="w-[80%]">
                                <FormField
                                    control={form.control}
                                    name="reason"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('leave_request.create.reason')}<DotRequireComponent/></FormLabel>
                                            <FormControl>
                                                <Textarea 
                                                    name={field.name}
                                                    onChange={field.onChange}
                                                    value={field.value}
                                                    placeholder={t('leave_request.create.reason')}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        <Button disabled={loading} type="submit" className="hover:cursor-pointer w-[30%]">
                            {loading ? <Spinner className="text-white" /> : "Save"}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}