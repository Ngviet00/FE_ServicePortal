type LeaveStatus = 'PENDING' | 'IN_PROCESS' | 'COMPLETED' | 'REJECT' | 'WAIT_HR';

interface StatusLeaveRequestProps {
    status: LeaveStatus | number | string | undefined | null;
}

const STATUS_MAP: Record<number, LeaveStatus> = {
	1: 'PENDING',
	2: 'IN_PROCESS',
	3: 'COMPLETED',
	4: 'REJECT',
	5: 'WAIT_HR',
};

const STATUS_CONFIG: Record<LeaveStatus, { bg: string; text_color: string }> = {
    PENDING: {
		bg: 'bg-gray-500',
		text_color: 'text-white',
    },
    IN_PROCESS: {
		bg: 'bg-yellow-400',
		text_color: 'text-black',
    },
    COMPLETED: {
		bg: 'bg-green-200',
		text_color: 'text-green-600',
    },
    REJECT: {
		bg: 'bg-red-200',
		text_color: 'text-red-600',
    },
	WAIT_HR: {
		bg: 'bg-pink-200',
		text_color: 'text-pink-600',
    },
};
  

export function StatusLeaveRequest({ status }: StatusLeaveRequestProps) {
  const normalizedStatus: LeaveStatus =
    typeof status === 'number'
		? STATUS_MAP[status] || 'PENDING'
		: typeof status === 'string' && STATUS_CONFIG[status as LeaveStatus]
			? (status as LeaveStatus)
			: 'PENDING';

    const { bg, text_color } = STATUS_CONFIG[normalizedStatus];

    return (
		<span className={`${bg} ${text_color} p-1 w-[72px] inline-block text-xs rounded-[3px] text-center`}>
			{normalizedStatus}
		</span>
    )
}