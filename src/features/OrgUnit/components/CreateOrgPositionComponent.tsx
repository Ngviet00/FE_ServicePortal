/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import positionApi from "@/api/orgPositionApi";
import orgUnitApi from "@/api/orgUnitApi";
import ButtonDeleteComponent from "@/components/ButtonDeleteComponent";
import PaginationControl from "@/components/PaginationControl/PaginationControl";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage, ShowToast, UnitEnum } from "@/lib";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod"

export default function CreateOrgPositionComponent () {
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

    const { data: getAllOrgPositions, isPending, error } = useQuery({
        queryKey: ['get-org-position', page, pageSize, deptId],
        queryFn: async () => {
            const res = await positionApi.GetOrgPositionsByDepartmentId({
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
            const shouldGoBack = getAllOrgPositions.length === 1;
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
                    <select onChange={(e) => {
                        setPage(1)
                        setDeptId(e.target.value)
                    }} value={deptId} className={`border cursor-pointer border-gray-300 rounded px-3 py-1`}>
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
                <ModalCreateOrgPosition departments={departments} onAction={() => queryClient.invalidateQueries({ queryKey: ['get-org-position'] })}/>
            </div>

            <table className="min-w-full text-sm border border-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-2 border w-[70px]">Id</th>
                        <th className="px-4 py-2 border w-[400px]">Mã</th>
                        <th className="px-4 py-2 border w-[400px]">Tên</th>
                        <th className="px-4 py-2 border w-[300px]">Bộ phận</th>
                        <th className="px-4 py-2 border w-[300px]">Tổ</th>
                        <th className="px-4 py-2 border w-[300px]">Vị trí cha</th>
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
                                    <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></td>
                                    <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[80px] bg-gray-300" /></div></td>
                                    <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[80px] bg-gray-300" /></div></td>
                                    <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[80px] bg-gray-300" /></div></td>
                                    <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[90px] bg-gray-300" /></div></td>
                                </tr>  
                            ))
                        ) : isPending || getAllOrgPositions.length == 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-2 text-center font-bold text-red-700">
                                    { error?.message ?? 'Không có kết quả' } 
                                </td>
                            </tr>
                        ) : (
                            getAllOrgPositions?.map((item: any) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 border whitespace-nowrap text-center">
                                        {item.id}
                                    </td>
                                    <td className="px-4 py-2 border whitespace-nowrap">{item?.positionCode}</td>
                                    <td className="px-4 py-2 border whitespace-nowrap">{item?.name}</td>
                                    <td className="px-4 py-2 border whitespace-nowrap">{item?.orgUnit?.parentOrgUnit?.name ?? item?.orgUnit?.name ?? '--'}</td>
                                    <td className="px-4 py-2 border whitespace-nowrap">{item?.orgUnit?.name && item?.orgUnit?.unitId == UnitEnum.Team ? (item?.orgUnit?.name ?? '--') : '--'}</td>
                                     <td className="px-4 py-2 border whitespace-nowrap">{item?.parentOrgPosition?.name ?? '--'}</td>
                                    <td className="px-4 py-2 border whitespace-nowrap text-center">
                                        <ModalCreateOrgPosition departments={departments} orgPosition={item} onAction={() => queryClient.invalidateQueries({ queryKey: ['get-org-position'] })}/>
                                        <ButtonDeleteComponent id={item?.id} onDelete={() => handleDeleteDepartment(item?.id)}/>
                                    </td>
                                </tr>
                            ))
                        )
                    }
                </tbody>
            </table>
            {
                getAllOrgPositions?.length > 0 ? (<PaginationControl
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

const createOrgPositionSchema = z.object({
    id: z.number().optional().nullable(),
    code: z.string().min(1, { message: "Bắt buộc" }),
    name: z.string().min(1, { message: "Bắt buộc" }),
    departmentId: z.string().min(1, { message: "Bắt buộc" }),
    teamId: z.string().optional().nullable(),
    parentOrgPositionId: z.string().optional().nullable(),
    isStaff: z.boolean().optional().nullable(),
    unitId: z.string().min(1, { message: "Bắt buộc" }),
});

type CreateOrgPositionFormValues = z.infer<
    typeof createOrgPositionSchema
>;

interface PropsModalCreateOrgPosition {
    orgPosition?: any;
    onAction?: () => void;
    departments?: any[];
}

export function ModalCreateOrgPosition({
    orgPosition,
    onAction, 
    departments 
}: PropsModalCreateOrgPosition) {

    const [open, setOpen] = useState(false)
    const isEditing = !!orgPosition

    const form = useForm<CreateOrgPositionFormValues>({
        resolver: zodResolver(createOrgPositionSchema),
        defaultValues: {
            id: null,
            code: "",
            name: "",
            departmentId: "",
            teamId: "",
            parentOrgPositionId: "",
            isStaff: false,
            unitId: "",
        }
    })

    const departmentId = form.watch("departmentId")

    /* ================= QUERY ================= */

    const { data: teamsByDept = [] } = useQuery({
        queryKey: ["modal-teams", departmentId],
        queryFn: async () => {
            const res = await orgUnitApi.GetAllTeam({
                departmentId: Number(departmentId),
                page: 1,
                pageSize: 500
            })
            return res.data.data
        },
        enabled: open && !!departmentId
    })

    const { data: allOrgPositions = [] } = useQuery({
        queryKey: ['modal-all-org-position'],
        queryFn: async () => {
            const res = await positionApi.GetOrgPositionsByDepartmentId({
                page: 1,
                pageSize: 1000
            })
            return res.data.data
        },
        enabled: open
    })

    const { data: allUnits = [] } = useQuery({
        queryKey: ['modal-all-units'],
        queryFn: async () => {
            const res = await orgUnitApi.getAllUnit()
            return res.data.data;
        },
        enabled: open
    })

    /* ================= RESET KHI MỞ MODAL ================= */

    useEffect(() => {
        if (!open) return

        form.clearErrors()

        if (!isEditing) {
            form.reset({
                id: null,
                code: "",
                name: "",
                departmentId: "",
                teamId: "",
                parentOrgPositionId: "",
                isStaff: false,
                unitId: ""
            })
            return
        }

        // ===== EDIT =====
        const deptId =
            orgPosition?.orgUnit?.parentOrgUnit
                ? orgPosition.orgUnit.parentOrgUnit.id?.toString()
                : orgPosition.orgUnit?.id?.toString() ?? ""

        form.reset({
            id: orgPosition.id,
            code: orgPosition.positionCode ?? "",
            name: orgPosition.name ?? "",
            departmentId: deptId,
            teamId: "",
            parentOrgPositionId: "",
            isStaff: orgPosition.isStaff ?? false,
            unitId: orgPosition.unitId?.toString() ?? ""
        })

    }, [open])

    /* ================= SET TEAM SAU KHI LOAD ================= */

    useEffect(() => {
        if (!open || !isEditing) return
        if (!teamsByDept.length) return

        if (orgPosition?.orgUnit?.unitId === UnitEnum.Team) {
            form.setValue(
                "teamId",
                orgPosition.orgUnit.id?.toString() ?? ""
            )
        }
    }, [teamsByDept, open])

    /* ================= SET PARENT POSITION ================= */

    useEffect(() => {
        if (!open || !isEditing) return
        if (!allOrgPositions.length) return

        form.setValue(
            "parentOrgPositionId",
            orgPosition?.parentOrgPositionId?.toString() ?? ""
        )
    }, [allOrgPositions, open])

    /* ================= SUBMIT ================= */

    const onSubmit = async (values: CreateOrgPositionFormValues) => {
        const payload = {
            id: values.id ?? null,
            name: values.name,
            code: values.code,
            departmentId: Number(values.departmentId),
            teamId: values.teamId ? Number(values.teamId) : null,
            parentOrgPositionId: values.parentOrgPositionId ? Number(values.parentOrgPositionId) : null,
            IsStaff: values.isStaff ?? false,
            unitId: Number(values.unitId)
        }

        await positionApi.SaveOrUpdate(payload)
        onAction?.()
        setOpen(false)
        ShowToast('Success', 'success')
    }

    /* ================= UI ================= */

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="rounded px-2 py-1 bg-gray-600 text-white">
                    {isEditing ? 'Sửa' : 'Thêm mới'}
                </button>
            </DialogTrigger>

            <DialogContent className="w-[50em]">
                <DialogHeader>
                    <DialogTitle>Vị trí</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        {/* CODE */}
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Mã</Label>
                                    <Input {...field} />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* NAME */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Tên</Label>
                                    <Input {...field} />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* DEPARTMENT */}
                        <FormField
                            control={form.control}
                            name="departmentId"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Phòng ban</Label>
                                    <select {...field} className="w-full border rounded px-2 py-1">
                                        <option value="">--Chọn--</option>
                                        {departments?.map(d => (
                                            <option key={d.id} value={d.id.toString()}>
                                                {d.name}
                                            </option>
                                        ))}
                                    </select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* TEAM */}
                        <FormField
                            control={form.control}
                            name="teamId"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Team</Label>
                                    <select {...field} value={field.value ?? ""} className="w-full border rounded px-2 py-1">
                                        <option value="">--Chọn--</option>
                                        {teamsByDept.map((t: any) => (
                                            <option key={t.id} value={t.id.toString()}>
                                                {t.name}
                                            </option>
                                        ))}
                                    </select>
                                </FormItem>
                            )}
                        />

                        {/* PARENT POSITION */}
                        <FormField
                            control={form.control}
                            name="parentOrgPositionId"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Vị trí cha</Label>
                                    <select {...field} value={field.value ?? ""} className="w-full border rounded px-2 py-1">
                                        <option value="">--Chọn--</option>
                                        {allOrgPositions.map((p: any) => (
                                            <option key={p.id} value={p.id.toString()}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>
                                </FormItem>
                            )}
                        />

                        {/* UNIT */}
                        <FormField
                            control={form.control}
                            name="unitId"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Đơn vị</Label>
                                    <select {...field} className="w-full border rounded px-2 py-1">
                                        <option value="">--Chọn--</option>
                                        {allUnits.map((u: any) => (
                                            <option key={u.id} value={u.id.toString()}>
                                                {u.name}
                                            </option>
                                        ))}
                                    </select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* IS STAFF */}
                        <FormField
                            control={form.control}
                            name="isStaff"
                            render={({ field }) => (
                                <FormItem className="flex gap-2 items-center">
                                    <Checkbox
                                        checked={field.value ?? false}
                                        onCheckedChange={field.onChange}
                                    />
                                    <Label>Is Staff</Label>
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end">
                            <Button type="submit">Lưu</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}