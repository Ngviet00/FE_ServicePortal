/* eslint-disable @typescript-eslint/no-explicit-any */
import approvalApi from "@/api/approvalApi";
import { ITForm } from "@/api/itFormApi";
import { useHrExportExcelLeaveRequest, useRegisterAllLeaveRequest } from "@/api/leaveRequestApi";
import orgUnitApi from "@/api/orgUnitApi";
import requestTypeApi, { IRequestType } from "@/api/requestTypeApi";
import PaginationControl from "@/components/PaginationControl/PaginationControl";
import { StatusLeaveRequest } from "@/components/StatusLeaveRequest/StatusLeaveRequestComponent";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import useHasPermission from "@/hooks/useHasPermission";
import { REQUEST_TYPE, ShowToast } from "@/lib";
import { formatDate } from "@/lib/time";
import { useAuthStore } from "@/store/authStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const subKeys = ["leaveRequest", "itForm", "memoNotification"];

function getSubForm(item: any) {
	const key = subKeys.find(k => item[k] !== null);
	return key ? item[key] : null;
}

function getInfo(item: any) {
	const sub = getSubForm(item);
	if (!sub) return null;

	return {
		id: sub.id,
		code: sub.code,
		userNameRequestor: sub.userNameRequestor,
		userNameCreated: sub.userNameCreated,
		departmentName: sub.departmentName,
	};
}

interface PendingApprovalResponse {
	id: string;
	requestTypeId: number;
	currentOrgUnitId: number
	createdAt: string | Date 
	requestType?: {
		id: number,
		name: string,
		nameE: string,
	},
	historyApplicationForm?: {
		userNameApproval?: string
	},
	leaveRequest?: {
		id?: string,
		code?: string,
		userNameRequestor?: string,
		createdBy?: string
	},
	memoNotification?: {
		id?: string,
		code?: string,
		createdBy?: string,
	},
	itForm: ITForm
}

function GetUrlDetailWaitApproval(item: PendingApprovalResponse) {
	let result = ''

	if (item.requestTypeId == REQUEST_TYPE.LEAVE_REQUEST) {
		result = `/approval/approval-leave-request/${item?.leaveRequest?.id ?? '-1'}`
	}
	else if (item.requestTypeId == REQUEST_TYPE.MEMO_NOTIFICATION) {
		result = `/approval/approval-memo-notify/${item?.memoNotification?.id ?? '1'}`
	}
	else if (item.requestTypeId == REQUEST_TYPE.FORM_IT) {
		result = `/approval/approval-form-it/${item?.itForm?.id ?? '1'}`
	}

	return result
}

