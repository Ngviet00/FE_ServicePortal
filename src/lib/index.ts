import { useEffect, useState } from "react";
import { toast, Zoom } from "react-toastify";

export const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export const ShowToast = (
    message: string,
    type: "success" | "error" | "info" | "warning" = "success",
    autoClose: number = 3000
) => {
    toast[type](message, {
        position: "top-right",
        autoClose: autoClose,
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

export const formatDate = (dateStr: string | undefined, type: "dd/MM/yyyy" | "yyyy/MM/dd HH:mm:ss" | "yyyy/MM/dd HH:mm" = "dd/MM/yyyy") => {
    const d = new Date(dateStr ?? "");
    if (isNaN(d.getTime())) return "";

    const dd = d.getDate().toString().padStart(2, "0");
    const MM = (d.getMonth() + 1).toString().padStart(2, "0");
    const yyyy = d.getFullYear();
    const HH = d.getHours().toString().padStart(2, "0");
    const mm = d.getMinutes().toString().padStart(2, "0");
    const ss = d.getSeconds().toString().padStart(2, "0");

    switch (type) {
        case "yyyy/MM/dd HH:mm":
        return `${yyyy}/${MM}/${dd} ${HH}:${mm}`;
        case "yyyy/MM/dd HH:mm:ss":
        return `${yyyy}/${MM}/${dd} ${HH}:${mm}:${ss}`;
        case "dd/MM/yyyy":
        default:
        return `${dd}/${MM}/${yyyy}`;
    }
};

export function parseDateTime(datetimeStr: string) {
    const date = new Date(datetimeStr);
  
    // Lấy giờ và phút, thêm số 0 phía trước nếu cần
    const hour = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
  
    return {
      original: datetimeStr,
      date: date.toLocaleDateString("en-US"),
      hour,
      minutes,
    };
}

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

export enum ENUM_TIME_LEAVE {
    ALL_DAY = "1",
    MORNING = "2",
    AFTERNOON = "3",
}

export const TIME_LEAVE = [
    {
        label: "leave_request.create.time_leave.all_day",
        value: "1"
    },
    {
        label: "leave_request.create.time_leave.morning",
        value: "2"
    },
    {
        label: "leave_request.create.time_leave.afternoon",
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
        response?: { data?: { message?: string } };
        message?: string;
    };

    return err.response?.data?.message || err.message || "Unexpected error occurred";
}