import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { ChevronDown, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import authApi from "@/api/authApi";
import { ShowToast } from "@/lib";

export default function AvatarDropdown() {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const handleLogout = () => {
		try {
			const { refreshToken, logout: clearStore } = useAuthStore.getState();

			if (refreshToken) {
				authApi.logout({ refreshToken }).catch(err => {
					console.warn("API Logout background failed:", err);
					ShowToast(err, 'error')
				});
			}

			requestAnimationFrame(() => {
				try {
					clearStore();
					navigate("/login");
				} catch (uiError) {
					console.error("UI Logout Error:", uiError);
					window.location.href = "/login"; 
				}
			});
		} catch (globalError) {
			console.error("Critical Logout Error:", globalError);
			localStorage.removeItem('auth-storage');
			window.location.href = "/login";
		}
	};

	// const handleLogout = async () => {
	// 	const { refreshToken, logout: clearStore } = useAuthStore.getState();

	// 	if (refreshToken) {
	// 		authApi.logout({ refreshToken }).catch(err => {
	// 			console.warn("Background logout sync failed:", err);
	// 		});
	// 	}

	// 	requestAnimationFrame(() => {
	// 		clearStore();
	// 		navigate("/login");
	// 	});

	// 	// try {
	// 	// 	// 2. Gọi API logout và ĐỢI nó thực hiện xong (hoặc thất bại)
	// 	// 	// Khi này Interceptor vẫn lấy được accessToken từ config hoặc biến cục bộ
	// 	// 	if (refreshToken && accessToken) {
	// 	// 		await authApi.logout({ refreshToken });
	// 	// 	}
	// 	// } catch (err) {
	// 	// 	// Nếu API lỗi (ví dụ token hết hạn đúng lúc đó) thì cũng kệ nó
	// 	// 	console.warn("Server-side logout failed, proceeding with client logout", err);
	// 	// } finally {
	// 	// 	// 3. Cuối cùng mới xóa sạch dấu vết ở Client và đá ra Login
	// 	// 	clearStore();
	// 	// 	navigate("/login");
	// 	// }
	// };

	const handleChangePage = (path: string) => {
		navigate(path);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Avatar className="h-9 w-9" style={{ cursor: "pointer" }}>
					<AvatarImage src="/placeholder-user.jpg" alt="@shadcn" />
					<AvatarFallback className="bg-gray-200 relative dark:text-black">
						<User size={15} className="" /> 
						<ChevronDown  className="" size={12}/>
					</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem className="cursor-pointer" onClick={() => handleChangePage("personal-info")}>
					{t('header.personal_info')}
				</DropdownMenuItem>

				<DropdownMenuItem className="cursor-pointer" onClick={() => handleChangePage("change-password")}>
					{t('header.change_password')}
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				
				<DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
					{t('header.log_out')}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
