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
        return axiosClient.get('/system-config')
    },

    getByConfigKey(configKey: string) {
        return axiosClient.get(`/system-config/${configKey}`)
    },

    createOrUpdateConfig(data: SystemConfig) {
        return axiosClient.post('/system-config', data)
    },

    delete(configKey: string){
        return axiosClient.delete(`/system-config/${configKey}`)
    }
}

export function useCreateOrUpdateConfig() {
    return useMutation({
        mutationFn: async (data: SystemConfig) => {
            await systemConfigApi.createOrUpdateConfig(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useDeleteConfig() {
    return useMutation({
        mutationFn: async (configKey: string) => {
            await systemConfigApi.delete(configKey)
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