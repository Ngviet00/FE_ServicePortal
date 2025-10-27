/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { getErrorMessage, ShowToast, STATUS_ENUM } from '@/lib';
import { useAuthStore } from '@/store/authStore';
import itFormApi, { useApprovalITForm, useAssignedTaskITForm, useConfirmFormITNeedFormPurchase } from '@/api/itFormApi';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ModalConfirm from '@/components/ModalConfirm';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ISelectedUserAssigned } from '@/api/userApi';
import { Spinner } from '@/components/ui/spinner';
import HistoryApproval from '../Approval/Components/HistoryApproval';
import ITRequestForm from './Components/ITRequestForm';
import priorityApi from '@/api/priorityApi';
import itCategoryApi from '@/api/itCategoryApi';
import DotRequireComponent from '@/components/DotRequireComponent';
import { FileListPreviewDownload, UploadedFileType } from '@/components/ComponentCustom/FileListPreviewMemoNotify';
import memoNotificationApi from '@/api/memoNotificationApi';

const DetailWaitApprovalFormIT = () => {
    const { t } = useTranslation('formIT');
    const { t:tCommon} = useTranslation('common');
    const { user } = useAuthStore()
    const lang = useTranslation().i18n.language.split('-')[0]
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [statusModalConfirm, setStatusModalConfirm] = useState('')
    const [note, setNote] = useState("")
    const [selectedUserAssigned, setSelectedUserAssigned] = useState<ISelectedUserAssigned[]>([]);
    const { id } = useParams<{ id: string }>()
    const isHasId = !!id
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
    
    const approval = useApprovalITForm() //approval normal
    const assignTask = useAssignedTaskITForm() //manager assign task for staff
    const confirmNeedFormPurchase = useConfirmFormITNeedFormPurchase()

    const { data: formData, isLoading: isFormDataLoading } = useQuery({
        queryKey: ['itForm', id],
        queryFn: async () => {
            const res = await itFormApi.getById(id ?? '');
            return res.data.data;
        }
    });

    useEffect(() => {
        if (formData) {
            setUploadedFiles(formData?.applicationFormItem?.applicationForm?.files || []);
        }
    }, [formData])

    const mode = isHasId && formData?.applicationFormItem?.applicationForm?.requestStatusId == STATUS_ENUM.FINAL_APPROVAL ? 'manager_it_approval' : 'approval'
    const isManagerITapproval = mode == 'manager_it_approval'
    const initialFormData = isHasId ? formData : {};

    const { data: priorities = [] } = useQuery({
        queryKey: ['get-all-priority'],
        queryFn: async () => {
            const res = await priorityApi.getAll()
            return res.data.data
        },
    });

    const { data: ItCategories = [] } = useQuery({
        queryKey: ['get-all-it-category'],
        queryFn: async () => {
            const res = await itCategoryApi.getAll()
            return res.data.data
        },
    });

    const { data: ItMembers = [] } = useQuery({
        queryKey: ['get-all-it-member'],
        queryFn: async () => {
            const res = await itFormApi.getMemberITAssigned()
            return res.data.data
        }
    });

    const handleCheckboxChangeUserAssigned = (event: React.ChangeEvent<HTMLInputElement>, item: {nvMaNV: string, nvHoTen: string, email: string}) => {
        const isChecked = event.target.checked;
        if (isChecked) {
            setSelectedUserAssigned(prevSelected => [...prevSelected, { userCode: item.nvMaNV, email: item.email }]);
        } else {
            setSelectedUserAssigned(prevSelected => prevSelected.filter(u => u.userCode !== item.nvMaNV));
        }
    };

    const handleSaveModalConfirm = async (type: string) => {
        if (isManagerITapproval) {
            if (selectedUserAssigned.length == 0) {
                ShowToast(lang == 'vi' ? 'Vui lòng chọn ít nhất 1 người để làm công việc này' : 'Please select at least one person to assign the task.', "error")
                setStatusModalConfirm('')
                return
            }
        }

        try {
            if (statusModalConfirm == 'confirmed') {
                await confirmNeedFormPurchase.mutateAsync({
                    UserCode: user?.userCode,
                    UserName: user?.userName ?? '',
                    Note: note,
                    OrgPositionId: user?.orgPositionId,
                    ApplicationFormId: formData?.applicationFormItem?.applicationForm?.id,
                })
                navigate("/approval/wait-confirm")
            }
            else {
                if (isManagerITapproval) {
                    await assignTask.mutateAsync({
                        UserCodeApproval: user?.userCode,
                        UserNameApproval: user?.userName ?? '',
                        NoteManager: note,
                        OrgPositionId: user?.orgPositionId,
                        ApplicationFormId: formData?.applicationFormItem?.applicationForm?.id,
                        ApplicationFormCode: formData?.applicationFormItem?.applicationForm?.code,
                        UserAssignedTasks: selectedUserAssigned
                    })
                }
                else {
                    await approval.mutateAsync({
                        UserCodeApproval: user?.userCode,
                        UserNameApproval: user?.userName ?? "",
                        OrgPositionId: user?.orgPositionId,
                        Status: type == 'approval' ? true : false,
                        Note: note,
                        ApplicationFormId: formData?.applicationFormItem?.applicationForm?.id,
                        ApplicationFormCode: formData?.applicationFormItem?.applicationForm?.code,
                        RequestTypeId: formData?.applicationFormItem?.applicationForm?.requestTypeId,
                    })
                }
                navigate("/approval/pending-approval")
            }

            setStatusModalConfirm('')
            queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });
        } catch (err) {
            console.log(err);
        }
    }

    
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
            ShowToast(`Download file failed,${getErrorMessage(err)}`, "error")
        }
    }

    if (isHasId && isFormDataLoading) {
        return <div>Đang tải dữ liệu...</div>;
    }

    return (
        <div className="p-1 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0">{t('create.title_approval')}</h3>
            </div>

            <ModalConfirm
                type={statusModalConfirm}
                isOpen={statusModalConfirm != ''}
                onClose={() => setStatusModalConfirm('')}
                onSave={handleSaveModalConfirm}
            />

            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-[60%] bg-white rounded-xl p-2 md:p-1">
                    <ITRequestForm
                        mode={mode}
                        priorities={priorities}
                        itCategories={ItCategories}
                        formData={initialFormData}
                    />
                </div>

                <div className="w-full md:w-[40%] md:pl-5 md:border-l border-gray-200 flex flex-col gap-5">
                    <div className="w-full">
                        <Label className="mb-1">
                            {t('create.note')}{" "}
                            {isManagerITapproval && (
                                <span className="italic text-red-500">(Manager IT)</span>
                            )}
                        </Label>
                        <Textarea
                            placeholder={t('create.note')}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="border-gray-300 w-full"
                        />
                    </div>

                    {isManagerITapproval &&
                    formData?.applicationFormItem?.applicationForm?.assignedTasks?.length == 0 ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                {t('create.assigned')}<DotRequireComponent />
                            </label>
                            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 mt-2">
                                {ItMembers?.map((item: any, idx: number) => (
                                    <label
                                        key={idx}
                                        className="flex items-center space-x-2 cursor-pointer w-full sm:w-[48%]"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedUserAssigned.some(
                                                (e) => e.userCode == item.nvMaNV
                                            )}
                                            value={item.nvMaNV}
                                            className="border-gray-300 scale-[1.4] accent-black"
                                            onChange={(e) =>
                                                handleCheckboxChangeUserAssigned(e, item)
                                            }
                                        />
                                        <span>
                                            <strong>({item.nvMaNV})</strong> {item.nvHoTen}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ) : (
                        formData?.applicationFormItem?.applicationForm?.assignedTasks?.length > 0 && (
                            <div className="w-full">
                                <Label className="mb-1">{t('create.assigned')}</Label>
                                <div className="flex flex-col gap-2 mt-2">
                                    {ItMembers?.map((item: any, idx: number) => {
                                        const isExist =
                                            formData?.applicationFormItem?.applicationForm?.assignedTasks.some(
                                                (e: any) => e.userCode === item.nvMaNV
                                            );
                                        if (isExist)
                                            return (
                                                <label
                                                    key={idx}
                                                    className="flex items-center space-x-2 cursor-pointer"
                                                >
                                                    <span>
                                                        <strong>({item.nvMaNV})</strong> {item.nvHoTen}
                                                    </span>
                                                </label>
                                            );
                                    })}
                                </div>
                            </div>
                        )
                    )}

                    {formData?.applicationFormItem?.applicationForm?.files?.length > 0 && (
                        <div>
                            <Label className="mb-2 text-red-700 inline-block">
                                {lang == "vi"
                                    ? "Đính kèm file báo giá (nếu có)"
                                    : "Attach quotation file (if any)"}
                            </Label>
                            <FileListPreviewDownload
                                onDownload={(file) => handleDownloadFile(file)}
                                uploadedFiles={uploadedFiles}
                                isShowCheckbox={false}
                            />
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-end gap-2">
                        {formData?.applicationFormItem?.applicationForm?.requestStatusId ==
                        STATUS_ENUM.WAIT_CONFIRM ? (
                            <>
                                {user?.userCode ==
                                formData?.applicationFormItem?.applicationForm?.userCodeCreatedForm ? (
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center">
                                        <span className="text-sm text-red-700 underline mb-2 sm:mb-0">
                                            {lang == "vi"
                                                ? "(Đơn mua hàng liên kết với đơn IT)"
                                                : "(The purchase order will be linked to the IT order)"}
                                        </span>
                                        <Link
                                            to={`/purchase/create?applicationFormCode=${formData?.applicationFormItem?.applicationForm?.code}`}
                                            className="px-4 py-2 sm:ml-2 bg-orange-600 text-white rounded-[3px] shadow-lg hover:bg-orange-700 transition-all duration-200 text-base hover:cursor-pointer"
                                        >
                                            {lang == "vi"
                                                ? "Tạo đơn mua bán"
                                                : "Create Purchase Request"}
                                        </Link>
                                    </div>
                                ) : (
                                    <Button
                                        disabled={assignTask.isPending}
                                        onClick={() => setStatusModalConfirm("confirmed")}
                                        className="px-4 py-2 bg-blue-700 text-white rounded-[3px] shadow-lg hover:bg-blue-800 transition-all duration-200 text-base hover:cursor-pointer"
                                    >
                                        {assignTask.isPending ? (
                                            <Spinner size="small" className="text-white" />
                                        ) : lang == "vi" ? (
                                            "Xác nhận"
                                        ) : (
                                            "Confirm"
                                        )}
                                    </Button>
                                )}
                            </>
                        ) : (
                            <>
                                <Button
                                    disabled={assignTask.isPending}
                                    onClick={() => setStatusModalConfirm("approval")}
                                    className="px-4 py-2 bg-blue-700 text-white rounded-[3px] shadow-lg hover:bg-blue-800 transition-all duration-200 text-base hover:cursor-pointer"
                                >
                                    {assignTask.isPending ? (
                                        <Spinner size="small" className="text-white" />
                                    ) : (
                                        tCommon("approval")
                                    )}
                                </Button>
                                {!isManagerITapproval && (
                                    <Button
                                        onClick={() => setStatusModalConfirm("reject")}
                                        className="px-4 py-2 bg-red-600 text-white rounded-[3px] shadow-lg hover:bg-red-700 transition-all duration-200 text-base"
                                    >
                                        {tCommon("reject")}
                                    </Button>
                                )}
                            </>
                        )}
                    </div>

                    <HistoryApproval
                        historyApplicationForm={
                            formData?.applicationFormItem?.applicationForm?.historyApplicationForms
                        }
                    />
                </div>
            </div>
        </div>
    );
};

export default DetailWaitApprovalFormIT;
