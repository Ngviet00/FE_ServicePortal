type LeaveStatus = 'Pending' | 'In-Process' | 'Completed' | 'Reject';

interface StatusLeaveRequestProps {
	status: LeaveStatus | number;
}

const STATUS_MAP: Record<number, LeaveStatus> = {
  1: 'Pending',
  2: 'In-Process',
  3: 'Completed',
  4: 'Reject',
};

const STATUS_CONFIG: Record<LeaveStatus, { bg: string; text_color: string }> = {
    Pending: {
      bg: 'bg-gray-500',
      text_color: 'text-white',
    },
    'In-Process': {
      bg: 'bg-yellow-400',
      text_color: 'text-black',
    },
    Completed: {
      bg: 'bg-green-200',
      text_color: 'text-green-600',
    },
    Reject: {
      bg: 'bg-red-200',
      text_color: 'text-red-600',
    },
};
  

export function StatusLeaveRequest({ status }: StatusLeaveRequestProps) {
    const normalizedStatus: LeaveStatus =
    typeof status === 'number'
        ? STATUS_MAP[status] || 'Pending'
        : status;

    const { bg, text_color } = STATUS_CONFIG[normalizedStatus];

    return (
		<span className={`${bg} ${text_color} p-1 w-[67px] inline-block text-xs rounded-[3px] text-center`}>
			{normalizedStatus}
		</span>
    )
}