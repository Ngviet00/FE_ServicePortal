import { ShowToast, getErrorMessage } from '@/lib';
import { useMutation } from '@tanstack/react-query';
import axiosClient from '../axiosClient';

interface GetAll {
    providerId?: number | null,
    typeMachine?: number,
    keySearch?: string
}

interface Create {
    id?: number | null;
    ip?: string | null;
    port?: number | null;
    username?: string | null;
    password?: string | null;
    name?: string | null;
    nameE?: string | null;
    serial?: string | null;
    priority?: number;
    typeMachine: number;
    providerId: number;
}

interface SaveScanMachineWithDept {
    ScanMachineIds: number[],
    Nationality?: string,
    DepartmentIds: number[]
}

interface SaveScanMachineWithOrgPosition {
    ScanMachineIds: number[],
    OrgPositionIds: number[]
}

interface PushManualUserToMachine {
    scannerMachineIds: number[];
    userCodes: string[];
}

const scanMachineApi = {
    getAll(params: GetAll) {
        return axiosClient.get(`/scanner-machine`, {params})
    },

    getMachineById(id: number) {
        return axiosClient.get(`/scanner-machine/${id}`)
    },

    createOrUpdateScanMachine(data: Create) {
        return axiosClient.post(`/scanner-machine`, data)
    },

    deleteScanMachine(id: number) {
        return axiosClient.delete(`/scanner-machine/${id}`)
    },

    getInfoMachine(id: number) {
        return axiosClient.get(`/scanner-machine/get-info-machine/${id}`)
    },

    getDataPageConfigScanMachineWithDepartment() {
        return axiosClient.get(`/scanner-machine/get-data-page-config-scan-machine-with-dept`)
    },

    saveScanMachineWithDept(data: SaveScanMachineWithDept) {
        return axiosClient.post(`/scanner-machine/save-scan-machine-with-dept`, data)
    },

    getDepartmentConfigByScanMachineId(scanMachineId: number, nationality: string) {
        return axiosClient.get(`/scanner-machine/get-department-config-by-scan-machine-id/${scanMachineId}`, {
            params: { nationality }
        });
    },

    pushManualUserToMachine(data: PushManualUserToMachine) {
        return axiosClient.post(`/scanner-machine/push-manual-user-to-machine`, data)
    },

    getDataPageConfigScanMachineWithOrgPosition() {
        return axiosClient.get(`/scanner-machine/get-data-page-config-scan-machine-with-org-position`)
    },

    saveScanMachineWithOrgPosition(data: SaveScanMachineWithOrgPosition) {
        return axiosClient.post(`/scanner-machine/save-scan-machine-with-org-position`, data)
    },

    getOrgPositionConfigByScanMachineId(scanMachineId: number) {
        return axiosClient.get(`/scanner-machine/get-org-position-config-by-scan-machine-id/${scanMachineId}`);
    },
}

export function useSaveScanMachineWithOrgPosition() {
    return useMutation({
        mutationFn: async (data: SaveScanMachineWithOrgPosition) => {
            await scanMachineApi.saveScanMachineWithOrgPosition(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function usePushManualUserToMachine() {
    return useMutation({
        mutationFn: async (data: PushManualUserToMachine) => {
            await scanMachineApi.pushManualUserToMachine(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useSaveScanMachineWithDept() {
    return useMutation({
        mutationFn: async (data: SaveScanMachineWithDept) => {
            await scanMachineApi.saveScanMachineWithDept(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useCreateOrUpdateScanMachine() {
    return useMutation({
        mutationFn: async (data: Create) => {
            await scanMachineApi.createOrUpdateScanMachine(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useDeleteScanMachine() {
    return useMutation({
        mutationFn: async (id: number) => {
            await scanMachineApi.deleteScanMachine(id)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}


export default scanMachineApi;