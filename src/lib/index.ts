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
    SUPERADMIN = "SUPERADMIN",
    HR = "HR",
    IT = "IT",
    UNION = "UNION",
    USER = "USER",
    GM = "GM",
    PURCHASING = "PURCHASING"
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
    ASSIGNED = 7,
    WAIT_CONFIRM = 8,
    WAIT_QUOTE = 9,
    WAIT_PO = 10,
    WAIT_DELIVERY = 11,
}

export enum REQUEST_TYPE {
    LEAVE_REQUEST = 1,
    MEMO_NOTIFICATION = 2,
    FORM_IT = 3,
    PURCHASE = 4,
    OVERTIME = 5,
    MISS_TIMEKEEPING = 6,
    INTERNAL_MEMO_HR = 7,
    TIMEKEEPING = 8
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
    TEAM = 4,
    GM = 5,
    Manager = 6,
    AM = 7
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

export function GetUrlWaitApproval(requestTypeId: number, code: string) {
    let result = ''

	if (requestTypeId == REQUEST_TYPE.LEAVE_REQUEST) {
		result = `/view-leave-request-approval/${code}'}`
	}
	else if (requestTypeId == REQUEST_TYPE.MEMO_NOTIFICATION) {
		result = `/view-memo-notify-approval/${code}`
	}
	else if (requestTypeId == REQUEST_TYPE.FORM_IT) {
		result = `/view-form-it-approval/${code}`
	}
	else if (requestTypeId == REQUEST_TYPE.PURCHASE) {
		result = `/view-purchase-approval/${code}`
	}
	else if (requestTypeId == REQUEST_TYPE.OVERTIME) {
		result = `/view-overtime-approval/${code}`
	}
	else if (requestTypeId == REQUEST_TYPE.MISS_TIMEKEEPING) {
		result = `/view-miss-timekeeping-approval/${code}`
	}
	else if (requestTypeId == REQUEST_TYPE.INTERNAL_MEMO_HR) {
		result = `/internal-memo-hr/${code}?mode=approval`
	}

	return result
}

export function GetUrlViewDetail(requestTypeId: number, code: string) {
    let result = ''

	if (requestTypeId == REQUEST_TYPE.LEAVE_REQUEST) {
		result = `/view-leave-request-approval/${code}'}`
	}
	else if (requestTypeId == REQUEST_TYPE.MEMO_NOTIFICATION) {
		result = `/view-memo-notify-approval/${code}`
	}
	else if (requestTypeId == REQUEST_TYPE.FORM_IT) {
		result = `/view/form-it/${code}`
	}
	else if (requestTypeId == REQUEST_TYPE.PURCHASE) {
		result = `/view/purchase/${code}`
	}
	else if (requestTypeId == REQUEST_TYPE.OVERTIME) {
		result = `/view-overtime-approval/${code}`
	}
	else if (requestTypeId == REQUEST_TYPE.MISS_TIMEKEEPING) {
		result = `/view-miss-timekeeping-approval/${code}`
	}
	else if (requestTypeId == REQUEST_TYPE.INTERNAL_MEMO_HR) {
		result = `/internal-memo-hr/${code}?mode=approval`
	}

	return result
}