"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Input } from "@/components/ui/input"
import { parseDateTime, ShowToast, TIME_LEAVE } from "@/lib"
import { Textarea } from "@/components/ui/textarea"
import { useAuthStore } from "@/store/authStore"
import { AxiosError } from "axios"
import { Spinner } from "@/components/ui/spinner"
import { useQuery } from "@tanstack/react-query"
import { ITypeLeave } from "../TypeLeave/ListTypeLeave"
import leaveRequestApi, { LeaveRequestData } from "@/api/leaveRequestApi"
import DotRequireComponent from "@/components/DotRequireComponent"
import typeLeaveApi from "@/api/typeLeaveApi"

const formSchema = z.object({
    user_code: z.string().nonempty({message: "Required"}),
    name: z.string().nonempty({message: "Required"}),

    user_code_register: z.string().nonempty({message: "Required"}),
    name_register: z.string().nonempty({message: "Required"}),

    department: z.string().nonempty({message: "Required"}),
    position: z.string().nonempty({message: "Required"}),

    from_date: z.string().nonempty({message: "Required"}),
    from_hour: z.string().nonempty({message: "Required"}),
    from_minutes: z.string().nonempty({message: "Required"}),

    to_date: z.string().nonempty({message: "Required"}),
    to_hour: z.string().nonempty({message: "Required"}),
    to_minutes: z.string().nonempty({message: "Required"}),

    type_leave: z.string().nonempty({message: "Required"}),
    time_leave: z.string().nonempty({message: "Required"}),

    reason: z.string().nonempty({message: "Required"}),
}).refine(data => {
    const from = new Date(data.from_date);
    const to = new Date(data.to_date);

    return to >= from;
}, {
    path: ["to_date"],
    message: "To date cannot be earlier than From date",
});

const formatData = (values: z.infer<typeof formSchema>): LeaveRequestData => ({
    user_code: values.user_code ?? null,
    name: values.name ?? null,

    user_code_register: values.user_code_register ?? null,
    name_register: values.name_register ?? "",

    position: values.position,
    department: values.department,

    from_date: `${values.from_date} ${values.from_hour}:${values.from_minutes}`,
    to_date: `${values.to_date} ${values.to_hour}:${values.to_minutes}`,

    reason: values.reason,

    time_leave: parseInt(values.time_leave),
    type_leave: parseInt(values.type_leave),

    url_front_end: window.location.origin,
});

