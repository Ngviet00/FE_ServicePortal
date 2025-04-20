"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Calendar, CalendarIcon, Check, ChevronsUpDown } from "lucide-react"

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

import { ShowToast } from "@/ultils"

import React, { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import departmentApi from "@/api/departmentApi"
import { AxiosError } from "axios"
import { useParams } from "react-router-dom"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem } from "@radix-ui/react-select"
import { SelectComponent } from "./components/SelectComponent"
import { DatePicker } from "./components/PopupCalendar"
import { Textarea } from "@/components/ui/textarea"
import { useTranslation } from "react-i18next"

const formSchema = z.object({
    name: z.string().nonempty({ message: "Name is required" }),
    note: z.string().optional(),
    parentId: z.number().nullable().optional(),
})

// interface typeParentDepartments {
//     id: number | null
//     name: string
//     note: string | null
//     parentId: number | undefined | null
// }

export default function LeaveRequestForm() {
    const { t } = useTranslation();
    const [open, setOpen] = React.useState(false)
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    const { id } = useParams<{ id: string }>()
    const isEdit = !!id;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            note: "",
            parentId: null,
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
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

    const [fromHour, setFromHour] = useState("08")
    const [fromMinute, setFromMinute] = useState("00")
    const [toHour, setToHour] = useState("17")
    const [toMinute, setToMinute] = useState("00")

    const [typeLeave, setTypeLeave] = useState("1")
    const [timeLeave, setTimeLeave] = useState("1");

    
    const hours = Array.from({ length: 24 }, (_, i) => ({
        value: i.toString().padStart(2, "0"),
        label: i.toString().padStart(2, "0"),
    }))
    
    const minutes = Array.from({ length: 60 }, (_, i) => ({
        value: i.toString().padStart(2, "0"),
        label: i.toString().padStart(2, "0"),
    }))

    const type_leave = [
        {
            label: "leave_request.create.type_leave.annual",
            value: "1"
        },
        {
            label: "leave_request.create.type_leave.personal",
            value: "2"
        },
        {
            label: "leave_request.create.type_leave.sick",
            value: "3"
        },
        {
            label: "leave_request.create.type_leave.wedding",
            value: "4"
        },
        {
            label: "leave_request.create.type_leave.other",
            value: "5"
        }
    ]

    const time_leave = [
        {
            label: "leave_request.create.time_leave.all_day",
            value: "1"
        },
        {
            label: "leave_request.create.time_leave.morning",
            value: "2"
        },
        {
            label: "leave_request.create.time_leave.afternoon",
            value: "3"
        }
    ]

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex justify-between mb-1">
                <h3 className="font-bold text-2xl">{isEdit ? "Update" : "Create"} Leave Request</h3>
                <Button className="hover:cursor-pointer" onClick={() => navigate("/department")}>{t('leave_request.create.link_to_list')}</Button>
            </div>

            <div className="w-[100%] mt-5">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
                        <div className="first-row flex flex-wrap w-full">
                            <div className="w-[25%]">
                                <FormField
                                    control={form.control}
                                    name="department"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('leave_request.create.department')}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t('leave_request.create.department')} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="ml-2 w-[15%]">
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

                            <div className="ml-2 w-[25%] flex-1">
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

                            <div className="ml-2 w-[20%]">
                                <FormField
                                    control={form.control}
                                    name="position"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('leave_request.create.position')}</FormLabel>
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
                            <div className="w-[20%]">
                                <FormField
                                    control={form.control}
                                    name="from_date"
                                    render={({ field }) => (
                                        <FormItem className="hover:cursor-pointer">
                                            <FormLabel>{t('leave_request.create.from_date')}</FormLabel>
                                            <FormControl>
                                                <DatePicker
                                                    date={field.value}
                                                    setDate={field.onChange}
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
                                                <SelectComponent 
                                                    label="hour"
                                                    value={fromHour}
                                                    options={hours}
                                                    onChange={setFromHour} />
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
                                                <SelectComponent label="minutes"
                                                    value={fromMinute}
                                                    options={minutes}
                                                    onChange={setFromMinute} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="w-[10%] ml-2">
                                <FormField
                                    control={form.control}
                                    name="type_leave"
                                    render={({ field }) => (
                                        <FormItem className="hover:cursor-pointer">
                                            <FormLabel>{t('leave_request.create.type_leave.type_leave')}</FormLabel>
                                            <FormControl>
                                                <SelectComponent label="type leave"
                                                    value={typeLeave.toString()}
                                                    options={type_leave}
                                                    onChange={setTypeLeave}
                                                    isTranslate={true}
                                                />
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
                                                <SelectComponent label="minutes"
                                                    value={timeLeave.toString()}
                                                    options={time_leave}
                                                    onChange={setTimeLeave}
                                                    isTranslate={true}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="third-row flex flex-wrap w-full">
                            <div className="w-[20%]">
                                <FormField
                                    control={form.control}
                                    name="to_date"
                                    render={({ field }) => (
                                        <FormItem className="hover:cursor-pointer">
                                            <FormLabel>{t('leave_request.create.to_date')}</FormLabel>
                                            <FormControl>
                                                <DatePicker
                                                    date={field.value}
                                                    setDate={field.onChange}
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
                                                <SelectComponent 
                                                    label="hour"
                                                    value={toHour}
                                                    options={hours}
                                                    onChange={setToHour} />
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
                                                <SelectComponent label="minutes"
                                                    value={toMinute}
                                                    options={minutes}
                                                    onChange={setToMinute} />
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
                                                <Textarea placeholder={t('leave_request.create.reason')} {...field}/>
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