export default function PendingApproval() {
	const { t } = useTranslation('pendingApproval')
	const { t: tCommon } = useTranslation('common')
	const lang = useTranslation().i18n.language.split('-')[0]
    const [requestType, setRequestType] = useState('');
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(10)
	const [totalPage, setTotalPage] = useState(0)
	const { user } = useAuthStore()
	const [selectedDepartment, setSelectedDepartment] = useState('')
	const hasPermissionHrMngLeaveRq = useHasPermission(['leave_request.hr_management_leave_request'])
	const [selectedIds, setSelectedIds] = useState<string[]>([])
	const [loadingRegisterAll, setLoadingRegisterAll] = useState(false)
	const registerAllLeaveMutation = useRegisterAllLeaveRequest()
	const queryClient = useQueryClient()

	function setCurrentPage(page: number): void {
        setPage(page)
    }

    function handlePageSizeChange(size: number): void {
        setPage(1)
        setPageSize(size)
    }

	const { data: requestTypes = []} = useQuery({
        queryKey: ['get-all-request-type'],
        queryFn: async () => {
            const res = await requestTypeApi.getAll({
                page: 1,
                pageSize: 200,
            });
            return res.data.data;
        },
    });

	const { data: departments = [] } = useQuery({
		queryKey: ['get-all-department'],
		queryFn: async () => {
			const res = await orgUnitApi.GetAllDepartment()
			return res.data.data
		},
	});

	const { data: ListWaitApprovals = [], isPending, isError, error } = useQuery({
        queryKey: ['get-list-wait-approval', page, pageSize, requestType, selectedDepartment],
        queryFn: async () => {
            const res = await approvalApi.GetAllApproval({
                Page: page,
                PageSize: pageSize,
				OrgPositionId: user?.orgPositionId,
				UserCode: user?.userCode,
				RequestTypeId: requestType == '' ? null : Number(requestType),
				DepartmentId: selectedDepartment == '' ? null : Number(selectedDepartment)
            });
			setTotalPage(res.data.total_pages)
            return res.data.data;
        },
    });

	const currentPageIds = ListWaitApprovals
		.filter((item: { requestTypeId: number; }) => item.requestTypeId === 1)
		.map((item: { leaveRequest: { id: any; }; }) => item.leaveRequest.id);

	const handleOnChangeRequestType = (e: ChangeEvent<HTMLSelectElement>) => {
		setRequestType(e.target.value)
	}
	
	const handleOnChangeDepartment = (e: ChangeEvent<HTMLSelectElement>) => {
		setSelectedDepartment(e.target.value)
	}

	const handleSelectAllCurrentPage = (checked: string | boolean) => {
        if (ListWaitApprovals.length > 0) {
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

	const handleRowCheckboxChange = (id: string, checked: string | boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(item => item !== id));
        }
    };

	const hrExportExcelLeaveRequest = useHrExportExcelLeaveRequest();
	const handleExport = async () => {
		if (selectedIds.length <= 0) {
			ShowToast("Chọn đơn nghỉ phép muốn xuất excel", "error")
			return
		}
		await hrExportExcelLeaveRequest.mutateAsync(selectedIds)
	};

	const registerAllLeave = async () => {
		if (selectedIds.length <= 0) {
			ShowToast("Chọn đơn nghỉ cần đăng ký", "error")
			return
		}
		setLoadingRegisterAll(true)
		try
		{
			await registerAllLeaveMutation.mutateAsync({
				UserCode: user?.userCode,
				UserName: user?.userName ?? "",
				leaveRequestIds: selectedIds
			})
			setPage(1)
			setSelectedIds([])
			queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });
			queryClient.invalidateQueries({ queryKey: ['get-list-wait-approval'] });
		}
		finally {   
			setLoadingRegisterAll(false)
		}
	}

    return (
		<div className="p-1 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0">{t('pending_approval.title')}</h3>
				{hasPermissionHrMngLeaveRq && (
                    <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
                        <Button
                            variant="outline"
                            disabled={hrExportExcelLeaveRequest.isPending}
                            onClick={handleExport}
                            className="text-xs px-2 bg-blue-700 text-white hover:cursor-pointer hover:bg-dark hover:text-white w-full sm:w-auto"
                        >
                            {hrExportExcelLeaveRequest.isPending ? <Spinner className="text-white" size="small"/> : t('pending_approval.export_excel')}
                        </Button>
                        <Button
                            variant="outline"
                            disabled={loadingRegisterAll}
                            onClick={registerAllLeave}
                            className="text-xs px-2 bg-black text-white hover:cursor-pointer hover:bg-dark hover:text-white w-full sm:w-auto"
                        >
                            {t('pending_approval.register_all')}
                        </Button>
                    </div>
                )}
            </div>

			<div className="mt-2 flex">
				<div className="w-[20%]">
					<Label className="mb-2">{t('pending_approval.request_type')}</Label>
					<select value={requestType} onChange={(e) => handleOnChangeRequestType(e)} className="border p-1 rounded w-full cursor-pointer">
						<option value="">
							{ lang == 'vi' ? 'Tất cả' : 'All' }
						</option>
						{
							requestTypes.map((item: IRequestType, idx: number) => (
								<option key={idx} value={item.id}>{lang == 'vi' ? item.name : item.nameE}</option>
							))
						}
					</select>
				</div>

				{
					hasPermissionHrMngLeaveRq && (
						<div className="w-[20%] ml-4">
							<Label className="mb-2">{t('pending_approval.department')}</Label>
							<select value={selectedDepartment} onChange={(e) => handleOnChangeDepartment(e)} className="border p-1 rounded w-full cursor-pointer">
								<option value="">
									{ lang == 'vi' ? 'Tất cả' : 'All' }
								</option>
								{
									departments.map((item: { id: number, name: string }, idx: number) => (
										<option key={idx} value={item.id}>{item.name}</option>
									))
								}
							</select>
						</div>
					)
				}
			</div>

			<div>
				<div className="overflow-x-auto">
					{
						//hiển thị của hr
						hasPermissionHrMngLeaveRq ? (
							<table className="min-w-full text-sm border border-gray-200">
								<thead className="bg-gray-100">
									<tr>
										<th className="px-4 py-2 border">
											<input
												type="checkbox" 
												className="hover:cursor-pointer scale-[1.3]"
												checked={selectedIds.length > 0 && currentPageIds.every((id: string) => selectedIds.includes(id))}
												onChange={(event) => handleSelectAllCurrentPage(event.target.checked)}
											/>
										</th>
										<th className="px-4 py-2 border">{t('pending_approval.code')}</th>
										<th className="px-4 py-2 border">{t('pending_approval.request_type')}</th>
										<th className="px-4 py-2 border">{t('pending_approval.user_request')}</th>
										<th className="px-4 py-2 border">{t('pending_approval.created_at')}</th>
										<th className="px-4 py-2 border">{t('pending_approval.user_register')}</th>
										<th className="px-4 py-2 border">{t('pending_approval.last_approved')}</th>
										<th className="px-4 py-2 border">{t('pending_approval.status')}</th>
										<th className="px-4 py-2 border text-center">{t('pending_approval.action')}</th>
									</tr>
								</thead>
								<tbody>
									{
										isPending ? (
											Array.from({ length: 3 }).map((_, index) => (
												<tr key={index}>
													<td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[20px] bg-gray-300" /></div></td>
													<td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[70px] bg-gray-300" /></div></td>
													<td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[70px] bg-gray-300" /></div></td>
													<td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[70px] bg-gray-300" /></div></td>
													<td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[70px] bg-gray-300" /></div></td>
													<td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[70px] bg-gray-300" /></div></td>
													<td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[70px] bg-gray-300" /></div></td>
													<td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[70px] bg-gray-300" /></div></td>
													<td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[70px] bg-gray-300" /></div></td>
												</tr>
											))
										) : isError || ListWaitApprovals?.length == 0 ? (
											<tr>
												<td colSpan={9} className="px-4 py-2 text-center font-bold text-red-700">
													{ error?.message ?? tCommon('no_results') } 
												</td>
											</tr>
										) : (
											ListWaitApprovals.map((item: PendingApprovalResponse, idx: number) => {
												const data = getInfo(item)

												return (
													<tr key={idx} className="hover:bg-gray-50">
														<td className="px-4 py-2 border whitespace-nowrap text-center">
															{
																item.requestTypeId == 1 && (
																	<input
																		type="checkbox" 
																		className="hover:cursor-pointer scale-[1.3]"
																		checked={selectedIds.includes(item?.leaveRequest?.id ?? "")}
																		onChange={(event) => handleRowCheckboxChange(item?.leaveRequest?.id ?? "", event.target.checked)}
																	/>
																)
															}
														</td>
														<td className="px-4 py-2 border whitespace-nowrap text-center">
															<Link to={GetUrlDetailWaitApproval(item)} className="text-blue-700 underline">
																{ data?.code }
															</Link>
														</td>
														<td className="px-4 py-2 border whitespace-nowrap text-center">{lang == 'vi' ? item?.requestType?.name : item?.requestType?.nameE}</td>
														<td className="px-4 py-2 border whitespace-nowrap text-center">{data?.userNameRequestor}</td>
														<td className="px-4 py-2 border whitespace-nowrap text-center">{item?.createdAt ? formatDate(item?.createdAt, "yyyy/MM/dd HH:mm") : '--'}</td>
														<td className="px-4 py-2 border whitespace-nowrap text-center">{data?.userNameCreated}</td>
														<td className="px-4 py-2 border whitespace-nowrap text-center">{item?.historyApplicationForm?.userNameApproval ? item?.historyApplicationForm?.userNameApproval : '--'}</td>
														<td className="px-4 py-2 border text-center">
															<StatusLeaveRequest status="Pending"/>
														</td>
														<td className="px-4 py-2 border text-center space-x-1">
															<button
																className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
															>
																<Link to={GetUrlDetailWaitApproval(item)}>
																	{t('pending_approval.detail')}
																</Link>
															</button>
														</td>
													</tr>
												)
											})
										)
									}
								</tbody>
							</table>
						) : (
							<table className="min-w-full text-sm border border-gray-200">
								<thead className="bg-gray-100">
									<tr>
										<th className="px-4 py-2 border">{t('pending_approval.code')}</th>
										<th className="px-4 py-2 border">{t('pending_approval.request_type')}</th>
										<th className="px-4 py-2 border">{t('pending_approval.user_request')}</th>
										<th className="px-4 py-2 border">{t('pending_approval.department')}</th>
										<th className="px-4 py-2 border">{t('pending_approval.created_at')}</th>
										<th className="px-4 py-2 border">{t('pending_approval.user_register')}</th>
										<th className="px-4 py-2 border">{t('pending_approval.last_approved')}</th>
										<th className="px-4 py-2 border">{t('pending_approval.status')}</th>
										<th className="px-4 py-2 border text-center">{t('pending_approval.action')}</th>
									</tr>
								</thead>
								<tbody>
									{
										isPending ? (
											Array.from({ length: 3 }).map((_, index) => (
												<tr key={index}>
													<td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[20px] bg-gray-300" /></div></td>
													<td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[70px] bg-gray-300" /></div></td>
													<td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[70px] bg-gray-300" /></div></td>
													<td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[70px] bg-gray-300" /></div></td>
													<td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[70px] bg-gray-300" /></div></td>
													<td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[70px] bg-gray-300" /></div></td>
													<td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[70px] bg-gray-300" /></div></td>
													<td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[70px] bg-gray-300" /></div></td>
													<td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[70px] bg-gray-300" /></div></td>
												</tr>  
											))
										) : isError || ListWaitApprovals?.length == 0 ? (
											<tr>
												<td colSpan={9} className="px-4 py-2 text-center font-bold text-red-700">
													{ error?.message ?? tCommon('no_results') } 
												</td>
											</tr>
										) : (
											ListWaitApprovals.map((item: PendingApprovalResponse, idx: number) => {
												const data = getInfo(item)

												return (
													<tr key={idx} className="hover:bg-gray-50">
														<td className="px-4 py-2 border whitespace-nowrap text-left">
															<Link to={GetUrlDetailWaitApproval(item)} className="text-blue-700 underline">
																{data?.code}
															</Link>
														</td>
														<td className="px-4 py-2 border whitespace-nowrap text-center">{lang == 'vi' ? item?.requestType?.name : item?.requestType?.nameE}</td>
														<td className="px-4 py-2 border whitespace-nowrap text-center">{data?.userNameRequestor}</td>
														<td className="px-4 py-2 border whitespace-nowrap text-center">{data?.departmentName}</td>
														<td className="px-4 py-2 border whitespace-nowrap text-center">{item?.createdAt ? formatDate(item?.createdAt, "yyyy/MM/dd HH:mm") : '--'}</td>
														<td className="px-4 py-2 border whitespace-nowrap text-center">{data?.userNameCreated}</td>
														<td className="px-4 py-2 border whitespace-nowrap text-center">{item?.historyApplicationForm?.userNameApproval ? item?.historyApplicationForm?.userNameApproval : '--'}</td>
														<td className="px-4 py-2 border text-center">
															<StatusLeaveRequest status="Pending"/>
														</td>
														<td className="px-4 py-2 border text-center space-x-1">
															<button
																className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
															>
																<Link to={GetUrlDetailWaitApproval(item)}>
																	{t('pending_approval.detail')}
																</Link>
															</button>
														</td>
													</tr>
												)
											})
										)
									}
								</tbody>
							</table>
						)
					}
     		 	</div>
			</div>
			{
                ListWaitApprovals.length > 0 ? (<PaginationControl
                    currentPage={page}
                    totalPages={totalPage}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={handlePageSizeChange}
                />) : (null)
            }
			{/* <div className="block md:hidden space-y-4">
				{isPending ? (
					Array.from({ length: 3 }).map((_, index) => (
						<div key={index} className="border rounded p-4 space-y-2 shadow bg-white dark:bg-gray-800">
						{Array.from({ length: 6 }).map((_, i) => (
							<div key={i} className="h-4 w-full bg-gray-300 rounded animate-pulse" />
						))}
						</div>
					))
				) : isError || leaveRequests.length === 0 ? (
					<div className="pt-2 pl-4 text-red-700 font-medium dark:text-white">{error?.message ?? t('list_leave_request.no_result')}</div>
				) : (
					leaveRequests.map((item: LeaveRequestData) => (
						<div key={item.id} className="border rounded p-4 shadow bg-white dark:bg-gray-800 mt-5">
							<div className="mb-1 font-bold">{item.name} ({item.requesterUserCode})</div>
							<div className="mb-1"><strong>{t('list_leave_request.department')}:</strong> {item.department}</div>
							<div className="mb-1"><strong>{t('list_leave_request.position')}:</strong> {item.position}</div>
							<div className="mb-1"><strong>{t('list_leave_request.from')}:</strong> {formatDate(item.fromDate ?? "", "yyyy/MM/dd HH:mm:ss")}</div>
							<div className="mb-1"><strong>{t('list_leave_request.to')}:</strong>{formatDate(item.toDate ?? "", "yyyy/MM/dd HH:mm:ss")}</div>
							<div className="mb-1"><strong>{t('list_leave_request.type_leave')}:</strong> {lang == 'vi' ? item?.typeLeave?.nameV : item?.typeLeave?.name}</div>
							<div className="mb-1"><strong>{t('list_leave_request.time_leave')}:</strong> {lang == 'vi' ? item?.timeLeave?.description : item?.timeLeave?.english}</div>
							<div className="mb-1"><strong>{t('list_leave_request.reason')}:</strong> {item.reason}</div>
							<div className="mb-1"><strong>{t('list_leave_request.write_leave_name')}:</strong> {item.userNameWriteLeaveRequest}</div>
						</div>
					))
				)}
			</div> */}
        </div>
    )
}