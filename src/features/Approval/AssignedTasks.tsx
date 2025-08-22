/* eslint-disable @typescript-eslint/no-explicit-any */
import { ITForm } from "@/api/itFormApi";
import { StatusLeaveRequest } from "@/components/StatusLeaveRequest/StatusLeaveRequestComponent";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { REQUEST_TYPE } from "@/lib";
import { formatDate } from "@/lib/time";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import orgUnitApi from "@/api/orgUnitApi";
import requestTypeApi, { IRequestType } from "@/api/requestTypeApi";
import PaginationControl from "@/components/PaginationControl/PaginationControl";
import useHasPermission from "@/hooks/useHasPermission";
import approvalApi from "@/api/approvalApi";

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
		result = `/approval/approval-form-it/${item?.itForm?.id ?? '1'}?mode=approval`
	}

	return result
}

export default function AssignedTasks() {
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

	const { data: ListAssignedTask = [], isPending, isError, error } = useQuery({
		queryKey: ['get-list-assigned-task', page, pageSize, requestType, selectedDepartment],
		queryFn: async () => {
			const res = await approvalApi.GetListAssigned({
				Page: page,
				PageSize: pageSize,
				UserCode: user?.userCode,
			});
			setTotalPage(res.data.total_pages)
			return res.data.data;
		},
	});

	const handleOnChangeRequestType = (e: ChangeEvent<HTMLSelectElement>) => {
		setRequestType(e.target.value)
	}
	
	const handleOnChangeDepartment = (e: ChangeEvent<HTMLSelectElement>) => {
		setSelectedDepartment(e.target.value)
	}

	return (
		<div className="p-1 pl-1 pt-0 space-y-4">
			<div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
				<h3 className="font-bold text-xl md:text-2xl m-0">{t('pending_approval.title')}</h3>
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
								) : isError || ListAssignedTask?.length == 0 ? (
									<tr>
										<td colSpan={9} className="px-4 py-2 text-center font-bold text-red-700">
											{ error?.message ?? tCommon('no_results') } 
										</td>
									</tr>
								) : (
									ListAssignedTask.map((item: PendingApprovalResponse, idx: number) => {
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
				</div>
			</div>
			{
				ListAssignedTask.length > 0 ? (<PaginationControl
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
