/* eslint-disable @typescript-eslint/no-explicit-any */
import voteApi, { useDeleteVote } from "@/api/voteApi";
import ButtonDeleteComponent from "@/components/ButtonDeleteComponent";
import PaginationControl from "@/components/PaginationControl/PaginationControl";
import { Skeleton } from "@/components/ui/skeleton";
import useHasRole from "@/hooks/useHasRole";
import { RoleEnum, useDebounce } from "@/lib";
import { formatDate } from "@/lib/time";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function ListVote() {
	const { t } = useTranslation("vote")
	const { t: tCommon } = useTranslation("common")
    const lang = useTranslation().i18n.language.split("-")[0]
	const [searchTitle, setsearchTitle] = useState("");
	const [statusId, setStatusId] = useState(1);
	const queryClient = useQueryClient();

	const [totalPage, setTotalPage] = useState(0);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	const deleteVote = useDeleteVote();
    const debounceSearchTitle = useDebounce(searchTitle, 300);

    const isUnion = useHasRole([RoleEnum.UNION])

	const { data: votes = [], isPending, isError, error } = useQuery({
		queryKey: ["get-all-votes", { page, pageSize, debounceSearchTitle, statusId }],
		queryFn: async () => {
			const res = await voteApi.getAll({
				Page: page,
				PageSize: pageSize,
				SearchTitle: debounceSearchTitle ?? '',
                StatusId: statusId
			});
			setTotalPage(res.data.total_pages);
			return res.data.data;
		},
	});

    useEffect(() => {
        setPage(1);
    }, [debounceSearchTitle]);

    const handleSearchTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setsearchTitle(e.target.value)
    }

	function setCurrentPage(page: number): void {
		setPage(page);
	}

	function handlePageSizeChange(size: number): void {
		setPage(1);
		setPageSize(size);
	}

	function handleSuccessDelete(shouldGoBack?: boolean) {
		if (shouldGoBack && page > 1) {
			setPage((prev) => prev - 1);
		} else {
			queryClient.invalidateQueries({ queryKey: ["get-all-votes"] });
		}
	}

	const handleDelete = async (id: number) => {
		const shouldGoBack = votes.length === 1;
		await deleteVote.mutateAsync(id);
		handleSuccessDelete(shouldGoBack);
	};

	return (
		<div className="p-1 space-y-6">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-1">
				<h2 className="text-2xl font-semibold text-gray-800">
					{t("list.title")}
				</h2>
				<button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition hover:cursor-pointer">
                    <Link to="/vote/create">+ {t("list.button_new_vote")}</Link>
				</button>
			</div>

			<div className="flex flex-col md:flex-row md:items-end gap-4">
				<div className="w-full md:w-1/2">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						{t("list.search")}
					</label>
					<input
						type="text"
						placeholder="..."
						value={searchTitle}
						onChange={handleSearchTitle}
						className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
					/>
				</div>

				<div className="w-full md:w-40">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						{t("list.status")}
					</label>
					<select
						value={statusId}
						onChange={(e) => setStatusId(Number(e.target.value))}
						className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 hover:cursor-pointer"
					>
						<option value="1">{lang == 'vi' ? 'Tất cả' : 'All' }</option>
						<option value="2">{lang == 'vi' ? 'Đang mở' : 'Open' }</option>
						<option value="3">{lang == 'vi' ? 'Kết thúc' : 'Close' }</option>
						<option value="4">{lang == 'vi' ? 'Sắp diễn ra' : 'Upcoming' }</option>
					</select>
				</div>
			</div>

			<div className="hidden md:block overflow-x-auto border border-gray-200 rounded-lg">
				<table className="w-full text-sm text-left border-collapse">
					<thead className="bg-gray-100 text-black">
						<tr>
							<th className="p-3 font-semibold border-b text-left w-[35%] border-r">
								{t("create.title")}
							</th>
							<th className="p-3 font-semibold border-b text-center w-[20%] border-r">
								{t("list.start_date")}
							</th>
							<th className="p-3 font-semibold border-b text-center w-[20%] border-r">
								{t("list.end_date")}
							</th>
							<th className="p-3 font-semibold border-b text-center w-[15%] border-r">
								{t("list.status")}
							</th>
							<th className="p-3 font-semibold border-b text-right w-[15%]">
								{t("list.action")}
							</th>
						</tr>
					</thead>
					<tbody>
						{isPending ? (
							Array.from({ length: 3 }).map((_, index) => (
								<tr key={index}>
									{Array.from({ length: 5 }).map((__, i) => (
										<td key={i} className="px-4 py-2 border text-center">
											<div className="flex justify-center">
												<Skeleton className="h-4 w-[80px] bg-gray-300" />
											</div>
										</td>
									))}
								</tr>
							))
						) : isError || votes.length === 0 ? (
							<tr>
								<td
									colSpan={5}
									className="px-4 py-2 text-center font-bold text-red-700"
								>
									{error?.message ?? tCommon("no_results")}
								</td>
							</tr>
						) : (
							votes.map((vote: any, idx: number) => (
								<tr
									key={idx}
									className="hover:bg-gray-50 transition border-b last:border-b-0"
								>
									<td className="p-3 font-medium text-blue-600 truncate text-[15px] border-r">
                                        <Link className="underline" to={`/vote/${vote?.Id}`}>{vote?.Title}</Link>
									</td>
									<td className="p-3 text-black text-center border-r">{formatDate(vote?.StartDate, 'yyyy-MM-dd')}</td>
									<td className="p-3 text-black text-center border-r">{formatDate(vote?.EndDate, 'yyyy-MM-dd')}</td>
									<td className="p-3 text-center border-r">
										<span
											className={`px-2 py-1 text-xs font-semibold rounded ${
												vote.Status == 3
													? "bg-red-500 text-white"
													: vote.Status == 2
													? "bg-green-500 text-white"
													: "bg-gray-300 text-gray-800"
											}`}
										>
											{vote.Status == 3
												? (lang == 'vi' ? 'Kết thúc' : 'Closed')
												: vote.Status == 2
												? (lang == 'vi' ? 'Đang mở' : 'Open')
												: (lang == 'vi' ? 'Sắp diễn ra' : 'Upcoming')}
										</span>
									</td>
                                    <td className="p-3 text-right">
                                        <div className="flex items-center justify-end gap-2"> 
                                            <Link 
                                                to={`/vote/${vote?.Id}`} 
                                                className="bg-blue-600 text-white px-3 py-1 rounded-[3px] text-sm inline-flex items-center justify-center whitespace-nowrap text-[15px] h-6" 
                                            >
                                                {lang == 'vi' ? 'Chi tiết' : 'Detail'}
                                            </Link>
                                            {
                                                isUnion && vote.Status != 3 && (
                                                    <>
                                                        <Link 
                                                            to={`/vote/edit/${vote?.Id}`} 
                                                            className="bg-yellow-600 text-white px-[10px] py-1 rounded-[3px] text-sm inline-flex items-center justify-center whitespace-nowrap text-[15px] h-6" 
                                                        >
                                                            {lang == 'vi' ? 'Sửa' : 'Edit'}
                                                        </Link>
                                                        
                                                        <ButtonDeleteComponent
                                                            id={vote?.Id}
                                                            onDelete={() => handleDelete(vote?.Id)}
                                                        />
                                                    </>
                                                )
                                            }

                                        </div>
                                    </td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

            {/* mobile */}
			<div className="md:hidden space-y-3">
				{isPending ? (
					Array.from({ length: 3 }).map((_, idx) => (
						<div key={idx} className="border rounded-lg p-3 shadow-sm bg-white">
							<Skeleton className="h-4 w-[80%] mb-2 bg-gray-300" />
							<Skeleton className="h-4 w-[60%] mb-2 bg-gray-300" />
							<Skeleton className="h-4 w-[50%] bg-gray-300" />
						</div>
					))
				) : isError || votes.length === 0 ? (
					<div className="text-center text-red-600 font-semibold">
						{error?.message ?? tCommon("no_results")}
					</div>
				) : (
					votes.map((vote: any, idx: number) => (
						<div
							key={idx}
							className="border rounded-lg p-3 shadow-sm bg-white mb-3"
						>
							<div className="flex justify-between items-center">
                                <Link className="underline text-blue-700 font-medium" to={`/vote/${vote?.Id}`}>{vote?.Title}</Link>
                                <span
                                    className={`px-2 py-1 text-xs font-semibold rounded ${
                                        vote.Status == 3
                                            ? "bg-red-500 text-white"
                                            : vote.Status == 2
                                            ? "bg-green-500 text-white"
                                            : "bg-gray-300 text-gray-800"
                                    }`}
                                >
                                    {vote.Status == 3
                                        ? (lang == 'vi' ? 'Kết thúc' : 'Closed')
                                        : vote.Status == 2
                                        ? (lang == 'vi' ? 'Đang mở' : 'Open')
                                        : (lang == 'vi' ? 'Sắp diễn ra' : 'Upcoming')}
                                </span>
							</div>

							<div className="text-sm text-black mt-2 space-y-1">
								<p>
									<span className="font-medium">{t("list.start_date")}:</span> {formatDate(vote?.StartDate, 'yyyy-MM-dd')}
								</p>
								<p>
									<span className="font-medium">{t("list.end_date")}:</span> {formatDate(vote?.EndDate, 'yyyy-MM-dd')}
								</p>
							</div>

							<div className="flex items-center justify-end gap-2"> 
                                <Link 
                                    to={`/vote/${vote?.Id}`} 
                                    className="bg-blue-600 text-white px-3 py-1 rounded-[3px] text-sm inline-flex items-center justify-center whitespace-nowrap text-[15px] h-7" 
                                >
                                    {lang == 'vi' ? 'Chi tiết' : 'Detail'}
                                </Link>
                                
                                <Link 
                                    to={`/vote/edit/${vote?.Id}`} 
                                    className="bg-yellow-600 text-white px-[10px] py-1 rounded-[3px] text-sm inline-flex items-center justify-center whitespace-nowrap text-[15px] h-7" 
                                >
                                    {lang == 'vi' ? 'Sửa' : 'Edit'}
                                </Link>
                                
                                <ButtonDeleteComponent
                                    id={vote?.Id}
                                    onDelete={() => handleDelete(vote?.Id)}
                                />
                            </div>
						</div>
					))
				)}
			</div>

			{votes.length > 0 && (
				<PaginationControl
					currentPage={page}
					totalPages={totalPage}
					pageSize={pageSize}
					onPageChange={setCurrentPage}
					onPageSizeChange={handlePageSizeChange}
				/>
			)}
		</div>
	);
}
