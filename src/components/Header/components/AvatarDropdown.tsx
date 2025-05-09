import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { ChevronDown, User } from "lucide-react";

import authApi from "@/api/authApi";
import { useTranslation } from "react-i18next";

export default function AvatarDropdown() {
	const { t } = useTranslation();
	const { logout } = useAuthStore();
	const navigate = useNavigate();

	const handleLogout = async () => {
		try {
			await authApi.logout();

			logout();
			navigate("/login");
		} catch (err) {
			console.error("Logout API failed", err);
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
					<AvatarFallback className="bg-gray-200 relative">
						<User size={15} /> 
						<ChevronDown  className="" size={12}/>
					</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
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
