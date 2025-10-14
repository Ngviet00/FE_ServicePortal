/* eslint-disable @typescript-eslint/no-explicit-any */
import { HistoryApplicationForm, IRequestStatus } from "@/api/itFormApi";
import { OrgUnit } from "@/api/orgUnitApi";
import purchaseApi from "@/api/purchaseApi";
import PaginationControl from "@/components/PaginationControl/PaginationControl";
import { StatusLeaveRequest } from "@/components/StatusLeaveRequest/StatusLeaveRequestComponent";
import { Skeleton } from "@/components/ui/skeleton";
import { GetUrlWaitApproval } from "@/lib";
import { formatDate } from "@/lib/time";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
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
	requestTypeId?: number,
	requestTypeName?: string,
	requestTypeNameE?: string,
	requestStatus?: IRequestStatus
	historyApplicationForm?: HistoryApplicationForm,
	orgUnit?: OrgUnit
}

export default function ListItemWaitQuote() {
	const { t } = useTranslation('pendingApproval')
	const { t: tCommon } = useTranslation('common')
	const lang = useTranslation().i18n.language.split('-')[0]
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(10)
	const [totalPage, setTotalPage] = useState(0)
	const { user } = useAuthStore()

	function setCurrentPage(page: number): void {
        setPage(page)
    }

    function handlePageSizeChange(size: number): void {
        setPage(1)
        setPageSize(size)
    }
	
	const { data: ListWaitResponseQuotes = [], isPending, isError, error } = useQuery({
        queryKey: ['get-list-wait-response-quote', page, pageSize],
        queryFn: async () => {
            const res = await purchaseApi.getListWaitResponseQuote({
                Page: page,
                PageSize: pageSize,
				UserCode: user?.userCode,
            });
			setTotalPage(res.data.total_pages)
            return res.data.data;
        },
    });

    return (
		<div className="p-1 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0">{lang == 'vi' ? 'Danh sách chờ báo giá': 'List wait response quote'}</h3>
            </div>

			<div className="hidden md:block overflow-x-auto">
				<table className="min-w-full text-sm border border-gray-200">
					<thead className="bg-gray-100">
						<tr>
							<th className="px-4 py-2 border">{t("pending_approval.code")}</th>
							<th className="px-4 py-2 border">{t("pending_approval.request_type")}</th>
							<th className="px-4 py-2 border">{t("pending_approval.user_request")}</th>
							<th className="px-4 py-2 border">{t("pending_approval.created_at")}</th>
							<th className="px-4 py-2 border">{t("pending_approval.status")}</th>
							<th className="px-4 py-2 border text-center">{t("pending_approval.action")}</th>
						</tr>
					</thead>
					<tbody>
						{isPending ? (
							Array.from({ length: 3 }).map((_, index) => (
								<tr key={index}>
									{Array.from({ length: 6 }).map((_, i) => (
										<td key={i} className="px-4 py-2 border text-center">
											<div className="flex justify-center">
												<Skeleton className="h-4 w-[70px] bg-gray-300" />
											</div>
										</td>
									))}
								</tr>
							))
						) : isError || ListWaitResponseQuotes?.length == 0 ? (
							<tr>
								<td colSpan={6} className="px-4 py-2 text-center font-bold text-red-700">
									{error?.message ?? tCommon("no_results")}
								</td>
							</tr>
						) : (
							ListWaitResponseQuotes.map((item: any, idx: number) => (
								<tr key={idx} className="hover:bg-gray-50">
									<td className="px-4 py-2 border text-center">
										<Link to={GetUrlWaitApproval(item?.requestTypeId, item?.code)} className="text-blue-700 underline">
											{item?.code}
										</Link>
									</td>
									<td className="px-4 py-2 border text-center">
										{lang == "vi" ? item?.requestTypeName : item?.requestTypeNameE}
									</td>
									<td className="px-4 py-2 border text-center">{item?.userNameCreatedForm}</td>
									<td className="px-4 py-2 border text-center">
										{item?.createdAt ? formatDate(item?.createdAt, "yyyy/MM/dd HH:mm") : "--"}
									</td>
									<td className="px-4 py-2 border text-center">
										<StatusLeaveRequest status="Pending" />
									</td>
									<td className="px-4 py-2 border text-center space-x-1">
										<Link
											to={GetUrlWaitApproval(item?.requestTypeId, item?.code)}
											className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
										>
											{t("pending_approval.detail")}
										</Link>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			<div className="md:hidden space-y-3">
				{isPending ? (
					Array.from({ length: 3 }).map((_, idx) => (
						<div key={idx} className="border rounded-lg p-3 shadow-sm bg-white">
							<Skeleton className="h-4 w-[80%] mb-2 bg-gray-300" />
							<Skeleton className="h-4 w-[60%] mb-2 bg-gray-300" />
							<Skeleton className="h-4 w-[50%] bg-gray-300" />
						</div>
					))
				) : isError || ListWaitResponseQuotes?.length == 0 ? (
					<div className="text-center text-red-600 font-semibold">
						{error?.message ?? tCommon("no_results")}
					</div>
				) : (
					<div>
						{
							ListWaitResponseQuotes.map((item: any, idx: number) => (
								<div key={idx} className="border rounded-lg p-3 shadow-sm bg-white mb-3">
									<div className="flex justify-between items-center">
										<Link
											to={GetUrlWaitApproval(item?.requestTypeId, item?.code)}
											className="font-semibold text-blue-700 underline"
										>
											{item.code}
										</Link>
										<StatusLeaveRequest status="Pending" />
									</div>

									<div className="text-sm text-gray-700 mt-1 space-y-1">
										<p>
											<span className="font-medium">{t("pending_approval.request_type")}: </span>
											{lang == "vi" ? item?.requestTypeName : item?.requestTypeNameE}
										</p>
										{item?.noteCategories && (
											<p>
												<span className="font-medium">
													{lang == "vi" ? "Danh mục" : "Category"}:{" "}
												</span>
												{item?.noteCategories}
											</p>
										)}
										<p>
											<span className="font-medium">
												{t("pending_approval.user_request")}:{" "}
											</span>
											{item?.userNameCreatedForm}
										</p>
										<p>
											<span className="font-medium">
												{t("pending_approval.created_at")}:{" "}
											</span>
											{item?.createdAt ? formatDate(item?.createdAt, "yyyy/MM/dd HH:mm") : "--"}
										</p>
									</div>

									<div className="mt-2 flex justify-end">
										<Link
											to={GetUrlWaitApproval(item?.requestTypeId, item?.code)}
											className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
										>
											{t("pending_approval.detail")}
										</Link>
									</div>
								</div>
							))
						}
					</div>
				)}
			</div>
			{
                ListWaitResponseQuotes.length > 0 ? (<PaginationControl
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