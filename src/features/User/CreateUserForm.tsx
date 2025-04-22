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
import userApi from "@/api/userApi"
import { useQuery } from "@tanstack/react-query"

const formSchema = z.object({
    code: z.string().nonempty({message: "Required"}),
    name: z.string().nonempty({message: "Required"}),
    password: z.string().nonempty({message: "Required"}),
    email: z.string().nonempty({message: "Required"}),
    role_id: z.string().nonempty({message: "Required"}),
    is_active: z.string().nullable().optional(),
    date_join_company: z.string().nullable().optional(),
    date_of_birth: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    sex: z.string().nullable().optional(),
    department_id: z.string().nonempty({message: "Required"}),
    position_id: z.string().nonempty({message: "Required"}),
    team_id: z.string().nullable().optional()
})

// interface TypeLeaveRequestForm {
//     employee_code: string,
//     department: string,
//     name: string,
//     position: string,

//     from_date: string,
//     from_hour: string,
//     from_minutes: string,

//     to_date: string,
//     to_hour: string,
//     to_minutes: string,

//     type_leave: string,
//     time_leave: string,
//     reason: string,
// }

export default function CreateUserForm() {
    const { t } = useTranslation();
    const [loading] = useState(false);
    const navigate = useNavigate();
    
    const { id } = useParams<{ id: string }>()
    const isEdit = !!id;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            code: "",
            name: "",
            password: "",
            email: "",
            role_id: "",
            is_active: "",
            date_join_company: "",
            date_of_birth: "",
            phone: "",
            sex:"",
            department_id: "",
            position_id: "",
            team_id:""
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        console.log(values);
        ShowToast("Create leave request success", "success")
        // setLoading(true);
        // try {
        //     if (isEdit) {
        //         await departmentApi.update(Number(id), {
        //             ...values,
        //             note: values.note ?? null,
        //             parent_id: values.parentId ?? null,
        //         })
        //         ShowToast("Update department success", "success")
        //         navigate("/department")
        //       } else {
        //         await departmentApi.create({
        //             ...values,
        //             note: values.note ?? null,
        //             parent_id: values.parentId ?? null,
        //         })
        //         ShowToast("Add department success", "success")
        //         navigate("/department")
        //       }
        // } catch (err: unknown) {
        //     const error = err as AxiosError<{ message: string }>
        //     const message = error?.response?.data?.message ?? "Something went wrong"
        //     form.setError("name", {
        //         type: "server",
        //         message,
        //     })
        // } finally {
        //     setLoading(false);
        // }
    }

    // const { data, isPending, isError } = useQuery({
    //     queryKey: ['parentDepartments'],
    //     queryFn: async () => {
    //         const res = await departmentApi.getParentDepartment();
    //         return res.data.data as typeParentDepartments[];
    //     }
    // });

    //get by id
    const { data: userData } = useQuery({
        queryKey: ["get-by-id", id],
        queryFn: async () => await userApi.getById(id),
        enabled: !!id,
    })

    useEffect(() => {
        if (userData) {
            //const { name, note, parentId } = userData.data.data
            form.reset({
                // name,
                // note: note ?? "",
                // parentId: parentId ?? null,
            })
        }
    }, [userData, form])

    const handleInputClickShowPicker = (event: React.MouseEvent<HTMLInputElement>) => {
        (event.target as HTMLInputElement).showPicker();
    };

    // const watchTimeLeave = useWatch({
    //     control: form.control,
    //     name: "time_leave"
    // })
    

    // useEffect(() => {
    //     if (watchTimeLeave == ENUM_TIME_LEAVE.ALL_DAY) {
    //         form.setValue("from_hour", "08");
    //         form.setValue("to_hour", "17");
    //     } else if (watchTimeLeave == ENUM_TIME_LEAVE.MORNING) {
    //         form.setValue("from_hour", "08");
    //         form.setValue("to_hour", "12");
    //     } else {
    //         form.setValue("from_hour", "13");
    //         form.setValue("to_hour", "17");
    //     }
    // }, [watchTimeLeave, form])

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex justify-between mb-1">
                <h3 className="font-bold text-2xl">{isEdit ? "Update" : "Create New"} User</h3>
                <Button className="hover:cursor-pointer" onClick={() => navigate("/user")}>{t('user.list.list')}</Button>
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
                                            <FormLabel>{t('leave_request.create.code')}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t('leave_request.create.code')} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="ml-2 w-[25%]">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('leave_request.create.name')}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t('leave_request.create.name')} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="ml-2 w-[25%]">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('leave_request.create.name')}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t('leave_request.create.name')} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="ml-2 w-[25%]">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('leave_request.create.name')}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t('leave_request.create.name')} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="second-row flex flex-wrap w-full">
                            <div className="w-[13%]">
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

                            <div className="w-[10%] ml-2">
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

                            <div className="w-[10%] ml-2">
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

                            <div className="w-[15%] ml-2">
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
                            <div className="w-[13%]">
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

                            <div className="w-[10%] ml-2">
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

                            <div className="w-[10%] ml-2">
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
                                            <FormLabel>{t('leave_request.create.reason')}</FormLabel>
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

