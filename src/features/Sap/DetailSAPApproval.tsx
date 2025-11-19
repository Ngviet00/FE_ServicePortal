/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import sapApi, { useApprovalSAP } from "@/api/sapApi";
import { getErrorMessage, parseJSON, ShowToast } from "@/lib";
import { FileListPreviewDownload, UploadedFileType } from "@/components/ComponentCustom/FileListPreviewMemoNotify";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import memoNotificationApi from "@/api/memoNotificationApi";
import { useState } from "react";

export interface FileAttachs {
    fileId: number;
    fileName: string;
    contentType: string;
    departmentIdAttachFile?: number | null;
    step?: number | null;
}

export interface SAPAssignTasks {
    id: number;
    defineWorkflowActionId: number;
    userCode: string;
    userName: string;
    assignedBy: string;
    statusId: number;
}   

export interface DefineWorkFlowActions {
    id: number;
    applicationFormId: number;
    stepOrder: number;
    departmentId: number | null;
    orgPositionId: number | null;
    isActive?: boolean;
    condition?: string | null;
    statusId?: number | null;
    files: FileAttachs[],
    sapAssignTasks?: SAPAssignTasks[] | undefined
}

export interface ApprovalList {
    step: number;
    departmentId?: number | null;
    departmentName?: string;
    userCode?: string;
    userName?: string;
    date: string;
    condition?: string;
}

export interface SAPData<T = any> {
    approvalList: ApprovalList[];
    data: T
}

export interface SapDetail {
    id: number,
    code: string;
    sapData: SAPData;
    sapTypeCode: string;
    sapTypeName: string;
    userCodeCreatedForm: string;
    userNameCreatedForm: string;
}

export interface ApiFormSAPDetailResponse {
    defineWorkFlowActions: DefineWorkFlowActions[]
    sapDetail: SapDetail;
}

