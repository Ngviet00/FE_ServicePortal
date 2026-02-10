import fileApi from "@/api/fileApi";
import { HistoryApplicationForm, IAssignedTask, IRequestStatus } from "@/api/itFormApi";
// import { IMemoNotify } from "@/api/memoNotificationApi";
import { IOrgPosition } from "@/api/orgPositionApi";
import { OrgUnit } from "@/api/orgUnitApi";
import { IRequestType } from "@/api/requestTypeApi";
import { UploadedFileType } from "@/components/ComponentCustom/FileListPreviewMemoNotify";
import { useEffect, useState } from "react";
import { toast, Zoom } from "react-toastify";

export const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export const ShowToast = (message: string, type: "success" | "error" | "info" | "warning" = "success", autoClose?: number) => {
    toast[type](message, {
        position: "top-right",
        autoClose: autoClose ?? (type === "error" ? 5000 : 3000),
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Zoom,
    });
};

export const ListPerPage = [
    5, 10, 20, 50
]

export const useDebounce = <T,>(value: T, delay: number): T => {
    const [debounced, setDebounced] = useState(value);
  
    useEffect(() => {
      const timer = setTimeout(() => setDebounced(value), delay);
      return () => clearTimeout(timer);
    }, [value, delay]);
  
    return debounced;
};

export enum ENUM_TYPE_LEAVE {
    ANNUAL = "1",
    PERSONAL = "2",
    SICK = "3",
    WEDDING = "4",
    ACCIDENT = "5",
    OTHER = "6",
}

export const TYPE_LEAVE = [
    {
        label: "leave_request.create.type_leave.annual",
        value: "1"
    },
    {
        label: "leave_request.create.type_leave.personal",
        value: "2"
    },
    {
        label: "leave_request.create.type_leave.sick",
        value: "3"
    },
    {
        label: "leave_request.create.type_leave.wedding",
        value: "4"
    },
    {
        label: "leave_request.create.type_leave.accident",
        value: "5"
    },
    {
        label: "leave_request.create.type_leave.other",
        value: "6"
    }
]

export const TIME_LEAVE = [
    {
        label: "all_day",
        value: "1"
    },
    {
        label: "morning",
        value: "2"
    },
    {
        label: "afternoon",
        value: "3"
    }
]

export const getEnumName = (value: string, enumObj: object): string => {
    const entry = Object.entries(enumObj).find(([, val]) => val == value);

    if (entry) {
        const name = entry[0];
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    }
    
    return "UNKNOWN"; 
};

export function getErrorMessage(error: unknown): string {
    if (typeof error === "string") return error;

    const err = error as {
        response?: {
            data?: {
                message?: string;
                errors?: { field: string; errors: string[] }[];
            };
        };
        message?: string;
    };

    const dataErr = err.response?.data;

    if (typeof dataErr === "string") {
        return dataErr;
    }

    const detailedErrors = err.response?.data?.errors;
    if (Array.isArray(detailedErrors) && detailedErrors.length > 0) {
        const firstFieldError = detailedErrors[0];
        if (Array.isArray(firstFieldError.errors) && firstFieldError.errors.length > 0) {
            return firstFieldError.errors[0];
        }
    }

    return err.response?.data?.message || err.message || "Server error!";
}

export const handleInputClickShowPicker = (e: React.FocusEvent<HTMLInputElement> | React.MouseEvent<HTMLInputElement>) => {
    (e.target as HTMLInputElement).showPicker?.();
};

export enum RoleEnum {
    SUPERADMIN = "SUPERADMIN",
    ADMINISTRATOR = "ADMINISTRATOR",
    APPROVAL = "APPROVAL",
    HR = "HR",
    IT_ADMIN = "IT_ADMIN",
    IT_USER = "IT_USER",
    PURCHASE_ADMIN = "PURCHASE_ADMIN",
    PURCHASE_USER = "PURCHASE_USER",
    SAP = "SAP",
    UNION = "UNION",
    UNION_ADMIN = "UNION_ADMIN",
}

