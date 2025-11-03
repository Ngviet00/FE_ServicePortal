/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@/components/ComponentCustom/Flatpickr';
import { Button } from '@/components/ui/button';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import priorityApi from '@/api/priorityApi';
import itCategoryApi from '@/api/itCategoryApi';
import { useState } from 'react';
import DotRequireComponent from '@/components/DotRequireComponent';
import { useAuthStore } from '@/store/authStore';
import itFormApi, { useResolvedTaskITForm, useStaffITReferenceToManagerIT } from '@/api/itFormApi';
import { Spinner } from '@/components/ui/spinner';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ITRequestForm from './Components/ITRequestForm';
import ModalConfirm from '@/components/ModalConfirm';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import HistoryApproval from '../Approval/Components/HistoryApproval';
import { getErrorMessage, ShowToast, STATUS_ENUM } from '@/lib';
import FileListPreview, { FileListPreviewDownload, UploadedFileType } from '@/components/ComponentCustom/FileListPreviewMemoNotify';
import memoNotificationApi from '@/api/memoNotificationApi';

const AssignedFormIT = () => {
    const { t } = useTranslation('formIT');
    const { user } = useAuthStore()
    const lang = useTranslation().i18n.language.split('-')[0]
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [statusModalConfirm, setStatusModalConfirm] = useState('')
    const [targetDate, setTargetDate] = useState<any>(new Date().toISOString().split('T')[0]);
    const [actualDate, setActualDate] = useState<any>(new Date().toISOString().split('T')[0]);
    const [note, setNote] = useState("")
    const [localFiles, setLocalFiles] = useState<File[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
    const [idDeleteFile, setIdDeleteFile] = useState<number[]>([]);

    const MAX_FILE_SIZE_MB = 2;
    const MAX_FILE_COUNT = 5;

    const { id } = useParams<{ id: string }>();
    const isAssigned = !!id;

    const { data: formData, isLoading: isFormDataLoading } = useQuery({
        queryKey: ['itForm', id],
        queryFn: async () => {
            const res = await itFormApi.getById(id ?? '');
            return res.data.data;
        },
        enabled: isAssigned,
    });

    const mode = 'assigned'
    const initialFormData = isAssigned ? formData : {};

    const staffITReferenceToManagerIT = useStaffITReferenceToManagerIT()
    const resolvedTask = useResolvedTaskITForm()
    
    const handleSaveModalConfirm = async () => {
        if (statusModalConfirm == 'reference') {
            const formDataToSend = new FormData();

            formDataToSend.append('UserCode', user?.userCode ?? '');
            formDataToSend.append('UserName', user?.userName ?? '');
            formDataToSend.append('ApplicationFormId', formData?.applicationFormItem?.applicationForm?.id ?? '');
            formDataToSend.append('OrgPositionId', user?.orgPositionId?.toString() ?? '');
            formDataToSend.append('Note', note ?? '');
            if (localFiles && Array.isArray(localFiles)) {
                localFiles.forEach((file) => {
                    formDataToSend.append('Files', file);
                });
            }
            await staffITReferenceToManagerIT.mutateAsync(formDataToSend);
        }
        else {
            await resolvedTask.mutateAsync({
                UserCodeApproval: user?.userCode,
                UserNameApproval: user?.userName ?? '',
                ApplicationFormId: formData?.applicationFormItem?.applicationForm?.id,
                ApplicationFormCode: formData?.applicationFormItem?.applicationForm?.code,
                TargetCompletionDate: targetDate,
                ActualCompletionDate: actualDate
            })
        }

        navigate("/approval/assigned-tasks")
        queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });
    };

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
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newFiles = Array.from(files);

        const totalCount = (newFiles?.length ?? 0) + (localFiles?.length ?? 0) + (uploadedFiles?.length ?? 0);

        if (totalCount > MAX_FILE_COUNT) {
            e.target.value = "";
            ShowToast(
                lang == 'vi'
                    ? `Chỉ được upload tối đa ${MAX_FILE_COUNT} file`
                    : `Only upload maximum ${MAX_FILE_COUNT} file`,
                'error'
            );
            return;
        }

        const oversized = newFiles.find(f => f.size > MAX_FILE_SIZE_MB * 1024 * 1024);
        if (oversized) {
            e.target.value = "";
            ShowToast(
                lang == 'vi'
                    ? `File ${oversized.name} vượt quá ${MAX_FILE_SIZE_MB}MB`
                    : `The file ${oversized.name} exceeds ${MAX_FILE_SIZE_MB}MB.`,
                'error'
            );
            return;
        }

        setLocalFiles(prev => [...prev, ...newFiles]);
        e.target.value = "";
    };

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

    if (isAssigned && isFormDataLoading) {
        return <div>Đang tải dữ liệu...</div>;
    }

    return (
        <div className="p-1 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0">{lang == 'vi' ? 'Chi tiết đơn IT' : 'Detail form IT'}</h3>
                <Button
                    onClick={() => navigate("/form-it")}
                    className="w-full md:w-auto hover:cursor-pointer"
                >
                    {lang === "vi" ? "Danh sách đã tạo" : "Created list"}
                </Button>
            </div>

            {formData?.applicationFormItem?.applicationForm?.reference?.code && (
                <div className="mb-4 mt-2 text-base text-black bg-orange-200 p-2 rounded">
                    <span>
                    {lang == "vi"
                        ? "Đơn IT này liên kết với đơn mua bán"
                        : "The IT order linked to purchase order"}
                    :{" "}
                    <Link
                        className="text-purple-600 font-bold underline"
                        to={`/view/purchase/${formData?.applicationFormItem?.applicationForm?.reference?.code}`}
                    >
                        {formData?.applicationFormItem?.applicationForm?.reference?.code}
                    </Link>
                    </span>
                </div>
            )}

            <ModalConfirm
                type={statusModalConfirm}
                isOpen={statusModalConfirm != ""}
                onClose={() => setStatusModalConfirm("")}
                onSave={handleSaveModalConfirm}
            />

            <div className="flex flex-col md:flex-row md:space-x-5">
                <div className="w-full md:max-w-3xl bg-white rounded-xl">
                    <ITRequestForm
                        mode={mode}
                        priorities={priorities}
                        itCategories={ItCategories}
                        formData={initialFormData}
                    />
                </div>

                <div className="w-full mt-6 md:mt-0 md:pl-5 md:border-l border-gray-300">
                    <div className="w-full mb-5">
                        <Label className="mb-1">
                            {t("create.note")}{" "}
                            <span className="italic text-red-500">(Manager IT)</span>
                        </Label>
                        <Textarea
                            readOnly={true}
                            placeholder={t("create.note")}
                            value={formData?.noteManagerIT}
                            className="bg-gray-100 border-gray-300 w-full"
                        />
                    </div>

                    <div className="w-full mb-5">
                        <Label className="mb-1">{t("create.assigned")}</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {ItMembers?.map(
                                (
                                    item: { nvMaNV: string; nvHoTen: string; email: string },
                                    idx: number
                                ) => {
                                    const isExist =
                                    formData?.applicationFormItem?.applicationForm?.assignedTasks?.some(
                                        (e: { userCode: string }) => e.userCode === item.nvMaNV
                                    );
                                    if (isExist) {
                                        return (
                                            <label
                                            key={idx}
                                            className="w-full sm:w-[48%] flex items-center space-x-2 cursor-pointer"
                                            >
                                            <span>
                                                <strong>({item.nvMaNV})</strong> {item.nvHoTen}
                                            </span>
                                            </label>
                                        );
                                    }
                                }
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t("create.target_completion_date")}
                                <DotRequireComponent />
                            </label>
                            <DateTimePicker
                                key={"target_date"}
                                enableTime={false}
                                dateFormat="Y-m-d"
                                initialDateTime={
                                    targetDate ?? new Date().toISOString().split("T")[0]
                                }
                                onChange={(_selectedDates, dateStr) => setTargetDate(dateStr)}
                                className={`dark:bg-[#454545] w-full shadow-xs border border-gray-300 ${
                                    !isAssigned ? "bg-gray-100" : ""
                                } p-2 text-sm rounded-[5px] hover:cursor-pointer`}
                            />
                        </div>

                        <div className="form-group">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t("create.actual_completion_date")}
                                <DotRequireComponent />
                            </label>
                                <DateTimePicker
                                key={"actual_date"}
                                enableTime={false}
                                dateFormat="Y-m-d"
                                initialDateTime={
                                    actualDate ?? new Date().toISOString().split("T")[0]
                                }
                                onChange={(_selectedDates, dateStr) => setActualDate(dateStr)}
                                className={`dark:bg-[#454545] w-full shadow-xs border border-gray-300 ${
                                    !isAssigned ? "bg-gray-100" : ""
                                } p-2 text-sm rounded-[5px] hover:cursor-pointer`}
                            />
                        </div>
                    </div>

                    <div className="w-full mt-5">
                        <Label className="mb-1">{t("create.note")}</Label>
                        <Textarea
                            placeholder={t("create.note")}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="border-gray-300 w-full"
                        />
                    </div>

                    <div className="w-full mt-5">
                        {mode === "assigned" ? (
                            <>
                            <Label className="mb-1 text-red-700">
                                {lang == "vi"
                                ? "Đính kèm file báo giá (nếu có)"
                                : "Attach quotation file (if any)"}
                            </Label>
                            <input
                                id="file-upload"
                                type="file"
                                multiple
                                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            <div className="mt-2">
                                <label
                                htmlFor="file-upload"
                                className="inline-block cursor-pointer w-auto text-sm rounded-md bg-blue-800 px-3 py-2 text-white text-center hover:bg-blue-900 transition select-none"
                                >
                                {lang == "vi" ? "Chọn file" : "Choose file"}
                                </label>
                            </div>

                            <FileListPreview
                                files={localFiles}
                                uploadedFiles={uploadedFiles}
                                onRemove={(index) => {
                                const updated = [...localFiles];
                                updated.splice(index, 1);
                                setLocalFiles(updated);
                                }}
                                onRemoveUploaded={(index) => {
                                const removed = uploadedFiles[index];
                                const updated = [...uploadedFiles];
                                updated.splice(index, 1);
                                setUploadedFiles(updated);
                                setIdDeleteFile((prev) => [...prev, removed.id]);
                                }}
                            />
                            </>
                        ) : (
                            <div>
                                <Label className="mb-1 text-red-700">
                                    {lang == "vi"
                                    ? "Đính kèm file báo giá (nếu có)"
                                    : "Attach quotation file (if any)"}
                                </Label>
                                <FileListPreviewDownload
                                    onDownload={(file) => handleDownloadFile(file)}
                                    uploadedFiles={uploadedFiles}
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-end mt-5">
                        {formData?.applicationFormItem?.applicationForm?.reference
                            ?.requestStatusId != STATUS_ENUM.COMPLETED && (
                            <Button
                                onClick={() => setStatusModalConfirm("reference")}
                                disabled={staffITReferenceToManagerIT.isPending}
                                type="submit"
                                className="px-6 py-2 bg-green-500 hover:bg-green-600 border border-transparent rounded-md text-sm font-medium text-white cursor-pointer w-full sm:w-auto"
                            >
                                {staffITReferenceToManagerIT.isPending ? (
                                    <Spinner size="small" className="text-white" />
                                ) : lang == "vi" ? (
                                    "Yêu cầu đơn mua bán"
                                ) : (
                                    "Request form purchase"
                                )}
                            </Button>
                        )}
                        <Button
                            onClick={() => setStatusModalConfirm("approval")}
                            disabled={resolvedTask.isPending}
                            type="submit"
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 border border-transparent rounded-md text-sm font-medium text-white cursor-pointer w-full sm:w-auto"
                        >
                            {resolvedTask.isPending ? (
                            <Spinner size="small" className="text-white" />
                            ) : lang == "vi" ? (
                                "Đã xử lý"
                            ) : (
                                "Resolved"
                            )}
                        </Button>
                    </div>

                    <div className="mt-6">
                        <HistoryApproval
                            historyApplicationForm={
                            formData?.applicationFormItem?.applicationForm
                                ?.historyApplicationForms
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignedFormIT;
