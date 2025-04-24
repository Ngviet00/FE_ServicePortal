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
import { ShowToast } from "@/lib"
import { useQuery } from "@tanstack/react-query"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"

import departmentApi from "@/api/departmentApi"
import roleApi from "@/api/roleApi"
import userApi from "@/api/userApi"
import { AxiosError } from "axios"
import authApi, { RegisterRequest } from "@/api/authApi"

const formSchema = z.object({
    code: z.string().nonempty({message: "Required"}),
    name: z.string().nonempty({message: "Required"}),
    password: z.string().nonempty({message: "Required"}),
    email: z.string().nonempty({message: "Required"}),
    role_id: z.number({message: 'Required'}),
    is_active: z.string().nullable().optional(),
    date_join_company: z.string().nullable().optional(),
    date_of_birth: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    sex: z.number().nullable().optional(),
    parent_department_id: z.string().nonempty({message: "Required"}),
    child_department_id: z.string().nullable().optional(),
    position_id: z.string().nonempty({message: "Required"}),
    management_position_id: z.string().nullable().optional()
})

const formatData = (values: z.infer<typeof formSchema>): RegisterRequest => ({
    code: values.code ?? null,
    name: values.name ?? null,
    password: values.password ?? null,
    email: values.email ?? null,
    role_id: values.role_id ?? null,
    date_of_birth: values.date_of_birth ? new Date(values.date_of_birth).toISOString() : null,
    date_join_company: values.date_join_company ? new Date(values.date_join_company).toISOString() : null,
    phone: values.phone ?? null,
    sex: values.sex ?? null,
    parent_department_id: parseInt(values.parent_department_id) ?? null,
    child_department_id: values.child_department_id ? parseInt(values.child_department_id) : null,
    position_id: parseInt(values.position_id) ?? null,
    management_position_id: values.management_position_id ? parseInt(values.management_position_id): null
});


