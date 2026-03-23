/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Link, useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import memoNotificationApi, { useCreateMemoNotification, useUpdateMemoNotification } from "@/api/memoNotificationApi";
import { useAuthStore } from "@/store/authStore";
import { getVietnamTime } from "@/lib/time";
import { getErrorMessage, ShowToast } from "@/lib";
import { useTranslation } from "react-i18next";
import { MultiSelect } from "react-multi-select-component";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import QuillEditorCDN from "@/components/QuillEditorCDN";
import DotRequireComponent from "@/components/DotRequireComponent";
import FileListPreview from "@/components/ComponentCustom/FileListPreviewMemoNotify";
import systemConfigApi from "@/api/systemConfigApi";
import useHasPermission from "@/hooks/useHasPermission";
import orgUnitApi from "@/api/orgUnitApi";
import { Checkbox } from "@/components/ui/checkbox";

const isQuillContentEmpty = (html: string) => {
    const text = html.replace(/<[^>]*>/g, "").trim(); 
    return text === "";
};

const formSchema = z.object({
    title: z.string().nonempty({ message: "Required" }),
    content: z.string().refine(val => !isQuillContentEmpty(val), {
        message: "Required",
    }),
    departments: z.array(z.number()).nonempty({ message: "Required" }),
    dateRange: z.object({
        from: z.date(),
        to: z.date(),
    }),
    status: z.boolean(),
    attachments: z
        .any()
        .refine(
        (files) =>
            files === undefined ||
            files === null ||
            files instanceof FileList ||
            Array.isArray(files),
            {
                message: 'Invalid file(s)',
            }
        )
        .optional(),
});

type Option = {
    value: string;
    label: string;
};

