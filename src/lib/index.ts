import { HistoryApplicationForm, IAssignedTask, IRequestStatus } from "@/api/itFormApi";
// import { IMemoNotify } from "@/api/memoNotificationApi";
import { IOrgPosition } from "@/api/orgPositionApi";
import { OrgUnit } from "@/api/orgUnitApi";
import { IRequestType } from "@/api/requestTypeApi";
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
    SUPERADMIN = "SuperAdmin",
    HR = "HR",
    IT = "IT",
    UNION = "Union",
    USER = "User",
    GM = "GM",
    PURCHASING = "Purchasing"
}

export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export enum STATUS_ENUM {
    PENDING = 1,
    IN_PROCESS = 2,
    COMPLETED = 3,
    WAIT_HR = 4,
    REJECT = 5,
    FINAL_APPROVAL = 6,
    ASSIGNED = 7
}

export enum REQUEST_TYPE {
    LEAVE_REQUEST = 1,
    MEMO_NOTIFICATION = 2,
    FORM_IT = 3,
    PURCHASE = 4,
}

export enum IT_CATEGORY {
    SERVER = 1,
    NETWORK = 2,
    EMAIL = 3,
    SOFTWARE = 4,
    ERP = 5,
    OTHER = 6
}

export enum PRIORITY {
    LOW = 1,
    MEDIUM = 2,
    HIGH = 3,
}

export enum UNIT_ENUM {
    COMPANY = 1,
    MNG_DEPARTMENT = 2,
    DEPARTMENT = 3,
    TEAM = 4
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