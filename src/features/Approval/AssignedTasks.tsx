/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusLeaveRequest } from "@/components/StatusLeaveRequest/StatusLeaveRequestComponent";
import { Skeleton } from "@/components/ui/skeleton";
import { REQUEST_TYPE, STATUS_ENUM } from "@/lib";
import { formatDate } from "@/lib/time";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import PaginationControl from "@/components/PaginationControl/PaginationControl";
import approvalApi from "@/api/approvalApi";
import { Label } from "@/components/ui/label";
import requestTypeApi, { IRequestType } from "@/api/requestTypeApi";
import { PendingApprovalResponse } from "./PendingApproval";

function GetUrlDetailWaitApproval(item: PendingApprovalResponse) {
	let result = ''

	const requestTypeId = item?.requestTypeId
	if (requestTypeId == REQUEST_TYPE.FORM_IT) {
		result = `/approval/assigned-form-it/${item?.code ?? '1'}`
	}
	else if (requestTypeId == REQUEST_TYPE.PURCHASE) {
		result = `/approval/assigned-purchase/${item?.code ?? '1'}`
	}

	return result
}

export default function AssignedTasks() {
	const { t } = useTranslation('pendingApproval')
	const { t: tCommon } = useTranslation('common')
	const lang = useTranslation().i18n.language.split('-')[0]
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(10)
	const [totalPage, setTotalPage] = useState(0)
	const { user } = useAuthStore()
	const [requestType, setRequestType] = useState('')

	const handleOnChangeRequestType = (e: ChangeEvent<HTMLSelectElement>) => {
		setPage(1)
		setRequestType(e.target.value)
	}

	function setCurrentPage(page: number): void {
		setPage(page)
	}

	function handlePageSizeChange(size: number): void {
		setPage(1)
		setPageSize(size)
	}

	const { data: ListAssignedTask = [], isPending, isError, error } = useQuery({
		queryKey: ['get-list-assigned-task', page, pageSize, requestType],
		queryFn: async () => {
			const res = await approvalApi.GetListAssigned({
				Page: page,
				PageSize: pageSize,
				UserCode: user?.userCode,
				RequestTypeId: requestType == '' ? null : Number(requestType),
			});
			setTotalPage(res.data.total_pages)
			return res.data.data;
		},
	});

	const { data: requestTypes = []} = useQuery({
        queryKey: ['get-all-request-type'],
        queryFn: async () => {
            const res = await requestTypeApi.getAll({
                page: 1,
                pageSize: 200,
            });
            return res.data.data;
        }
    });

	return (
		<div className="p-1 pl-1 pt-0 space-y-4">
			<div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-2">
				<h3 className="font-bold text-xl md:text-2xl m-0">{t('assigned.title')}</h3>
			</div>

			<div className="flex mt-3 mb-5">
				<div className='w-[12%]'>
					<Label className="mb-2">{t('history_approval_processed.request_type')}</Label>
					<select className="border p-1 rounded w-full cursor-pointer" value={requestType} onChange={(e) => handleOnChangeRequestType(e)}>
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
								<th className="px-4 py-2 border">{t('pending_approval.code')}</th>
								<th className="px-4 py-2 border">{t('pending_approval.request_type')}</th>
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
											<td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[70px] bg-gray-300" /></div></td>
											<td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[70px] bg-gray-300" /></div></td>
											<td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[70px] bg-gray-300" /></div></td>
											<td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[70px] bg-gray-300" /></div></td>
											<td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[70px] bg-gray-300" /></div></td>
										</tr>  
									))
								) : isError || ListAssignedTask?.length == 0 ? (
									<tr>
										<td colSpan={6} className="px-4 py-2 text-center font-bold text-red-700">
											{ error?.message ?? tCommon('no_results') } 
										</td>
									</tr>
								) : (
									ListAssignedTask.map((item: any, idx: number) => {
										let status = STATUS_ENUM.ASSIGNED;

										if (item?.requestTypeId == REQUEST_TYPE.PURCHASE && item?.requestStatusIdPurchase > 0 ) {
											status = item?.requestStatusIdPurchase
										}

										return (
											<tr key={idx} className="hover:bg-gray-50">
												<td className="px-4 py-2 border whitespace-nowrap text-center">
													<Link to={GetUrlDetailWaitApproval(item)} className="text-blue-700 underline">
														{item?.code}
													</Link>
												</td>
												<td className="px-4 py-2 border whitespace-nowrap text-center">{lang == 'vi' ? item?.requestTypeName : item?.requestTypeNameE}</td>
												<td className="px-4 py-2 border whitespace-nowrap text-center">{item?.userNameCreatedForm}</td>
												<td className="px-4 py-2 border whitespace-nowrap text-center">{item?.createdAt ? formatDate(item?.createdAt, "yyyy/MM/dd HH:mm") : '--'}</td>
												<td className="px-4 py-2 border text-center">

													<StatusLeaveRequest status={status}/>
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
