import { useMutation } from '@tanstack/react-query';
import axiosClient from './axiosClient';
import { getErrorMessage, ShowToast } from '@/lib';
import { OrgUnit } from './orgUnitApi';
import { ApplicationForm } from './itFormApi';

interface GetAllParams {
    page: number;
    pageSize: number;
    name?: string;
}

export interface IPurchase {
    Id?: string;
    ApplicationFormId?: string;
    Code?: string;
    UserCode?: string;
    UserName?: string;
    DepartmentId?: number;
    RequestedDate?: string | Date;
    CreatedAt?: string | Date;
    UpdatedAt?: string | Date;
    DeletedAt?: string | Date;
    ApplicationForm?: ApplicationForm;
    PurchaseDetails?: IPurchaseDetail[];
    OrgUnit?: OrgUnit;
};

export interface ICreatePurchase {
    UserCode?: string,
    UserName?: string,
    DepartmentId?: number,
    OrgPositionId?: number,
    RequestedDate?: string | Date,
    UrlFrontend: string,
    CreatePurchaseDetailRequests?: IPurchaseDetail[],
}

export interface IUpdatePurchase {
    RequestedDate?: string | Date,
    CreatePurchaseDetailRequests?: IPurchaseDetail[],
}

export interface IPurchaseDetail {
    Id?: string
    PurchaseId?: string
    ItemName?: string
    ItemDescription?: string
    Quantity?: number
    UnitMeasurement?: string
    RequiredDate?: string
    CostCenterId?: number
    Note?: string
    CreatedAt?: string
    UpdatedAt?: string
    DeletedAt?: string
}

const purchaseApi = {
    getAll(params: GetAllParams) {
        return axiosClient.get('/purchase', {params})
    },
    getById(id: string) {
        return axiosClient.get(`/purchase/${id}`)
    },
    create(data: ICreatePurchase) {
        return axiosClient.post('/purchase', data)
    },
    update(id: string, data: IUpdatePurchase){
        return axiosClient.put(`/purchase/${id}`, data)
    },
    delete(id: string) {
        return axiosClient.delete(`/purchase/${id}`)
    },
    deletePurchaseItemDetail(id: string) {
        return axiosClient.delete(`/delete-purchase-item/${id}`)
    }
}

export function useCreatePurchase() {
    return useMutation({
        mutationFn: async (data: ICreatePurchase) => {
            await purchaseApi.create(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useUpdatePurchase() {
    return useMutation({
        mutationFn: async ({id, data} : {id: string, data: IUpdatePurchase}) => {
            await purchaseApi.update(id, data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useDeletePurchase() {
    return useMutation({
        mutationFn: async (id: string) => {
            await purchaseApi.delete(id)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useDeletePurchaseItemDetail() {
    return useMutation({
        mutationFn: async (id: string) => {
            await purchaseApi.deletePurchaseItemDetail(id)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export default purchaseApi;