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