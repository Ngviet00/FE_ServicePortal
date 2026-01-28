/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import sapApi, { useApprovalSAP } from "@/api/sapApi";
import { getErrorMessage, parseJSON, ShowToast, ViewApprovalProps } from "@/lib";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { StatusLeaveRequest } from "@/components/StatusLeaveRequest/StatusLeaveRequestComponent";
import { formatDate } from "@/lib/time";
import { ArrowDownToLine } from "lucide-react";
import fileApi from "@/api/fileApi";
import { Spinner } from "@/components/ui/spinner";
import SapSidebar from "@/components/SapSidebar";

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

export default function ViewApprovalSAPForm({id, mode}: ViewApprovalProps) {
    const { t } = useTranslation('sap');
    const lang = useTranslation().i18n.language.split('-')[0]
    const user = useAuthStore((state) => state.user)
    const [activeAssignStep, setActiveAssignStep] = useState<number | null>(null);
    const [selectedUsers, setSelectedUsers] = useState<{ [key: number]: any[] }>({});
    const [employeesByStep, setEmployeesByStep] = useState<{ [key: number]: { id: number, userCode: string; userName: string, label: string }[] }>({});
    const queryClient = useQueryClient();
    const approvalSAP = useApprovalSAP();
    const [downloadingFiles, setDownloadingFiles] = useState<Record<number, boolean>>({});
    const [loadingPreviewExcel, setLoadingPreviewExcel] = useState(false);
    const hasId = !!id;
    
    const { data: formDataDetail, isLoading: isFormDataLoading } = useQuery({
        queryKey: ['get-detail-form-sap', id, user?.userCode],
        queryFn: async () => {
            const res = await sapApi.getDetailFormSAP(id ?? '');
            return res.data.data;
        },
        enabled: hasId,
    });

    const getSecureUrl = async (fileId: number, fileName: string) => {
        try {
            const res = await fileApi.generateTokenAccessFile(fileId);
            const baseUrl = import.meta.env.VITE_BASE_URL;
            const { token } = res.data;
            return `${baseUrl}/api/file/get-stream-file/${fileName}?token=${token}`;
        } catch (error: any) {
            ShowToast(getErrorMessage(error), "error");
            return null;
        }
    };

    const handleOpenExcel = async (fileId: number, fileName: string) => {
        try {
            const urlStreamFile = await getSecureUrl(fileId, fileName);
            if (!urlStreamFile) return;
            window.location.href = `ms-excel:ofe|u|${urlStreamFile}`;
        } catch (error) {
            ShowToast(getErrorMessage(error), "error");
        }
    };
    
    const handleDownload = async (e: React.MouseEvent, fileId: number, fileName: string) => {
        e.preventDefault();
        if (downloadingFiles[fileId]) return;
        setDownloadingFiles(prev => ({ ...prev, [fileId]: true }));
        try {
            const urlStreamFile = await getSecureUrl(fileId, fileName);
            if (urlStreamFile) {
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = urlStreamFile;
                document.body.appendChild(iframe);
                setTimeout(() => {
                    clearLoading(fileId);
                }, 800);

                setTimeout(() => {
                    if (document.body.contains(iframe)) {
                        document.body.removeChild(iframe);
                    }
                }, 3000);
            } else {
                clearLoading(fileId);
            }
        } catch (error) {
            ShowToast(getErrorMessage(error), "error");
            clearLoading(fileId);
        }
    };

    const clearLoading = (id: number) => {
        setDownloadingFiles(prev => {
            const newState = { ...prev };
            delete newState[id];
            return newState;
        });
    };

    const handleApproval = async (stepAction: DefineWorkFlowActions, paramStatus?: string | null) => {
        // const conditionStepAction = parseJSON(stepAction.condition || '{}');
        // let status = ''

        // if (conditionStepAction.is_assigned == false) {
        //     status = 'only_approval'
        // } else if (paramStatus == 'resolved') {
        //     status = 'resolved'
        // }

        // const payloadSAP = {
        //     DisplayTitle: conditionStepAction.display_title || '',
        //     IdDefineWorkFlow: stepAction.id,
        //     Step: stepAction.stepOrder,
        //     Status: status,
        //     Condition: stepAction.condition || '',
        // }

        // await approvalSAP.mutateAsync({
        //     ApplicationFormId: formData?.sapDetail.id || 0,
        //     ApplicationFormCode: id || '',
        //     UserCodeApproval: user?.userCode || '',
        //     UserNameApproval: user?.userName || '',
        //     OrgPositionId: user?.orgPositionId || 0,
        //     Note: '',
        //     SAPApprovalRequest: payloadSAP
        // })
        // queryClient.invalidateQueries({ queryKey: ['get-detail-form-sap', id, user?.userCode] });
    }

    const handleToggleAssign = async (stepOrder: number, departmentId: number) => {
        // if (activeAssignStep === stepOrder) {
        //     setActiveAssignStep(null);
        // } else {
        //     setActiveAssignStep(stepOrder);

        //     if (!employeesByStep[stepOrder]) {
        //         try {
        //             const res = await sapApi.getListStaffByDepartmentId(departmentId);
        //             setEmployeesByStep(prev => ({ ...prev, [stepOrder]: res.data.data || [] }));
        //         } catch (error) {
        //             console.error("Failed to load employees:", error);
        //         }
        //     }
        // }
    };

    const handleSelectUser = (step: number, emp: any) => {
        // setSelectedUsers(prev => {
        //     const list = prev[step] || [];

        //     const id = emp.userCode || emp.id;
        //     const name = emp.label || emp.userName;

        //     // Kiểm tra đã tồn tại chưa
        //     const exists = list.some(u => u.id === id);

        //     const updated = exists
        //         ? list.filter(u => u.id !== id)
        //         : [...list, { id, name }];

        //     return { ...prev, [step]: updated };
        // });
    };

    const handleSubmitAssign = async (stepAction: DefineWorkFlowActions) => {
        // const conditionStepAction = parseJSON(stepAction.condition || '{}');
        // const stepOrder = stepAction.stepOrder;
        // const userSelected = selectedUsers[stepOrder] || [];
        // setActiveAssignStep(null);

        // const payloadSAP = {
        //     DisplayTitle: conditionStepAction.display_title || '',
        //     IdDefineWorkFlow: stepAction.id,
        //     Step: stepAction.stepOrder,
        //     Status: 'assigned',
        //     Condition: stepAction.condition || '',
        //     AssignedUsers: userSelected
        // }

        // await approvalSAP.mutateAsync({
        //     ApplicationFormId: formData?.sapDetail.id || 0,
        //     ApplicationFormCode: id || '',
        //     UserCodeApproval: user?.userCode || '',
        //     UserNameApproval: user?.userName || '',
        //     OrgPositionId: user?.orgPositionId || 0,
        //     Note: '',
        //     SAPApprovalRequest: payloadSAP
        // })
        // queryClient.invalidateQueries({ queryKey: ['get-detail-form-sap', id, user?.userCode] });
    };

    // const currentApprovalList = formData?.sapDetail?.sapData?.approvalList || [];

    const order1Detail = formDataDetail?.sapData?.sapDataDetails?.find(
        (s: any) => s.orderKey === 'order_1'
    );

    const handleDownloadFileTxt = async (sapDataId: number, step: number) => {
        const txtFileId = step * -1;
        if (downloadingFiles[txtFileId]) return;

        try {
            setDownloadingFiles(prev => ({ ...prev, [txtFileId]: true }));
            const baseUrl = import.meta.env.VITE_BASE_URL;
            const url = `${baseUrl}/api/sap/export-to-txt?sapDataId=${sapDataId}&step=${step}`;
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', ''); 
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        catch (error) {
            ShowToast(getErrorMessage(error), "error");
        }
        finally {
            setDownloadingFiles(prev => ({ ...prev, [txtFileId]: false }));
        }
    }

    const handleViewExcel = async (sapDataDetailId: number) => {
        try {
            setLoadingPreviewExcel(true);
            const res = await fileApi.generateTokenAccessFile(sapDataDetailId);
            const { token } = res.data;

            const resPrepareViewExcel = await sapApi.preparePreviewExcel(token);
            const { fileName } = resPrepareViewExcel.data;

            const baseUrl = import.meta.env.VITE_BASE_URL;
            const previewUrl = `${baseUrl}/api/sap/preview-excel/${fileName}`;
            window.location.href = `ms-excel:ofe|u|${previewUrl}`;
        } catch (error) {
            ShowToast(getErrorMessage(error), "error");
        }
        finally {
            setLoadingPreviewExcel(false);
        }
    };
            
    if (hasId && isFormDataLoading) {
        return <div>{lang === 'vi' ? 'Đang tải dữ liệu...' : 'Loading data...'}</div>;
    }

    if (hasId && !formDataDetail) {
        return  <div className='text-red-700 font-semibold'>{lang == 'vi' ? 'Không tìm thấy dữ liệu' : 'Not found data'}</div>;
    }

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
                <div className="mb-2 pb-4 border-b border-gray-200 flex justify-between">
                    <p className="text-base text-gray-600">{lang == 'vi' ? 'Loại form SAP' : 'SAP Form Type'}: <strong className="font-bold">{formDataDetail?.sapData?.sapType?.name}</strong></p>
                    <div>
                        <StatusLeaveRequest status={formDataDetail?.sapData?.applicationForm?.requestStatusId}/>
                        <SapSidebar
                            data={formDataDetail?.sapData?.sapDataDetails || []} 
                            onViewExcel={handleViewExcel} 
                        />
                    </div>
                </div>

                <div className="workflow-steps flex flex-col space-y-3">
                    <div className={`step current flex py-3 border-b border-dotted border-gray-200 items-start`}>
                        <div className="status-summary w-36 flex-shrink-0 text-left pr-4">
                            <span className="status-dot inline-block w-2 h-2 rounded-full mr-1 bg-yellow-500"></span>
                            <span className="status-label font-semibold text-xs uppercase text-yellow-600">{lang == 'vi' ? 'ĐÃ TẠO' : 'CREATED'}</span>
                        </div>
                        <div className="step-content flex-grow">
                            <div className="step-title text-base font-semibold text-gray-800 mb-0.5">
                                User created form
                            </div>
                            <div className="step-manager text-sm text-gray-600 my-1">
                                {lang == 'vi' ? `Người tạo: ${formDataDetail?.sapData?.applicationForm?.userNameCreatedForm}, thời gian tạo: ${formatDate(formDataDetail?.sapData?.applicationForm?.createdAt, 'yyyy-MM-dd HH:mm:ss')}` : `Created By: ${formDataDetail?.sapData?.applicationForm?.userNameCreatedForm} ,  Created At: ${formatDate(formDataDetail?.sapData?.applicationForm?.createdAt, 'yyyy-MM-dd HH:mm:ss')}`}
                            </div>
                            <div className="flex items-end justify-between">
                                <div>
                                    <div>
                                        <span className="text-[14px] font-semibold my-1 inline-block text-red-700">File SAP <span className="text-[12.5px] italic text-gray-600">({lang == 'vi' ? 'Nhấn vào file để mở' : 'Click on the file to open'})</span> </span>
                                        {(() => {
                                            const sapFile = formDataDetail?.files?.find((f: any) => f.IsFileSAP === true);                                        
                                            if (sapFile) {
                                                return (
                                                    <div className="flex items-center">
                                                        <button
                                                            onClick={() => handleOpenExcel(sapFile?.Id, sapFile?.FileName)}
                                                            className="flex items-center px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-[3px] hover:bg-emerald-100 transition shadow-sm hover:cursor-pointer"
                                                        >
                                                            <span className="font-medium text-[13px]">{sapFile?.FileName}</span>
                                                        </button>

                                                        <button 
                                                            type="button"
                                                            onClick={(e) => handleDownload(e, sapFile?.Id, sapFile?.FileName)}
                                                            disabled={downloadingFiles[sapFile?.Id]}
                                                            className={`btn-download ml-1 cursor-pointer ${downloadingFiles[sapFile?.Id] ? 'loading' : ''}`}
                                                        >
                                                            {downloadingFiles[sapFile?.Id] ? (<Spinner className="text-black"/>) : (<ArrowDownToLine size={20} />)}
                                                        </button>
                                                    </div>
                                                );
                                            }
                                        })()}
                                    </div>
                                    {
                                        formDataDetail?.files?.some((f: any) => f.IsFileSAP === false && f.Step == 1) && (
                                            <div className="ml-5">
                                                <span className="text-[14px] font-semibold">Other file</span>
                                                <div>
                                                    <button>button</button>
                                                    <button>button</button>
                                                </div>
                                            </div>
                                        )
                                    }
                                </div>
                                {
                                    order1Detail && (
                                        <div>
                                            <button 
                                                disabled={downloadingFiles[order1Detail.id * -1]}
                                                onClick={() => handleDownloadFileTxt(formDataDetail?.sapData?.id, 1)} 
                                                className={`bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-sm items-center mr-2 cursor-pointer`}
                                            >
                                                {downloadingFiles[order1Detail.id * -1] ? <Spinner className="text-white"/> : <span className="flex"><ArrowDownToLine size={20} /><span className="ml-1">.txt</span></span> }
                                            </button>    
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                    {
                        formDataDetail?.sapData?.applicationForm?.defineWorkFlowInstance?.defineWorkFlowActions?.map((stepAction: any, index: number) => {
                            const condition = parseJSON(stepAction.condition || '{}');
                            // console.log(condition, 3);
                            // const currentStepApproval = currentApprovalList.find(app => {
                            //     const conditionApproval = parseJSON(app.condition || '{}');
                                
                            //     return conditionApproval.display_title === condition.display_title;
                            // });

                            // const currentFile = stepAction.files || [];
                            // const fileSAP = currentFile.filter(f => f.step == 1)?.map(file => ({
                            //     id: file.fileId,
                            //     fileName: file.fileName,
                            //     contentType: file.contentType
                            // })) || [];
                            // const normalFiles = currentFile.filter(f => f.step == null && f.departmentIdAttachFile == null)?.map(file => ({
                            //     id: file.fileId,
                            //     fileName: file.fileName,
                            //     contentType: file.contentType
                            // })) || [];

                            // let statusStep = 0;

                            // if (stepAction.stepOrder == 1 && stepAction.statusId == 3 && stepAction.isActive == false) {
                            //     statusStep = 1
                            // } else if (stepAction.isActive == true ) { 
                            //     statusStep = 2
                            // } else if (stepAction.statusId == 3) { 
                            //     statusStep = 3
                            // }d
                            //'step current flex py-3 border-b border-dotted border-gray-200 items-start
                            //step current flex py-4 px-3 border border-amber-500 rounded-md bg-amber-50 items-start !gap-0

                            return (
                                <div key={index} className={`step current flex py-3 border-b border-dotted border-gray-200 items-start`}>
                                        {/* ${statusStep == 2 &&  (stepAction.orgPositionId == user?.orgPositionId || stepAction.sapAssignTasks?.some(task => task.userCode === user?.userCode) && (stepAction.statusId == 1 || stepAction.statusId == 7))
                                        ? 'step current flex py-4 px-3 border border-amber-500 rounded-md bg-amber-50 items-start !gap-0' 
                                        : 'step current flex py-3 border-b border-dotted border-gray-200 items-start'
                                    } */}
                                    <div className="status-summary w-36 flex-shrink-0 text-left pr-4">
                                        <span className="status-dot inline-block w-2 h-2 rounded-full mr-1 bg-green-500"></span>
                                        <span className="status-label font-semibold text-xs uppercase text-green-600">{lang == 'vi' ? 'ĐÃ TẠO' : 'CREATED'}</span>
                                        {/* {
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
                                        } */}
                                    </div>
                                    <div className="step-content flex-grow">
                                        <div className="step-title text-base font-semibold text-gray-800 mb-0.5">
                                            {condition.label ?? 'Default'}
                                        </div>
                                        <div className="step-manager text-sm text-gray-600 my-1">
                                            {/* Người tạo: {currentStepApproval?.userName} ,  Created At: {currentStepApproval?.date} */}
                                            Người tạo: nguyen van a ,  Created At: 2025-09-12
                                        </div>
                                        {/* <div className="flex content-center items-start">
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
                                        </div> */}
                                        {/* {
                                            stepAction.isActive == true && (stepAction.orgPositionId == user?.orgPositionId || stepAction.sapAssignTasks?.some(task => task.userCode === user?.userCode)) && (stepAction.statusId == 1 || stepAction.statusId == 7) && (
                                                <>
                                                    <div className="flex action-box mt-4 pt-2 border-t border-dashed border-amber-300">
                                                        {
                                                            condition.is_assigned == true ? (
                                                                <button
                                                                    disabled={approvalSAP.isPending}
                                                                    onClick={() => handleApproval(stepAction, 'resolved')}
                                                                    className={`btn btn-approve px-4 py-2 mr-2 border-none rounded-md cursor-pointer font-semibold transition-colors text-sm bg-green-500 text-white hover:bg-green-600`}
                                                                >
                                                                    Đã xử lý
                                                                </button> 
                                                            ) : (
                                                                <button
                                                                    disabled={approvalSAP.isPending}
                                                                    onClick={() => handleApproval(stepAction)}
                                                                    className={`btn btn-approve px-4 py-2 mr-2 border-none rounded-md cursor-pointer font-semibold transition-colors text-sm bg-green-500 text-white hover:bg-green-600`}
                                                                >
                                                                    Phê duyệt
                                                                </button> 
                                                            )
                                                        }
       

                                                        {
                                                            condition.is_assigned == true && stepAction.sapAssignTasks?.length == 0 && (
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
                                        } */}
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