import { useEffect, useState } from "react";
import { toast, Zoom } from "react-toastify";

export const formatCurrency = (x: number) => {
    const number = new Intl.NumberFormat('vn', { style: 'currency', currency: 'vnd' }).format(x);
    
    return number;
 }

export const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export const ShowToast = (
    message: string,
    type: "success" | "error" | "info" | "warning" = "success"
) => {
    toast[type](message, {
        position: "top-right",
        autoClose: 3000,
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

export function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
      const timer = setTimeout(() => setDebounced(value), delay);
      return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}

export const formatDate = (dateStr: string | undefined) => {
    const d = new Date(dateStr ? dateStr : "");
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${d.getFullYear()}`;
};