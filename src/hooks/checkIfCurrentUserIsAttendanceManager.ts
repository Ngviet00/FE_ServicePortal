import HrManagementApi from "@/api/HrManagementApi";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";

export const useCheckIfCurrentUserIsAttendanceManager = () => {
	const { user } = useAuthStore()
    
	const { data: isCurrentUserManagerAttendance, isLoading } = useQuery({
		queryKey: ['get-attendance-managers'],
		queryFn: async () => {
			const res = await HrManagementApi.getAttendanceManager();
			return res.data.data.map((u: { userName: string; userCode: string }) => ({
                label: `${u.userName}`,
                value: u.userCode,
            }));
		},
		select: (users) => {
			if (!user?.userCode) return false;
			return users.some((u: {label: string, value: string}) => u.value === user?.userCode);
		}
	});

	return { isCurrentUserManagerAttendance, isLoading };
};