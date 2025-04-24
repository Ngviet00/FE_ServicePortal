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
        label: "sidebar.home",
        icon: House,
        route: "/",
        children: []
    },
    {
        key: "admin",
        label: "sidebar.admin.admin",
        icon: LockKeyhole,
        children: [
            { label: "sidebar.admin.role", route: "/role" },
            { label: "sidebar.admin.department", route: "/department" },
            { label: "sidebar.admin.position", route: "/position" },
            // { label: "sidebar.admin.team", route: "/team" },
        ],
    },
    {
        key: "user",
        label: "sidebar.user.user",
        icon: Users,
        children: [
            { label: "sidebar.user.list", route: "/user" },
            { label: "sidebar.user.create", route: "/user/create" },
        ],
    },
    {
        key: "leave_request",
        label: "sidebar.leave_request.leave_request",
        icon: Ticket,
        children: [
            { label: "sidebar.leave_request.create", route: "/leave/create" },
            { label: "sidebar.leave_request.list", route: "/leave" },
            { label: "Wait approval", route: "/wait-approval" },
            // { label: "Đi trễ, về sớm", route: "/leave/early-late" },
            // { label: "Phép chờ duyệt", route: "/leave/wait-approval" },
        ],
    },
];