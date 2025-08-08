import requestTypeApi, { IRequestType } from "@/api/requestTypeApi";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface Form {
	id: string;
	type: string;
	creator: string;
	created: string;
	description: string;
}

const formsData: Form[] = [
	{
		id: 'IT-20250807-001',
		type: 'IT',
		creator: 'Nguyễn Văn A',
		created: '07/08/2025',
		description: 'Yêu cầu cấp laptop cho nhân viên mới.',
	},
	{
		id: 'PO-20250807-002',
		type: 'PO',
		creator: 'Trần Thị B',
		created: '07/08/2025',
		description: 'Yêu cầu mua thiết bị văn phòng cho phòng kế toán.',
	},
	{
		id: 'SAP-20250807-003',
		type: 'SAP',
		creator: 'Lê Văn C',
		created: '07/08/2025',
		description: 'Yêu cầu phân quyền tài chính trong hệ thống SAP.',
	},
];

export default function PendingApproval() {

	const lang = useTranslation().i18n.language.split('-')[0];
    const [filter, setFilter] = useState('Tất cả');
    const [, setSelectedForm] = useState<Form | null>(null);

    const filteredForms = filter === 'Tất cả' ? formsData : formsData.filter((f) => f.type === filter);

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

    return (
		<div className="p-1 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0">Danh sách chờ duyệt</h3>
            </div>

			<div className="mt-2 flex">
				<div className="w-[20%]">
					<Label className="mb-2">Loại yêu cầu</Label>
					<select value={filter} onChange={(e) => setFilter(e.target.value)} className="border p-1 rounded w-full cursor-pointer">
						<option value="Tất cả">
							{ lang == 'vi' ? 'Tất cả' : 'ALL' }
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
								<th className="px-4 py-2 border">Mã đơn</th>
								<th className="px-4 py-2 border">Loại đơn</th>
								<th className="px-4 py-2 border">Người tạo</th>
								<th className="px-4 py-2 border">Ngày tạo</th>
								<th className="px-4 py-2 border">Người đăng ký</th>
								<th className="px-4 py-2 border">Người duyệt gần nhất</th>
								<th className="px-4 py-2 border">Trạng thái</th>
								<th className="px-4 py-2 border text-center">Hành động</th>
							</tr>
						</thead>
						<tbody>
							{filteredForms.map((form) => (
								<tr key={form.id} className="hover:bg-gray-50">
									<td className="px-4 py-2 border whitespace-nowrap text-left">{form.id}</td>
									<td className="px-4 py-2 border whitespace-nowrap text-center">{form.type}</td>
									<td className="px-4 py-2 border whitespace-nowrap text-center">{form.creator}</td>
									<td className="px-4 py-2 border whitespace-nowrap text-center">{form.created}</td>
									<td className="px-4 py-2 border whitespace-nowrap text-center">{`nguyen van a`}</td>
									<td className="px-4 py-2 border whitespace-nowrap text-center">{`nguyen van a`}</td>
									<td className="px-4 py-2 border text-center">
										<span className="inline-block px-2 py-1 text-xs text-white bg-yellow-500 rounded">
											Chờ duyệt
										</span>
									</td>
									<td className="px-4 py-2 border text-center space-x-1">
										<button
											onClick={() => setSelectedForm(form)}
											className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
										>
											Xem
										</button>
										<button className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600">
											Duyệt
										</button>
										<button className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">
											Từ chối
										</button>
									</td>
								</tr>
							))}
						</tbody>
        			</table>
     		 	</div>
			</div>
			{/* <div className="block md:hidden space-y-4">
				{isPending ? (
					Array.from({ length: 3 }).map((_, index) => (
						<div key={index} className="border rounded p-4 space-y-2 shadow bg-white dark:bg-gray-800">
						{Array.from({ length: 6 }).map((_, i) => (
							<div key={i} className="h-4 w-full bg-gray-300 rounded animate-pulse" />
						))}
						</div>
					))
				) : isError || leaveRequests.length === 0 ? (
					<div className="pt-2 pl-4 text-red-700 font-medium dark:text-white">{error?.message ?? t('list_leave_request.no_result')}</div>
				) : (
					leaveRequests.map((item: LeaveRequestData) => (
						<div key={item.id} className="border rounded p-4 shadow bg-white dark:bg-gray-800 mt-5">
							<div className="mb-1 font-bold">{item.name} ({item.requesterUserCode})</div>
							<div className="mb-1"><strong>{t('list_leave_request.department')}:</strong> {item.department}</div>
							<div className="mb-1"><strong>{t('list_leave_request.position')}:</strong> {item.position}</div>
							<div className="mb-1"><strong>{t('list_leave_request.from')}:</strong> {formatDate(item.fromDate ?? "", "yyyy/MM/dd HH:mm:ss")}</div>
							<div className="mb-1"><strong>{t('list_leave_request.to')}:</strong>{formatDate(item.toDate ?? "", "yyyy/MM/dd HH:mm:ss")}</div>
							<div className="mb-1"><strong>{t('list_leave_request.type_leave')}:</strong> {lang == 'vi' ? item?.typeLeave?.nameV : item?.typeLeave?.name}</div>
							<div className="mb-1"><strong>{t('list_leave_request.time_leave')}:</strong> {lang == 'vi' ? item?.timeLeave?.description : item?.timeLeave?.english}</div>
							<div className="mb-1"><strong>{t('list_leave_request.reason')}:</strong> {item.reason}</div>
							<div className="mb-1"><strong>{t('list_leave_request.write_leave_name')}:</strong> {item.userNameWriteLeaveRequest}</div>
						</div>
					))
				)}
			</div> */}
        </div>
    )
}