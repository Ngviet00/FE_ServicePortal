import { useMutation } from '@tanstack/react-query';
import { getErrorMessage, ShowToast } from '@/lib';
import axiosClient from './axiosClient';
import { OrgUnit } from './orgUnitApi';
import { IPriority } from './priorityApi';
import { ITCategoryInterface } from './itCategoryApi';
import { IRequestType } from './requestTypeApi';
import { ISelectedUserAssigned } from './userApi';

interface GetAll {
    UserCode?: string,
    Page: number
    PageSize: number,
    DepartmentId?: number | null,
    RequestStatusId?: number | null
}

export interface CreateITFormRequest {
    UserCodeRequestor?: string;
    UserNameRequestor?: string,
    UserCodeCreated?: string;
    UserNameCreated?: string
    DepartmentId?: number;
    Email?: string;
    Position?: string;
    Reason?: string;
    PriorityId?: number;
    OrgPositionId: number;
    ITCategories: number[];
    RequestDate?: string; 
    RequiredCompletionDate?: string;
    TargetCompletionDate?: string;
    ActualCompletionDate?: string;
    UrlFrontend?: string,
}

interface UpdateITFormRequest {
    UserCodeRequestor?: string;
    UserCodeCreated?: string;
    DepartmentId?: number;
    Email?: string;
    Position?: string;
    Reason?: string;
    PriorityId?: number;
    OrgPositionId: number;
    ITCategories: number[];
    RequestDate?: string; 
    RequiredCompletionDate?: string;
    TargetCompletionDate?: string;
    ActualCompletionDate?: string;
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
    applicationForm: ApplicationForm;
    itFormCategories: ITFormCategory[];
}

export interface IRequestStatus {
    id: number;
    name: string;
    nameE: string;
}

interface HistoryApplicationForm { 
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
    ITFormId?: string
    UrlFrontend?: string
    UserAssignedTasks?: ISelectedUserAssigned[];
}

export interface IResolvedTask {
    UserCodeApproval?: string,
    UserNameApproval?: string,
    ITFormId?: string
    UrlFrontend?: string,
    TargetCompletionDate?: string,
    ActualCompletionDate?: string
}

const itFormApi = {
    statistical() {
        return axiosClient.get('/it-form/statistical-form-it')
    },
    getAll(params: GetAll) {
        return axiosClient.get('/it-form', {params})
    },

    getById(id: string) {
        return axiosClient.get(`/it-form/${id}`)
    },

    create(data: CreateITFormRequest) {
        return axiosClient.post('/it-form', data)
    },

    update(id: string, data: UpdateITFormRequest){
        return axiosClient.put(`/it-form/${id}`, data)
    },

    delete(id: string | undefined) {
        return axiosClient.delete(`/it-form/${id}`)
    },
    assignedTask(data: IAssignedTask) {
        return axiosClient.post('/it-form/assigned-task', data)
    },
    resolvedTask(data: IResolvedTask) {
        return axiosClient.post('/it-form/resolved-task', data)
    }
}

export function useCreateITForm() {
    return useMutation({
        mutationFn: async (data: CreateITFormRequest) => {
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
        mutationFn: async ({id, data} : {id: string, data: UpdateITFormRequest}) => {
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
        mutationFn: async (id: string | undefined) => {
            await itFormApi.delete(id)
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