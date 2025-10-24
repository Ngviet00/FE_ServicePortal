/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import voteApi, { useVote } from "@/api/voteApi";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import { ShowToast } from "@/lib";

const PAGE_SIZE = 100;

const DetailVote: React.FC = () => {
	const { t } = useTranslation("vote")
	const lang = useTranslation().i18n.language.split("-")[0]

	const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
	const [expandedId, setExpandedId] = useState<number | null>(null);
	const [expandedDeptId, setExpandedDeptId] = useState<number | null>(null);
	const [previewImage, setPreviewImage] = useState<string | null>(null);
	const queryClient = useQueryClient();

	const [deptUsersCache, setDeptUsersCache] = useState<{
		[deptId: number]: {
			users: any[];
			loadedPages: number;
			loading: boolean;
		};
	}>({});

	const user = useAuthStore(u => u.user)

	const vote = useVote();

    const { id } = useParams();

	const { data: voteDetail, isLoading: isLoadingVote } = useQuery({
		queryKey: ['vote-detail', id],
		queryFn: async () => {
			try {
				const res = await voteApi.GetDetailVoteById(Number(id))
				return res.data.data;
            } 
			catch (error: any) {
                if (error.response?.status === 404) {
                    return null;
                }
                throw error;
            }
		},
		enabled: !!id,
	});

	useEffect(() => {
		if (voteDetail?.options?.length > 0) {
			const selectedOpt = voteDetail.options.find((opt: any) => opt.isSelected == 1);
			if (selectedOpt) {
				setSelectedOptionId(selectedOpt.optionId);
			}
		}
	}, [voteDetail])

	const totalVotesSum = voteDetail?.options.reduce((sum: any, item: any) => sum + (item.totalVotes || 0), 0);

	const toggleExpand = (id: number) => {
		setExpandedId(expandedId === id ? null : id);
	};

	const toggleDept = async (deptId: number) => {
		if (expandedDeptId === deptId) {
			setExpandedDeptId(null);
			return;
		}

		setExpandedDeptId(deptId);

		if (!deptUsersCache[deptId]) {
			await loadUsersByDept(deptId, 1);
		}
	};

	const loadUsersByDept = async (deptId: number, page: number) => {
		const cache = deptUsersCache[deptId] || { users: [], loadedPages: 0, loading: false };

		setDeptUsersCache(prev => ({
			...prev,
			[deptId]: { ...cache, loading: true }
		}));

		try {
			const res = await voteApi.getListUserNotVoteByDepartmentId({
				DepartmentId: deptId,
				VoteId: Number(id),
				Page: page,
				PageSize: PAGE_SIZE
			});

			const users = res.data.data;

			setDeptUsersCache(prev => ({
				...prev,
				[deptId]: {
					users: [...(prev[deptId]?.users || []), ...users],
					loadedPages: page,
					loading: false
				}
			}));
		} catch (err) {
			console.error(err);
			setDeptUsersCache(prev => ({
				...prev,
				[deptId]: { ...cache, loading: false }
			}));
		}
	};

	const loadMoreUsers = async (deptId: number) => {
		const cache = deptUsersCache[deptId];
		if (!cache) return;

		const dept = voteDetail?.departments?.find((d: any) => d.DepartmentId === deptId);
		if (!dept) return;

		const totalPages = Math.ceil(dept.NotVotedCount / PAGE_SIZE);
		const nextPage = cache.loadedPages + 1;
		if (nextPage > totalPages) return;

		loadUsersByDept(deptId, nextPage);
	};

	const handleVote = async (voteOptionId: number) => {
		const today = new Date();
		const isVotingAllowed =
			new Date(today.toDateString()) >= new Date(new Date(voteDetail?.startDate).toDateString()) &&
			new Date(today.toDateString()) <= new Date(new Date(voteDetail?.endDate).toDateString());

		if (isVotingAllowed == false) {
			ShowToast(lang == 'vi' ? 'Cuộc bình chọn đã đóng, không thể bình chọn' : 'This poll is closed and voting is not allowed', 'error')
			return
		}
		setSelectedOptionId(voteOptionId);
		await vote.mutateAsync({
			VoteId: Number(id),
			VoteOptionId: voteOptionId,
			UserCode: user?.userCode ?? ''
		})
        queryClient.invalidateQueries({ queryKey: ['vote-detail', id] });
	}

	if (!!id && isLoadingVote) {
		return <div>{lang === "vi" ? "Đang tải..." : "Loading..."}</div>;
	}

	if (!voteDetail) {
        return  <div className='text-red-700 font-semibold'>{lang == 'vi' ? 'Không tìm thấy dữ liệu' : 'Not found data'}</div>;
    }

	return (
		<div className="w-full p-1 space-y-6">
			<h2 className="text-2xl font-semibold text-gray-800 mb-2">
				{t('detail.title')}
			</h2>

			<div className="mb-2">
				<h2 className="text-[20px]"><span className="font-medium text-red-600">{t('create.title')}: </span>{voteDetail?.vote?.Title}</h2>
				
				<div className="text-[17px]">
					<span className="font-medium text-red-600">{t('create.description')}:</span> {voteDetail?.vote?.Description}
				</div>
			</div>

			{voteDetail?.options.map((opt: any, idx: number) => {
				const percentRaw = totalVotesSum == 0 ? 0 : (opt?.totalVotes / totalVotesSum) * 100;
				const percent = percentRaw % 1 === 0 ? percentRaw.toFixed(0) : percentRaw.toFixed(1);
				return (
					<div
						key={opt?.optionId}
						className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-all duration-300 w-full"
					>
						<div
							className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-2xl bg-white hover:shadow-sm transition-all duration-300 gap-2 cursor-pointer select-none"
							onClick={() => toggleExpand(opt?.optionId)}
						>
							<div className="flex flex-col sm:flex-row sm:items-center gap-2">
								<div className="flex items-center gap-2 flex-wrap">
									<span className="font-bold text-blue-600 text-lg sm:text-xl">
										#{idx + 1}.
									</span>
									<h3 className="font-semibold text-gray-800 text-base sm:text-lg line-clamp-1">
										{opt.title}
									</h3>

									{expandedId === opt?.optionId ? (
										<ChevronUp className="w-4 h-4 text-gray-500 transition-transform" />
									) : (
										<ChevronDown className="w-4 h-4 text-gray-500 transition-transform" />
									)}
								</div>

								<span className="text-blue-600 font-medium text-sm italic underline sm:ml-2">
									{lang == "vi" ? "(Xem chi tiết)" : "(View detail)"}
								</span>
							</div>

							<div className="flex items-center justify-between sm:justify-end gap-3">
								<div className="flex flex-col items-end text-right">
									<div className="text-2xl sm:text-3xl font-bold text-blue-600 leading-tight">
										{Number.isInteger(parseFloat(percent))
										? parseInt(percent)
										: parseFloat(percent).toFixed(1)}
										%
									</div>
									<div className="text-gray-500 font-normal md:text-xl sm:text-sm">
										({opt?.totalVotes} {t("detail.vote")})
									</div>
								</div>

								<button
									disabled={selectedOptionId != null || vote.isPending}
									onClick={(e) => {
										e.stopPropagation();
										handleVote(opt?.optionId);
									}}
									className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
										selectedOptionId != null ? "cursor-not-allowed" : "hover:scale-105 hover:cursor-pointer"
									} ${
										selectedOptionId === opt?.optionId
										? "bg-blue-600 text-white shadow-sm"
										: "bg-gray-100 hover:bg-gray-200 text-gray-800"
									}`}
								>
								{selectedOptionId === opt?.optionId
									? t("detail.selected")
									: t("detail.select")}
								</button>
							</div>
						</div>

						<div className={`overflow-hidden ${	expandedId === opt.optionId ? "max-h-[600px] opacity-100 mt-3" : "max-h-0 opacity-0"}`}>
							<div className={`pt-3 ${opt?.description != '' && opt?.description != null ? 'border' : ''} text-gray-700  rounded-md max-h-[400px] overflow-y-auto p-3`}>
								<div className="ql-editor text-sm leading-relaxed whitespace-pre-line" 
									dangerouslySetInnerHTML={{ __html: opt?.description ?? (lang == 'vi' ? 'Không có mô tả' : 'Not description') }}
								></div>
								<div className="mt-3">
									{opt?.files?.length > 0 && (
										<div className="flex flex-wrap gap-4">
											{opt.files.map((f: any) => {
												const fileUrl = `${import.meta.env.VITE_API_URL}/vote/get-file/${f.fileId}`;
												return (
													<div key={f.fileId} className="relative group">
														<img
															src={fileUrl}
															alt={f.fileName}
															className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-lg border shadow-sm cursor-pointer transition-transform duration-200 group-hover:scale-105"
															onClick={() => setPreviewImage(fileUrl)}
														/>
														<span className="absolute bottom-1 left-1 text-xs text-white bg-black bg-opacity-50 px-1 rounded">{f.fileName}</span>
													</div>
												);
											})}
										</div>
									)}

									{previewImage && (
										<div
											className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
											onClick={() => setPreviewImage(null)}
										>
											<img
												src={previewImage}
												alt="preview"
												className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-xl"
											/>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
					);
				})
			}

			<div className="mt-8">
				<h3 className="text-xl font-semibold text-red-600 mb-3">
					{t('detail.user_not_vote')}
				</h3>

				<div className="space-y-3">
					{voteDetail?.departments?.map((dept: any, idx: number) => {
						const cache = deptUsersCache[dept.DepartmentId];
            			const isExpanded = expandedDeptId === dept.DepartmentId;

						return (
							<div key={idx} className="border rounded-lg bg-white p-4 transition-all duration-300">
								<div className="flex justify-between items-center cursor-pointer" onClick={() => toggleDept(dept?.DepartmentId)}>
									<h4 className="font-semibold text-gray-700">
										{dept?.DepartmentName}{" "}
										<span className="text-red-500 text-sm">
											({dept?.NotVotedCount} {dept?.NotVotedCount == 1 ? t('detail.person') : t('detail.people')})
										</span>
									</h4>
									{isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
								</div>

								<div className={`overflow-hidden ${ isExpanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}>
									{cache && cache.users.length > 0 && (
										<ul className="list-disc list-inside text-base text-gray-700 pl-3 mt-2 max-h-[300px] overflow-y-auto">
											{cache.users.map((user: any) => (
												<li className="text-mute font-medium" key={user.UserCode}>({user.UserCode}) {user.UserName}</li>
											))}
										</ul>
									)}
									{cache && cache.loadedPages * PAGE_SIZE < dept.NotVotedCount && (
										<div className="mt-2 flex justify-center">
											<button
												className={`px-3 py-2 rounded text-sm hover:cursor-pointer ${
													cache.loading
													? "bg-gray-400 cursor-not-allowed text-white"
													: "bg-blue-600 hover:bg-blue-700 text-white"
												}`}
												onClick={() => !cache.loading && loadMoreUsers(dept.DepartmentId)}
												disabled={cache.loading}
											>
												{cache.loading ? "Loading..." : "Xem thêm"}
											</button>
										</div>
									)}
								</div>
							</div>
						)}
					)}
				</div>
			</div>
		</div>
	);
};

export default DetailVote;
