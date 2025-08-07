import { Label } from "@/components/ui/label";
import { useState } from "react";

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
    const [filter, setFilter] = useState('Tất cả');
    const [selectedForm, setSelectedForm] = useState<Form | null>(null);

    const filteredForms = filter === 'Tất cả' ? formsData : formsData.filter((f) => f.type === filter);

    return (
		<div className="p-1 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0">Danh sách chờ duyệt</h3>
            </div>

			<div className="mt-2 flex">
				<div>
					<Label className="mb-2">Loại yêu cầu</Label>
					<select value={filter} onChange={(e) => setFilter(e.target.value)} className="border p-1 rounded w-full md:w-auto cursor-pointer">
						<option value="Tất cả">Tất cả</option>
						<option value="IT">Đơn IT</option>
						<option value="PO">Đơn Mua Bán</option>
						<option value="SAP">Đơn SAP</option>
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
								<th className="px-4 py-2 border">Trạng thái</th>
								<th className="px-4 py-2 border text-center">Hành động</th>
							</tr>
						</thead>
						<tbody>
							{filteredForms.map((form) => (
							<tr key={form.id} className="hover:bg-gray-50">
								<td className="px-4 py-2 border whitespace-nowrap">{form.id}</td>
								<td className="px-4 py-2 border whitespace-nowrap">{form.type}</td>
								<td className="px-4 py-2 border whitespace-nowrap">{form.creator}</td>
								<td className="px-4 py-2 border whitespace-nowrap">{form.created}</td>
								<td className="px-4 py-2 border">
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
        </div>
    )
}