import { useMutation } from '@tanstack/react-query';
import axiosClient from './axiosClient';
import { getErrorMessage, ShowToast } from '@/lib';

interface GetAll {
    requestTypeId?: number,
    mainOrgUnitId?: number,
    tempUserCode?: string
}

interface AddNew {
    mainOrgUnitId?: number,
    mainUserCode?: string,
    tempUserCode?: string,
    requestTypeId?: number
}

interface Delete {
    mainOrgUnitId?: number, 
    tempUserCode?: string,
}

const delegatedTempApi = {
    GetAll: (params?: GetAll ) => {
        return axiosClient.get('/delegated-temp/get-all', {params});
    },

    AddNew(data: AddNew) {
        return axiosClient.post('/delegated-temp/add-new', data)
    },

    Delete(data: Delete) {
        return axiosClient.post('/delegated-temp/delete', data)       
    }
}

export function useAddNewDelegatedTemp() {
    return useMutation({
        mutationFn: async (data: AddNew) => {
            await delegatedTempApi.AddNew(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useDeleteDelegatedTemp() {
    return useMutation({
        mutationFn: async (data: Delete) => {
            await delegatedTempApi.Delete(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export default delegatedTempApi;