/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useForm, Controller, SubmitHandler, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import DateTimePicker from "@/components/ComponentCustom/Flatpickr";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { X } from "lucide-react";
import QuillEditorCDN from "@/components/QuillEditorCDN";
import { useCreateVote, useUpdateVote, useGetVoteById } from "@/api/voteApi";
import { Spinner } from "@/components/ui/spinner";
import { getVietnamTime } from "@/lib/time";
import { useAuthStore } from "@/store/authStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ShowToast } from "@/lib";
import orgUnitApi from "@/api/orgUnitApi";
import { MultiSelect } from "react-multi-select-component";

export const CreateVote: React.FC = () => {
    const { t } = useTranslation("vote");
    const lang = useTranslation().i18n.language.split("-")[0];
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const createVote = useCreateVote();
    const updateVote = useUpdateVote();
    const user = useAuthStore((u) => u.user);
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [searchParams] = useSearchParams();
	const roleCode = searchParams.get("role");

    const { data: voteDetail, isLoading: isLoadingVote } = useGetVoteById(Number(id));

    const optionSchema = z.object({
        id: z.number().nullable().optional(),
        title: z.string().min(1, "Bắt buộc"),
        note: z.string().optional(),
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

    const voteSchema = z.object({
        title: z.string().min(1, "Bắt buộc"),
        note: z.string().optional(),
        departments: z.array(z.number()).nonempty({ message: "Required" }),
        dateRange: z.object({
            from: z.date(),
            to: z.date(),
        }),
        publishDate: z.string(),
        options: z.array(optionSchema).min(1, "Phải có ít nhất 1 option"),
    });

    type VoteFormData = z.infer<typeof voteSchema>;

    const {
        control,
        handleSubmit,
        register,
        setValue,
        watch,
        formState: { errors },
        reset
    } = useForm<VoteFormData>({
        resolver: zodResolver(voteSchema),
        defaultValues: {
            title: "",
            note: "",
            departments: [] as number[],
            dateRange: {
                from: new Date(),
                to: new Date(),
            },
            publishDate: new Date().toISOString().slice(0, 10),
            options: [{ title: "", note: "", img: [], existingImgs: [] }],
        },
    });

    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: "options",
    });

    const { data: departments = [] } = useQuery({
        queryKey: ['get-all-department'],
        queryFn: async () => {
            const res = await orgUnitApi.GetAllDepartment()
            return res.data.data.map((dept: {id: number, name: string}) => ({
                value: dept.id,
                label: dept.name,
            }));
        },
    });

    useEffect(() => {
        if (voteDetail?.data) {
            const v = voteDetail.data;
            setValue("title", v.title || "");

            const selectedDepartments = v.isGlobalCompany ? departments.map((opt: {value: string}) => opt.value) : v?.departmentApplies?.map((item: { id: any; }) => item?.id);
            setValue("departments", selectedDepartments);

            setValue("note", v.description || "");
            setValue("publishDate", v.datePublish?.split("T")[0] || "");
            setValue("dateRange", {
                from: new Date(v.startDate),
                to: new Date(v.endDate),
            });

            const mappedOptions = v.voteOptions.map((opt: any) => ({
                id: opt.id,
                title: opt?.title ?? '',
                note: opt?.description ?? '',
                img: [],
                existingImgs: opt.files || [],
            }));

            replace(mappedOptions);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [voteDetail, setValue, replace]);

    useEffect(() => {
        if (!id) { 
            reset({
                title: "",
                note: "",
                dateRange: {
                    from: new Date(),
                    to: new Date(),
                },
                publishDate: new Date().toISOString().slice(0, 10),
                options: [{ title: "", note: "", img: [], existingImgs: [] }],
            });
        }
    }, [id, reset]);

    const addOption = () => {
        append({ title: "", note: "", img: [], existingImgs: [] });
    };

    const removeOption = (index: number) => {
        remove(index);
    };

    const onSubmit: SubmitHandler<VoteFormData> = async (data) => {
        const toDateOnly = (d: Date | string) => {
            const date = new Date(d);
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        };

        if (toDateOnly(data.publishDate) > toDateOnly(data.dateRange.from)) {
            ShowToast('Ngày phát hành phải trước hoặc bằng ngày bắt đầu', 'error');
            return;
        }

        const formDataSend = new FormData();

        formDataSend.append("Title", data.title);
        formDataSend.append("Description", data.note || "");
        formDataSend.append("DatePublish", data.publishDate);
        formDataSend.append("StartDate", String(getVietnamTime("iso", data.dateRange.from)));
        formDataSend.append("EndDate", String(getVietnamTime("iso", data.dateRange.to)));
        formDataSend.append("CreatedBy", user?.userName ?? "");
        formDataSend.append("UserCode", user?.userCode ?? "");
        formDataSend.append("CreateRoleCode", roleCode ?? '');
        formDataSend.append("IsGlobalCompany", String(data.departments.length == departments.length));

        if (data.departments.length != departments.length) {
            data.departments.forEach(id => {
                formDataSend.append("DepartmentApplies[]", String(id))
            })
        }

        data.options.forEach((opt, idx) => {
            formDataSend.append(`VoteOptionRequests[${idx}].Id`, opt?.id?.toString() ?? "");
            formDataSend.append(`VoteOptionRequests[${idx}].Title`, opt.title);
            formDataSend.append(`VoteOptionRequests[${idx}].Description`, opt.note || "");

            if (opt.img && opt.img.length > 0) {
                opt.img.forEach((file) => {
                    formDataSend.append(`VoteOptionRequests[${idx}].Files`, file, file.name);
                });
            }

            if (opt.existingImgs && opt.existingImgs.length > 0) {
                opt.existingImgs.forEach((f) => {
                    formDataSend.append(`VoteOptionRequests[${idx}].ExistingFileIds`, f.id.toString());
                });
            }
        });

        await (isEditMode
            ? updateVote.mutateAsync({ id: Number(id), data: formDataSend })
            : createVote.mutateAsync(formDataSend));

        navigate(`/vote?role=${roleCode}`);
        queryClient.invalidateQueries({ queryKey: ["count-wait-approval-sidebar"] });
    };

    if (isEditMode && isLoadingVote) {
        return <div>{lang === "vi" ? "Đang tải..." : "Loading..."}</div>;
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="p-1 space-y-6 max-w-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-1">
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                    {t("create.title_page")}
                </h2>
            	<button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition hover:cursor-pointer">
                    <Link to={`/vote?role=${roleCode}`}>{t("list.title")}</Link>
				</button>
			</div>

            <div className="space-y-2">
                <Label htmlFor="title">{t("create.title")}</Label>
                <Input
                    id="title"
                    {...register("title")}
                    placeholder={t("create.title")}
                    className={`w-full ${errors.title ? "border-red-500" : ""}`}
                />
                {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="note">{t("create.description")}</Label>
                <Textarea
                    id="note"
                    {...register("note")}
                    placeholder={t("create.description")}
                    className="w-full min-h-[80px]"
                />
            </div>

            <div>
                <Label className="mb-2">{t("create.department_apply")}</Label>
                <Controller
                    control={control}
                    name="departments"
                    render={({ field, fieldState }) => {
                        const selectedOptions = departments.filter((opt: {value: number}) => field.value?.includes(opt.value));
                        return (
                            <div className={fieldState.invalid ? "border border-red-500 rounded-[5px]" : ""}>
                                <MultiSelect
                                    className="dark:text-black"
                                    options={departments}
                                    value={selectedOptions}
                                    onChange={(selected: any[]) => {
                                        const values = selected.map(option => option.value);
                                        field.onChange(values);
                                    }}
                                    labelledBy="Select"
                                    hasSelectAll={true}
                                    overrideStrings={{
                                        selectSomeItems: "Chọn phòng ban...",
                                        search: "Tìm kiếm...",
                                        clearSearch: "Xoá tìm kiếm",
                                        noOptions: "Không có phòng ban nào",
                                        allItemsAreSelected: "Tất cả phòng ban",
                                    }}
                                    valueRenderer={(selected: any[]) => {
                                        if (selected.length === 0) return "Chọn phòng ban...";
                                        if (selected.length >= 8) return `Đã chọn ${selected.length}`;
                                        return selected.map(s => s.label).join(", ");
                                    }}
                                />
                            </div>
                        )
                    }}
                />
            </div>

            <div className="flex flex-col md:flex-row md:items-end md:space-x-6 gap-y-4">
                <div className="flex-1 space-y-2">
                <Label>{t("create.publish_date")}</Label>
                <Controller
                    control={control}
                    name="publishDate"
                    render={({ field }) => (
                        <DateTimePicker
                            enableTime={true}
                            dateFormat="Y-m-d"
                            initialDateTime={field.value}
                            onChange={(_s, dateStr) => field.onChange(dateStr)}
                            className="dark:bg-[#454545] shadow-xs text-sm border rounded border-gray-300 p-2 w-full"
                        />
                    )}
                />
                </div>

                <div className="flex-1 space-y-2">
                    <Label>{t("create.date_range")}</Label>
                    <Controller
                        control={control}
                        name="dateRange"
                        render={({ field }) => {
                        const from = field.value?.from;
                        const to = field.value?.to;
                        const key = from?.toISOString() + to?.toISOString();
                            return (
                                <DateRangePicker
                                    key={key}
                                    initialDateFrom={field.value.from}
                                    initialDateTo={field.value.to}
                                    onUpdate={({ range }) => field.onChange(range)}
                                    align="start"
                                    locale="vi-VN"
                                    showCompare={false}
                                />
                            );
                        }}
                    />
                </div>
            </div>

            <div className="mt-6">
                <div className="flex flex-wrap justify-between items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-800">
                    {t("create.option")}
                </h3>
                <Button
                    variant="outline"
                    type="button"
                    onClick={addOption}
                    className="cursor-pointer"
                >
                    + {t("create.add_options")}
                </Button>
                </div>

                <div className="space-y-4 mt-3">
                {fields.map((field, idx) => (
                    <div
                    key={field.id}
                    className="border rounded-lg p-4 bg-gray-50 transition w-full"
                    >
                    <div className="flex justify-between items-center mb-2 flex-wrap gap-y-2">
                        <Label className="font-semibold text-red-500 text-lg">
                        {t("create.option")} #{idx + 1}
                        </Label>
                        {fields.length > 1 && (
                        <Button
                            variant="destructive"
                            size="sm"
                            type="button"
                            onClick={() => removeOption(idx)}
                            className="cursor-pointer"
                        >
                            <X />
                        </Button>
                        )}
                    </div>

                    <Input
                        placeholder={t("create.title")}
                        className={`w-full ${errors.options?.[idx]?.title ? "border-red-500" : ""}`}
                        {...register(`options.${idx}.title` as const)}
                    />
                    {errors.options?.[idx]?.title && (
                        <p className="text-red-500 text-sm mt-1">
                        {errors.options[idx]?.title?.message}
                        </p>
                    )}

                    <div className="my-3">
                        <Label className="mb-2">{t("create.description")}</Label>
                        <Controller
                        control={control}
                        name={`options.${idx}.note` as const}
                        render={({ field }) => (
                            <QuillEditorCDN
                            initialContent={field.value || ""}
                            onChange={field.onChange}
                            height={250}
                            />
                        )}
                        />
                    </div>

                    <div className="my-3">
                        <Label className="mb-2">{t("create.img_option")}</Label>
                        <Controller
                        name={`options.${idx}.img` as const}
                        control={control}
                        render={({ field }) => {
                            const imgs = field.value || [];
                            const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                            const files = e.target.files;
                            if (!files) return;
                            field.onChange([...imgs, ...Array.from(files)]);
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
                                    document.getElementById(`file-upload-${idx}`)?.click()
                                }
                                >
                                📸 {t("create.img_option")}
                                </Button>
                                <input
                                id={`file-upload-${idx}`}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                                className="hidden"
                                />

                                {/* preview ảnh */}
                                <div className="flex flex-wrap gap-2">
                                {(watch(`options.${idx}.existingImgs`) ?? []).map((f: any, i: number) => (
                                    <div key={`server-${f.id}`} className="relative">
                                    <img
                                        src={`${import.meta.env.VITE_API_URL}/vote/get-file/${f.id}`}
                                        alt={f.fileName}
                                        className="w-20 h-20 object-cover rounded-md border cursor-pointer"
                                        onClick={() =>
                                        setPreviewImage(`${import.meta.env.VITE_API_URL}/vote/get-file/${f.id}`)
                                        }
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                        const cur = watch(`options.${idx}.existingImgs`) || [];
                                        setValue(
                                            `options.${idx}.existingImgs`,
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
                    </div>
                ))}
                </div>
            </div>

            <div className="pt-3 flex justify-end">
                <Button
                disabled={createVote.isPending || updateVote.isPending}
                type="submit"
                className="bg-primary text-white px-6 rounded-md cursor-pointer w-full md:w-auto"
                >
                {createVote.isPending || updateVote.isPending ? <Spinner /> : t("create.save")}
                </Button>
            </div>

            {previewImage && (
                <div
                className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-999"
                onClick={() => setPreviewImage(null)}
                >
                <img
                    src={previewImage}
                    alt="preview"
                    className="max-h-[90vh] max-w-[90vw] rounded-md shadow-lg"
                />
                </div>
            )}
        </form>
    );
};
