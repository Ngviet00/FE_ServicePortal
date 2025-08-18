/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { formatDate } from '@/lib/time'
import { FileListPreviewDownload, UploadedFileType } from '@/components/ComponentCustom/FileListPreviewMemoNotify'
import { getErrorMessage, ShowToast } from '@/lib'
import { useQuery } from '@tanstack/react-query'
import memoNotificationApi from '@/api/memoNotificationApi'

export default function DetailMemoNotification() {
    const [uploadedFiles, setUploadedFiles] = useState<{ id: string, fileName: string; contentType: string }[]>([]);
    const { id } = useParams<{ id: string }>();

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

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
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
                        { memo.applyAllDepartment == true ? "Tất cả bộ phận" : memo?.memoNotificationDepartments?.map((item: { orgUnit: { name: any; }; }) => item?.orgUnit?.name)?.join(', ') }
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
    )
}
