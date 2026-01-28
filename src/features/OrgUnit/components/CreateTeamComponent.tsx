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
import { getErrorMessage, ShowToast, UnitEnum } from "@/lib";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod"

export default function CreateTeamComponent () {
    const [totalPage, setTotalPage] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [deptId, setDeptId] = useState('');
    const queryClient = useQueryClient()

    const { data: departments = [] } = useQuery({ 
        queryKey: ['get-all-department'], 
        queryFn: async () => { 
            const res = await orgUnitApi.GetAllDepartment();
            return res.data.data;
        }
    });

	const { data: getAllTeams, isPending, error } = useQuery({
		queryKey: ['get-all-teams', page, pageSize, deptId],
		queryFn: async () => {
			const res = await orgUnitApi.GetAllTeam({
                departmentId: deptId != '' ? Number(deptId) : null,
                page: page,
                pageSize: pageSize
            })
            setTotalPage(res.data.total_pages);
			return res.data.data
		},
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
            queryClient.invalidateQueries({ queryKey: ['get-all-teams'] });
        }
    }

    const handleDeleteDepartment = async (id: number) => {
        try {
            const shouldGoBack = getAllTeams.length === 1;
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
                    <label className="block mr-2">{`Phòng ban`}</label>
                    <select onChange={(e) => setDeptId(e.target.value)} value={deptId} className={`border cursor-pointer border-gray-300 rounded px-3 py-1`}>
                        <option value="">--Chọn--</option>
                        {
                            departments?.map((item: any, idx: number) => {
                                return (
                                    <option key={idx} value={item?.id ?? ''}>{item?.name}</option>
                                )
                            })
                        }
                    </select>
                </div>
                <ModalCreateTeam departments={departments} onAction={() => queryClient.invalidateQueries({ queryKey: ['get-all-teams'] })}/>
            </div>

            <table className="min-w-full text-sm border border-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-2 border w-[70px]">Id</th>
                        <th className="px-4 py-2 border w-[400px]">Tên</th>
                        <th className="px-4 py-2 border w-[300px]">Bộ phận</th>
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
                                </tr>  
                            ))
                        ) : isPending || getAllTeams.length == 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-2 text-center font-bold text-red-700">
                                    { error?.message ?? 'Không có kết quả' } 
                                </td>
                            </tr>
                        ) : (
                            getAllTeams?.map((item: any) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 border whitespace-nowrap text-center">
                                        {item.id}
                                    </td>
                                    <td className="px-4 py-2 border whitespace-nowrap">{item?.name}</td>
                                    <td className="px-4 py-2 border whitespace-nowrap">{item?.parentOrgUnit?.name ?? '--'}</td>
                                    <td className="px-4 py-2 border whitespace-nowrap text-center">
                                        <ModalCreateTeam departments={departments} team={item} onAction={() => queryClient.invalidateQueries({ queryKey: ['get-all-teams'] })}/>
                                        <ButtonDeleteComponent id={item?.id} onDelete={() => handleDeleteDepartment(item?.id)}/>
                                    </td>
                                </tr>
                            ))
                        )
                    }
                </tbody>
            </table>
            {
                getAllTeams?.length > 0 ? (<PaginationControl
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
    parentOrgUnitId: z.string()
})

type CreateTeamFormValues = z.infer<typeof createTeamSchema>

interface PropsModalCreateTeam {
    team?: {
        id: number,
        name: string,
        parentOrgUnitId: string
    },
    onAction?: () => void;
    departments?: any
};

export function ModalCreateTeam({ team, onAction, departments }: PropsModalCreateTeam) {
    const [open, setOpen] = useState(false)
    
    const form = useForm<CreateTeamFormValues>({
        resolver: zodResolver(createTeamSchema),
        defaultValues: {
            id: null,
            name: "",
            parentOrgUnitId: ''
        },
    })

    useEffect(() => {
        if (team && open) {
            form.reset({
                id: team?.id,
                name: team?.name,
                parentOrgUnitId: team?.parentOrgUnitId?.toString()
            });
        } 
        else {
            form.reset({ id: null, name: "", parentOrgUnitId: '' });
        }
    }, [team, open, form]);

    const onSubmit = async (values: CreateTeamFormValues) => {
        if (values.parentOrgUnitId == '') {
            ShowToast('Chưa chọn phòng ban', 'error')
            return
        }

        try {
            setOpen(false);
            await orgUnitApi.CreateOrUpdate({
                id: values?.id ?? null,
                name: values.name,
                parentOrgUnitId: Number(values.parentOrgUnitId),
                unitId: UnitEnum.Team
            })
            ShowToast('Success')
            onAction?.();
            form.reset();
        } catch (err) {
            ShowToast(getErrorMessage(err), "error")
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="hover:cursor-pointer rounded-[3px] py-0.5 px-2 bg-[#555555] text-white">
                    {team ? 'Sửa' : 'Thêm mới' }
                </button>
            </DialogTrigger>

            <DialogContent className="w-[40em]" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>Tổ/nhóm</DialogTitle>
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
                                    <Label>Chọn phòng ban</Label>
                                    <select 
                                        {...field} 
                                        value={field.value ?? ""}
                                        className="border border-gray-300 rounded px-3 py-1 w-full"
                                    >
                                        <option value="">--Chọn--</option>
                                        {departments?.map((item: any) => (
                                        <option key={item.id} value={item?.id?.toString()}>
                                            {item.name}
                                        </option>
                                        ))}
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