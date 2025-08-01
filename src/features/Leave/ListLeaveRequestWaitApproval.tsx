import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import leaveRequestApi, { LeaveRequestData, useHrExportExcelLeaveRequest, useRegisterAllLeaveRequest } from "@/api/leaveRequestApi"
import { useAuthStore } from "@/store/authStore"
import PaginationControl from "@/components/PaginationControl/PaginationControl"
import { getErrorMessage, ShowToast } from "@/lib"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useTranslation } from "react-i18next"
import { formatDate } from "@/lib/time"
import { Checkbox } from "@/components/ui/checkbox"
import useHasPermission from "@/hooks/useHasPermission"
import { Spinner } from "@/components/ui/spinner"

export default function ListLeaveRequestWaitApproval () {
    const { t } = useTranslation();
    const lang = useTranslation().i18n.language.split('-')[0];
    const [loading, setLoading] = useState(false)
    const [loadingRegisterAll, setLoadingRegisterAll] = useState(false)
    const [totalPage, setTotalPage] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(50)
    const [note, setNote] = useState("");
    const [selectedItem, setSelectedItem] = useState<LeaveRequestData | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const {user} = useAuthStore()
    const queryClient = useQueryClient();
    const registerAllLeaveMutation = useRegisterAllLeaveRequest();
    // const isOrgUnitIdAvailable = user !== null && user !== undefined && user.orgUnitID !== null && user.orgUnitID !== undefined;
    
    const { data: leaveRequests = [], isPending, isError, error } = useQuery({
        queryKey: ['get-leave-request-wait-approval', page, pageSize],
        queryFn: async () => {
            const res = await leaveRequestApi.getLeaveRequestWaitApproval({
                page: page,
                pageSize: pageSize,
                OrgUnitId: user?.orgUnitID,
                UserCode: user?.userCode
            });
            setTotalPage(res.data.total_pages)
            return res.data.data;
        },
        // enabled: isOrgUnitIdAvailable
    });

    function handleApproval(shouldGoBack?: boolean) {
        if (shouldGoBack && page > 1) {
            setPage(prev => prev - 1);
        } else {
            queryClient.invalidateQueries({ queryKey: ['get-leave-request-wait-approval'] });
        }
    }

    function setCurrentPage(page: number): void {
        setPage(page)
    }

    function handlePageSizeChange(size: number): void {
        setPage(1)
        setPageSize(size)
    }

    const mutation = useMutation({
        mutationFn: async ({ item, approval }: { item: LeaveRequestData; approval: boolean, note: string | null }) => {
            await leaveRequestApi.approvalLeaveRequest({
                NameUserApproval: user?.userName || null,
                UserCodeApproval: user?.userCode || null,
                LeaveRequestId: item?.id ?? "",
                Status: approval,
                Note: note,
                UrlFrontEnd: window.location.origin
            });
        },
        
        onSuccess: () => {
            ShowToast("Success");
            setShowConfirm(false)
            queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });
        }
    });

    const handleConfirm = async (item: LeaveRequestData, approval: boolean, note: string | null) => {
        setLoading(true);
        try {
            const shouldGoBack = leaveRequests.length === 1;
            await mutation.mutateAsync({ item, approval, note });
            handleApproval(shouldGoBack);
            setSelectedItem(null)
        } catch (error) {
            ShowToast(getErrorMessage(error), "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!showConfirm) {
          setNote("");
        }
    }, [showConfirm]);
    
    //#region role HR and have permission mng leave req
    const hasPermissionHrMngLeaveRq = useHasPermission(['leave_request.hr_management_leave_request'])

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const currentPageIds = leaveRequests.map((item: LeaveRequestData) => item.id);

    const handleRowCheckboxChange = (id: string, checked: string | boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(item => item !== id));
        }
    };

    const handleSelectAllCurrentPage = (checked: string | boolean) => {
        if (leaveRequests.length > 0) {
            if (checked) {
                const newSelected = Array.from(new Set([...selectedIds, ...currentPageIds]));
                setSelectedIds(newSelected);
            } else {
                const newSelected = selectedIds.filter(id => !currentPageIds.includes(id));
                setSelectedIds(newSelected);
            }
        } else {
            setSelectedIds([]);
        }
    };

    const hrExportExcelLeaveRequest = useHrExportExcelLeaveRequest();
    const handleExport = async () => {
        if (leaveRequests.length > 0) {
            if (selectedIds.length <= 0) {
                ShowToast("Chọn đơn nghỉ phép muốn xuất excel", "error")
                return
            }
            await hrExportExcelLeaveRequest.mutateAsync(selectedIds)
        }
    };

    const registerAllLeave = async () => {
        if (leaveRequests.length > 0) {
            if (selectedIds.length <= 0) {
                ShowToast("Chọn đơn nghỉ cần đăng ký", "error")
                return
            }
            setLoadingRegisterAll(true)
            try
            {
                const shouldGoBack = leaveRequests.length === 1;
                await registerAllLeaveMutation.mutateAsync({
                    UserCode: user?.userCode,
                    UserName: user?.userName ?? "",
                    leaveRequestIds: selectedIds
                })
                handleApproval(shouldGoBack);
                queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });
                setSelectedIds([])
            }
            finally {   
                setLoadingRegisterAll(false)
            }
        }
    }
    //#endregion

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between mb-1 items-start sm:items-center">
                <h3 className="font-bold text-xl sm:text-2xl m-0 pb-2 sm:pb-0">
                    {t('list_leave_request.title_wait_approval')}
                </h3>

                {hasPermissionHrMngLeaveRq && (
                    <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
                        <Button
                            variant="outline"
                            disabled={hrExportExcelLeaveRequest.isPending}
                            onClick={handleExport}
                            className="text-xs px-2 bg-blue-700 text-white hover:cursor-pointer hover:bg-dark hover:text-white w-full sm:w-auto"
                        >
                            {hrExportExcelLeaveRequest.isPending ? <Spinner className="text-white" size="small"/> : t('leave_request.wait_approval.export_excel')}
                        </Button>
                        <Button
                            variant="outline"
                            disabled={loadingRegisterAll}
                            onClick={registerAllLeave}
                            className="text-xs px-2 bg-black text-white hover:cursor-pointer hover:bg-dark hover:text-white w-full sm:w-auto"
                        >
                            {t('leave_request.wait_approval.register_all')}
                        </Button>
                    </div>
                )}
            </div>

            <div className="mb-5 relative shadow-md sm:rounded-lg pb-3">
                <div className="max-h-[600px] overflow-scroll hidden sm:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {
                                    hasPermissionHrMngLeaveRq ? (
                                        <TableHead className="w-[50px] text-left">
                                            <Checkbox 
                                                checked={selectedIds.length > 0 && currentPageIds.every((id: string) => selectedIds.includes(id))}
                                                onCheckedChange={(checked) => handleSelectAllCurrentPage(checked)}
                                                className="hover:cursor-pointer"
                                            />
                                        </TableHead>
                                    ) : (<></>)
                                }
                                <TableHead className="w-[120px] text-left">{t('list_leave_request.usercode')}</TableHead>
                                <TableHead className="w-[180px] text-left">{t('list_leave_request.name')}</TableHead>
                                <TableHead className="w-[130px] text-left">{t('list_leave_request.department')}</TableHead>
                                <TableHead className="w-[100px] text-left">{t('list_leave_request.position')}</TableHead>
                                <TableHead className="w-[150px] text-left">{t('list_leave_request.from')}</TableHead>
                                <TableHead className="w-[150px] text-left">{t('list_leave_request.to')}</TableHead>
                                <TableHead className="w-[120px] text-left">{t('list_leave_request.type_leave')}</TableHead>
                                <TableHead className="w-[120px] text-left">{t('list_leave_request.time_leave')}</TableHead>
                                <TableHead className="w-[200px] text-left">{t('list_leave_request.reason')}</TableHead>
                                <TableHead className="w-[150px] text-left">{t('list_leave_request.write_leave_name')}</TableHead>
                                <TableHead className="w-[80px] text-left">{t('list_leave_request.approve_by')}</TableHead>
                                <TableHead className="w-[50px] text-left">{t('list_leave_request.created_at')}</TableHead>
                                <TableHead className="w-[50px] text-left">{t('list_leave_request.approval')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isPending ? (
                            Array.from({ length: 3 }).map((_, index) => (
                                <TableRow key={index}>
                                {[...Array(hasPermissionHrMngLeaveRq ? 13 : 12)].map((_, i) => (
                                    <TableCell key={i} className="text-left">
                                    <div className="flex justify-center">
                                        <Skeleton className="h-4 w-[100px] bg-gray-300" />
                                    </div>
                                    </TableCell>
                                ))}
                                </TableRow>
                            ))
                            ) : isError || leaveRequests.length == 0 ? (
                            <TableRow>
                                <TableCell className="text-red-700 font-medium text-left dark:text-white" colSpan={hasPermissionHrMngLeaveRq ? 13 : 12}>
                                    {error?.message ?? t('list_leave_request.no_result')}
                                </TableCell>
                            </TableRow>
                            ) : (
                            leaveRequests.map((item: LeaveRequestData) => (
                                <TableRow key={item.id}>
                                    {
                                        hasPermissionHrMngLeaveRq ? (
                                            <TableCell className="text-left">
                                                <Checkbox
                                                    checked={selectedIds.includes(item.id ?? "")}
                                                    onCheckedChange={(checked) => handleRowCheckboxChange(item.id ?? "", checked)}
                                                    className="hover:cursor-pointer"
                                                />
                                            </TableCell>
                                        ) : (<></>)
                                    }
                                    <TableCell className="text-left">{item.requesterUserCode}</TableCell>
                                    <TableCell className="text-left">{item.name}</TableCell>
                                    <TableCell className="text-left">{item.department}</TableCell>
                                    <TableCell className="text-left">{item.position}</TableCell>
                                    <TableCell className="text-left">{formatDate(item.fromDate ?? "", "yyyy/MM/dd HH:mm:ss")}</TableCell>
                                    <TableCell className="text-left">{formatDate(item.toDate ?? "", "yyyy/MM/dd HH:mm:ss")}</TableCell>
                                    <TableCell className="text-left">{lang == 'vi' ? item?.typeLeave?.nameV : item?.typeLeave?.name}</TableCell>
                                    <TableCell className="text-left">{lang == 'vi' ? item?.timeLeave?.description : item?.timeLeave?.english}</TableCell>
                                    <TableCell className="text-left">{item.reason}</TableCell>
                                    <TableCell className="text-left text-red-800 font-bold">{item.userNameWriteLeaveRequest}</TableCell>
                                    <TableCell className="text-left text-red-800 font-bold">{item.historyApplicationForm?.userApproval ?? "--"}</TableCell>
                                    <TableCell className="text-left">{formatDate(item.createdAt ?? "", "yyyy/MM/dd HH:mm:ss")}</TableCell>
                                    <TableCell className="text-left">
                                        {hasPermissionHrMngLeaveRq ? (
                                        <Button variant="outline" disabled={loading} onClick={() => handleConfirm(item, true, note)} className="text-xs px-2 bg-black text-white hover:cursor-pointer hover:bg-dark hover:text-white">
                                            {t('leave_request.wait_approval.register')}
                                        </Button>
                                        ) : (
                                        <Button variant="outline" onClick={() => setSelectedItem(item)} className="text-xs px-2 bg-black text-white hover:cursor-pointer hover:bg-black hover:text-white">
                                            Approval
                                        </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="sm:hidden space-y-4">
                    {isPending
                    ? Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="p-4 border rounded shadow-sm">
                            <Skeleton className="h-4 w-[80%] bg-gray-300 mb-2" />
                            <Skeleton className="h-4 w-[60%] bg-gray-300 mb-2" />
                            <Skeleton className="h-4 w-[90%] bg-gray-300 mb-2" />
                        </div>
                        ))
                    : isError || leaveRequests.length === 0
                    ? (
                            <div className="text-red-700 font-medium dark:text-white">{error?.message ?? t('list_leave_request.no_result')}</div>
                        )
                    : leaveRequests.map((item: LeaveRequestData) => (
                        <div key={item.id} className="p-4 border rounded shadow-sm space-y-2">
                            <div><strong>{t('list_leave_request.usercode')}:</strong> {item.requesterUserCode}</div>
                            <div><strong>{t('list_leave_request.name')}:</strong> {item.name}</div>
                            <div><strong>{t('list_leave_request.department')}:</strong> {item.department}</div>
                            <div><strong>{t('list_leave_request.position')}:</strong> {item.position}</div>
                            <div><strong>{t('list_leave_request.from')}:</strong> {formatDate(item.fromDate ?? "", "yyyy/MM/dd HH:mm:ss")}</div>
                            <div><strong>{t('list_leave_request.to')}:</strong> {formatDate(item.toDate ?? "", "yyyy/MM/dd HH:mm:ss")}</div>
                            <div><strong>{t('list_leave_request.type_leave')}:</strong> {lang == 'vi' ? item?.typeLeave?.nameV : item?.typeLeave?.name}</div>
                            <div><strong>{t('list_leave_request.time_leave')}:</strong> {lang == 'vi' ? item?.timeLeave?.description : item?.timeLeave?.english}</div>
                            <div><strong>{t('list_leave_request.reason')}:</strong> {item.reason}</div>
                            <div><strong>{t('list_leave_request.write_leave_name')}:</strong> {item.userNameWriteLeaveRequest}</div>
                            <div><strong>{t('list_leave_request.approve_by')}:</strong> <span className="text-red-800 font-bold">{item.historyApplicationForm?.userApproval ?? "--"}</span></div>
                            <div><strong>{t('list_leave_request.created_at')}:</strong> {formatDate(item.createdAt ?? "", "yyyy/MM/dd HH:mm:ss")}</div>
                            <div className="pt-2">
                                {hasPermissionHrMngLeaveRq ? (
                                    <Button variant="outline" disabled={loading} onClick={() => handleConfirm(item, true, note)} className="text-xs bg-black text-white">
                                        {t('leave_request.wait_approval.register')}
                                    </Button>
                                ) : (
                                    <Button variant="outline" onClick={() => setSelectedItem(item)} className="text-xs bg-black text-white">
                                        Approval
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {selectedItem && (
                    <Dialog open={!!selectedItem} onOpenChange={(open) => {
                        if (!open) setSelectedItem(null)
                            setNote("")
                        }}>
                        <DialogContent className="sm:max-w-[600px] max-w-full max-h-[90vh] h-auto flex flex-col overflow-auto">
                            <DialogHeader>
                                <DialogTitle></DialogTitle>
                                <DialogDescription></DialogDescription>
                                </DialogHeader>

                                <div className="flex flex-col w-full space-y-2 text-xl">
                                    <div>User Code: <span className="pl-2 font-bold text-red-800">{selectedItem?.requesterUserCode}</span></div>
                                    <div>Name: <span className="pl-2 font-bold text-red-800">{selectedItem?.name}</span></div>
                                    <div>Department: <span className="pl-2 font-bold text-red-800">{selectedItem?.department}</span></div>
                                    <div>Position: <span className="pl-2 font-bold text-red-800">{selectedItem?.position}</span></div>
                                    <div>From Date: <span className="pl-2 font-bold text-red-800">{formatDate(selectedItem?.fromDate ?? "", "yyyy/MM/dd HH:mm:ss")}</span></div>
                                    <div>To Date: <span className="pl-2 font-bold text-red-800">{formatDate(selectedItem?.toDate ?? "", "yyyy/MM/dd HH:mm:ss")}</span></div>
                                    <div>Type Leave: <span className="pl-2 font-bold">{selectedItem?.timeLeave?.description}</span></div>
                                    <div>Time Leave: <span className="pl-2 font-bold">{selectedItem?.typeLeave?.name}</span></div>
                                    <div>Reason: <span className="pl-2 font-bold">{selectedItem?.reason}</span></div>
                                    <div>Created At: <span className="pl-2 font-bold">{formatDate(selectedItem?.createdAt ?? "", "yyyy/MM/dd HH:mm:ss")}</span></div>
                                </div>

                                <div className="note mt-4">
                                    <Label htmlFor="note" className="mb-2">Ghi chú</Label>
                                    <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nội dung..." id="note" />
                                </div>

                                <div className="flex justify-end mt-4">
                                    <Button disabled={loading} onClick={() => handleConfirm(selectedItem, false, note)} className="mr-4 bg-red-800 hover:bg-red-900">Reject</Button>
                                    <Button disabled={loading} onClick={() => handleConfirm(selectedItem, true, note)} className="bg-green-800 hover:bg-green-900">Approval</Button>
                                </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
            {
                leaveRequests.length > 0 ? (<PaginationControl
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
