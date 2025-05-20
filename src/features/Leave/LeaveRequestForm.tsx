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

const formSchema = z.object({
    user_code: z.string().nonempty({ message: "Required" }),
    user_code_register: z.string().nonempty({ message: "Required" }),
    name: z.string().nonempty({ message: "Required" }),
    department: z.string().nonempty({ message: "Required" }),
    position: z.string().nonempty({ message: "Required" }),
    from_date: z.string().nonempty({ message: "Required" }),
    to_date: z.string().nonempty({ message: "Required" }),
    from_hour: z.string().nonempty({ message: "Required" }),
    to_hour: z.string().nonempty({ message: "Required" }),
    from_minutes: z.string().nonempty({ message: "Required" }),
    to_minutes: z.string().nonempty({ message: "Required" }),
    type_leave: z.string().nonempty({ message: "Required" }),
    time_leave: z.string().nonempty({ message: "Required" }),
    reason: z.string().nonempty({ message: "Required" }),
});

const formatData = (values: z.infer<typeof formSchema>): LeaveRequestData => ({
    requesterUserCode: values.user_code ?? null,
    writeLeaveUserCode: values.user_code_register,
    name: values.name,
    department: values.department,
    position: values.position,
    fromDate: `${values.from_date} ${values.from_hour}:${values.from_minutes}`,
    toDate: `${values.to_date} ${values.to_hour}:${values.to_minutes}`,
    reason: values.reason,
    typeLeave: parseInt(values.type_leave),
    timeLeave: parseInt(values.time_leave),
    urlFrontend: window.location.origin,
});

