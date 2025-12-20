/* eslint-disable @typescript-eslint/no-explicit-any */
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/authStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import approvalApi, { useApprovalAll } from "@/api/approvalApi";
import { StatusLeaveRequest } from "@/components/StatusLeaveRequest/StatusLeaveRequestComponent";
import KeysetPagination from "@/components/PaginationControl/PaginationControlKeySet";
import { formatDate } from "@/lib/time";
import { ShowToast, StatusApplicationFormEnum } from "@/lib";
import { Button } from "@/components/ui/button";

export default function AssignedTasks() {
	const { t } = useTranslation("pendingApproval");
	const { t: tCommon } = useTranslation("common");
	const lang = useTranslation().i18n.language.split("-")[0];
	const { user } = useAuthStore();
	const approvalAll = useApprovalAll();
	const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
	const [errorItems, setErrorItems] = useState<any[]>([]);	
	const queryClient = useQueryClient()
	const [isSelectAll, setIsSelectAll] = useState(false)

	const [searchParams, setSearchParams] = useSearchParams();

	const [cursor, setCursor] = useState<number | null>(0);
	const [cursorStack, setCursorStack] = useState<number[]>([]);
	const [limit, setLimit] = useState(20);
	const [hasNext, setHasNext] = useState(false);
	const [nextCursor, setNextCursor] = useState<number | null>(null);

	const {data: ListAssignedTask = [],isPending,isError,error} = useQuery({
		queryKey: ["get-list-assigned-task", cursor, limit],
		queryFn: async () => {
			const res = await approvalApi.GetListAssigned({
				LastId: cursor ?? 0,
				PageSize: limit,
				UserCode: user?.userCode,
			});
			setHasNext(res.data.data.hasNext);
			setNextCursor(res.data.data.nextCursor);

			return res.data.data.pendingApprovalItems ?? [];
		},
	});

	useEffect(() => {
		setCursorStack([]);
	}, [limit]);

	const handleNext = () => {
		if (!hasNext || nextCursor == null) return;

		setCursorStack(prev => [...prev, cursor ?? 0]);
		setCursor(nextCursor);
	};

	const handlePrevious = () => {
		setCursorStack(prev => {
			if (prev.length === 0) return prev;

			const newStack = [...prev];
			const prevCursor = newStack.pop()!;
			setCursor(prevCursor);
			return newStack;
		});
	};

	const handleLimitChange = (newLimit: number) => {
		setLimit(newLimit);
		setCursor(null); 
		setCursorStack([]);
		setNextCursor(null);
		
		searchParams.set("limit", newLimit.toString());
		setSearchParams(searchParams);
	};

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
			const allCodes = ListAssignedTask.map((x: any) => x.code);
			setSelectedCodes(new Set(allCodes));
			setIsSelectAll(true);
		}
	};

	const handleApproveAll = async () => {
		if (selectedCodes.size === 0) {
			ShowToast(lang == 'vi' ? `Chưa chọn đơn nào để duyệt` : 'Select item to approve', 'error');
			return;
		}

		const selectedItems = ListAssignedTask
			.filter((item: any) => selectedCodes.has(item.code))
			.map((item: any) => ({
				ApplicationFormId: item.id,
				ApplicationFormCode: item.code,
				RequestTypeId: item.requestTypeId,
				RequestStatusId: item.requestStatusId
			}));

		const results = await approvalAll.mutateAsync({
			Items: selectedItems,
			UserCodeApproval: user?.userCode ?? '',
			UserNameApproval: user?.userName ?? '',
			OrgPositionId: user?.orgPositionId ?? -1,
		});

		const failedItems = results.filter(item => !item.success);
		setErrorItems(failedItems);

		queryClient.invalidateQueries({ queryKey: ['get-list-assigned-task'] })
		queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] })
		setSelectedCodes(new Set());
		setIsSelectAll(false);
	};

	return (
		<div className="p-1 pl-1 pt-0 space-y-4">
			<div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-3">
				<h3 className="font-bold text-xl md:text-2xl m-0">
					{t("assigned.title")}
				</h3>
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

			<div className="hidden md:block">
				<div className="overflow-x-auto">
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
								<th className="px-4 py-2 border">{t("pending_approval.RequestTypeEnum")}</th>
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
										{Array.from({ length: 7 }).map((__, i) => (
											<td
												key={i}
												className="px-4 py-2 border whitespace-nowrap text-center"
											>
												<div className="flex justify-center">
													<Skeleton className="h-4 w-[70px] bg-gray-300" />
												</div>
											</td>
										))}
									</tr>
								))
							) : isError || ListAssignedTask?.length === 0 ? (
								<tr>
									<td
										colSpan={7}
										className="px-4 py-2 text-center font-bold text-red-700"
									>
										{error?.message ?? tCommon("no_results")}
									</td>
								</tr>
							) : (
								ListAssignedTask.map((item: any, idx: number) => {
									return (
										<tr key={idx} className="hover:bg-gray-50">
											<td className="px-4 py-2 border text-center">
												<input
													className="scale-[1.3] hover:cursor-pointer accent-black"
													type="checkbox"
													checked={selectedCodes.has(item.code)}
													onChange={() => toggleSelect(item.code)}
												/>
											</td>
											<td className="px-4 py-2 border whitespace-nowrap text-center">
												<Link
													to={`/view-approval/${item.code}?requestType=${item.requestTypeId}`}
													className="text-blue-700 underline"
												>
													{item?.code}
												</Link>
											</td>
											<td className="px-4 py-2 border whitespace-nowrap text-center">
												{lang == "vi"
													? item?.requestTypeName
													: item?.requestTypeNameE}
											</td>
											<td className="px-4 py-2 border whitespace-nowrap text-center">
												{item?.userNameCreatedForm}
											</td>
											<td className="px-4 py-2 border whitespace-nowrap text-center">
												{item?.createdAt ? formatDate(item?.createdAt, "yyyy/MM/dd HH:mm") : "--"}
											</td>
											<td className="px-4 py-2 border text-center">
												<StatusLeaveRequest status={StatusApplicationFormEnum.Assigned} />
											</td>
											<td className="px-4 py-2 border text-center space-x-1">
												<Link
													to={`/view-approval/${item.code}?requestType=${item.requestTypeId}`}
													className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
												>
													{t("pending_approval.detail")}
												</Link>
											</td>
										</tr>
									);
								})
							)}
						</tbody>
					</table>
				</div>
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
				) : isError || ListAssignedTask?.length === 0 ? (
					<div className="text-center text-red-600 font-semibold">
						{error?.message ?? tCommon("no_results")}
					</div>
				) : (
					ListAssignedTask.map((item: any, idx: number) => {
						return (
							<div
								key={idx}
								className="border rounded-lg p-3 shadow-sm bg-white mb-3"
							>
								<div className="flex justify-between items-center">
									<Link
										to={`/view-approval/${item.code}?requestType=${item.requestTypeId}`}
										className="font-semibold text-blue-700 underline"
									>
										{item.code}
									</Link>
									<StatusLeaveRequest status={StatusApplicationFormEnum.Assigned} />
								</div>

								<div className="text-sm text-gray-700 mt-1 space-y-1">
									<p>
										<span className="font-medium">
											{t("pending_approval.RequestTypeEnum")}:{" "}
										</span>
										{lang == "vi"
											? item?.requestTypeName
											: item?.requestTypeNameE}
									</p>
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
										{item?.createdAt
											? formatDate(item?.createdAt, "yyyy/MM/dd HH:mm")
											: "--"}
									</p>
								</div>

								<div className="mt-2 flex justify-end">
									<Link
										to={`/view-approval/${item.code}?requestType=${item.requestTypeId}`}
										className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
									>
										{t("pending_approval.detail")}
									</Link>
								</div>
							</div>
						);
					})
				)}
			</div>
			<KeysetPagination
				hasNext={hasNext}
				canPrevious={cursorStack.length > 0}
				onNext={handleNext}
				onPrevious={handlePrevious}
				limit={limit}
				onLimitChange={handleLimitChange}
			/>
		</div>
	);
}