export default function LeaveRequestForm() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuthStore();
    
    const { id } = useParams<{ id: string }>()
    const isEdit = !!id;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            user_code: user?.code,
            name: user?.name,

            user_code_register: user?.code,
            name_register: user?.name,

            department: user?.department?.name,
            position: user?.position,
        
            from_date: new Date().toISOString().slice(0, 10),
            from_hour: "08",
            from_minutes: "00",
        
            to_date: new Date().toISOString().slice(0, 10),
            to_hour: "17",
            to_minutes: "00",
        
            type_leave: "1",
            time_leave: "1",
            reason: ""
        },
    })

    //submit form
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true)
        const data = formatData(values);
        try {
            if (isEdit) {
                await leaveRequestApi.update(id, data)
                ShowToast("Success", "success")
                navigate("/leave")
            } else {
                await leaveRequestApi.create(data)
                ShowToast("Success", "success")
                form.setValue("reason", "")
                navigate("/leave")
            }
        } catch (err: unknown) {
            const error = err as AxiosError<{ message: string }>
            const message = error?.response?.data?.message ?? "Something went wrong"
            form.setError("name", {
                type: "server",
                message,
            })
        } finally {
            setLoading(false)
        }
    }

    //event click show calendar
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
    

    //#region UPDATE
    
    //get by id
    const { data: departmentData } = useQuery({
        queryKey: ["department", id],
        queryFn: async () => await leaveRequestApi.getById(id ?? ""),
        enabled: !!id,
    })

    useEffect(() => {
        if (departmentData) {
            const data = departmentData.data.data

            const from = parseDateTime(data.from_date);
            const to = parseDateTime(data.to_date);

            form.reset({
                user_code: data.user_code,
                name: data.name,
                user_code_register: data.user_code_register,
                name_register: data.name_register,
                department: data.department,
                position: data.position,
                from_date: new Date(data.from_date).toISOString().slice(0, 10),
                from_hour: from.hour,
                from_minutes: from.minutes,

                to_date: new Date(data.to_date).toISOString().slice(0, 10),
                to_hour: to.hour,
                to_minutes: to.minutes,

                type_leave: data.type_leave.toString(),
                time_leave: data.time_leave.toString(),
                reason: data.reason
            })
        }
    }, [departmentData, form])
    
    //#endregion
    
    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex justify-between mb-1">
                <h3 className="font-bold text-2xl">{isEdit ? "Update" : "Create"} Leave Request</h3>
                <Button className="hover:cursor-pointer" onClick={() => navigate("/leave")}>{t('leave_request.create.link_to_list')}</Button>
            </div>

            <div className="w-[100%] mt-5">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
                        <div className="first-row flex flex-wrap w-full">
                            <div className="w-[15%]">
                                <FormField
                                    control={form.control}
                                    name="user_code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('leave_request.create.code')}<DotRequireComponent/></FormLabel>
                                            <FormControl>
                                                <Input placeholder={t('leave_request.create.code')} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="ml-5 w-[25%] flex-1">
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
                            
                            <div className="ml-5 w-[25%]">
                                <FormField
                                    control={form.control}
                                    name="department"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('leave_request.create.department')}<DotRequireComponent/></FormLabel>
                                            <FormControl>
                                                <Input readOnly className="bg-gray-200 border-gray-300" placeholder={t('leave_request.create.department')} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="ml-5 w-[20%]">
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

                        <div className="second-row flex flex-wrap w-full">
                            <div className="w-[10%]">
                                <FormField
                                    control={form.control}
                                    name="from_date"
                                    render={({ field }) => (
                                        <FormItem className="hover:cursor-pointer">
                                            <FormLabel>{t('leave_request.create.from_date')}</FormLabel>
                                            <FormControl>
                                                <Input
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

                            <div className="w-[10%] ml-5">
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

                            <div className="w-[10%] ml-5">
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

                            <div className="w-[15%] ml-5">
                                <FormField
                                    control={form.control}
                                    name="type_leave"
                                    render={({ field, fieldState }) => (
                                        <FormItem className="hover:cursor-pointer">
                                            <FormLabel>{t('leave_request.create.type_leave.type_leave')}</FormLabel>
                                            <FormControl>
                                                <select
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    name={field.name}
                                                    id="from_hour" 
                                                    className={`dark:bg-[#454545] shadow-xs border border-[#ebebeb] p-1 rounded-[5px] ${fieldState.invalid ? "border-red-500" : "border-gray-200"}`}>
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

                            <div className="w-[15%] ml-5">
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

                        <div className="third-row flex flex-wrap w-full">
                            <div className="w-[10%]">
                                <FormField
                                    control={form.control}
                                    name="to_date"
                                    render={({ field }) => (
                                        <FormItem className="hover:cursor-pointer">
                                            <FormLabel>{t('leave_request.create.to_date')}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="w-full"
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

                            <div className="w-[10%] ml-5">
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
                                                    className="dark:bg-[#454545] shadow-xs border border-[#ebebeb] p-1 rounded-[5px]">
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

                            <div className="w-[10%] ml-5">
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

                        <div className="fourth-row flex flex-wrap w-full">
                            <div className="w-[50%]">
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

                        <Button disabled={loading} type="submit" className="hover:cursor-pointer w-[10%]">
                            { loading ? <Spinner className="text-white"/> : "Save" }
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}

