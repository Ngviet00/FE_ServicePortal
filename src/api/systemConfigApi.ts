import { useMutation } from '@tanstack/react-query';
import axiosClient from './axiosClient';
import { getErrorMessage, ShowToast } from '@/lib';

export interface SystemConfig {
    id?: number;
    configKey?: string;
    configValue?: string;
    valueType?: string;
    defaultValue?: string;
    minValue?: string;
    maxValue?: string;
    Description?: string;
    isActive?: boolean;
    updatedBy?: string;
    updatedAt?: Date | string;
}

const systemConfigApi = {
    getAll() {
        return axiosClient.get('/system-config/get-all')
    },

    GetByConfigKey(configKey: string) {
        return axiosClient.get(`/system-config/get-config-by-key?configKey=${configKey}`)
    },

    AddConfig(data: SystemConfig) {
        return axiosClient.post('/system-config/add-config', data)
    },

    UpdateConfig(configKey: string, data: SystemConfig){
        return axiosClient.put(`/system-config/update-config/${configKey}`, data)
    }
}

export function useAddConfig() {
    return useMutation({
        mutationFn: async (data: SystemConfig) => {
            await systemConfigApi.AddConfig(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useUpdateConfig() {
    return useMutation({
        mutationFn: async ({ configKey, data }: { configKey: string; data: SystemConfig }) => {
            await systemConfigApi.UpdateConfig(configKey, data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export default systemConfigApi;