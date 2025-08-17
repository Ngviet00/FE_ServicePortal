import { useApproval } from '@/api/approvalApi';
import { FileListPreviewDownload, UploadedFileType } from '@/components/ComponentCustom/FileListPreviewMemoNotify';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getErrorMessage, ShowToast } from '@/lib';
import { formatDate } from '@/lib/time';
import { useAuthStore } from '@/store/authStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HistoryApproval from '../Approval/Components/HistoryApproval';
import ModalConfirm from '@/components/ModalConfirm';
import memoNotificationApi from '@/api/memoNotificationApi';

const DetailWaitApprovalMemoNotification: React.FC = () => {
    const { t } = useTranslation();
    const [uploadedFiles, setUploadedFiles] = useState<{ id: string, fileName: string; contentType: string }[]>([]);
    const { id } = useParams<{ id: string }>();
    const { user } = useAuthStore()
    const [note, setNote] = useState("")
    const navigate = useNavigate()
    const queryClient = useQueryClient();
    const approval = useApproval();
    const [statusModalConfirm, setStatusModalConfirm] = useState('')

    const { data: memo } = useQuery({
        queryKey: ['get-detail-memo-notify'],
        queryFn: async () => {
            const res = await memoNotificationApi.getById(id!);
            setUploadedFiles(res?.data?.data?.files || []);
            return res.data.data;
        },
        enabled: id != null || id != undefined
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
            ShowToast(`Download file failed,${getErrorMessage(err)}`, "error")
        }
    }

    const handleSaveModalConfirm = async (type: string) => {
        const payload = {
            UserCodeApproval: user?.userCode,
            UserNameApproval: user?.userName ?? "",
            OrgPositionId: user?.orgPositionId,
            Status: type == 'approval' ? true : false,
            Note: note,
            MemoNotificationId: id,
            urlFrontend: window.location.origin,
            RequestTypeId: memo?.applicationForm?.requestTypeId
        }

        try {
            await approval.mutateAsync(payload)
            setStatusModalConfirm('')
            navigate("/approval/pending-approval")
            queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });

        } catch (err) {
            console.log(err);
        }
    }

    if (!memo) {
        return <div className="p-6">Đang tải...</div>
    }

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0">{t('title_wait_approval')}</h3>
            </div>

            <div className="p-4 mt-2 space-y-4 border rounded-[3px] border-gray-200">
                <h2 className="text-[24px] sm:text-[30px] font-bold mb-1">{memo.title}</h2>
                <div className="text-sm text-gray-600 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className='dark:text-white'>
                        Created by: <span className="font-bold text-black dark:text-white">{memo.createdBy}</span>
                    </span>
                    <span className='dark:text-white'>•</span>
                    <span className='dark:text-white'>
                        Created At:{" "}
                        <span className="font-bold text-black dark:text-white">
                            {formatDate(memo.createdAt, "yyyy/MM/dd HH:mm:ss")}
                        </span>
                    </span>
                    <span className='dark:text-white'>•</span>
                    <span className='dark:text-white'>
                        Department apply: {" "}
                        <span className="font-bold text-black dark:text-white">
                            { memo.applyAllDepartment == true ? "Tất cả bộ phận" : memo.departmentNames }
                        </span>
                    </span>
                </div>

                <div>
                    <FileListPreviewDownload onDownload={(file) => {handleDownloadFile(file)}} uploadedFiles={uploadedFiles}/>
                </div>

                <div className="w-full overflow-x-auto">
                    <div
                        className="text-left text-gray-800 leading-relaxed prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: memo.content }}
                    />
                </div>
            </div>

            <HistoryApproval historyApplicationForm={memo?.applicationForm?.historyApplicationForms[0]}/>

            <div>
                <Label className='mb-1'>{t('note')}</Label>
                <Textarea placeholder='Note' value={note} onChange={(e) => setNote(e.target.value)}/>
            </div>

            <ModalConfirm
                type={statusModalConfirm}
                isOpen={statusModalConfirm != ''}
                onClose={() => setStatusModalConfirm('')}
                onSave={handleSaveModalConfirm}
            />

            <div>
                <div className="flex justify-end gap-4 mt-8">
                    <Button
                        onClick={() => setStatusModalConfirm('approval')}
                        className="px-4 py-2 bg-blue-700 text-white rounded-[3px] shadow-lg hover:bg-blue-800 hover:shadow-xl transition-all duration-200 text-base hover:cursor-pointer"
                    >
                        {t('approval')}
                    </Button>
                    <Button
                        onClick={() => setStatusModalConfirm('reject')}
                        className="flex items-center justify-center hover:cursor-pointer px-8 py-4 bg-red-600 text-white rounded-[3px] shadow-lg hover:bg-red-700 hover:shadow-xl transform transition-all duration-200 text-base"
                    >
                        {t('reject')}
                    </Button>
                </div>
            </div>
        </div>
    )
};

export default DetailWaitApprovalMemoNotification;