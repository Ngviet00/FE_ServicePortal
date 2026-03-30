import { useMutation } from '@tanstack/react-query';
import { getErrorMessage, IApplicationForm, ShowToast } from '@/lib';
import axiosClient from './axiosClient';
import { OrgUnit } from './orgUnitApi';
import { IPriority } from './priorityApi';
import { ITCategoryInterface } from './itCategoryApi';
import { IRequestType } from './requestTypeApi';
import { ISelectedUserAssigned } from './userApi';
import { ApprovalRequest, ListWaitApprovalRequest } from './approvalApi';

interface GetAll {
    UserCode?: string | null,
    Page: number
    PageSize: number,
    DepartmentId?: number | null,
    RequestStatusId?: number | null,
    Year?: number | null,
}

export interface ITFormCategory {
    id: number;
    itFormId: string;
    itCategoryId: number;
    itCategory: ITCategoryInterface;
}

export interface ITForm {
    id: string;
    applicationFormId: string;
    code: string;
    userCodeRequestor: string;
    userNameRequestor: string | null;
    userCodeCreated: string;
    userNameCreated: string | null;
    departmentId: number;
    email: string;
    position: string;
    reason: string;
    priorityId: number;
    noteManagerIT: string | null;
    requestDate: string;
    requiredCompletionDate: string;
    targetCompletionDate: string | null;
    actualCompletionDate: string | null;
    createdAt: string;
    updatedAt: string | null;
    deletedAt: string | null;
    orgUnit: OrgUnit;
    priority: IPriority;
    applicationForm: IApplicationForm;
    itFormCategories: ITFormCategory[];
}

export interface IRequestStatus {
    id: number;
    name: string;
    nameE: string;
}

export interface HistoryApplicationForm { 
    id: string; 
    applicationFormId: string | null;
    userNameApproval: string | null;
    userCodeApproval: string | null;
    action: string | null;
    note: string | null;
    createdAt: string | null;
    deletedAt: string | null;
}

export interface ApplicationForm {
    id: string;
    userCodeRequestor: string;
    userNameRequestor: string | null;
    requestTypeId: number;
    requestStatusId: number;
    orgPositionId: number;
    createdAt: string;
    updatedAt: string | null;
    deletedAt: string | null;
    historyApplicationForms: HistoryApplicationForm[]
    requestType: IRequestType;
    requestStatus: IRequestStatus;
}

export interface IAssignedTask {
    UserCodeApproval?: string,
    UserNameApproval?: string,
    NoteManager?: string,
    OrgPositionId?: number
    ApplicationFormId?: number,
    ApplicationFormCode?: string,
    UserAssignedTasks?: ISelectedUserAssigned[],
    Note?: string
}

export interface IResolvedTask {
    UserCodeApproval?: string,
    UserNameApproval?: string,
    ApplicationFormId?: number,
    ApplicationFormCode?: string,
    TargetCompletionDate?: string,
    ActualCompletionDate?: string,
    Note?: string
}

export interface IStatistical {
    year?: number
}

export interface StaffITReferenceManagerITRequest {
    OrgPositionId?: number;
    ApplicationFormId: number;
    UserCode?: string;
    UserName?: string;
    Note?: string;
    Files?: File[];
}

export interface ConfirmFormITNeedFormPurchase {
    OrgPositionId?: number;
    ApplicationFormId: number;
    UserCode?: string;
    UserName?: string;
    Note?: string;
}

const itFormApi = {
    statistical(params: IStatistical) {
        return axiosClient.get('/it-form/statistical-form-it', {params})
    },
    getAll(params: GetAll) {
        return axiosClient.get('/it-form', {params})
    },

    getById(id: string) {
        return axiosClient.get(`/it-form/${id}`)
    },

    create(data: FormData) {
        return axiosClient.post('/it-form', data, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
    },

    update(applicationFormId: number, data: FormData){
        return axiosClient.put(`/it-form/${applicationFormId}`, data, {
             headers: {
                "Content-Type": "multipart/form-data"
            }
        })
    },

    delete(applicationFormId: number) {
        return axiosClient.delete(`/it-form/${applicationFormId}`)
    },
    assignedTask(data: IAssignedTask) {
        return axiosClient.post('/it-form/assigned-task', data)
    },
    resolvedTask(data: IResolvedTask) {
        return axiosClient.post('/it-form/resolved-task', data)
    },
    getAllStaffIT() {
        return axiosClient.get('/it-form/get-all-staff-it')
    },
    approval(data: ApprovalRequest) {
        return axiosClient.post(`/it-form/approval`, data)
    },

    listFormITWaitConfirmFormPurchase(params: ListWaitApprovalRequest) {
        return axiosClient.get('/it-form/list-form-it-wait-confirm-form-purchase', {params})
    },

    staffITRequestFormPurchase(data: {applicationFormId: number, userCodeApproval: string, userNameApproval: string, note?: string}) {
        return axiosClient.post(`/it-form/staff-it-request-form-purchase`, data)
    },

    confirmFormITRequestPurchase (data: {applicationFormId: number, userCodeApproval: string, userNameApproval: string, note?: string}) {
        return axiosClient.post(`/it-form/confirm-form-it-request-purchase`, data)
    }
}

export function useStaffITRequestFormPurchase() {
    return useMutation({
        mutationFn: async (data: {applicationFormId: number, userCodeApproval: string, userNameApproval: string, note?: string}) => {
            await itFormApi.staffITRequestFormPurchase(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useConfirmITRequestPurchase() {
    return useMutation({
        mutationFn: async (data: {applicationFormId: number, userCodeApproval: string, userNameApproval: string, note?: string, orgPositionId?: number}) => {
            await itFormApi.confirmFormITRequestPurchase(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useApprovalITForm() {
    return useMutation({
        mutationFn: async (data: ApprovalRequest) => {
            await itFormApi.approval(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useCreateITForm() {
    return useMutation({
        mutationFn: async (data: FormData) => {
            await itFormApi.create(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useUpdateITForm() {
    return useMutation({
        mutationFn: async ({id, data} : {id: number, data: FormData}) => {
            await itFormApi.update(id, data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useDeleteITForm() {
    return useMutation({
        mutationFn: async (applicationFormId: number) => {
            await itFormApi.delete(applicationFormId)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useAssignedTaskITForm() {
    return useMutation({
        mutationFn: async (data: IAssignedTask) => {
            await itFormApi.assignedTask(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useResolvedTaskITForm() {
    return useMutation({
        mutationFn: async (data: IResolvedTask) => {
            await itFormApi.resolvedTask(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export default itFormApi;