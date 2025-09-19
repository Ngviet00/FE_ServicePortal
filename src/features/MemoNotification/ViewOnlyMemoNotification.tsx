/* eslint-disable @typescript-eslint/no-explicit-any */
import { FileListPreviewDownload, UploadedFileType } from '@/components/ComponentCustom/FileListPreviewMemoNotify';
import { getErrorMessage, ShowToast } from '@/lib';
import { formatDate } from '@/lib/time';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useParams } from 'react-router-dom';
import React, { useState } from 'react';
import HistoryApproval from '../Approval/Components/HistoryApproval';
import memoNotificationApi from '@/api/memoNotificationApi';
import { useTranslation } from 'react-i18next';

const ViewOnlyMemoNotification: React.FC = () => {
    const { t } = useTranslation();
    const lang = useTranslation().i18n.language.split('-')[0]
    const [uploadedFiles, setUploadedFiles] = useState<{ id: string, fileName: string; contentType: string }[]>([]);
    const { id } = useParams<{ id: string }>();

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const isDislayInHomePage = searchParams.get("locate") == 'home';

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
        return <div className="p-6">{lang == 'vi' ? 'Đang tải' : 'Loading'}...</div>
    }

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0">{lang == 'vi' ? 'Chi tiết thông báo' : 'Detail memo notification'}</h3>
            </div>

            <div className={`p-1 mt-2 space-y-4 ${isDislayInHomePage ? 'pl-0' : 'p-4 border'}  rounded-[3px] border-gray-200`}>
                <h2 className="text-[24px] sm:text-[30px] font-bold mb-1">{memo.title}</h2>
                <div className="text-sm text-gray-600 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className='dark:text-white'>
                        {t('memo_notification.list.created_by')}: <span className="font-bold text-black dark:text-white">{memo?.applicationFormItem?.applicationForm?.createdBy}</span>
                    </span>
                    <span className='dark:text-white'>•</span>
                    <span className='dark:text-white'>
                       {t('memo_notification.list.created_at')}:{" "}
                        <span className="font-bold text-black dark:text-white">
                            {formatDate(memo.createdAt, "yyyy/MM/dd HH:mm:ss")}
                        </span>
                    </span>
                    <span className='dark:text-white'>•</span>
                    <span className='dark:text-white'>
                        {t('memo_notification.list.display')}:{" "}
                        <span className="font-bold text-black dark:text-white">
                            {formatDate(memo.fromDate, "yyyy-MM-dd")} ___ {formatDate(memo.toDate, "yyyy-MM-dd")}
                        </span>
                    </span>
                    <span className='dark:text-white'>•</span>
                    <span className='dark:text-white'>
                        {t('memo_notification.list.department_apply')}: {" "}
                        <span className="font-bold text-black dark:text-white">
                            { memo.applyAllDepartment == true ? lang == 'vi' ? 'Tất cả bộ phận' : 'All department' : memo?.memoNotificationDepartments?.map((item: { orgUnit: { name: any; }; }) => item?.orgUnit?.name)?.join(', ') }
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
            {
                !isDislayInHomePage && (<HistoryApproval historyApplicationForm={memo?.applicationFormItem?.applicationForm?.historyApplicationForms}/>)
            }
        </div>
    )
};

export default ViewOnlyMemoNotification;