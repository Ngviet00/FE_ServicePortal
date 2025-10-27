/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@/components/ComponentCustom/Flatpickr';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import priorityApi from '@/api/priorityApi';
import itCategoryApi from '@/api/itCategoryApi';
import DotRequireComponent from '@/components/DotRequireComponent';
import itFormApi from '@/api/itFormApi';
import { Link, useNavigate, useParams } from 'react-router-dom';
import HistoryApproval from '../Approval/Components/HistoryApproval';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ITRequestForm from './Components/ITRequestForm';
import { useEffect, useState } from 'react';
import { FileListPreviewDownload, UploadedFileType } from '@/components/ComponentCustom/FileListPreviewMemoNotify';
import memoNotificationApi from '@/api/memoNotificationApi';
import { getErrorMessage, ShowToast } from '@/lib';

const ViewOnlyFormIT = () => {
    const { t } = useTranslation('formIT');
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isAssigned = !!id;
    const lang = useTranslation().i18n.language.split('-')[0];
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

    const { data: formData, isLoading: isFormDataLoading } = useQuery({
        queryKey: ['itForm', id],
        queryFn: async () => {
            const res = await itFormApi.getById(id ?? '');
            return res.data.data;
        },
        enabled: isAssigned,
        staleTime: 0
    });

    useEffect(() => {
        if (formData) {
            setUploadedFiles(formData?.applicationFormItem?.applicationForm?.files || []);
        }
    }, [formData]);

    const { data: priorities = [] } = useQuery({
        queryKey: ['get-all-priority'],
        queryFn: async () => {
            const res = await priorityApi.getAll();
            return res.data.data;
        },
    });

    const { data: ItCategories = [] } = useQuery({
        queryKey: ['get-all-it-category'],
        queryFn: async () => {
            const res = await itCategoryApi.getAll();
            return res.data.data;
        },
    });

    const { data: ItMembers = [] } = useQuery({
        queryKey: ['get-all-it-member'],
        queryFn: async () => {
            const res = await itFormApi.getMemberITAssigned();
            return res.data.data;
        },
    });

    const mode = 'view';
    const initialFormData = isAssigned ? formData : {};

    const handleDownloadFile = async (file: UploadedFileType) => {
        try {
            const result = await memoNotificationApi.downloadFile(file.id);
            const url = window.URL.createObjectURL(result.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.fileName;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            ShowToast(`Download file failed, ${getErrorMessage(err)}`, 'error');
        }
    };

    if (isAssigned && isFormDataLoading) {
        return <div>{lang == 'vi' ? 'Đang tải...' : 'Loading...'}</div>;
    }

    return (
        <div className="p-2 md:p-1 space-y-4">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0">
                    {t('list.title_view_form_it')}
                </h3>
                <Button
                    onClick={() => navigate('/form-it')}
                    className="w-full md:w-auto hover:cursor-pointer"
                >
                    {t('list.title')}
                </Button>
            </div>

            {formData?.applicationFormItem?.applicationForm?.reference?.code && (
                <div className="mb-4 mt-2 text-base text-black bg-orange-200 p-2 rounded">
                    <span>
                        {lang == 'vi'
                            ? 'Đơn IT này liên kết với đơn mua bán'
                            : 'The IT order linked to purchase order'}:{' '}
                        <Link
                            className="text-purple-600 font-bold underline"
                            to={`/view/purchase/${formData?.applicationFormItem?.applicationForm?.reference?.code}`}
                        >
                            {formData?.applicationFormItem?.applicationForm?.reference?.code}
                        </Link>
                    </span>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/2 bg-white rounded-xl p-1">
                    <ITRequestForm
                        mode={mode}
                        priorities={priorities}
                        itCategories={ItCategories}
                        formData={initialFormData}
                    />
                </div>

                <div className="w-full md:w-1/2 md:pl-5 border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0">
                    <div className="w-full mb-4">
                        <Label className="mb-1">
                            {t('create.note')}{' '}
                            <span className="italic text-red-500">(Manager IT)</span>
                        </Label>
                        <Textarea
                            readOnly
                            placeholder={t('create.note')}
                            value={formData?.noteManagerIT ?? ''}
                            className="bg-gray-100 border-gray-300"
                        />
                    </div>

                    {formData?.applicationFormItem?.applicationForm?.assignedTasks?.length > 0 && (
                        <div className="w-full mt-5">
                            <Label className="mb-1">{t('create.assigned')}</Label>
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
                                                    className="flex items-center space-x-2 cursor-pointer"
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
                    )}

                    {formData?.targetCompletionDate != null && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('create.target_completion_date')}
                                    <DotRequireComponent />
                                </label>
                                <DateTimePicker
                                    disabled
                                    enableTime={false}
                                    dateFormat="Y-m-d"
                                    initialDateTime={
                                        formData?.targetCompletionDate ??
                                        new Date().toISOString().split('T')[0]
                                    }
                                    onChange={() => {}}
                                    className="dark:bg-[#454545] w-full shadow-xs border border-gray-300 bg-gray-100 p-2 text-sm rounded-[5px] hover:cursor-pointer"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('create.actual_completion_date')}
                                    <DotRequireComponent />
                                </label>
                                <DateTimePicker
                                    disabled
                                    enableTime={false}
                                    dateFormat="Y-m-d"
                                    initialDateTime={
                                        formData?.actualCompletionDate ??
                                        new Date().toISOString().split('T')[0]
                                    }
                                    onChange={() => {}}
                                    className="dark:bg-[#454545] w-full shadow-xs border border-gray-300 bg-gray-100 p-2 text-sm rounded-[5px] hover:cursor-pointer"
                                />
                            </div>
                        </div>
                    )}

                    {/* Files */}
                    {formData?.applicationFormItem?.applicationForm?.files?.length > 0 && (
                        <div className="mt-4">
                            <Label className="mb-2 text-red-700 inline-block">
                                {lang == 'vi'
                                    ? 'Đính kèm file báo giá (nếu có)'
                                    : 'Attach quotation file (if any)'}
                            </Label>
                            <FileListPreviewDownload
                                onDownload={(file) => handleDownloadFile(file)}
                                uploadedFiles={uploadedFiles}
                                isShowCheckbox={false}
                            />
                        </div>
                    )}

                    <div className="mt-4">
                        <HistoryApproval
                            historyApplicationForm={
                                formData?.applicationFormItem?.applicationForm?.historyApplicationForms
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewOnlyFormIT;
