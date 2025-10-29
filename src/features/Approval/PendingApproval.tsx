/* eslint-disable @typescript-eslint/no-explicit-any */
import approvalApi, { useApprovalAll } from "@/api/approvalApi";
import { HistoryApplicationForm, IRequestStatus } from "@/api/itFormApi";
import { OrgUnit } from "@/api/orgUnitApi";
import requestTypeApi, { IRequestType } from "@/api/requestTypeApi";
import PaginationControl from "@/components/PaginationControl/PaginationControl";
import { StatusLeaveRequest } from "@/components/StatusLeaveRequest/StatusLeaveRequestComponent";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { REQUEST_TYPE, ShowToast } from "@/lib";
import { formatDate } from "@/lib/time";
import { useAuthStore } from "@/store/authStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChangeEvent, useEffect, useState } from "react";
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

function GetUrlDetailWaitApproval(item: any) {
	let result = ''
	const requestTypeId = item?.requestTypeId

	if (requestTypeId == REQUEST_TYPE.LEAVE_REQUEST) {
		result = `/view-leave-request-approval/${item.code ?? '-1'}`
	}
	else if (requestTypeId == REQUEST_TYPE.MEMO_NOTIFICATION) {
		result = `/view-memo-notify-approval/${item.code ?? '1'}`
	}
	else if (requestTypeId == REQUEST_TYPE.FORM_IT) {
		result = `/view-form-it-approval/${item.code ?? '1'}`
	}
	else if (requestTypeId == REQUEST_TYPE.PURCHASE) {
		result = `/view-purchase-approval/${item.code ?? '1'}`
	}
	else if (requestTypeId == REQUEST_TYPE.OVERTIME) {
		result = `/view-overtime-approval/${item?.code ?? '1'}`
	}
	else if (requestTypeId == REQUEST_TYPE.MISS_TIMEKEEPING) {
		result = `/view-miss-timekeeping-approval/${item?.code ?? '1'}`
	}
	else if (requestTypeId == REQUEST_TYPE.INTERNAL_MEMO_HR) {
		result = `/internal-memo-hr/${item?.code ?? '1'}?mode=approval`
	}
	else if (requestTypeId == REQUEST_TYPE.TIMEKEEPING) {
		result = `/view/timekeeping/${item?.code ?? '1'}?mode=approval`
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
	const [isSelectAll, setIsSelectAll] = useState(false)
	const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
	const approvalAll = useApprovalAll();
	const queryClient = useQueryClient()
	const [errorItems, setErrorItems] = useState<any[]>([]);

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

	const handleOnChangeRequestType = (e: ChangeEvent<HTMLSelectElement>) => {
		setRequestType(e.target.value)
		setSelectedCodes(new Set());
		setIsSelectAll(false);
	}

	useEffect(() => {
		if (ListWaitApprovals.length === 0) {
			setIsSelectAll(false);
			return;
		}
		const allSelected = ListWaitApprovals.every((x: any) =>
			selectedCodes.has(x.code)
		);
		setIsSelectAll(allSelected);
	}, [selectedCodes, ListWaitApprovals]);

	const toggleSelect = (code: string) => {
		setSelectedCodes((prev) => {
			const next = new Set(prev);
			if (next.has(code)) next.delete(code);
			else next.add(code);
			return next;
		});
	};

	const toggleSelectAll = () => {
		if (isSelectAll) {
			setSelectedCodes(new Set());
			setIsSelectAll(false);
		} else {
			const allCodes = ListWaitApprovals.map((x: any) => x.code);
			setSelectedCodes(new Set(allCodes));
			setIsSelectAll(true);
		}
	};

	const handleApproveAll = async () => {
		if (selectedCodes.size === 0) {
			ShowToast(lang == 'vi' ? `Chưa chọn đơn nào để duyệt` : 'Select item to approve', 'error');
			return;
		}

		const selectedItems = ListWaitApprovals
			.filter((item: any) => selectedCodes.has(item.code))
			.map((item: any) => ({
				ApplicationFormId: item.id,
				ApplicationFormCode: item.code,
				RequestTypeId: item.requestTypeId
			}));

		const results = await approvalAll.mutateAsync({
			Items: selectedItems,
			UserCodeApproval: user?.userCode ?? '',
			UserNameApproval: user?.userName ?? '',
			OrgPositionId: user?.orgPositionId ?? -1,
		});

		const failedItems = results.filter(item => !item.success);
		setErrorItems(failedItems);

		queryClient.invalidateQueries({ queryKey: ['get-list-wait-approval'] })
		queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] })
		setSelectedCodes(new Set());
		setIsSelectAll(false);
	};

    return (
		<div className="p-1 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0">{t('pending_approval.title')}</h3>
				<Button
					disabled={approvalAll.isPending || selectedCodes.size === 0}
					onClick={handleApproveAll}
					className="bg-red-700 hover:bg-red-800 text-white text-sm cursor-pointer"
				>
					{approvalAll.isPending
						? lang == 'vi' ? 'Đang duyệt' : 'Approving'
						: lang == 'vi' ? `Duyệt tất cả (${selectedCodes.size})` : `Approval All (${selectedCodes.size})`}
				</Button>
            </div>

			{errorItems.length > 0 && (
				<div className="mt-4 p-2 border border-red-400 bg-red-50 text-red-700 rounded">
					<h4 className="font-semibold mb-2">{lang == 'vi' ? 'Đơn lỗi' : 'Errors'}:</h4>
					<ul className="list-disc list-inside">
						{errorItems.map(item => (
						<li key={item.code}>
							{item.code}: {item.error}
						</li>
						))}
					</ul>
				</div>
			)}

			<div className="mt-2 flex mb-5">
				<div className="w-[12%] min-w-[150px]">
					<Label className="mb-2">{t("pending_approval.request_type")}</Label>
					<select
						value={requestType}
						onChange={(e) => handleOnChangeRequestType(e)}
						className="border p-1 rounded w-full cursor-pointer"
					>
						<option value="">
							{lang == "vi" ? "Tất cả" : "All"}
						</option>
						{requestTypes.map((item: IRequestType, idx: number) => (
							<option key={idx} value={item.id}>
								{lang == "vi" ? item.name : item.nameE}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className="hidden md:block overflow-x-auto">
				<table className="min-w-full text-sm border border-gray-200">
					<thead className="bg-gray-100">
						<tr>
							<th className="px-4 py-2 border text-center w-[40px]">
								<input
									className="scale-[1.3] hover:cursor-pointer accent-black"
									type="checkbox"
									checked={isSelectAll}
									onChange={toggleSelectAll}
								/>
							</th>
							<th className="px-4 py-2 border">{t("pending_approval.code")}</th>
							<th className="px-4 py-2 border">{t("pending_approval.request_type")}</th>
							<th className="px-4 py-2 border w-[200px]">{lang == "vi" ? "Danh mục" : "Category"}</th>
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
									{Array.from({ length: 8 }).map((_, i) => (
										<td key={i} className="px-4 py-2 border text-center">
											<div className="flex justify-center">
												<Skeleton className="h-4 w-[70px] bg-gray-300" />
											</div>
										</td>
									))}
								</tr>
							))
						) : isError || ListWaitApprovals?.length == 0 ? (
							<tr>
								<td colSpan={8} className="px-4 py-2 text-center font-bold text-red-700">
									{error?.message ?? tCommon("no_results")}
								</td>
							</tr>
						) : (
							ListWaitApprovals.map((item: any, idx: number) => (
								<tr key={idx} className="hover:bg-gray-50">
									<td className="px-4 py-2 border text-center">
										<input
											className="scale-[1.3] hover:cursor-pointer accent-black"
											type="checkbox"
											checked={selectedCodes.has(item.code)}
											onChange={() => toggleSelect(item.code)}
										/>
									</td>
									<td className="px-4 py-2 border text-center">
										<Link to={GetUrlDetailWaitApproval(item)} className="text-blue-700 underline">
											{item?.code}
										</Link>
									</td>
									<td className="px-4 py-2 border text-center">
										{lang == "vi" ? item?.requestTypeName : item?.requestTypeNameE}
									</td>
									<td className="px-4 py-2 border text-center">
										{item?.noteCategories || "--"}
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
											to={GetUrlDetailWaitApproval(item)}
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
				) : isError || ListWaitApprovals?.length == 0 ? (
					<div className="text-center text-red-600 font-semibold">
						{error?.message ?? tCommon("no_results")}
					</div>
				) : (
					<div>
						<div className="mb-1 ml-3">
							<input
								id="mobile-select-all"
								className="scale-[1.3] hover:cursor-pointer accent-black"
								type="checkbox"
								checked={isSelectAll}
								onChange={toggleSelectAll}
							/>
							<label htmlFor="mobile-select-all" className="inline-block ml-2 hover:cursor-pointer">Chọn tất cả</label>
						</div>

						{
							ListWaitApprovals.map((item: any, idx: number) => (
								<div key={idx} className="border rounded-lg p-3 shadow-sm bg-white mb-3">
									<div className="flex justify-between items-center">
										<input
											type="checkbox"
											className="scale-[1.3] accent-black cursor-pointer"
											checked={selectedCodes.has(item.code)}
											onChange={() => toggleSelect(item.code)}
										/>
										<Link
											to={GetUrlDetailWaitApproval(item)}
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
											to={GetUrlDetailWaitApproval(item)}
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