export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export enum StatusApplicationFormEnum
{
    Pending = 1, // đang chờ

    Inprocess = 2, //đang xử lý

    Complete = 3, //hoàn thành

    WaitHR = 4, //chờ hr

    Reject = 5, //từ chối

    FinalApproval = 6, //duyệt cuối cùng

    Assigned = 7, //được giao

    WaitConfirm= 8, //chờ xác nhận

    WaitQuote = 9, //chờ báo giá

    WaitPO = 10, //chờ PO

    WaitDelivery = 11 // chờ giao hàng
}

export enum RequestTypeEnum
{
    LeaveRequest = 1, // Nghỉ phép

    Overtime = 2, // Tăng ca

    InternalMemoHR = 3, // Đơn nội bộ HR

    Timekeeping = 4, // Chấm công

    WarningLetter = 5, // Đơn cảnh cáo

    ResignationLetter = 6, // Đơn xin nghỉ việc

    TerminationLetter = 7, // Đơn thông báo sa thải

    ManpowerRequisitionLetter = 8, // Đơn yêu cầu thêm người

    FormIT = 9, // Đơn IT

    Purchase = 10, // Đơn mua bán

    Sap = 11 // Đơn SAP
}

export enum ITCategoryEnum
{
    Server = 1,
    Network = 2,
    Email = 3,
    Software = 4,
    Sap = 5,
    Other = 6
}

export enum PriorityEnum
{
    Low = 1,
    Medium = 2,
    High = 3
}

export enum UnitEnum
{
    Company = 1,

    ManagerDepartment = 2,

    Department = 3,

    Team = 4,

    //các đơn vị thuộc các vị trí

    GM = 5, // Nhóm tổng giám đốc

    Manager = 6, //Trưởng phòng

    AM = 7, // Trợ lí giám đốc

    Supervisor = 8, // chủ quản

    Staff = 9, //Nhân viên

    Leader = 10, // Tổ trưởng

    Operator = 11, // Công nhân

    Technician = 12 // Kỹ thuật
}

export interface IApplicationForm {
    id: string;
    code?: string;
    userCodeRequestor?: string;
    userNameRequestor?: string;
    userCodeCreated?: string;
    userNameCreated?: string;
    requestTypeId?: number;
    requestStatusId?: number;
    orgPositionId?: number;
    departmentId?: number;
    step?: number;
    metaData?: string;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
    requestType?: IRequestType;
    requestStatus?: IRequestStatus;
    orgPosition?: IOrgPosition;
    orgUnit?: OrgUnit;
    assignedTasks: IAssignedTask[];
    historyApplicationForms: HistoryApplicationForm[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseJSON<T = Record<string, any>>(value: string | null | undefined): T {
    if (!value) return {} as T;

    try {
        return JSON.parse(value) as T;
    } catch {
        return {} as T;
    }
}


export const handleDownloadTemplate = async (templateFileUrl: string ) => {
    try {
        const res = await fetch(templateFileUrl);
    if (!res.ok) throw new Error("File not found");
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = templateFileUrl.split("/").pop() || "template.xlsx";
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (err) {
        ShowToast("Download failed!", "error");
        console.error(err);
    }
};

export const handleDownloadFile = async (file: UploadedFileType) => {
    try {
        const result = await fileApi.downloadFile(file.id)
        const url = window.URL.createObjectURL(result.data);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.fileName ?? 'file_default';
        a.click();
        URL.revokeObjectURL(url);
    } catch (err) {
        ShowToast(`Download file failed,${getErrorMessage(err)}`, "error")
    }
}

export interface ViewApprovalProps {
    id: string;
    mode?: string
}

export const TYPE_SCANNER_MACHINE = [
    {
        id: 1,
        name: "Máy chấm công",
        nameE: "Timekeeping"
    },
    {
        id: 2,
        name: "Cửa",
        nameE: "Door"
    },
    {
        id: 3,
        name: "Cổng",
        nameE: "Gate"
    },
    {
        id: 4,
        name: "Ăn trưa",
        nameE: "Meal"
    }
]

export const PROVIDER_SCAN_MACHINE = [
    {
        id: 1,
        name: "Hikvision",
        nameE: "Hikvision"
    },
    {
        id: 2,
        name: "Ronald jack",
        nameE: "Ronald jack"
    }
]

export function getProviderName(providerId: number) {
    return PROVIDER_SCAN_MACHINE.find(p => p.id === providerId)?.name ?? 'Unknown';
}