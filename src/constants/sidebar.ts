import { House, LockKeyhole, Ticket, Users } from "lucide-react";

export interface SidebarMenuItem {
    key: string | null;
    label: string | null;
    icon: React.ElementType | null;
    route?: string | null;
    children?: { label: string; route: string }[] | null;
}

export const SIDEBAR_MENUS: SidebarMenuItem[] = [
    {
        key: "home",
        label: "Trang chủ",
        icon: House,
        route: "/",
        children: []
    },
    {
        key: "admin",
        label: "Admin",
        icon: LockKeyhole,
        children: [
            { label: "Role", route: "/role" },
            { label: "Department", route: "/department" },
            { label: "Position", route: "/position" },
        ],
    },
    {
        key: "user",
        label: "User",
        icon: Users,
        children: [
            { label: "List User", route: "/user" },
            { label: "Create User", route: "/user/create" },
        ],
    },
    {
        key: "leave_request",
        label: "Nghỉ phép",
        icon: Ticket,
        children: [
            { label: "Danh sách nghỉ phép", route: "/leave/list" },
            { label: "Xin nghỉ phép", route: "/leave/create" },
            { label: "Đi trễ, về sớm", route: "/leave/early-late" },
            { label: "Phép chờ duyệt", route: "/leave/wait-approval" },
        ],
    },
];