export default function CreateMemoNotification () {
    const { t } = useTranslation();
    const { user } = useAuthStore()
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();
    const hasPermissionCreateNotification = useHasPermission(['memo_notification.create'])

    const [localFiles, setLocalFiles] = useState<File[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<{ id: string, fileName: string; contentType: string }[]>([]);
    const [deletedFileUrls, setDeletedFileUrls] = useState<string[]>([]);

    const createMemoNotify = useCreateMemoNotification();
    const updateMemoNotify = useUpdateMemoNotification();
    const navigate = useNavigate()

    const { data: dataMaxUploadFileMemo } = useQuery({
        queryKey: ['get-max-file-size-memo-upload'],
        queryFn: async () => {
            const res = await systemConfigApi.getByConfigKey('LIMIT_FILE_MEMO_NOTIFY')
            const result = res.data.data;

            return result?.configValue ? parseInt(result.configValue) : 5;
        },
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            content: '',
            departments: [] as number[],
            dateRange: {
                from: new Date(),
                to: new Date(),
            },
            status: true,
            attachments: [],
        },
    });

    const { data: options = [] } = useQuery({
        queryKey: ['get-all-department'],
        queryFn: async () => {
            const res = await orgUnitApi.GetAllDepartment()
            return res.data.data.map((dept: {id: number, name: string}) => ({
                value: dept.id,
                label: dept.name,
            }));
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!hasPermissionCreateNotification) {
            ShowToast("Bạn không có quyền tạo thông báo, liên hệ Team IT", "error")
            return
        }
        
        const formData = new FormData();

        formData.append("orgPositionId", String(user?.orgPositionId ?? ''));
        formData.append("departmentId", String(user?.departmentId ?? ''));
        formData.append("urlFrontend", window.location.origin);

        formData.append("title", values.title);
        formData.append("content", values.content);
        formData.append("status", String(values.status));
        formData.append("fromDate", String(getVietnamTime('iso', values.dateRange.from)));
        formData.append("toDate", String(getVietnamTime('iso', values.dateRange.to)));
        formData.append("applyAllDepartment", String(values.departments.length == options.length));

        if (values.departments.length != options.length) {
            values.departments.forEach(id => {
                formData.append("departmentIdApply[]", String(id))
            })
        }

        if (id) {
            formData.append("updatedBy", String(user?.userName));
            formData.append("updatedAt", String(getVietnamTime('iso')));
            deletedFileUrls.forEach((item) => {
                formData.append("deleteFiles", item);
            })
        } else {
            formData.append("userCodeCreated", String(user?.userCode));
            formData.append("UserNameCreated", String(user?.userName));
            formData.append("createdAt", String(getVietnamTime('iso')));
        }

        if (Array.isArray(values.attachments)) {
            values.attachments.forEach((file: File) => {
                formData.append("files", file);
            });
        }

        try {
            if (id) {
                await updateMemoNotify.mutateAsync({id: id, data: formData})
            } else {
                await createMemoNotify.mutateAsync(formData)
            }
            navigate("/memo-notify")
            queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });
        } catch (err) {
            console.log(getErrorMessage(err));
        }
    };

    useEffect(() => {
        if (id && options.length > 0) {
            setLocalFiles([]);
            form.setValue("attachments", []);
            (async () => {
                try {
                    const res = await memoNotificationApi.getById(Number(id));
                    const result = res.data.data;

                    const selectedDepartments = result.applyAllDepartment
                        ? options.map((opt: any) => opt.value)
                        : result?.memoNotificationDepartments?.map((item: any) => item?.orgUnit?.id) || [];
                    
                    form.reset({
                        title: result.title,
                        content: result.content,
                        departments: selectedDepartments,
                        dateRange: {
                            from: new Date(result.fromDate),
                            to: new Date(result.toDate),
                        },
                        status: result.status,
                    });

                    setUploadedFiles(result.systemFiles || []); 
                } catch (err) {
                    ShowToast(getErrorMessage(err), "error");
                }
            })();
        }
    }, [form, id, options]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const newFiles = Array.from(files);
            
            // Check size
            const limitSize = (dataMaxUploadFileMemo ?? 5) * 1024 * 1024;
            const oversizedFiles = newFiles.filter(file => file.size > limitSize);
            
            if (oversizedFiles.length > 0) {
                alert(`File phải nhỏ hơn ${dataMaxUploadFileMemo ?? 5}MB.`);
                return;
            }

            // Cập nhật state cục bộ để hiển thị preview
            const updatedLocalFiles = [...localFiles, ...newFiles];
            setLocalFiles(updatedLocalFiles);
            
            // Cập nhật vào react-hook-form để submit
            form.setValue("attachments", updatedLocalFiles, { shouldValidate: true });
            
            // Reset input để có thể chọn lại cùng 1 file nếu lỡ tay xóa
            e.target.value = ""; 
        }
    };

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0">{t('memo_notification.list.btn_create_memo_notify')}</h3>
                <Button asChild className="w-full sm:w-auto bg-black text-white hover:bg-black">
                    <Link to="/memo-notify">{t('memo_notification.list.title_page')}</Link>
                </Button>
            </div>
            
            <div className="w-[100%] mt-5">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {t('memo_notification.list.title')}
                                        <DotRequireComponent />
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder={t('memo_notification.list.title')} {...field} className="border border-gray-300"/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="departments"
                            render={({field, fieldState}) => {
                                const selectedOptions = options.filter((opt: {value: number}) => field.value?.includes(opt.value));
                                return (
                                    <FormItem className="mt-5">
                                        <FormLabel>{t('memo_notification.list.department_apply')} <DotRequireComponent /></FormLabel>
                                        <FormControl>
                                            <div className={fieldState.invalid ? "border border-red-500 rounded-[5px]" : ""}>
                                                <MultiSelect
                                                    options={options}
                                                    value={selectedOptions}
                                                    onChange={(selected: Option[]) => {
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
                                                    valueRenderer={(selected: Option[]) => {
                                                        if (selected.length === 0) return "Chọn phòng ban...";
                                                        if (selected.length >= 5) return `Đã chọn ${selected.length}`;
                                                        return selected.map(s => s.label).join(", ");
                                                    }}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
                        />

                        <FormField
                            control={form.control}
                            name="attachments"
                            render={() => (
                                <FormItem className="flex flex-col mt-4 space-y-2 gap-0 mb-4">
                                    <FormLabel className="font-bold">
                                        {t("memo_notification.list.attachments")} <span className="text-xs text-red-500 italic">(giới hạn {dataMaxUploadFileMemo}MB)</span>
                                    </FormLabel>
                                    <FormControl>
                                        <input
                                        id="file-upload"
                                        type="file"
                                        multiple
                                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
                                        onChange={handleFileChange}
                                        className="file-input file-input-bordered hidden"
                                        />
                                    </FormControl>
                                    <div className="w-max">
                                        <label
                                            htmlFor="file-upload"
                                            className="inline-block cursor-pointer w-auto text-sm rounded-md bg-blue-800 px-3 py-2 text-white text-center hover:bg-blue-900 transition select-none">
                                            Choose file
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
                                            setDeletedFileUrls((prev) => [...prev, removed.id]);
                                        }}
                                    />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field, fieldState }) => (
                                <FormItem className="gap-0">
                                    <FormLabel className="mb-2">
                                        {t('memo_notification.list.content')} <DotRequireComponent />
                                    </FormLabel>
                                    <FormControl>
                                        <div className={fieldState.invalid ? "border border-red-500" : ""}>
                                            <QuillEditorCDN initialContent={field.value} onChange={field.onChange} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 mt-4">
                                    <FormControl>
                                        <Checkbox
                                            id="status"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className="h-5 w-5 border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 transition-all cursor-pointer"
                                        />
                                    </FormControl>
                                    <FormLabel 
                                        htmlFor="status" 
                                        className="font-bold hover:cursor-pointer text-sm select-none"
                                    >
                                        {t('memo_notification.list.status')}
                                    </FormLabel>
                                </FormItem>
                            )}
                        />

                        <FormItem className="w-[18%] mt-4">
                            <FormLabel>{t('memo_notification.list.display')}</FormLabel>
                            <div className="">
                                <FormControl>
                                    <Controller
                                        control={form.control}
                                        name="dateRange"
                                        render={({ field }) => {
                                            const from = field.value?.from;
                                            const to = field.value?.to;
                                            const key = from?.toISOString() + to?.toISOString();
                                            return  (
                                                <DateRangePicker
                                                    key={key}
                                                    onUpdate={({ range }) => field.onChange(range)}
                                                    initialDateFrom={from}
                                                    initialDateTo={to}
                                                    align="start"
                                                    locale="vi-VN"
                                                    showCompare={false}
                                                />
                                            )
                                        }}
                                    />
                                </FormControl>
                            </div>
                            <FormMessage />
                        </FormItem>

                        <Button disabled={createMemoNotify.isPending || updateMemoNotify.isPending} type="submit" className="hover:cursor-pointer hover:bg-black bg-black text-white w-[30%]">
                            {createMemoNotify.isPending || updateMemoNotify.isPending ? <Spinner className="text-white" /> : t('memo_notification.list.btn_save')}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}