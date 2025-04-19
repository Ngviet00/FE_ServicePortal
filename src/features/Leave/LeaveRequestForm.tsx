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

import { Input } from "@/components/ui/input"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown } from "lucide-react"

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

const formSchema = z.object({
    name: z.string().nonempty({ message: "Name is required" }),
    note: z.string().optional(),
    parentId: z.number().nullable().optional(),
})

interface typeParentDepartments {
    id: number | null
    name: string
    note: string | null
    parentId: number | undefined | null
}

export default function LeaveRequestForm() {
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
        setLoading(true);
        try {
            if (isEdit) {
                await departmentApi.update(Number(id), {
                    ...values,
                    note: values.note ?? null,
                    parent_id: values.parentId ?? null,
                })
                ShowToast("Update department success", "success")
                navigate("/department")
              } else {
                await departmentApi.create({
                    ...values,
                    note: values.note ?? null,
                    parent_id: values.parentId ?? null,
                })
                ShowToast("Add department success", "success")
                navigate("/department")
              }
        } catch (err: unknown) {
            const error = err as AxiosError<{ message: string }>
            const message = error?.response?.data?.message ?? "Something went wrong"
            form.setError("name", {
                type: "server",
                message,
            })
        } finally {
            setLoading(false);
        }
    }

    //get list parent departments
    const { data, isPending, isError } = useQuery({
        queryKey: ['parentDepartments'],
        queryFn: async () => {
            const res = await departmentApi.getParentDepartment();
            return res.data.data as typeParentDepartments[];
        }
    });

    //get by id
    const { data: departmentData } = useQuery({
        queryKey: ["department", id],
        queryFn: async () => await departmentApi.getById(Number(id)),
        enabled: !!id,
    })

    useEffect(() => {
        if (departmentData) {
            const { name, note, parentId } = departmentData.data.data
            form.reset({
                name,
                note: note ?? "",
                parentId: parentId ?? null,
            })
        }
    }, [departmentData, form])

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex justify-between mb-1">
                <h3 className="font-bold text-2xl">{isEdit ? "Update" : "Create"} Department</h3>
                <Button className="hover:cursor-pointer" onClick={() => navigate("/department")}>List Departments</Button>
            </div>

            <div className="w-[40%] mt-5">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="note"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Note</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Note" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="parentId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Parent Department</FormLabel>
                                    <Popover open={open} onOpenChange={setOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={open}
                                                className="w-[260px] justify-between text-gray-500"
                                            >
                                                {field.value
                                                    ? data?.find((item) => item.id === field.value)?.name
                                                    : "Select"}
                                                <ChevronsUpDown className="opacity-50 ml-2 h-4 w-4" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[260px] p-0">
                                            {isPending ? (
                                                <p className="p-2 text-sm text-muted-foreground">Loading...</p>
                                            ) : isError ? (
                                                <p className="p-2 text-sm text-red-500">Failed to load departments</p>
                                            ) : (
                                                <Command>
                                                    <CommandInput placeholder="Search..." className="h-9" />
                                                    <CommandList>
                                                        <CommandEmpty>No department found.</CommandEmpty>
                                                        <CommandGroup>
                                                            <CommandItem
                                                                key="none"
                                                                onSelect={() => {
                                                                    field.onChange(null)
                                                                    setOpen(false)
                                                                }}
                                                            >
                                                                -- No Parent --
                                                                <Check
                                                                    className={cn(
                                                                        "ml-auto h-4 w-4",
                                                                        !field.value ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                            </CommandItem>

                                                            {data.map((item) => (
                                                                <CommandItem
                                                                    key={item.id}
                                                                    onSelect={() => {
                                                                        field.onChange(item.id)
                                                                        setOpen(false)
                                                                    }}
                                                                >
                                                                    {item.name}
                                                                    <Check
                                                                        className={cn(
                                                                            "ml-auto h-4 w-4",
                                                                            field.value === item.id ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            )}
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button disabled={loading} type="submit" className="hover:cursor-pointer">
                            { loading ? "Loading..." : "Save" }
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}

