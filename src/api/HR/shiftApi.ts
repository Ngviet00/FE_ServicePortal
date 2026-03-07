import { useMutation } from '@tanstack/react-query';
import axiosClient from '../axiosClient';
import { getErrorMessage, ShowToast } from '@/lib';

interface GetMngShift {
    dayMonth: string,
    departmentName?: string | null,
    page: number,
    keySearch?: string | null
}

interface UpdateMngShift {
    dayMonth: string,
    from: string,
    to: string,
    shiftCode: string,
    userCodes: string[]
}

interface ExportShiftOrHoliday {
    dayMonth: string
    keySearch?: string | null,
    departmentId?: number | null
}

const shiftApi = {
    importShift(data: FormData) {
        return axiosClient.post('/shift/import-shift', data, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
    },

    importDayOff(data: FormData) {
        return axiosClient.post('/shift/import-day-off', data, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
    },

    getAllShift(params: { pageSize?: number | null } = {}) {
        return axiosClient.get('/shift', { params });
    },

    getCombineUserShift() {
        return axiosClient.post('/shift/get-combine-user-with-shift')
    },

    handlExportShift(params: ExportShiftOrHoliday) {
        return axiosClient.get(`/shift/export-shift`, {
            params,
            responseType: 'blob'
        })
    },

    handlExportHoliday(params: ExportShiftOrHoliday) {
        return axiosClient.get(`/shift/export-day-off`, {
            params,
            responseType: 'blob'
        })
    },

    getManagementShift(params: GetMngShift) {
        return axiosClient.get('/shift/get-mng-shift', { params });
    },

    updateManagementShift(data: UpdateMngShift) {
        return axiosClient.post('/shift/update-mng-shift', data);
    }
}

export function useUpdateMngShift() {
    return useMutation({
        mutationFn: async (data: UpdateMngShift) => {
            await shiftApi.updateManagementShift(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useImportShift() {
    return useMutation({
        mutationFn: async (data: FormData) => {
            await shiftApi.importShift(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useImportDayOff() {
    return useMutation({
        mutationFn: async (data: FormData) => {
            await shiftApi.importDayOff(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useExportShift() {
    return useMutation({
        mutationFn: async (params: ExportShiftOrHoliday) => {
            const response = await shiftApi.handlExportShift(params)
            const contentDisposition = response.headers['content-disposition'] || '';
            let fileName = 'Report.xlsx';

            const match = contentDisposition.match(/filename\*=(?:UTF-8'')?(.+)/i);
            if (match?.[1]) {
                fileName = match[1];
                fileName = decodeURIComponent(fileName);
                fileName = fileName.replace(/\s+/g, '_');
            }

            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        },
        onSuccess: () => {
            ShowToast("Export shift successfully");        
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useExportHoliday() {
    return useMutation({
        mutationFn: async (params: ExportShiftOrHoliday) => {
            const response = await shiftApi.handlExportHoliday(params);   
            const contentDisposition = response.headers['content-disposition'] || '';
            let fileName = 'Report.xlsx';

            const match = contentDisposition.match(/filename\*=(?:UTF-8'')?(.+)/i);
            if (match?.[1]) {
                fileName = match[1];
                fileName = decodeURIComponent(fileName);
                fileName = fileName.replace(/\s+/g, '_');
            }

            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        },  
        onSuccess: () => {
            ShowToast("Export holiday successfully");        
        },
        onError: (err) => { 
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export default shiftApi;