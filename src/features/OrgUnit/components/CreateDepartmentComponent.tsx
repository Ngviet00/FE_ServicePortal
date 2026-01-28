"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import orgUnitApi from "@/api/orgUnitApi";
import ButtonDeleteComponent from "@/components/ButtonDeleteComponent";
import PaginationControl from "@/components/PaginationControl/PaginationControl";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage, ShowToast } from "@/lib";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod"

export default function CreateDepartmentComponent () {
    const [totalPage, setTotalPage] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [unitId, setUnitId] = useState('');
    const queryClient = useQueryClient()

	const { data: getAllCompanyAndMngDeptAndDepts, isPending, error } = useQuery({
		queryKey: ['get-all-company-mng-dept-and-dept', page, pageSize, unitId],
		queryFn: async () => {
			const res = await orgUnitApi.GetAllCompanyAndMngDeptAndDept({
                unitId: unitId != '' ? Number(unitId) : null,
                page: page,
                pageSize: pageSize
            })
            setTotalPage(res.data.total_pages);
			return res.data.data
		},
	});

    const { data: getAllCompanyAndMngDeptAndDeptsWithOutFilter } = useQuery({
        queryKey: ['get-all-company-mng-dept-and-dept-without-filter'],
        queryFn: async () => {
            const res = await orgUnitApi.GetAllCompanyAndMngDeptAndDept({
                page: 1,
                pageSize: 200
            });
            return res.data.data;
        }
    });

    function setCurrentPage(page: number): void {
		setPage(page);
	}

	function handlePageSizeChange(size: number): void {
		setPage(1);
		setPageSize(size);
	}

    const mutation = useMutation({
        mutationFn: async (id: number) => {
            await orgUnitApi.Delete(id);
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (error) => {
            ShowToast(getErrorMessage(error), "error");
        }
    });
    
    function handleSuccessDelete(shouldGoBack?: boolean) {
        if (shouldGoBack && page > 1) {
            setPage(prev => prev - 1);
        } else {
            queryClient.invalidateQueries({ queryKey: ['get-all-company-mng-dept-and-dept'] });
            queryClient.invalidateQueries({ queryKey: ['get-all-company-mng-dept-and-dept-without-filter'] });
        }
    }

    const handleDeleteDepartment = async (id: number) => {
        try {
            const shouldGoBack = getAllCompanyAndMngDeptAndDepts.length === 1;
            await mutation.mutateAsync(id);
            handleSuccessDelete(shouldGoBack);
        } catch (error) {
            ShowToast(getErrorMessage(error), "error");
        }
    };

    return (
        <div className="overflow-x-auto">
            <div className="flex my-2">
                <div className="flex items-center mr-3">
                    <label className="block mr-2">{`Đơn vị`}</label>
                    <select onChange={(e) => {
                        setPage(1)
                        setUnitId(e.target.value)
                    }} value={unitId} className={`border cursor-pointer border-gray-300 rounded px-3 py-1`}>
                        <option value="">--Chọn--</option>
                        <option value="1">Company</option>
                        <option value="2">Manager department</option>
                        <option value="3">Department</option>
                    </select>
                </div>
                <ModalCreateDept listParentDepartments={getAllCompanyAndMngDeptAndDeptsWithOutFilter} onAction={() => queryClient.invalidateQueries({ queryKey: ['get-all-company-mng-dept-and-dept'] })}/>
            </div>

            <table className="min-w-full text-sm border border-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-2 border w-[70px]">Id</th>
                        <th className="px-4 py-2 border w-[400px]">Tên</th>
                        <th className="px-4 py-2 border w-[300px]">Phòng ban cha</th>
                        <th className="px-4 py-2 border w-[300px]">Loại</th>
                        <th className="px-4 py-2 border">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        isPending ? (
                            Array.from({ length: 3 }).map((_, index) => (
                                <tr key={index}>
                                    <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[30px] bg-gray-300" /></div></td>
                                    <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></td>
                                    <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[80px] bg-gray-300" /></div></td>
                                    <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[90px] bg-gray-300" /></div></td>
                                    <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[90px] bg-gray-300" /></div></td>
                                </tr>  
                            ))
                        ) : isPending || getAllCompanyAndMngDeptAndDepts.length == 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-2 text-center font-bold text-red-700">
                                    { error?.message ?? 'Không có kết quả' } 
                                </td>
                            </tr>
                        ) : (
                            getAllCompanyAndMngDeptAndDepts?.map((item: any) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 border whitespace-nowrap text-center">
                                        {item.id}
                                    </td>
                                    <td className="px-4 py-2 border whitespace-nowrap">{item?.name}</td>
                                    <td className="px-4 py-2 border whitespace-nowrap">{item?.parentOrgUnit?.name ?? '--'}</td>
                                    <td className="px-4 py-2 border whitespace-nowrap">{item?.unit?.name ?? '--'}</td>
                                    <td className="px-4 py-2 border whitespace-nowrap text-center">
                                        <ModalCreateDept listParentDepartments={getAllCompanyAndMngDeptAndDeptsWithOutFilter} department={item} onAction={() => queryClient.invalidateQueries({ queryKey: ['get-all-company-mng-dept-and-dept'] })}/>
                                        <ButtonDeleteComponent id={item?.id} onDelete={() => handleDeleteDepartment(item?.id)}/>
                                    </td>
                                </tr>
                            ))
                        )
                    }
                </tbody>
            </table>
            {
                getAllCompanyAndMngDeptAndDepts?.length > 0 ? (<PaginationControl
                    currentPage={page}
                    totalPages={totalPage}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={handlePageSizeChange}
                />) : (null)
            }
        </div>
    )
}

