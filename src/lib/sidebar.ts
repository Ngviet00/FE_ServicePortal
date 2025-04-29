import { House, LockKeyhole, Ticket } from "lucide-react";
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
        key: "HR",
        label: "HR",
        icon: LockKeyhole,
        children: [
            { label: "sidebar.admin.role", route: "/role" },
            { label: "sidebar.admin.department", route: "/department" },
            { label: "sidebar.user.list", route: "/user" },
            { label: "sidebar.user.create", route: "/user/create" },
            { label: "sidebar.user.approval_flow", route: "/approval-flow" },
            { label: "sidebar.user.type_leave", route: "/type_leave" },
        ],
    },
    {
        key: "leave_request",
        label: "sidebar.leave_request.leave_request",
        icon: Ticket,
        children: [
            { label: "sidebar.leave_request.create", route: "/leave/create" },
            { label: "sidebar.leave_request.list", route: "/leave" },
            { label: "Wait approval", route: "/leave/wait-approval" },
        ],
    },
];