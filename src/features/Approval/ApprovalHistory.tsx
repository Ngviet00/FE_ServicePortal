/* eslint-disable @typescript-eslint/no-explicit-any */
import approvalApi from '@/api/approvalApi';
import requestTypeApi, { IRequestType } from '@/api/requestTypeApi';
import PaginationControl from '@/components/PaginationControl/PaginationControl';
import { StatusLeaveRequest } from '@/components/StatusLeaveRequest/StatusLeaveRequestComponent';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { REQUEST_TYPE, STATUS_ENUM } from '@/lib';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { formatDate } from 'date-fns';
import React, { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

function GetUrlDetailWaitApproval(item: any) {
	let result = ''

	if (item?.requestTypeId == REQUEST_TYPE.LEAVE_REQUEST) {
		result = `/view/leave-request/${item?.code ?? '-1'}`
	}
	else if (item?.requestTypeId == REQUEST_TYPE.MEMO_NOTIFICATION) {
		result = `/view/memo-notify/${item?.code ?? '1'}`
	}
	else if (item?.requestTypeId == REQUEST_TYPE.FORM_IT) {
		result = `/view/form-it/${item?.code ?? '1'}`
	}
	else if (item?.requestTypeId == REQUEST_TYPE.PURCHASE) {
		result = `/view/purchase/${item?.code ?? '1'}`
	}
	else if (item?.requestTypeId == REQUEST_TYPE.OVERTIME) {
		result = `/view/overtime/${item?.code ?? '1'}`
	}
	else if (item?.requestTypeId == REQUEST_TYPE.MISS_TIMEKEEPING) {
		result = `/view/miss-timekeeping/${item?.code ?? '1'}`
	}
	else if (item?.requestTypeId == REQUEST_TYPE.INTERNAL_MEMO_HR) {
		result = `/internal-memo-hr/${item?.code ?? '1'}?mode=view`
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
	const [selectedStatus, setSelectedStatus] = useState('')

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
        queryKey: ['get-list-history-approval-processed', page, pageSize, requestType, selectedStatus],
        queryFn: async () => {
            const res = await approvalApi.GetListHistoryApprovalOrProcessed({
                Page: page,
                PageSize: pageSize,
				UserCode: user?.userCode,
				RequestTypeId: requestType == '' ? null : Number(requestType),
				Status: selectedStatus == '' ? null : Number(selectedStatus),
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

	const handleOnChangeStatus = (e: ChangeEvent<HTMLSelectElement>) => {
        setPage(1)
        setSelectedStatus(e.target.value)
    }
		
	return (
		<div className="p-1 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0">{t('history_approval_processed.title')}</h3>
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
				<div className="w-[12%] mx-5">
					<Label className="mb-2">{t('history_approval_processed.status')}</Label>
					<select value={selectedStatus} onChange={(e) => handleOnChangeStatus(e)} className="border p-1 rounded w-full cursor-pointer">
						<option value="">{ lang == 'vi' ? 'Tất cả' : 'All' }</option>
						{
							Object.entries(STATUS_ENUM).filter(([, value]) => typeof value === 'number' && [1, 2, 3, 5].includes(value))
								.map(([key, value]) => (
									<option key={value} value={value}>
										{key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()}
									</option>
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
								<th className="px-4 py-2 border text-center">{t('history_approval_processed.code')}</th>
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
									ListHistoryApprovalsProcessed.map((item: any, idx: number) => {
										const reqStatusId = item?.requestStatusId

										return (
											<tr key={idx} className="hover:bg-gray-50">
												<td className="px-4 py-2 border whitespace-nowrap text-center">
													<Link to={GetUrlDetailWaitApproval(item)} className="text-blue-700 underline">
														{item?.code}
													</Link>
												</td>
												<td className="px-4 py-2 border whitespace-nowrap text-center">{lang == 'vi' ? item?.requestTypeName : item?.requestTypeNameE}</td>
												<td className="px-4 py-2 border whitespace-nowrap text-center">{item?.userNameCreatedForm}</td>
												<td className="px-4 py-2 border whitespace-nowrap text-center">{item?.actionAt ? formatDate(item?.actionAt, "yyyy/MM/dd HH:mm:ss") : '--'}</td>
												<td className="px-4 py-2 border whitespace-nowrap text-center">
													{ item?.action }
												</td>
												<td className="px-4 py-2 border whitespace-nowrap text-center">
													<StatusLeaveRequest status={
                                                        reqStatusId == STATUS_ENUM.ASSIGNED || reqStatusId == STATUS_ENUM.FINAL_APPROVAL 
                                                            ? STATUS_ENUM.IN_PROCESS 
                                                        : reqStatusId
                                                    }/>
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
