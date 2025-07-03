import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { ChevronDown, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getErrorMessage, ShowToast } from "@/lib";
import authApi from "@/api/authApi";

export default function AvatarDropdown() {
	const { t } = useTranslation();
	const { logout, refreshToken } = useAuthStore();
	const navigate = useNavigate();

	const handleLogout = async () => {
		try {
			await authApi.logout({
				refreshToken: refreshToken
			});
			logout();
			navigate("/login");
		} catch (err) {
			ShowToast(getErrorMessage(err), "error")
		}
	}

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
