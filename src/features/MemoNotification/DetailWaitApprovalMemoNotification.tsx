import { useApproval } from '@/api/approvalApi';
import memoNotificationApi from '@/api/memoNotificationApi';
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

const DetailWaitApprovalMemoNotification: React.FC = () => {
    const [uploadedFiles, setUploadedFiles] = useState<{ id: string, fileName: string; contentType: string }[]>([]);
    const { id } = useParams<{ id: string }>();
    const { user } = useAuthStore()
    const [note, setNote] = useState("")
    const navigate = useNavigate()
    const queryClient = useQueryClient();
    const approval = useApproval();

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

    if (!memo) {
        return <div className="p-6">Đang tải...</div>
    }

    const handleApproval = async (status: boolean) => {
        try {
            await approval.mutateAsync({
                UserCodeApproval: user?.userCode,
                UserNameApproval: user?.userName ?? "",
                OrgUnitId: user?.orgUnitID,
                Status: status,
                Note: note,
                MemoNotificationId: id,
                urlFrontend: window.location.origin,
                RequestTypeId: memo.requestTypeId
            })
            navigate("/approval/pending-approval")
            queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0">Chi tiết chờ duyệt</h3>
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

            <div>
                <Label className='mb-1'>Ghi chú</Label>
                <Textarea placeholder='Note' value={note} onChange={(e) => setNote(e.target.value)}/>
            </div>

            <div>
                <div className="flex justify-end gap-4 mt-8">
                    <Button
                        onClick={() => handleApproval(true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-[3px] shadow-lg hover:bg-green-700 hover:shadow-xl transition-all duration-200 text-base hover:cursor-pointer"
                    >
                        Duyệt
                    </Button>
                    <Button
                        onClick={() => handleApproval(false)}
                        className="flex items-center justify-center hover:cursor-pointer px-8 py-4 bg-red-600 text-white rounded-[3px] shadow-lg hover:bg-red-700 hover:shadow-xl transform transition-all duration-200 text-base"
                    >
                        Từ Chối
                    </Button>
                </div>
            </div>
        </div>
    )
};

export default DetailWaitApprovalMemoNotification;