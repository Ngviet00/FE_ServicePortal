/* eslint-disable @typescript-eslint/no-explicit-any */
import feedbackApi, { useResponseFeedback } from "@/api/feedbackApi";
import DotRequireComponent from "@/components/DotRequireComponent";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom";
import { FeedbackSchema, FeedbackState } from "./CreateFeedback";
import { formatDate } from "@/lib/time";
import useHasRole from "@/hooks/useHasRole";
import { RoleEnum, ShowToast } from "@/lib";
import ModalConfirm from "@/components/ModalConfirm";

export default function ViewFeedback () {
    const { t } = useTranslation();
    const lang = useTranslation().i18n.language.split('-')[0]
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [contentResponse, setContentResponse] = useState('')
    const [statusModalConfirm, setStatusModalConfirm] = useState('')

    const { id } = useParams<{ id: string }>();
    const hasId = !!id;

    const { data: formDataDetail, isLoading: isFormDataLoading } = useQuery({
        queryKey: ['feedbackForm', id],
        queryFn: async () => {
            const res = await feedbackApi.getByCode(id ?? '');
            return res.data.data;
        },
        enabled: hasId,
    });
    
    const {
        register,
        formState: { errors },
        control,
        reset,
        watch,
    } = useForm<FeedbackState>({
        resolver: zodResolver(FeedbackSchema),
        defaultValues: {
            content: ''
        },
    });

    const isHR = useHasRole([RoleEnum.HR])

    useEffect(() => {
        if (formDataDetail) {
            reset({
                content: formDataDetail?.feedback?.content,
                existingImgs: formDataDetail?.files ?? []
            })

            if (formDataDetail?.feedback?.feedbackResponse?.responseContent) {
                setContentResponse(
                    formDataDetail.feedback.feedbackResponse.responseContent
                );
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formDataDetail])

    const responseFeedback = useResponseFeedback()
    const handleSaveModalConfirm = async () => {
        setStatusModalConfirm('')
        if (contentResponse.trim() == '') {
            ShowToast(lang == 'vi' ? 'Chưa nhập nội dung phản hồi' : 'Please input response', 'error')
            return
        }

        const payload = {
            feedbackId: formDataDetail?.feedback?.id,
            contentResponse: contentResponse
        }

        await responseFeedback.mutateAsync(payload)

        navigate("/feedback/pending-response")
        queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });
    }

    if (hasId && isFormDataLoading) {
        return <div>{lang == 'vi' ? 'Loading' : 'Đang tải'}...</div>;
    }

    if (hasId && !formDataDetail) {
        return  <div className='text-red-700 font-semibold'>{lang == 'vi' ? 'Không tìm thấy dữ liệu' : 'Not found data'}</div>;
    }

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex justify-between mb-1">
                <h3 className="font-bold text-2xl m-0 pb-2">{lang == 'vi' ? 'Chi tiết thư góp ý' : 'Detail feedback'}</h3>
            </div>
            <ModalConfirm
                type={statusModalConfirm}
                isOpen={statusModalConfirm != ''}
                onClose={() => setStatusModalConfirm('')}
                onSave={handleSaveModalConfirm}
            />
            <div>
                <div>
                    <div className="form-group">
                        <div className="mb-2 flex">
                            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                                {t('feedback.list.created_at')}: 
                            </label>
                            <span className="ml-2 block text-sm font-medium text-gray-700">{formatDate(formDataDetail?.feedback?.createdAt, 'yyyy-MM-dd HH:mm:ss')}</span>
                        </div>
                        <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                            {lang == 'vi' ? 'Nội dung góp ý' : 'Feedback content'}<DotRequireComponent />
                        </label>
                        <textarea
                            id="reason"
                            disabled
                            {...register('content')}
                            placeholder={lang == 'vi' ? 'Nội dung' : 'Feedback content'}
                            rows={7}
                            className={`mt-1 w-full p-2 rounded-md text-sm border ${errors?.content ? 'border border-red-300 bg-red-100' : ''} bg-gray-100`}
                        ></textarea>
                    </div>

                    <div className="my-3">
                        <Label className="mb-2">{lang == 'vi' ? 'Ảnh đính kèm (Nếu có)' : 'Attached image (if any)'}</Label>
                        <Controller
                            name={`img`}
                            control={control}
                            render={({ field }) => {
                                const imgs = field.value || [];
                                return (
                                    <div>
                                        <div className="flex flex-wrap gap-2">
                                            {(watch(`existingImgs`) ?? []).map((f: any) => (
                                                <div key={`server-${f.id}`} className="relative">
                                                    <img
                                                        src={`${import.meta.env.VITE_API_URL}/file/get-file/${f.id}`}
                                                        alt={f.fileName}
                                                        className="w-20 h-20 object-cover rounded-md border cursor-pointer"
                                                        onClick={() =>
                                                            setPreviewImage(`${import.meta.env.VITE_API_URL}/file/get-file/${f.id}`)
                                                        }
                                                    />
                                                </div>
                                            ))}
                                            {imgs.map((file: File, i: number) => {
                                                const url = URL.createObjectURL(file);
                                                return (
                                                    <div key={i} className="relative">
                                                        <img
                                                            src={url}
                                                            alt={file.name}
                                                            className="w-20 h-20 object-cover rounded-md border cursor-pointer"
                                                            onClick={() => setPreviewImage(url)}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            }}
                        />
                    </div>
                    {
                        (formDataDetail?.feedback?.feedbackResponse != null || (formDataDetail?.feedback?.feedbackResponse == null && isHR)) && 
                        <>
                            <hr className="py-2 mt-4" />
                            <div>
                                {
                                    formDataDetail?.feedback?.feedbackResponse?.respondedAt && 
                                    <div className="mb-2 flex">
                                        <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                                            {t('feedback.view.response_at')}: 
                                        </label>
                                        <span className="ml-2 block text-sm font-medium text-gray-700">{formatDate(formDataDetail?.feedback?.feedbackResponse?.respondedAt, 'yyyy-MM-dd HH:mm:ss')}</span>
                                    </div>
                                }
                                <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                                    {lang == 'vi' ? 'Nội dung phản hồi' : 'Feedback response'}<DotRequireComponent />
                                </label>
                                <textarea
                                    id="reason"
                                    value={contentResponse ?? ''}
                                    disabled={formDataDetail?.feedback?.feedbackResponse != null}
                                    onChange={(e) => setContentResponse(e.target.value)}
                                    placeholder={lang == 'vi' ? 'Nội dung' : 'Feedback response'}
                                    rows={7}
                                    className={`mt-1 w-full p-2 rounded-md text-sm border ${formDataDetail?.feedback?.feedbackResponse != null ? 'bg-gray-100' : ''}`}
                                />
                            </div>
                        </>
                    }
                    {
                        isHR && formDataDetail?.feedback?.feedbackResponse == null && 
                        <div className="flex justify-end mt-1">
                            <button 
                                onClick={() => setStatusModalConfirm('confirm')}
                                disabled={responseFeedback.isPending}
                                className="cursor-pointer w-full sm:w-auto py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-base tracking-wide uppercase disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {t('feedback.view.btn_response')}
                            </button>
                        </div>
                    }
                    <div>
                        {previewImage && <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-999" onClick={() => setPreviewImage(null)}>
                            <img
                                src={previewImage}
                                alt="preview"
                                className="max-h-[90vh] max-w-[90vw] rounded-md shadow-lg"
                                />
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}