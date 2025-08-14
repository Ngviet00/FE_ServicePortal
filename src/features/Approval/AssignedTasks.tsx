import { Label } from '@/components/ui/label';
import React from 'react';

interface Task {
	id: string;
	type: string;
	requester: string;
	requestedDate: string;
	dueDate: string;
	status: 'Chờ xử lý' | 'Đang xử lý' | 'Đã xử lý';
}

const tasks: Task[] = [
	{
		id: 'IT-20250807-001',
		type: 'IT',
		requester: 'Nguyễn Văn A',
		requestedDate: '07/08/2025',
		dueDate: '09/08/2025',
		status: 'Chờ xử lý',
	},
	{
		id: 'PO-20250807-002',
		type: 'Mua hàng',
		requester: 'Trần Thị B',
		requestedDate: '06/08/2025',
		dueDate: '10/08/2025',
		status: 'Đang xử lý',
	},
	{
		id: 'SAP-20250807-003',
		type: 'SAP',
		requester: 'Lê Văn C',
		requestedDate: '05/08/2025',
		dueDate: '08/08/2025',
		status: 'Đã xử lý',
	},
];

const getStatusStyle = (status: Task['status']) => {
	switch (status) {
		case 'Chờ xử lý':
			return 'bg-yellow-500';
		case 'Đang xử lý':
			return 'bg-blue-500';
		case 'Đã xử lý':
			return 'bg-green-600';
		default:
			return 'bg-gray-400';
	}
};

const AssignedTasks: React.FC = () => {
	return (
		<div className="p-1 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0">Danh sách task được giao</h3>
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
							<th className="px-4 py-3 border text-left whitespace-nowrap">Ngày yêu cầu</th>
							<th className="px-4 py-3 border text-left whitespace-nowrap">Hạn xử lý</th>
							<th className="px-4 py-3 border text-left whitespace-nowrap">Trạng thái</th>
							<th className="px-4 py-3 border text-center whitespace-nowrap">Hành động</th>
							</tr>
						</thead>
						<tbody>
							{tasks.map((task) => (
								<tr key={task.id} className="hover:bg-gray-50">
									<td className="px-4 py-3 border whitespace-nowrap">{task.id}</td>
									<td className="px-4 py-3 border whitespace-nowrap">{task.type}</td>
									<td className="px-4 py-3 border whitespace-nowrap">{task.requester}</td>
									<td className="px-4 py-3 border whitespace-nowrap">{task.requestedDate}</td>
									<td className="px-4 py-3 border whitespace-nowrap">{task.dueDate}</td>
									<td className="px-4 py-3 border whitespace-nowrap">
										<span className={`inline-block px-2 py-1 text-xs font-medium text-white rounded ${getStatusStyle(task.status)}`}>
											{task.status}
										</span>
									</td>
									<td className="px-4 py-3 border text-center space-x-2">
										<button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
											Xem
										</button>
										{task.status !== 'Đã xử lý' ? (
											<button className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600">
											Xử lý
											</button>
										) : (
											<button
											className="px-3 py-1 text-sm bg-gray-400 text-white rounded cursor-not-allowed"
											disabled
											>
											Đã xử lý
											</button>
										)}
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

export default AssignedTasks;
