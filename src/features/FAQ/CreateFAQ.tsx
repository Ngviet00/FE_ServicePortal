import React, { useEffect } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import QuillEditorCDN from "@/components/QuillEditorCDN";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import faqGroupApi, { FAQGroup } from "@/api/faqGroupApi";
import faqApi, { FAQ, useCreateFAQ, useUpdateFAQ } from "@/api/faqApi";
import { Spinner } from "@/components/ui/spinner";

export const CreateFAQ: React.FC = () => {
    const lang = useTranslation().i18n.language.split("-")[0]
    const user = useAuthStore((u) => u.user)
    const navigate = useNavigate()
    const { id } = useParams()
    const isEditMode = !!id
    const createFAQ = useCreateFAQ()
    const updateFAQ = useUpdateFAQ()

    const { data: faqGroups = [], isLoading: isLoadingFAQGroups } = useQuery({
        queryKey: ['list-faq'],
        queryFn: async () => {
            const res = await faqGroupApi.getAll({
                page: 1,
                pageSize: 200
            })
            return res.data.data;
        },
    });

    const { data: faqDetail, isLoading: isLoading } = useQuery<FAQ>({
        queryKey: ['faq-detail', id],
        queryFn: async () => {
            const res = await faqApi.getById(Number(id ?? -1));
            return res.data.data;
        },
        enabled: isEditMode && !!id && !isLoadingFAQGroups
    });

    const faqSchema = z.object({
        id: z.number().nullable().optional(),
        question: z.string().min(1, "Bắt buộc"),
        questionV: z.string().min(1, "Bắt buộc"),
        answer: z.string().min(1, "Bắt buộc"),
        answerV: z.string().min(1, "Bắt buộc"),
        faqGroupId: z.string().min(1, "Bắt buộc"),
    });

    type FAQFormData = z.infer<typeof faqSchema>;

    const form = useForm<FAQFormData>({
        resolver: zodResolver(faqSchema),
        defaultValues: {
            question: '',
            questionV: '',
            answer: '',
            answerV: '',
            faqGroupId: ''
        },
    })
    const { register, handleSubmit, control, setValue, formState: { errors } } = form;

    useEffect(() => {
        if (faqDetail) {
            setValue("question", faqDetail?.question ?? '');
            setValue("questionV", faqDetail?.questionV ?? '');
            setValue("faqGroupId", String(faqDetail?.faqGroupId ?? ''));
            setValue("answerV", faqDetail?.answerV ?? '');
            setValue("answer", faqDetail?.answer ?? '');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [faqDetail])

    const onSubmit: SubmitHandler<FAQFormData> = async (data) => {
        const payload = {
            question: data.question,
            questionV: data.questionV,
            answer: data.answer,
            answerV: data.answerV,
            faqGroupId: Number(data.faqGroupId),
            role: 'HR',
            CreatedBy: user?.userCode
        }

        await (isEditMode ? updateFAQ.mutateAsync({ id: Number(id), data: payload }) : createFAQ.mutateAsync(payload));

        navigate(`/mng-faq`);
    };

    if (isEditMode && isLoading) {
        return <div>{lang === "vi" ? "Đang tải..." : "Loading..."}</div>;
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="p-1 space-y-6 max-w-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-1">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    FAQ
                </h2>
            </div>

            <div className="w-[40%] mr-3 mb-3">
                <Label htmlFor="title" className="mb-1">{lang == 'vi' ? 'Câu hỏi bằng tiếng anh' : 'Question by english'}</Label>
                <Input
                    id="title"
                    {...register("question")}
                    placeholder='...'
                    className={`w-full ${errors.question ? "border-red-500" : ""}`}
                />
                {errors.question && <p className="text-red-500 text-sm">{errors.question.message}</p>}
            </div>
            <div className="w-[40%]">
                <Label htmlFor="title" className="mb-1">{lang == 'vi' ? 'Câu hỏi bằng tiếng Việt' : 'Question by vietnamese'}</Label>
                <Input
                    id="title"
                    {...register("questionV")}
                    placeholder='...'
                    className={`w-full ${errors.questionV ? "border-red-500" : ""}`}
                />
                {errors.questionV && <p className="text-red-500 text-sm">{errors.questionV.message}</p>}
            </div>

            <div>
                <Label htmlFor="faqGroup" className="mb-1">{lang == 'vi' ? 'Nhóm FAQ' : 'FAQ Group'}</Label>
                <select {...register("faqGroupId")} className={`p-2 text-sm border rounded hover:cursor-pointer w-full ${errors?.faqGroupId ? "border-red-500 bg-red-50" : "border-gray-300"}`}>
                    <option value="">{lang == 'vi' ? '--Chọn--' : '--Choose--'}</option>
                    {faqGroups?.map((item: FAQGroup) => (
                        <option key={item.id} value={item.id ?? -1}>
                            {lang == "vi" ? item?.titleV : item?.title }
                        </option>
                    ))}
                </select>
            </div>

            <div className="my-3">
                <Label className="mb-2">{lang == 'vi' ? 'Trả lời tiếng anh' : 'Answer by english'}</Label>
                <Controller
                    control={control}
                    name='answer'
                    render={({ field }) => (
                        <div className={`${errors.answer ? 'border border-red-500' : ''}`}>
                            <QuillEditorCDN
                                initialContent={field.value || ""}
                                onChange={field.onChange}
                                height={250}
                            />
                        </div>
                    )}
                />
            </div>

            <div className="my-3 ">
                <Label className="mb-2">{lang == 'vi' ? 'Trả lời tiếng Việt' : 'Answer by vietnamese'}</Label>
                <Controller
                    control={control}
                    name="answerV"
                    render={({ field }) => (
                        <div className={`${errors.answerV ? 'border border-red-500' : ''}`}>
                            <QuillEditorCDN
                                initialContent={field.value || ""}
                                onChange={field.onChange}
                                height={250}
                            />
                        </div>
                    )}
                />
            </div>

            <div className="pt-8 flex justify-end">
                <Button
                    disabled={createFAQ.isPending || updateFAQ.isPending}
                    type="submit"
                    className="bg-primary text-white px-6 rounded-md cursor-pointer hover:cursor-pointer w-full md:w-auto"
                >
                    {createFAQ.isPending || updateFAQ.isPending ? <Spinner /> : (lang == 'vi' ? 'Xác nhận' : 'Submit')}
                </Button>
            </div>
        </form>
    );
};
