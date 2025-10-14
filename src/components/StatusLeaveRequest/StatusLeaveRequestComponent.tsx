import { useTranslation } from 'react-i18next';

type LeaveStatus =
	| 'Pending'
	| 'In Process'
	| 'Completed'
	| 'Reject'
	| 'Wait HR'
	| 'Final Approval'
	| 'Assigned'
	| 'Wait Confirm'
	| 'Wait Quote'
	| 'Wait PO'
	| 'Wait Delivery';

interface StatusLeaveRequestProps {
  	status: LeaveStatus | number | string | undefined | null;
}

const STATUS_MAP: Record<number, LeaveStatus> = {
	1: 'Pending',
	2: 'In Process',
	3: 'Completed',
	4: 'Wait HR',
	5: 'Reject',
	6: 'Final Approval',
	7: 'Assigned',
	8: 'Wait Confirm',
	9: 'Wait Quote',
	10: 'Wait PO',
	11: 'Wait Delivery',
};

const STATUS_CONFIG: Record<
	LeaveStatus,
	{ bg: string; text: string; border: string }
> = {
	Pending: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
	'In Process': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
	Completed: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
	Reject: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
	'Wait HR': { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300' },
	'Final Approval': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
	Assigned: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
	'Wait Confirm': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
	'Wait Quote': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300' },
	'Wait PO': { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300' },
	'Wait Delivery': { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-300' },
};

const STATUS_KEYS: Record<LeaveStatus, string> = {
	Pending: 'status.pending',
	'In Process': 'status.in_process',
	Completed: 'status.completed',
	Reject: 'status.reject',
	'Wait HR': 'status.wait_hr',
	'Final Approval': 'status.final_approval',
	Assigned: 'status.assigned',
	'Wait Confirm': 'status.wait_confirm',
	'Wait Quote': 'status.wait_quote',
	'Wait PO': 'status.wait_po',
	'Wait Delivery': 'status.wait_delivery',
};

export function StatusLeaveRequest({ status }: StatusLeaveRequestProps) {
	const { t } = useTranslation();

	let normalizedStatus: LeaveStatus = 'Pending';

	if (typeof status === 'number') {
		normalizedStatus = STATUS_MAP[status] || 'Pending';
	} else if (typeof status === 'string') {
		const cleanStatus = status.trim().toLowerCase().replace(/_/g, ' ');
		const found = (Object.keys(STATUS_CONFIG) as LeaveStatus[]).find(
			key => key.toLowerCase() === cleanStatus
		);
		normalizedStatus = found || 'Pending';
	}

	const { bg, text, border } = STATUS_CONFIG[normalizedStatus];

	return (
		<span
			className={`${bg} ${text} ${border} border font-medium px-2 py-1 min-w-[100px] inline-block text-xs text-center rounded`}
		>
			{t(STATUS_KEYS[normalizedStatus])}
		</span>
	);
}
