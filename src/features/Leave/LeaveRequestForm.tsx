"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
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
import { ENUM_TIME_LEAVE, ShowToast, TIME_LEAVE, TYPE_LEAVE } from "@/lib"
import { Textarea } from "@/components/ui/textarea"
import { useAuthStore } from "@/store/authStore"
import DotRequireComponent from "@/components/DotRequireComponent"
import { AxiosError } from "axios"
import leaveRequestApi, { LeaveRequestData } from "@/api/leaveRequestApi"

const formSchema = z.object({
    code: z.string().nonempty({message: "Required"}),
    department: z.string().nonempty({message: "Required"}),
    name: z.string().nonempty({message: "Required"}),
    position: z.string().nonempty({message: "Required"}),

    from_date: z.string().nonempty({message: "Required"}),
    from_hour: z.string().nonempty({message: "Required"}),
    from_minutes: z.string().nonempty({message: "Required"}),

    to_date: z.string().nonempty({message: "Required"}),
    to_hour: z.string().nonempty({message: "Required"}),
    to_minutes: z.string().nonempty({message: "Required"}),

    type_leave: z.string().nonempty({message: "Required"}),
    time_leave: z.string().nonempty({message: "Required"}),

    reason: z.string().nonempty({message: "Required"})
}).refine(data => {
    const from = new Date(data.from_date);
    const to = new Date(data.to_date);
    return to >= from;
}, {
    path: ["to_date"],
    message: "To date cannot be earlier than From date",
});

const formatData = (values: z.infer<typeof formSchema>, codeCurrentUser: string | undefined): LeaveRequestData => ({
    user_code: values.code ?? null,
    name: values.name ?? null,
    name_register: codeCurrentUser ?? "",
    position: values.position,
    department: values.department,
    from_date: `${values.from_date} ${values.from_hour}:${values.from_minutes}`,
    to_date: `${values.to_date} ${values.to_hour}:${values.to_minutes}`,
    reason: values.reason,
    time_leave: parseInt(values.time_leave),
    type_leave: parseInt(values.type_leave),
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
            code: user?.code,
            department: user?.children_department ? user?.children_department.name : (user?.parent_department ? user?.parent_department.name : "Not Set"),
            name: user?.name,
            position: user?.position?.name,
        
            from_date: new Date().toISOString().slice(0, 10),
            from_hour: "08",
            from_minutes: "00",
        
            to_date: new Date().toISOString().slice(0, 10),
            to_hour: "17",
            to_minutes: "00",
        
            type_leave: "1",
            time_leave: "1",
            reason: "",
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        // setLoading(true)

        const data = formatData(values, user?.code);

        console.log(data);

        try {
            await leaveRequestApi.create(data)
            ShowToast("Create leave request success", "success")
            form.setValue("reason", "")
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

    // const { data, isPending, isError } = useQuery({
    //     queryKey: ['parentDepartments'],
    //     queryFn: async () => {
    //         const res = await departmentApi.getParentDepartment();
    //         return res.data.data as typeParentDepartments[];
    //     }
    // });

    //get by id
    // const { data: departmentData } = useQuery({
    //     queryKey: ["department", id],
    //     queryFn: async () => await departmentApi.getById(Number(id)),
    //     enabled: !!id,
    // })

    // useEffect(() => {
    //     if (departmentData) {
    //         const { name, note, parentId } = departmentData.data.data
    //         form.reset({
    //             name,
    //             note: note ?? "",
    //             parentId: parentId ?? null,
    //         })
    //     }
    // }, [departmentData, form])

    const handleInputClickShowPicker = (event: React.MouseEvent<HTMLInputElement>) => {
        (event.target as HTMLInputElement).showPicker();
    };

    const watchTimeLeave = useWatch({
        control: form.control,
        name: "time_leave"
    })
    

    useEffect(() => {
        if (watchTimeLeave == ENUM_TIME_LEAVE.ALL_DAY) {
            form.setValue("from_hour", "08");
            form.setValue("to_hour", "17");
        } else if (watchTimeLeave == ENUM_TIME_LEAVE.MORNING) {
            form.setValue("from_hour", "08");
            form.setValue("to_hour", "12");
        } else {
            form.setValue("from_hour", "13");
            form.setValue("to_hour", "17");
        }
    }, [watchTimeLeave, form])

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
                                    name="code"
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
                                                <Input placeholder={t('leave_request.create.department')} {...field} />
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
                                                    className="shadow-xs border border-[#ebebeb] p-1 rounded-[5px]"
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
                                                    className="shadow-xs border border-[#ebebeb] p-1 rounded-[5px]">
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
                                    render={({ field }) => (
                                        <FormItem className="hover:cursor-pointer">
                                            <FormLabel>{t('leave_request.create.type_leave.type_leave')}</FormLabel>
                                            <FormControl>
                                                <select
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    name={field.name}
                                                    id="from_hour" 
                                                    className="shadow-xs border border-[#ebebeb] p-1 rounded-[5px]">
                                                    <option value="">--Select--</option>
                                                    {
                                                        TYPE_LEAVE.map((item) => (
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
                                                    className="shadow-xs border border-[#ebebeb] p-1 rounded-[5px]">
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
                                                    className="shadow-xs border border-[#ebebeb] p-1 rounded-[5px]">
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
                                                    className="shadow-xs border border-[#ebebeb] p-1 rounded-[5px]">
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
                            { loading ? "Loading..." : "Save" }
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}

