/* eslint-disable @typescript-eslint/no-explicit-any */
import approvalApi from "@/api/approvalApi";
import { HistoryApplicationForm, IRequestStatus } from "@/api/itFormApi";
import { useHrExportExcelLeaveRequest, useRegisterAllLeaveRequest } from "@/api/leaveRequestApi";
import { OrgUnit } from "@/api/orgUnitApi";
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

export interface PendingApprovalResponse {
	id?: string;
	code?: string
	createdAt?: string | Date
	userCodeRequestor?: string,
	userNameCreated?: string,
	userNameRequestor?: string,
	orgPositionId?: number
	requestType?: IRequestType
	requestStatus?: IRequestStatus
	historyApplicationForm?: HistoryApplicationForm,
	orgUnit?: OrgUnit
}

function GetUrlDetailWaitApproval(item: any) {
	let result = ''
	const requestTypeId = item?.requestTypeId

	if (requestTypeId == REQUEST_TYPE.LEAVE_REQUEST) {
		result = `/approval/approval-leave-request/${item.code ?? '-1'}`
	}
	else if (requestTypeId == REQUEST_TYPE.MEMO_NOTIFICATION) {
		result = `/approval/approval-memo-notify/${item.code ?? '1'}`
	}
	else if (requestTypeId == REQUEST_TYPE.FORM_IT) {
		result = `/approval/approval-form-it/${item.id ?? '1'}`
	}
	else if (requestTypeId == REQUEST_TYPE.PURCHASE) {
		result = `/approval/approval-purchase/${item.id ?? '1'}`
	}
	else if (requestTypeId == REQUEST_TYPE.OVERTIME) {
		result = `/approval/approval-overtime/${item?.code ?? '1'}`
	}
	else if (requestTypeId == REQUEST_TYPE.MISS_TIMEKEEPING) {
		result = `/approval/approval-miss-timekeeping/${item?.code ?? '1'}`
	}
	else if (requestTypeId == REQUEST_TYPE.INTERNAL_MEMO_HR) {
		result = `/internal-memo-hr/${item?.code ?? '1'}?mode=approval`
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
	
	const { data: ListWaitApprovals = [], isPending, isError, error } = useQuery({
        queryKey: ['get-list-wait-approval', page, pageSize, requestType],
        queryFn: async () => {
            const res = await approvalApi.GetAllApproval({
                Page: page,
                PageSize: pageSize,
				OrgPositionId: user?.orgPositionId,
				UserCode: user?.userCode,
				RequestTypeId: requestType == '' ? null : Number(requestType)
            });
			setTotalPage(res.data.total_pages)
            return res.data.data;
        },
    });

	const currentPageIds = ListWaitApprovals;
		// .filter((item: { requestType: { id: number, name: string } }) => item.requestType.id == 1)
		// .map((item: { id: number, name: string }) => item.id);

	const handleOnChangeRequestType = (e: ChangeEvent<HTMLSelectElement>) => {
		setRequestType(e.target.value)
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
		await hrExportExcelLeaveRequest.mutateAsync({applicationFormId: -11})
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
				{/* {hasPermissionHrMngLeaveRq && (
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
                )} */}
            </div>

			<div className="mt-2 flex">
				<div className="w-[12%]">
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
			</div>

			<div>
				<div className="overflow-x-auto">
					<table className="min-w-full text-sm border border-gray-200">
						<thead className="bg-gray-100">
							<tr>
								{/* <th className="px-4 py-2 border">
									<input
										type='checkbox' 
										className='hover:cursor-pointer scale-[1.2]'
										checked={selectedIds.length > 0 && currentPageIds.every((id: string) => selectedIds.includes(id))}
										onChange={(event) => handleSelectAllCurrentPage(event.target.checked)}
									/>
								</th> */}
								<th className="px-4 py-2 border">{t('pending_approval.code')}</th>
								<th className="px-4 py-2 border">{t('pending_approval.request_type')}</th>
								<th className="px-4 py-2 border">{lang == 'vi' ? 'Danh mục' : 'Category'}</th>
								<th className="px-4 py-2 border">{t('pending_approval.user_request')}</th>
								<th className="px-4 py-2 border">{t('pending_approval.created_at')}</th>
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
											<td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[20px] bg-gray-300" /></div></td>
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
										<td colSpan={8} className="px-4 py-2 text-center font-bold text-red-700">
											{ error?.message ?? tCommon('no_results') } 
										</td>
									</tr>
								) : (
									ListWaitApprovals.map((item: any, idx: number) => {
										return (
											<tr key={idx} className="hover:bg-gray-50">
												{/* <td className="px-4 py-2 border whitespace-nowrap text-center">
													<input 
														type="checkbox" 
														className="hover:cursor-pointer scale-[1.2]"
														checked={selectedIds.includes(item?.id ?? "")}
														onChange={(event) => handleRowCheckboxChange(item?.id ?? "", event.target.checked)}
													/>
												</td> */}
												<td className="px-4 py-2 border whitespace-nowrap text-center">
													<Link to={GetUrlDetailWaitApproval(item)} className="text-blue-700 underline">
														{item?.code}
													</Link>
												</td>
												<td className="px-4 py-2 border whitespace-nowrap text-center">{lang == 'vi' ? item?.requestTypeName : item?.requestTypeNameE}</td>
												<td className="px-4 py-2 border whitespace-nowrap text-center">--</td>
												<td className="px-4 py-2 border whitespace-nowrap text-center">{item?.userNameCreatedForm}</td>
												<td className="px-4 py-2 border whitespace-nowrap text-center">{item?.createdAt ? formatDate(item?.createdAt, "yyyy/MM/dd HH:mm") : '--'}</td>
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
        </div>
    )
}