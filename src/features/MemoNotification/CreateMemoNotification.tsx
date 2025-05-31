import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Link, useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
// import { MultiSelect } from "react-multi-select-component";
import { useEffect } from "react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Switch } from "@/components/ui/switch";
import memoNotificationApi, { IMemoNotify, useCreateMemoNotification, useUpdateMemoNotification } from "@/api/memoNotificationApi";
import { useAuthStore } from "@/store/authStore";
import { getVietnamTime } from "@/lib/time";

import QuillEditorCDN from "@/components/QuillEditorCDN";
import DotRequireComponent from "@/components/DotRequireComponent";
import { getErrorMessage, ShowToast } from "@/lib";

// Remove all HTML tags to check empty
const isQuillContentEmpty = (html: string) => {
    const text = html.replace(/<[^>]*>/g, "").trim(); 
    return text === "";
};

const formSchema = z.object({
    title: z.string().nonempty({ message: "Required" }),
    content: z.string().refine(val => !isQuillContentEmpty(val), {
        message: "Required",
    }),
    // departments: z.array(z.string()).nonempty("Required"),
    dateRange: z.object({
        from: z.date(),
        to: z.date(),
    }),
    status: z.boolean()
});

// type Option = {
//     value: string;
//     label: string;
// };

export default function CreateMemoNotification () {
    const createMemoNotify = useCreateMemoNotification();
    const updateMemoNotify = useUpdateMemoNotification();
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const { id } = useParams<{ id: string }>();

    // const [options] = useState<Option[]>([
    //     { label: "HR", value: "1" },
    //     { label: "MIS", value: "2" },
    //     { label: "Production", value: "3" }
    // ])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            content: '',
            // departments: [] as string[],
            dateRange: {
                from: new Date(),
                to: new Date(),
            },
            status: true,
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const payload: IMemoNotify = {
            title: values.title,
            content: values.content,
            createdByDepartmentId: 1,
            // departmentIdApply: values.departments,
            status: values.status,
            fromDate: getVietnamTime('iso', values.dateRange.from),
            toDate: getVietnamTime('iso', values.dateRange.to),
            userCodeCreated: user?.userCode,
            createdBy: user?.userCode,
            createdAt: getVietnamTime('iso'),
            applyAllDepartment: true
        }

        if (id) {
            await updateMemoNotify.mutateAsync({
                id: id,
                data: payload
            })
        } else {
            await createMemoNotify.mutateAsync(payload)
        }

        navigate("/memo-notify")
    };

    useEffect(() => {
        if (id) {
            (async () => {
                try {
                    const data = await memoNotificationApi.getById(id!);
                    const result = data.data.data;
                    form.reset({
                        title: result.title,
                        content: result.content,
                        // departments: [] as string[],
                        dateRange: {
                            from: new Date(result.fromDate),
                            to: new Date(result.toDate),
                        },
                        status: result.status,
                    });
                } catch (err) {
                    ShowToast(getErrorMessage(err), "error");
                }
            })();
         }
    }, [form, id])

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0">Tạo thông báo</h3>
                <Button asChild className="w-full sm:w-auto">
                    <Link to="/memo-notify">Danh sách thông báo</Link>
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
                                        Tiêu đề
                                        <DotRequireComponent />
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="Tiêu đề" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field, fieldState }) => (
                                <FormItem className="gap-0">
                                    <FormLabel className="mb-2">
                                        Nội dung <DotRequireComponent />
                                    </FormLabel>
                                    <FormControl className="dark:bg-[#9f9f9f]">
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
                                    <FormLabel htmlFor="status" className="font-bold">
                                        Hiển thị
                                    </FormLabel>
                                    <FormControl>
                                        <Switch
                                            className="hover:cursor-pointer"
                                            id="status"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormItem className="w-[18%] mt-4">
                            <FormLabel>Thời gian hiển thị</FormLabel>
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
                            <FormMessage />
                        </FormItem>

                        {/* <FormField
                            control={form.control}
                            name="departments"
                            render={({field, fieldState}) => {
                                const selectedOptions = field && options.filter(o => field.value.includes(o.value));
                                const selectedLabels = selectedOptions.map(item => item.label).join(', ');

                                return (
                                    <FormItem className="mt-5">
                                        <FormLabel>Phòng ban áp dụng</FormLabel>
                                        <FormControl>
                                            <div className={fieldState.invalid ? "border border-red-500 rounded-[5px]" : ""}>
                                                <MultiSelect
                                                    className="dark:text-black"
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
                                                        allItemsAreSelected: field.value.length === options.length ? "Tất cả" : selectedLabels || "Chọn phòng ban..."
                                                    }}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
                        /> */}

                        <Button disabled={createMemoNotify.isPending || updateMemoNotify.isPending} type="submit" className="hover:cursor-pointer w-[30%]">
                            {createMemoNotify.isPending || updateMemoNotify.isPending ? <Spinner className="text-white" /> : "Save"}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}
