type LeaveStatus = 'Pending' | 'In Process' | 'Completed' | 'Reject' | 'Wait HR';

interface StatusLeaveRequestProps {
    status: LeaveStatus | number | string | undefined | null;
}

const STATUS_MAP: Record<number, LeaveStatus> = {
	1: 'Pending',
	2: 'In Process',
	3: 'Completed',
	5: 'Reject',
	4: 'Wait HR',
};

const STATUS_CONFIG: Record<LeaveStatus, { bg: string; text_color: string }> = {
    Pending: {
		bg: 'bg-gray-500',
		text_color: 'text-white',
    },
    "In Process": {
		bg: 'bg-yellow-400',
		text_color: 'text-black',
    },
    Completed: {
		bg: 'bg-green-500',
		text_color: 'text-white',
    },
    Reject: {
		bg: 'bg-red-200',
		text_color: 'text-red-600',
    },
	"Wait HR": {
		bg: 'bg-pink-200',
		text_color: 'text-pink-600',
    }
};

export function StatusLeaveRequest({ status }: StatusLeaveRequestProps) {
  const normalizedStatus: LeaveStatus =
    typeof status === 'number'
		? STATUS_MAP[status] || 'Pending'
		: typeof status === 'string' && STATUS_CONFIG[status as LeaveStatus]
			? (status as LeaveStatus)
			: 'Pending';

    const { bg, text_color } = STATUS_CONFIG[normalizedStatus];
    return (
		<span className={`${bg} ${text_color} font-bol p-1 py-2 w-[72px] inline-block text-xs text-center rounded`}>
			{normalizedStatus}
		</span>
    )
}