export default function LeaveRequestForm() {
    const { t } = useTranslation();
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
            name: "",
            department: "",
            position: "",
            from_date: new Date().toISOString().slice(0, 10),
            from_hour: "08",
            from_minutes: "00",
            to_date: new Date().toISOString().slice(0, 10),
            to_hour: "17",
            to_minutes: "00",
            time_leave: "1"
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        try {
            const data = formatData(values);
            if (isEdit) {
                await leaveRequestApi.update(id, data);
                ShowToast("Success");
                navigate("/leave");
            } else {
                await leaveRequestApi.create(data);
                ShowToast("Success");
                form.setValue("reason", "");
                navigate("/leave");
            }
        } catch (err) {
            ShowToast(getErrorMessage(err))
        } finally {
            setLoading(false);
        }
    };

    const handleInputClickShowPicker = (event: React.MouseEvent<HTMLInputElement>) => {
        (event.target as HTMLInputElement).showPicker();
    };

    const { data: typeLeaves = [], isPending, isError, error } = useQuery({
        queryKey: ['get-all-type-leave'],
        queryFn: async () => {
            const res = await typeLeaveApi.getAll({
                page: 1,
                page_size: 50,
            });
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
            setCheckReceiveEmail(receiveEmail.configValue == "true")
        } else {
            setCheckReceiveEmail(true);
        }
    }, [receiveEmail])

    const handleCheckChange = async (checked: boolean) => {
        try {
            await userConfigApi.saveOrUpdate({
                userCode: user?.userCode,
                configKey: "RECEIVE_MAIL_LEAVE_REQUEST",
                configValue: checked ? "true" : "false",
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

    return (
        <div className="p-4 pl-1 pt-0 space-y-4 leave-request-form">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
                <div className="flex flex-col gap-2">
                    <h3 className="font-bold text-xl md:text-2xl">
                        {isEdit ? "Sửa" : "Đăng ký"} nghỉ phép
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

                <Button onClick={() => navigate("/leave")} className="w-full md:w-auto">
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
                                                <Input placeholder={t("leave_request.create.code")} {...field} />
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
                                                <Input placeholder={t('leave_request.create.name')} {...field} />
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
                                                <Input className="border-gray-300" placeholder={t('leave_request.create.department')} {...field} />
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
                                                <Input placeholder={t('leave_request.create.position')} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="second-row w-full flex flex-col gap-4 mb-5">
                            <div className="flex flex-wrap gap-4 w-full">
                                <div className="w-full sm:w-[48%] lg:w-[18%]">
                                    <FormField
                                        control={form.control}
                                        name="from_date"
                                        render={({ field }) => (
                                            <FormItem className="hover:cursor-pointer">
                                                <FormLabel>{t('leave_request.create.from_date')}</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        className="justify-center"
                                                        onClick={handleInputClickShowPicker}
                                                        onChange={field.onChange}
                                                        value={field.value}
                                                        type="date"
                                                        id="to_date"
                                                        name={field.name}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="w-[48%] sm:w-[23%] lg:w-[8%]">
                                    <FormField
                                        control={form.control}
                                        name="from_hour"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('leave_request.create.from_hour')}</FormLabel>
                                                <FormControl>
                                                    <select
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        name={field.name}
                                                        id="from_hour" 
                                                        className="dark:bg-[#454545] shadow-xs border border-[#ebebeb] p-1 rounded-[5px]"
                                                        >
                                                            {Array.from({length: 24}, (_, i) => (
                                                                <option key={i} value={i.toString().padStart(2, "0")}>
                                                                    {i.toString().padStart(2, "0")}
                                                                </option>
                                                            ))}
                                                    </select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="w-[48%] sm:w-[23%] lg:w-[8%]">
                                    <FormField
                                        control={form.control}
                                        name="from_minutes"
                                        render={({ field }) => (
                                            <FormItem className="hover:cursor-pointer">
                                                <FormLabel>{t('leave_request.create.from_minutes')}</FormLabel>
                                                <FormControl>
                                                    <select
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        name={field.name}
                                                        id="from_hour" 
                                                        className="dark:bg-[#454545] shadow-xs border border-[#ebebeb] p-1 rounded-[5px]">
                                                            <option key="00" value="00">00</option>
                                                            <option key="30" value="30">30</option>
                                                    </select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4 w-full">
                                <div className="w-full sm:w-[48%] lg:w-[15%]">
                                    <FormField
                                        control={form.control}
                                        name="type_leave"
                                        render={({ field, fieldState }) => (
                                            <FormItem className="hover:cursor-pointer">
                                                <FormLabel>{t('leave_request.create.type_leave.type_leave')}</FormLabel>
                                                <FormControl>
                                                    <select
                                                        ref={field.ref}
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        name={field.name}
                                                        id="type_leave" 
                                                        className={`dark:bg-[#454545] shadow-xs border p-1 rounded-[5px] ${fieldState.invalid ? "border-red-500" : "border-[#ebebeb]"}`}>
                                                        <option value="">--Select--</option>
                                                        {
                                                            isPending ? (
                                                                <option value="">Loading...</option>
                                                            ) : isError || typeLeaves.length == 0 ? (
                                                                <option value="" className="text-red-500">{isError ? error.message : "No results"}</option>
                                                            ) : (
                                                                typeLeaves.map((item: ITypeLeave) => (
                                                                    <option key={item.id} value={item.id}>
                                                                        {t(item.name)}
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
                                <div className="w-full sm:w-[48%] lg:w-[15%]">
                                    <FormField
                                        control={form.control}
                                        name="time_leave"
                                        render={({ field }) => (
                                            <FormItem className="hover:cursor-pointer">
                                                <FormLabel>{t('leave_request.create.time_leave.time_leave')}</FormLabel>
                                                <FormControl>
                                                    <select
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        name={field.name}
                                                        id="from_hour" 
                                                        className="dark:bg-[#454545] shadow-xs border border-[#ebebeb] p-1 rounded-[5px]">
                                                        <option value="">--Select--</option>
                                                        {
                                                            TIME_LEAVE.map((item) => (
                                                                <option key={item.value} value={item.value}>
                                                                    {t(item.label)}
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

                        <div className="third-row w-full flex flex-col gap-4">
                            <div className="flex flex-wrap gap-4 w-full">
                                <div className="w-full sm:w-[48%] lg:w-[18%]">
                                    <FormField
                                        control={form.control}
                                        name="to_date"
                                        render={({ field }) => (
                                        <FormItem className="hover:cursor-pointer">
                                            <FormLabel>{t('leave_request.create.to_date')}</FormLabel>
                                            <FormControl>
                                            <Input
                                                className="w-full justify-center"
                                                onClick={handleInputClickShowPicker}
                                                onChange={field.onChange}
                                                value={field.value}
                                                type="date"
                                                id="from_date"
                                                name={field.name}
                                            />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="w-[48%] sm:w-[23%] lg:w-[8%]">
                                    <FormField
                                        control={form.control}
                                        name="to_hour"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('leave_request.create.to_hour')}</FormLabel>
                                            <FormControl>
                                            <select
                                                value={field.value}
                                                onChange={field.onChange}
                                                name={field.name}
                                                id="to_hour"
                                                className="dark:bg-[#454545] shadow-xs border border-[#ebebeb] p-1 rounded-[5px]"
                                            >
                                                {Array.from({ length: 24 }, (_, i) => (
                                                <option key={i} value={i.toString().padStart(2, "0")}>
                                                    {i.toString().padStart(2, "0")}
                                                </option>
                                                ))}
                                            </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="w-[48%] sm:w-[23%] lg:w-[8%]">
                                    <FormField
                                        control={form.control}
                                        name="to_minutes"
                                        render={({ field }) => (
                                        <FormItem className="hover:cursor-pointer">
                                            <FormLabel>{t('leave_request.create.to_minutes')}</FormLabel>
                                            <FormControl>
                                            <select
                                                value={field.value}
                                                onChange={field.onChange}
                                                name={field.name}
                                                id="to_minutes"
                                                className="dark:bg-[#454545] shadow-xs border border-[#ebebeb] p-1 rounded-[5px]"
                                            >
                                                <option key="00" value="00">00</option>
                                                <option key="30" value="30">30</option>
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