const createTeamSchema = z.object({
    id: z.number().optional().nullable(),
    name: z.string().min(1, { message: "Tên không được để trống" }),
    parentOrgUnitId: z.string().optional().nullable(),
    unitId: z.string().optional().nullable(),
})

type CreateTeamFormValues = z.infer<typeof createTeamSchema>

interface PropsModalCreateTeam {
    department?: {
        id: number,
        name: string,
        unitId: string,
        parentOrgUnitId?: string
    },
    onAction?: () => void;
    listParentDepartments?: any
};

export function ModalCreateDept({ department, onAction, listParentDepartments }: PropsModalCreateTeam) {
    const [open, setOpen] = useState(false)
    const queryClient = useQueryClient()
    
    const form = useForm<CreateTeamFormValues>({
        resolver: zodResolver(createTeamSchema),
        defaultValues: {
            id: null,
            name: "",
            parentOrgUnitId: '',
            unitId: '3'
        },
    })

    useEffect(() => {
        if (department && open) {
            form.reset({
                id: department?.id,
                name: department?.name,
                parentOrgUnitId: department?.parentOrgUnitId?.toString() ?? null,
                unitId: department?.unitId?.toString() ?? null,
            });
        } 
        else {
            form.reset({ id: null, name: "", parentOrgUnitId: '' });
        }
    }, [department, open, form]);

    const onSubmit = async (values: CreateTeamFormValues) => {
        try {
            setOpen(false);
            await orgUnitApi.CreateOrUpdate({
                id: values?.id ?? null,
                name: values.name,
                parentOrgUnitId: values.parentOrgUnitId != '' ? Number(values.parentOrgUnitId) : null,
                unitId: values.unitId != '' ? Number(values.unitId) : null
            })
            
            ShowToast('Success')
            onAction?.();
            form.reset();
            queryClient.invalidateQueries({ queryKey: ['get-all-company-mng-dept-and-dept-without-filter'] })
        } catch (err) {
            ShowToast(getErrorMessage(err), "error")
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="hover:cursor-pointer rounded-[3px] py-0.5 px-2 bg-[#555555] text-white">
                    {department ? 'Sửa' : 'Thêm mới' }
                </button>
            </DialogTrigger>

            <DialogContent className="w-[40em]" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>Bộ phận</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(
                        onSubmit, 
                        (errors) => console.log("Danh sách lỗi khiến form bị focus:", errors)
                    )} className="space-y-4 max-w-md">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <Label htmlFor="name">Tên</Label>
                                    <FormControl>
                                        <Input id="name" placeholder="..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}  
                        />
                        <FormField
                            control={form.control}
                            name="parentOrgUnitId"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Phòng ban cha</Label>
                                    <select 
                                        {...field} 
                                        value={field.value ?? ""}
                                        className="border border-gray-300 rounded px-3 py-1 w-full"
                                    >
                                        <option value="">--Chọn--</option>
                                        {listParentDepartments?.map((item: any) => (
                                            <option key={item.id} value={item?.id?.toString()}>
                                                {item.name}
                                            </option>
                                        ))}
                                    </select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="unitId"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Chọn loại</Label>
                                    <select 
                                        {...field} 
                                        value={field.value ?? ""}
                                        className="border border-gray-300 rounded px-3 py-1 w-full"
                                    >
                                        <option value="1">Company</option>
                                        <option value="2">Manager department</option>
                                        <option value="3">Department</option>
                                    </select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <div className="flex justify-end">
                            <Button type="submit" className="hover:cursor-pointer">
                                Lưu
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}