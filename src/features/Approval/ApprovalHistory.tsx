
import approvalApi from '@/api/approvalApi';
import requestTypeApi, { IRequestType } from '@/api/requestTypeApi';
import PaginationControl from '@/components/PaginationControl/PaginationControl';
import { StatusLeaveRequest } from '@/components/StatusLeaveRequest/StatusLeaveRequestComponent';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { REQUEST_TYPE } from '@/lib';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { formatDate } from 'date-fns';
import React, { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface HistoryApprovalProcessedResponse {
	action: string;
	createdAt: string | Date,
	requestStatusId?: number,
	requestType?: {
		id: number,
		name: string,
		nameE: string,
	},
	leaveRequest?: {
		id?: string,
		code?: string,
		userNameRequestor?: string
	},
	memoNotification?: {
		id?: string,
		code?: string,
		createdBy?: string,
	}
}

function GetCodeByRequestTypeId(item: HistoryApprovalProcessedResponse) {
	let result = ''

	if (item?.requestType?.id == REQUEST_TYPE.LEAVE_REQUEST) {
		result = item?.leaveRequest?.code || ''
	}
	else if (item?.requestType?.id == REQUEST_TYPE.MEMO_NOTIFICATION) {
		result = item?.memoNotification?.code || '';
	}

	return result
}

function GetUrlDetailWaitApproval(item: HistoryApprovalProcessedResponse) {
	let result = ''

	if (item?.requestType?.id == REQUEST_TYPE.LEAVE_REQUEST) {
		result = `/approval/view-leave-request/${item?.leaveRequest?.id ?? '-1'}`
	}
	else if (item?.requestType?.id == REQUEST_TYPE.MEMO_NOTIFICATION) {
		result = `/approval/view-memo-notify/${item?.memoNotification?.id ?? '1'}`
	}

	return result
}


function GetUserRequestByRequestTypeId(item: HistoryApprovalProcessedResponse) {
	let result = ''

	if (item?.requestType?.id == REQUEST_TYPE.LEAVE_REQUEST) {
		result = item?.leaveRequest?.userNameRequestor ?? ''
	}
	else if (item?.requestType?.id == REQUEST_TYPE.MEMO_NOTIFICATION) {
		result = item?.memoNotification?.createdBy || '';
	}

	return result
}

const ApprovalHistory: React.FC = () => {
	const { t } = useTranslation('pendingApproval')
	const { t: tCommon } = useTranslation('common')
	const lang = useTranslation().i18n.language.split('-')[0]
	const [requestType, setRequestType] = useState('');
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(10)
	const [totalPage, setTotalPage] = useState(0)
	const { user } = useAuthStore()

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

	const handleOnChangeRequestType = (e: ChangeEvent<HTMLSelectElement>) => {
		setPage(1)
		setRequestType(e.target.value)
	}

	const { data: ListHistoryApprovalsProcessed = [], isPending, isError, error } = useQuery({
        queryKey: ['get-list-history-approval-processed', page, pageSize, requestType],
        queryFn: async () => {
            const res = await approvalApi.GetListHistoryApprovalOrProcessed({
                Page: page,
                PageSize: pageSize,
				UserCode: user?.userCode,
				RequestTypeId: requestType == '' ? null : Number(requestType),
            });
			setTotalPage(res.data.total_pages)
            return res.data.data;
        },
    });

	function setCurrentPage(page: number): void {
        setPage(page)
    }

    function handlePageSizeChange(size: number): void {
        setPage(1)
        setPageSize(size)
    }
		
	return (
		<div className="p-1 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0">{t('history_approval_processed.title')}</h3>
            </div>

			<div className="mt-2 flex">
				<div>
					<Label className="mb-2">{t('history_approval_processed.request_type')}</Label>
					<select className="border p-1 rounded w-full md:w-auto cursor-pointer" value={requestType} onChange={(e) => handleOnChangeRequestType(e)}>
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
				<div className="overflow-x-auto bg-white rounded border-gray-200">
					<table className="min-w-full text-sm border border-gray-200">
						<thead className="bg-gray-100">
							<tr>
								<th className="px-4 py-2 border">{t('history_approval_processed.code')}</th>
								<th className="px-4 py-3 border text-center whitespace-nowrap">{t('history_approval_processed.request_type')}</th>
								<th className="px-4 py-3 border text-center whitespace-nowrap">{t('history_approval_processed.user_request')}</th>
								<th className="px-4 py-3 border text-center whitespace-nowrap">{t('history_approval_processed.approval_at')}</th>
								<th className="px-4 py-3 border text-center whitespace-nowrap">{t('history_approval_processed.action')}</th>
								<th className="px-4 py-3 border text-center whitespace-nowrap">{t('history_approval_processed.result')}</th>
							</tr>
						</thead>
						<tbody>
							{
								isPending ? (
									Array.from({ length: 3 }).map((_, index) => (
										<tr key={index}>
											<td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[50px] bg-gray-300" /></div></td>
											<td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[50px] bg-gray-300" /></div></td>
											<td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[50px] bg-gray-300" /></div></td>
											<td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[50px] bg-gray-300" /></div></td>
											<td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[50px] bg-gray-300" /></div></td>
											<td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[50px] bg-gray-300" /></div></td>
										</tr>
									))
								) : isError || ListHistoryApprovalsProcessed?.length == 0 ? (
									<tr>
										<td colSpan={6} className="px-4 py-2 text-center font-bold text-red-700">
											{ error?.message ?? tCommon('no_results') } 
										</td>
									</tr>
								) : (
									ListHistoryApprovalsProcessed.map((item: HistoryApprovalProcessedResponse, idx: number) => (
										<tr key={idx} className="hover:bg-gray-50">
											<td className="px-4 py-2 border whitespace-nowrap text-center">
												<Link to={GetUrlDetailWaitApproval(item)} className="text-blue-700 underline">
													{ GetCodeByRequestTypeId(item) }
												</Link>
											</td>
											<td className="px-4 py-2 border whitespace-nowrap text-center">{lang == 'vi' ? item?.requestType?.name : item?.requestType?.nameE}</td>
											<td className="px-4 py-2 border whitespace-nowrap text-center">{GetUserRequestByRequestTypeId(item)}</td>
											<td className="px-4 py-2 border whitespace-nowrap text-center">{item?.createdAt ? formatDate(item?.createdAt, "yyyy/MM/dd HH:mm") : '--'}</td>
											<td className="px-4 py-2 border whitespace-nowrap text-center">
												{ item.action }
											</td>
											<td className="px-4 py-2 border whitespace-nowrap text-center">
												<StatusLeaveRequest status={item?.requestStatusId == 6 ? "In Process" : item?.requestStatusId}/>
											</td>
										</tr>
									))
								)
							}
						</tbody>
					</table>
				</div>
			</div>
			{
                ListHistoryApprovalsProcessed.length > 0 ? (<PaginationControl
                    currentPage={page}
                    totalPages={totalPage}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={handlePageSizeChange}
                />) : (null)
            }
        </div>
	);
};

export default ApprovalHistory;
