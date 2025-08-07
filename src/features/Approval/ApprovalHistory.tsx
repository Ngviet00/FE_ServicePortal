
import { Label } from '@/components/ui/label';
import React from 'react';

interface HistoryItem {
    id: string;
    formType: string;
    requester: string;
    approvedDate: string;
    action: 'Duyệt' | 'Xử lý';
    result: 'Đã duyệt' | 'Từ chối' | 'Đã xử lý';
}

const history: HistoryItem[] = [
    {
        id: 'IT-20250801-001',
        formType: 'IT',
        requester: 'Nguyễn Văn A',
        approvedDate: '07/08/2025',
        action: 'Duyệt',
        result: 'Đã duyệt',
    },
    {
        id: 'PO-20250802-002',
        formType: 'PO',
        requester: 'Trần Thị B',
        approvedDate: '06/08/2025',
        action: 'Xử lý',
        result: 'Đã xử lý',
    },
    {
		id: 'SAP-20250803-003',
		formType: 'SAP',
		requester: 'Lê Văn C',
		approvedDate: '05/08/2025',
		action: 'Duyệt',
		result: 'Từ chối',
    },
];

const resultColor = (result: HistoryItem['result']) => {
  switch (result) {
    case 'Đã duyệt':
      return 'bg-green-500';
    case 'Từ chối':
      return 'bg-red-500';
    case 'Đã xử lý':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
};

const ApprovalHistory: React.FC = () => {
	return (
		<div className="p-1 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0">Lịch sử duyệt / xử lý</h3>
            </div>

			<div className="mt-2 flex">
				<div>
					<Label className="mb-2">Loại yêu cầu</Label>
					<select className="border p-1 rounded w-full md:w-auto cursor-pointer">
						<option value="Tất cả">Tất cả</option>
						<option value="IT">Đơn IT</option>
						<option value="PO">Đơn Mua Bán</option>
						<option value="SAP">Đơn SAP</option>
					</select>
				</div>
			</div>

			<div>
				<div className="overflow-x-auto bg-white rounded shadow border border-gray-200">
					<table className="min-w-full text-sm">
						<thead className="bg-gray-100">
							<tr>
								<th className="px-4 py-3 border text-left whitespace-nowrap">Mã đơn</th>
								<th className="px-4 py-3 border text-left whitespace-nowrap">Loại đơn</th>
								<th className="px-4 py-3 border text-left whitespace-nowrap">Người yêu cầu</th>
								<th className="px-4 py-3 border text-left whitespace-nowrap">Ngày duyệt / xử lý</th>
								<th className="px-4 py-3 border text-left whitespace-nowrap">Hành động</th>
								<th className="px-4 py-3 border text-left whitespace-nowrap">Kết quả</th>
							</tr>
						</thead>
						<tbody>
							{history.map((item) => (
								<tr key={item.id} className="hover:bg-gray-50">
									<td className="px-4 py-3 border whitespace-nowrap">{item.id}</td>
									<td className="px-4 py-3 border whitespace-nowrap">{item.formType}</td>
									<td className="px-4 py-3 border whitespace-nowrap">{item.requester}</td>
									<td className="px-4 py-3 border whitespace-nowrap">{item.approvedDate}</td>
									<td className="px-4 py-3 border whitespace-nowrap">{item.action}</td>
									<td className="px-4 py-3 border whitespace-nowrap">
										<span className={`inline-block px-2 py-1 text-xs font-medium text-white rounded \${resultColor(item.result)}`}>
											{item.result}
										</span>
									</td>
								</tr>
							))}
					</tbody>
					</table>
				</div>
			</div>
        </div>
	);
};

export default ApprovalHistory;