export default function DetailSAPApproval() {
    const { t } = useTranslation('sap');
    const lang = useTranslation().i18n.language.split('-')[0]
    const user = useAuthStore((state) => state.user)
    const [activeAssignStep, setActiveAssignStep] = useState<number | null>(null);
    const [selectedUsers, setSelectedUsers] = useState<{ [key: number]: any[] }>({});
    const [employeesByStep, setEmployeesByStep] = useState<{ [key: number]: { id: number, userCode: string; userName: string, label: string }[] }>({});

    const queryClient = useQueryClient();
    const approvalSAP = useApprovalSAP();

    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;
    
    const { data: formData, isLoading: isFormDataLoading } = useQuery<ApiFormSAPDetailResponse>({
        queryKey: ['get-detail-form-sap', id, user?.userCode],
        queryFn: async () => {
            const res = await sapApi.getDetailFormSAP(id ?? '');
            return res.data.data;
        },
        enabled: isEdit,
    });

    const handleDownloadFile = async (file: UploadedFileType) => {
        try {
            const result = await memoNotificationApi.downloadFile(file.id)
            const url = window.URL.createObjectURL(result.data);
            const a = document.createElement("a");
            a.href = url;
            a.download = file.fileName;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            ShowToast(`Download file failed, ${getErrorMessage(err)}`, "error")
        }
    };

    const handleApproval = async (stepAction: DefineWorkFlowActions) => {
        const conditionStepAction = parseJSON(stepAction.condition || '{}');
        let status = ''

        if (conditionStepAction.is_assigned == false) {
            status = 'only_approval'
        }

        const payloadSAP = {
            DisplayTitle: conditionStepAction.display_title || '',
            IdDefineWorkFlow: stepAction.id,
            Step: stepAction.stepOrder,
            Status: status,
            Condition: stepAction.condition || '',
        }

        await approvalSAP.mutateAsync({
            ApplicationFormId: formData?.sapDetail.id || 0,
            ApplicationFormCode: id || '',
            UserCodeApproval: user?.userCode || '',
            UserNameApproval: user?.userName || '',
            OrgPositionId: user?.orgPositionId || 0,
            Note: '',
            SAPApprovalRequest: payloadSAP
        })
        queryClient.invalidateQueries({ queryKey: ['get-detail-form-sap', id, user?.userCode] });
    }

    const handleToggleAssign = async (stepOrder: number, departmentId: number) => {
        if (activeAssignStep === stepOrder) {
            setActiveAssignStep(null);
        } else {
            setActiveAssignStep(stepOrder);

            if (!employeesByStep[stepOrder]) {
                try {
                    const res = await sapApi.getListStaffByDepartmentId(departmentId);
                    setEmployeesByStep(prev => ({ ...prev, [stepOrder]: res.data.data || [] }));
                } catch (error) {
                    console.error("Failed to load employees:", error);
                }
            }
        }
    };

    const handleSelectUser = (step: number, emp: any) => {
        setSelectedUsers(prev => {
            const list = prev[step] || [];

            const id = emp.userCode || emp.id;
            const name = emp.label || emp.userName;

            // Kiểm tra đã tồn tại chưa
            const exists = list.some(u => u.id === id);

            const updated = exists
                ? list.filter(u => u.id !== id)
                : [...list, { id, name }];

            return { ...prev, [step]: updated };
        });
    };

    const handleSubmitAssign = async (stepAction: DefineWorkFlowActions) => {
        const conditionStepAction = parseJSON(stepAction.condition || '{}');
        const stepOrder = stepAction.stepOrder;
        const userSelected = selectedUsers[stepOrder] || [];
        setActiveAssignStep(null);

        const payloadSAP = {
            DisplayTitle: conditionStepAction.display_title || '',
            IdDefineWorkFlow: stepAction.id,
            Step: stepAction.stepOrder,
            Status: 'assigned',
            Condition: stepAction.condition || '',
            AssignedUsers: userSelected
        }

        await approvalSAP.mutateAsync({
            ApplicationFormId: formData?.sapDetail.id || 0,
            ApplicationFormCode: id || '',
            UserCodeApproval: user?.userCode || '',
            UserNameApproval: user?.userName || '',
            OrgPositionId: user?.orgPositionId || 0,
            Note: '',
            SAPApprovalRequest: payloadSAP
        })
        queryClient.invalidateQueries({ queryKey: ['get-detail-form-sap', id, user?.userCode] });
    };

    if (isEdit && isFormDataLoading) {
        return <div>{lang == 'vi' ? 'Loading' : 'Đang tải'}...</div>;
    }

    const currentApprovalList = formData?.sapDetail?.sapData?.approvalList || [];

    return (
        <div className="p-4 pl-1 pt-0 space-y-4 leave-request-form pb-[15rem]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-2">
                <div className="flex flex-col gap-2">
                    <div className="flex">
                        <h3 className="font-bold text-xl md:text-2xl">
                            <span>{ lang == 'vi' ? 'Chi tiết đơn SAP' : `Detail form SAP` }</span>
                        </h3>
                    </div>
                </div>
            </div>

            <div className="mb-0">
                <div className="mb-2 pb-4 border-b border-gray-200">
                    <p className="text-base text-gray-600">Loại form SAP: <strong className="font-bold">{formData?.sapDetail?.sapTypeName}</strong></p>
                </div>

                <div className="workflow-steps flex flex-col space-y-3">
                    {
                        formData?.defineWorkFlowActions.map((stepAction, index) => {
                            const condition = parseJSON(stepAction.condition || '{}');
                            const currentStepApproval = currentApprovalList.find(app => app.step === stepAction.stepOrder);

                            const currentFile = stepAction.files || [];
                            const fileSAP = currentFile.filter(f => f.step == 1)?.map(file => ({
                                id: file.fileId,
                                fileName: file.fileName,
                                contentType: file.contentType
                            })) || [];
                            const normalFiles = currentFile.filter(f => f.step == null && f.departmentIdAttachFile == null)?.map(file => ({
                                id: file.fileId,
                                fileName: file.fileName,
                                contentType: file.contentType
                            })) || [];

                            let statusStep = 0;

                            if (stepAction.stepOrder == 1 && stepAction.statusId == 3 && stepAction.isActive == false) {
                                statusStep = 1
                            } else if (stepAction.isActive == true ) { 
                                statusStep = 2
                            } else if (stepAction.statusId == 3) { 
                                statusStep = 3
                            }

                            return (
                                <div key={index} className={`
                                    ${statusStep == 2 &&  (stepAction.orgPositionId == user?.orgPositionId || stepAction.sapAssignTasks?.some(task => task.userCode === user?.userCode) && (stepAction.statusId == 1 || stepAction.statusId == 7))
                                        ? 'step current flex py-4 px-3 border border-amber-500 rounded-md bg-amber-50 items-start !gap-0' 
                                        : 'step current flex py-3 border-b border-dotted border-gray-200 items-start'
                                    }`}>
                                    <div className="status-summary w-36 flex-shrink-0 text-left pr-4">
                                        {
                                            statusStep == 1 ? (
                                                <>
                                                    <span className="status-dot inline-block w-2 h-2 rounded-full mr-1 bg-green-500"></span>
                                                    <span className="status-label font-semibold text-xs uppercase text-green-600">{lang == 'vi' ? 'ĐÃ TẠO' : 'CREATED'}</span>
                                                </>
                                            ) :
                                            statusStep == 2 ? (
                                                <>
                                                    <span className="status-dot inline-block w-2 h-2 rounded-full mr-1 bg-amber-600"></span>
                                                    <span className="status-label font-semibold text-xs uppercase text-amber-600">{lang == 'vi' ? 'CHỜ DUYỆT' : 'PENDING APPROVAL'}</span>
                                                </>
                                            ) :
                                            statusStep == 3 ? (
                                                <>
                                                    <span className="status-dot inline-block w-2 h-2 rounded-full mr-1 bg-green-500"></span>
                                                    <span className="status-label font-semibold text-xs uppercase text-green-600">{lang == 'vi' ? 'ĐÃ DUYỆT' : 'RESOLVED'}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="status-dot inline-block w-2 h-2 rounded-full mr-1 bg-gray-400"></span>
                                                    <span className="status-label font-semibold text-xs uppercase text-gray-500">{lang == 'vi' ? 'ĐANG ĐỢI' : 'WAITING'}</span>
                                                </>
                                            )
                                        }
                                    </div>
                                    <div className="step-content flex-grow">
                                        <div className="step-title text-base font-semibold text-gray-800 mb-0.5">
                                            {lang == 'vi' ? condition?.display_title : condition?.display_title}
                                        </div>
                                        {
                                            currentStepApproval?.userName != '' && (
                                                <div className="step-manager text-sm text-gray-600 my-1">
                                                    Người tạo: {currentStepApproval?.userName} ,  Created At: {currentStepApproval?.date}
                                                </div>
                                            )
                                        }
                                        <div className="flex content-center items-start">
                                            {
                                                fileSAP.length > 0 &&  (
                                                    <div className="pr-10">
                                                        <label className="text-sm text-black font-semibold">File SAP Excel</label>
                                                        <FileListPreviewDownload
                                                            uploadedFiles={fileSAP}
                                                            onDownload={handleDownloadFile}
                                                            // onViewPdf={handleViewPdf}
                                                            isShowCheckbox={false}
                                                        />
                                                    </div>
                                                )
                                            }
                                            {
                                                normalFiles.length > 0 && (
                                                    <div>
                                                        <label className="text-sm text-black font-semibold">Other file attachs</label>
                                                        <FileListPreviewDownload
                                                            uploadedFiles={normalFiles}
                                                            onDownload={handleDownloadFile}
                                                            // onViewPdf={handleViewPdf}
                                                            isShowCheckbox={false}
                                                        />
                                                    </div>
                                                )
                                            }
                                        </div>
                                        {
                                            stepAction.isActive == true && (stepAction.orgPositionId == user?.orgPositionId || stepAction.sapAssignTasks?.some(task => task.userCode === user?.userCode)) && (stepAction.statusId == 1 || stepAction.statusId == 7) && (
                                                <>
                                                    <div className="flex action-box mt-4 pt-2 border-t border-dashed border-amber-300">
                                                        <button
                                                            disabled={approvalSAP.isPending}
                                                            onClick={() => handleApproval(stepAction)}
                                                            className={`btn btn-approve px-4 py-2 mr-2 border-none rounded-md cursor-pointer font-semibold transition-colors text-sm bg-green-500 text-white hover:bg-green-600`}
                                                        >
                                                            Phê duyệt
                                                        </button>
                                                        {
                                                            condition.is_assigned == true && (
                                                                <button
                                                                    onClick={() => handleToggleAssign(stepAction.stepOrder, stepAction.departmentId || 0)}
                                                                    className="btn btn-assign px-4 py-2 mr-2 border-none rounded-md cursor-pointer font-semibold transition-colors text-sm bg-blue-500 text-white hover:bg-blue-600"
                                                                >
                                                                    Giao việc/Assign
                                                                </button>
                                                            )
                                                        }
                                                        <div>
                                                            <input
                                                                // disabled={fileSAP != null}
                                                                id="file-excel-sap"
                                                                type="file"
                                                                accept=".xls,.xlsx,.csv"
                                                                // onChange={handleAddFiles}
                                                                className="hidden"
                                                            />
                                                            <label
                                                                htmlFor="file-excel-sap"
                                                                className={`inline-flex items-center gap-2 border px-3 py-1 rounded-md text-sm font-medium bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 cursor-pointer`}
                                                            >
                                                                {lang === 'vi' ? 'Chọn file' : 'Choose file'} 
                                                            </label> <br />
                                                        </div>
                                                    </div>
                                                    {activeAssignStep === stepAction.stepOrder && Array.isArray(employeesByStep[stepAction.stepOrder]) && (
                                                        <div>
                                                            <label className="block font-semibold mb-1 mt-1 text-[15px]">Danh sách nhân viên:</label>
                                                            {employeesByStep[stepAction.stepOrder].map(emp => (
                                                                <div key={emp.id || emp.userCode} className="flex items-center mb-1">
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`emp-${stepAction.stepOrder}-${emp.id || emp.userCode}`}
                                                                        checked={
                                                                            selectedUsers[stepAction.stepOrder]?.some(
                                                                                u => u.id === (emp.userCode || emp.id)
                                                                            ) || false
                                                                        }
                                                                        onChange={() => handleSelectUser(stepAction.stepOrder, emp)}
                                                                        className="mr-2 hover:cursor-pointer"
                                                                    />
                                                                    <label htmlFor={`emp-${stepAction.stepOrder}-${emp.id || emp.userCode}`} className="text-[15px] hover:cursor-pointer font-semibold">
                                                                        ({emp.userCode || emp.id}) {emp.label || emp.userName}
                                                                    </label>
                                                                </div>
                                                            ))}
                                                            <button
                                                                disabled={approvalSAP.isPending}
                                                                onClick={() => handleSubmitAssign(stepAction)}
                                                                className={`${approvalSAP.isPending ? 'cursor-progress' : ''} btn btn-submit mt-2 px-3 py-1 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 text-sm font-medium`}
                                                            >
                                                                Confirm
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                            )
                                        }
                                        {
                                            currentStepApproval?.userName == '' && stepAction.sapAssignTasks && stepAction.sapAssignTasks?.length > 0 && (
                                                <div className="mt-2 text-sm text-gray-700">
                                                    <div>
                                                        Assigned by: {stepAction.sapAssignTasks[0].assignedBy}
                                                    </div>
                                                    Assigned to:
                                                    {stepAction.sapAssignTasks
                                                        .map(t => ` (${t.userCode}) ${t.userName}`)
                                                        .join(", ")}
                                                </div>
                                            )
                                        }
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    );
}