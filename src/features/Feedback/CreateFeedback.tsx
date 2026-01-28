/* eslint-disable @typescript-eslint/no-explicit-any */
import feedbackApi, { useCreateFeedback, useUpdateFeedback } from "@/api/feedbackApi";
import DotRequireComponent from "@/components/DotRequireComponent";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/authStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next"
import { Link, useNavigate, useParams } from "react-router-dom";
import { z } from "zod";

export const FeedbackSchema = z.object({
    content: z.string().min(1, 'Bắt buộc'),
    img: z.array(z.instanceof(File)).optional(),
    existingImgs: z
        .array(
            z.object({
                id: z.number(),
                fileName: z.string().nullable().optional(),
                contentType: z.string().nullable().optional(),
                createdAt: z.string().optional(),
            })
        )
        .optional(),
});

export type FeedbackState = z.infer<typeof FeedbackSchema>;

export default function CreateFeedback () {
    const { t: tCommon } = useTranslation('common')
    const lang = useTranslation().i18n.language.split('-')[0]
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const user = useAuthStore(u => u.user)
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;

    const { data: formDataDetail, isLoading: isFormDataLoading } = useQuery({
        queryKey: ['feedbackForm', id],
        queryFn: async () => {
            const res = await feedbackApi.getByCode(id ?? '');
            return res.data.data;
        },
        enabled: isEdit,
    });

    const createFb = useCreateFeedback()
    const updateFb = useUpdateFeedback()
    
    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        reset,
        setValue,
        watch,
        formState: { isSubmitting } 
    } = useForm<FeedbackState>({
        resolver: zodResolver(FeedbackSchema),
        defaultValues: {
            content: ''
        },
    });

    const onSubmit: SubmitHandler<FeedbackState> = async (data) => {
        const fd = new FormData();

        fd.append("UserCode", user?.userCode ?? '');
        fd.append("Content", data?.content ?? '');

        data?.img?.forEach((file: File) => {
            fd.append("Files", file);
        });

        if (isEdit) {
            await updateFb.mutateAsync({id: formDataDetail?.feedback?.id, data: fd})
        }
        else {
            await createFb.mutateAsync(fd)
        }

        navigate("/feedback/my-feedback")
        queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });
    }

    useEffect(() => {
        if (!isEdit) {
            reset({
                content: '',
                existingImgs: []
            })
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEdit])

    useEffect(() => {
        if (formDataDetail) {
            reset({
                content: formDataDetail?.feedback?.content,
                existingImgs: formDataDetail?.files ?? []
            })
        }        
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formDataDetail])

    if (isEdit && isFormDataLoading) {
        return <div>{lang == 'vi' ? 'Loading' : 'Đang tải'}...</div>;
    }

    if (isEdit && !formDataDetail) {
        return  <div className='text-red-700 font-semibold'>{lang == 'vi' ? 'Không tìm thấy dữ liệu' : 'Not found data'}</div>;
    }

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3 gap-2">
                <h3 className="font-bold text-2xl m-0 pb-1 text-center md:text-left">
                    {lang === 'vi' ? 'Hòm thư góp ý' : 'Feedback'}
                </h3>

                <div className="flex flex-col sm:flex-row gap-2">
                    <Link
                        to="/feedback/my-feedback"
                        className="bg-black text-white px-4 py-2 rounded-[5px] text-center hover:bg-gray-800 transition"
                    >
                        {lang === 'vi' ? 'Danh sách đã góp ý của tôi' : 'My Feedbacks'}
                    </Link>
                </div>
            </div>
            <div>
                <form onSubmit={handleSubmit(onSubmit, (error) => { console.log("Err:", error)})}>
                    <div className="form-group">
                        <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                            {lang == 'vi' ? 'Nhập nội dung muốn góp ý' : 'Feedback content'}<DotRequireComponent />
                        </label>
                        <textarea
                            id="reason"
                            {...register('content')}
                            placeholder={lang == 'vi' ? 'Nội dung' : 'Feedback content'}
                            rows={7}
                            className={`mt-1 w-full p-2 rounded-md text-sm border ${errors?.content ? 'border border-red-300 bg-red-100' : ''}`}
                        ></textarea>
                    </div>
                    <div className="my-3">
                        <Label className="mb-2">{lang == 'vi' ? 'Ảnh đính kèm (Nếu có)' : 'Attached image (if any)'}</Label>
                        <Controller
                            name={`img`}
                            control={control}
                            render={({ field }) => {
                                const imgs = field.value || [];
                                const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                                    const files = e.target.files;
                                    if (!files) return;

                                    field.onChange([...imgs, ...Array.from(files)]);
                                    e.target.value = '';
                                };

                                const handleRemoveFile = (i: number) => {
                                    field.onChange(imgs.filter((_, j) => j !== i));
                                };

                                return (
                                    <div>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            className="flex items-center gap-2 bg-orange-400 hover:bg-orange-500 mb-2 hover:cursor-pointer"
                                            onClick={() =>
                                                document.getElementById(`file-upload-img`)?.click()
                                            }
                                        >
                                            {lang == 'vi' ? 'Chọn' : 'Choose'}
                                        </Button>
                                        <input
                                            id={`file-upload-img`}
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />

                                        <div className="flex flex-wrap gap-2">
                                            {(watch(`existingImgs`) ?? []).map((f: any, i: number) => (
                                                <div key={`server-${f.id}`} className="relative">
                                                    <img
                                                        src={`${import.meta.env.VITE_API_URL}/file/get-file/${f.id}`}
                                                        alt={f.fileName}
                                                        className="w-20 h-20 object-cover rounded-md border cursor-pointer"
                                                        onClick={() =>
                                                            setPreviewImage(`${import.meta.env.VITE_API_URL}/file/get-file/${f.id}`)
                                                        }
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                        const cur = watch(`existingImgs`) || [];
                                                            setValue(
                                                                `existingImgs`,
                                                                cur.filter((_: any, j: number) => j !== i)
                                                            );
                                                        }}
                                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center cursor-pointer"
                                                    >
                                                        <X size={18} />
                                                    </button>
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
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveFile(i)}
                                                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            }}
                        />
                    </div>
                    <div className="flex justify-end">
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="cursor-pointer w-full sm:w-auto py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-base tracking-wide uppercase disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {tCommon('save')}
                        </button>
                    </div>
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
                </form>
            </div>
        </div>
    )
}