export default function CreateUserForm() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [openSelectDepartment, setOpenSelectDepartment] = useState(false)
    const [openSelectChildDepartment, setOpenSelectChildDepartment] = useState(false)
    const [openSelectPosition, setOpenSelectPosition] = useState(false)
    const [openSelectManagementPosition, setOpenSelectManagementPosition] = useState(false)
    const [openRole, setOpenRole] = useState(false)
    const [childrenDepartments, setChildrenDepartments] = useState<{ id: number; name: string; parent_id: number }[] | undefined | null>([])
    const [positions, setPositions] = useState<{ id: number; name: string }[] | undefined | null>([]);
    const [showPosition, setShowPosition] = useState(false)

    const { code } = useParams<{ code: string }>()
    const isEdit = !!code;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            code: "",
            name: "",
            password: "",
            email: "",
            role_id: 4,
            is_active: "",
            date_join_company: new Date().toISOString().split("T")[0],
            date_of_birth: new Date().toISOString().split("T")[0],
            phone: "",
            sex: 1,
            parent_department_id: "",
            child_department_id: "",
            position_id: "",
            management_position_id: ""
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true)
        const data = formatData(values);
        try {
            await authApi.register(data)
            ShowToast("Create user success", "success")
            navigate('/user')
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

    //get by id
    const { data: userData } = useQuery({
        queryKey: ["get-by-code", code],
        queryFn: async () => {
            const res = await userApi.getByCode(code)
            return res;
        },
        enabled: !!code,
    })

    //when go to page edit/1, set data to form
    useEffect(() => {
        if (userData) {
            const { code, name, email, phone, sex, date_of_birth, date_join_company, role_id, parent_department_id, position_id, management_position_id } = userData.data.data
            form.reset({
                code: code,
                name: name,
                email: email,
                phone: phone,
                sex: sex,
                date_of_birth: date_of_birth,
                date_join_company: date_join_company,
                role_id: role_id,
                parent_department_id: parent_department_id,
                position_id: position_id,
                management_position_id: management_position_id
            })
        }
    }, [userData, form])

    //click input type date will show picker
    const handleInputClickShowPicker = (event: React.MouseEvent<HTMLInputElement>) => {
        (event.target as HTMLInputElement).showPicker();
    };

    //get parent department
    const { data: parentDepartments = [], isPending: isPendingParentDepartments, isError: isErrorParentDepartment } = useQuery({
        queryKey: ['get-department-child-department-position'],
        queryFn: async () => {
            const res = await departmentApi.GetDepartmentWithChildrenDepartmentAndPosition();
            return res.data.data;
        }
    });

    //get all role
    const { data: roles = [], isPending: isPendingRoles, isError: isErrorRoles } = useQuery({
        queryKey: ['get-all-role'],
        queryFn: async () => {
            const res = await roleApi.getAll({
                page: 1,
                page_size: 50
            });
            return res.data.data;
        }
    });


    //handle parent department change
    const handleParentDepartmentChange = (selectedDepartmentId: number) => {
        if (selectedDepartmentId == -1) {
            setPositions([])
            setChildrenDepartments([])
            setOpenSelectDepartment(false);
            form.setValue("position_id", "")
            form.setValue("management_position_id", "")
            return;
        }

        const departmentSelected = parentDepartments.find((item: {id: number}) => item.id == selectedDepartmentId)

        setChildrenDepartments(departmentSelected.childrens.length > 0 ? departmentSelected.childrens : [])

        if (departmentSelected.positions.length > 0) {
            setPositions(departmentSelected.positions)
        } else {
            setShowPosition(true)
        }

        setOpenSelectDepartment(false);
    }
    
    //handle child department change
    const handleChildDepartmentChange = (selectedChildDepartmentId: number, parentId?: number) => {
        if (selectedChildDepartmentId == -1) {
            const currentParentDepartment = parentDepartments.find((item: {id: string}) => item.id == form.getValues('parent_department_id'))
            setPositions(currentParentDepartment.positions.length > 0 ? currentParentDepartment.positions : [])
            setShowPosition(false);
            setOpenSelectChildDepartment(false);
            return;
        }

        const parent = parentDepartments.find((item: {id: number}) => item.id == parentId)
        const childrens = parent.childrens.find((item: {id: number}) => item.id == selectedChildDepartmentId)

        if (childrens.positions.length > 0) {
            setPositions(childrens.positions)
        } else {
            form.setValue('position_id', "")
            form.setValue('management_position_id', "")

            setPositions([])
            setShowPosition(true);
        }
        setOpenSelectChildDepartment(false);
    }

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
                                            <FormLabel>Code</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Code" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="ml-5 w-[25%]">
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
                            </div>

                            <div className="ml-5 w-[25%]">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="Email" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="ml-5 w-[25%]">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="Password" {...field} />
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
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone</FormLabel>
                                            <FormControl>
                                                <Input
                                                    name={field.name}
                                                    value={field.value ?? ""}
                                                    onChange={field.onChange}
                                                    type="text"
                                                    placeholder="Phone"/>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="w-[10%] ml-5">
                                <FormField
                                    control={form.control}
                                    name="sex"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Sex</FormLabel>
                                            <FormControl>
                                                <select
                                                    value={field.value ?? ""}
                                                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                                                    name={field.name}
                                                    id="sex" 
                                                    className=" text-sm text-gray-600 h-[36px] shadow-xs border border-[#ebebeb] p-1 rounded-[5px]"
                                                    >
                                                        <option value="">--Select--</option>
                                                        <option value="1">Male</option>
                                                        <option value="2">Female</option>
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
                                    name="date_of_birth"
                                    render={({ field }) => (
                                        <FormItem className="hover:cursor-pointer">
                                            <FormLabel>Date of birth</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="w-full"
                                                    onClick={handleInputClickShowPicker}
                                                    onChange={field.onChange}
                                                    value={field.value ?? ""}
                                                    type="date"
                                                    id="date_of_birth"
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
                                    name="date_join_company"
                                    render={({ field }) => (
                                        <FormItem className="hover:cursor-pointer">
                                            <FormLabel>Date join company</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="w-full"
                                                    onClick={handleInputClickShowPicker}
                                                    onChange={field.onChange}
                                                    value={field.value ?? ""}
                                                    type="date"
                                                    id="date_join_company"
                                                    name={field.name}
                                                />
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
                                    name="role_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Role</FormLabel>
                                            <Popover open={openRole} onOpenChange={setOpenRole}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={openRole}
                                                        className="w-[260px] justify-between text-gray-500"
                                                    >
                                                        {field.value
                                                            ? roles?.find((item: {id: number, name: string}) => item.id == field.value)?.name
                                                            : "Select"}
                                                        <ChevronsUpDown className="opacity-50 ml-2 h-4 w-4" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[260px] p-0">
                                                    {isPendingRoles ? (
                                                        <p className="p-2 text-sm text-muted-foreground">Loading...</p>
                                                    ) : isErrorRoles ? (
                                                        <p className="p-2 text-sm text-red-500">Failed to load role</p>
                                                    ) :(
                                                        <Command>
                                                            <CommandInput placeholder="Search..." className="h-9" />
                                                            <CommandList>
                                                                <CommandEmpty>No role found.</CommandEmpty>
                                                                <CommandGroup>
                                                                    <CommandItem
                                                                        key="none"
                                                                        onSelect={() => {
                                                                            field.onChange(null)
                                                                            setOpenRole(false)
                                                                        }}
                                                                    >
                                                                        -- No select --
                                                                        <Check
                                                                            className={cn(
                                                                                "ml-auto h-4 w-4",
                                                                                !field.value ? "opacity-100" : "opacity-0"
                                                                            )}
                                                                        />
                                                                    </CommandItem>

                                                                    {roles.map((item: {id: number, name: string}) => (
                                                                        <CommandItem
                                                                            key={item.id}
                                                                            onSelect={() => {
                                                                                field.onChange(item.id)
                                                                                setOpenRole(false)
                                                                            }}
                                                                        >
                                                                            {item.name}
                                                                            <Check
                                                                                className={cn(
                                                                                    "ml-auto h-4 w-4",
                                                                                    field.value == item.id ? "opacity-100" : "opacity-0"
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
                            </div>

                            <div className="w-[13%] ml-32">
                                <FormField
                                    control={form.control}
                                    name="parent_department_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Department</FormLabel>
                                            <Popover open={openSelectDepartment} onOpenChange={setOpenSelectDepartment}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={openSelectDepartment}
                                                        className="w-[260px] justify-between text-gray-500"
                                                    >
                                                        {field.value
                                                            ? parentDepartments?.find((item: {id: number, name: string}) => item.id.toString() == field.value)?.name
                                                            : "Select"}
                                                        <ChevronsUpDown className="opacity-50 ml-2 h-4 w-4" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[260px] p-0">
                                                    {isPendingParentDepartments ? (
                                                        <p className="p-2 text-sm text-muted-foreground">Loading...</p>
                                                    ) : isErrorParentDepartment ? (
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
                                                                            field.onChange("")
                                                                            handleParentDepartmentChange(-1)
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

                                                                    {parentDepartments.map((item: {id: number, name: string}) => (
                                                                        <CommandItem
                                                                            key={item.id}
                                                                            onSelect={() => {
                                                                                field.onChange(item.id.toString())
                                                                                handleParentDepartmentChange(item.id)
                                                                            }}
                                                                        >
                                                                            {item.name}
                                                                            <Check
                                                                                className={cn(
                                                                                    "ml-auto h-4 w-4",
                                                                                    field.value == item.id.toString() ? "opacity-100" : "opacity-0"
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
                            </div>

                            {
                                childrenDepartments && childrenDepartments.length > 0 ? (
                                    <div className="w-[13%] ml-20">
                                        <FormField
                                            control={form.control}
                                            name="child_department_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Children Department</FormLabel>
                                                    <Popover open={openSelectChildDepartment} onOpenChange={setOpenSelectChildDepartment}>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                aria-expanded={openSelectChildDepartment}
                                                                className="w-[260px] justify-between text-gray-500"
                                                            >
                                                            {field.value
                                                            ? childrenDepartments?.find((item: {id: number, name: string}) => item.id.toString() == field.value)?.name ?? ""
                                                            : "Select"}
                                                                <ChevronsUpDown className="opacity-50 ml-2 h-4 w-4" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-[260px] p-0">
                                                                <Command>
                                                                    <CommandInput placeholder="Search..." className="h-9" />
                                                                    <CommandList>
                                                                        <CommandEmpty>No children department found.</CommandEmpty>
                                                                        <CommandGroup>
                                                                            <CommandItem
                                                                                key="none"
                                                                                onSelect={() => {
                                                                                    field.onChange("")
                                                                                    handleChildDepartmentChange(-1)
                                                                                }}
                                                                            >
                                                                                -- No select --
                                                                                <Check
                                                                                    className={cn(
                                                                                        "ml-auto h-4 w-4",
                                                                                        !field.value ? "opacity-100" : "opacity-0"
                                                                                    )}
                                                                                />
                                                                            </CommandItem>

                                                                            {childrenDepartments.map((item: {id: number, name: string, parent_id: number}) => (
                                                                                <CommandItem
                                                                                    key={item.id}
                                                                                    onSelect={() => {
                                                                                        field.onChange(item.id.toString())
                                                                                        handleChildDepartmentChange(item.id, item.parent_id)
                                                                                    }}
                                                                                >
                                                                                    {item.name}
                                                                                    <Check
                                                                                        className={cn(
                                                                                            "ml-auto h-4 w-4",
                                                                                            field.value == item.id.toString() ? "opacity-100" : "opacity-0"
                                                                                        )}
                                                                                    />
                                                                                </CommandItem>
                                                                            ))}
                                                                        </CommandGroup>
                                                                    </CommandList>
                                                                </Command>
                                                            {/* )} */}
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                ) : (<></>)
                            }

                            {
                                (positions && positions.length > 0) || (showPosition) ? (
                                    <div className="w-[13%] ml-20">
                                        <FormField
                                            control={form.control}
                                            name="position_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Position</FormLabel>
                                                    <Popover open={openSelectPosition} onOpenChange={setOpenSelectPosition}>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                aria-expanded={openSelectPosition}
                                                                className="w-[260px] justify-between text-gray-500"
                                                            >
                                                            {field.value
                                                            ? positions?.find((item: {id: number, name: string}) => item.id.toString() == field.value)?.name ?? ""
                                                            : "Select"}
                                                                <ChevronsUpDown className="opacity-50 ml-2 h-4 w-4" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-[260px] p-0">
                                                                <Command>
                                                                    <CommandInput placeholder="Search..." className="h-9" />
                                                                    <CommandList>
                                                                        <CommandEmpty>No position found.</CommandEmpty>
                                                                        <CommandGroup>
                                                                            <CommandItem
                                                                                key="none"
                                                                                onSelect={() => {
                                                                                    field.onChange("")
                                                                                    setOpenSelectPosition(false)
                                                                                }}
                                                                            >
                                                                                -- No select --
                                                                                <Check
                                                                                    className={cn(
                                                                                        "ml-auto h-4 w-4",
                                                                                        !field.value ? "opacity-100" : "opacity-0"
                                                                                    )}
                                                                                />
                                                                            </CommandItem>

                                                                            {positions?.map((item: {id: number, name: string}) => (
                                                                                <CommandItem
                                                                                    key={item.id}
                                                                                    onSelect={() => {
                                                                                        field.onChange(item.id.toString())
                                                                                        setOpenSelectPosition(false)
                                                                                    }}
                                                                                >
                                                                                    {item.name}
                                                                                    <Check
                                                                                        className={cn(
                                                                                            "ml-auto h-4 w-4",
                                                                                            field.value == item.id.toString() ? "opacity-100" : "opacity-0"
                                                                                        )}
                                                                                    />
                                                                                </CommandItem>
                                                                            ))}
                                                                        </CommandGroup>
                                                                    </CommandList>
                                                                </Command>
                                                            {/* )} */}
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                ) : (<></>)
                            }
                            
                            {
                                (positions && positions.length > 0) || (showPosition) ? (
                                    <div className="w-[13%] ml-20">
                                        <FormField
                                            control={form.control}
                                            name="management_position_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Management Position</FormLabel>
                                                    <Popover open={openSelectManagementPosition} onOpenChange={setOpenSelectManagementPosition}>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                aria-expanded={openSelectManagementPosition}
                                                                className="w-[260px] justify-between text-gray-500"
                                                            >
                                                            {field.value
                                                            ? positions?.find((item: {id: number, name: string}) => item.id.toString() == field.value)?.name ?? ""
                                                            : "Select"}
                                                                <ChevronsUpDown className="opacity-50 ml-2 h-4 w-4" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-[260px] p-0">
                                                                <Command>
                                                                    <CommandInput placeholder="Search..." className="h-9" />
                                                                    <CommandList>
                                                                        <CommandEmpty>No position found.</CommandEmpty>
                                                                        <CommandGroup>
                                                                            <CommandItem
                                                                                key="none"
                                                                                onSelect={() => {
                                                                                    field.onChange("")
                                                                                    setOpenSelectManagementPosition(false)
                                                                                }}
                                                                            >
                                                                                -- No select --
                                                                                <Check
                                                                                    className={cn(
                                                                                        "ml-auto h-4 w-4",
                                                                                        !field.value ? "opacity-100" : "opacity-0"
                                                                                    )}
                                                                                />
                                                                            </CommandItem>

                                                                            {positions?.map((item: {id: number, name: string}) => (
                                                                                <CommandItem
                                                                                    key={item.id}
                                                                                    onSelect={() => {
                                                                                        field.onChange(item.id.toString())
                                                                                        setOpenSelectManagementPosition(false)
                                                                                    }}
                                                                                >
                                                                                    {item.name}
                                                                                    <Check
                                                                                        className={cn(
                                                                                            "ml-auto h-4 w-4",
                                                                                            field.value == item.id.toString() ? "opacity-100" : "opacity-0"
                                                                                        )}
                                                                                    />
                                                                                </CommandItem>
                                                                            ))}
                                                                        </CommandGroup>
                                                                    </CommandList>
                                                                </Command>
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                ) : (<></>)
                            }
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

