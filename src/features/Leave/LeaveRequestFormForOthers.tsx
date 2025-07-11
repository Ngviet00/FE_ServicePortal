"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage, ShowToast, TIME_LEAVE } from "@/lib";
import { useQuery } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuthStore, User } from "@/store/authStore";
import { CreateLeaveRequestForManyPeople, LeaveRequestData, useCreateLeaveRequestForManyPeople } from "@/api/leaveRequestApi";
import typeLeaveApi, { ITypeLeave } from "@/api/typeLeaveApi";
import DateTimePicker from "@/components/ComponentCustom/Flatpickr";
import { Spinner } from "@/components/ui/spinner";
import { useEffect, useRef, useState } from "react";
import FullscreenLoader from "@/components/FullscreenLoader";

const leaveRequestSchema = z.object({
    user_code: z.string().nonempty({ message: "Bắt buộc." }),
    user_code_register: z.string().nonempty({ message: "Bắt buộc." }),
    name: z.string().nonempty({ message: "Bắt buộc." }),
    department: z.string().nonempty({ message: "Bắt buộc." }),
    position: z.string().nonempty({ message: "Bắt buộc." }),
    from_date: z.string().nonempty({ message: "Bắt buộc.." }),
    to_date: z.string().nonempty({ message: "Bắt buộc." }),
    type_leave: z.string().nonempty({ message: "Bắt buộc." }),
    time_leave: z.string().nonempty({ message: "Bắt buộc." }),
    reason: z.string().nonempty({ message: "Bắt buộc." }),
});

const leaveSchema = z.object({
    leaveRequests: z.array(leaveRequestSchema)
});

type LeaveForm = z.infer<typeof leaveSchema>;
type SingleLeaveRequest = z.infer<typeof leaveRequestSchema>;

const defaultSingleLeaveRequest: SingleLeaveRequest = {
    user_code: "",
    user_code_register: "",
    name: "",
    department: "",
    position: "",
    from_date: `${new Date().toISOString().slice(0, 10)} 08:00`,
    to_date: `${new Date().toISOString().slice(0, 10)} 17:00`,
    type_leave: "",
    time_leave: "",
    reason: "",
};

const formatSingleLeaveRequest = (values: SingleLeaveRequest, user: User | null): LeaveRequestData => ({
    requesterUserCode: values.user_code ?? null,
    writeLeaveUserCode: user?.userCode ?? "",
    writeLeaveName: user?.userName ?? "",
    name: values.name,
    department: values.department,
    position: values.position,
    fromDate: values.from_date,
    toDate: values.to_date,
    reason: values.reason,
    typeLeave: parseInt(values.type_leave),
    timeLeave: parseInt(values.time_leave),
    urlFrontend: window.location.origin,
});

export default function LeaveRequestFormForOthers() {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const saveLeaveRequestForManyPeople = useCreateLeaveRequestForManyPeople(); 

    const form = useForm<LeaveForm>({
        resolver: zodResolver(leaveSchema),
        defaultValues: {
            leaveRequests: [{ ...defaultSingleLeaveRequest, user_code_register: user?.userCode ?? "" }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "leaveRequests",
    });

    const onSubmit = async (data: LeaveForm) => {
        const formatData: LeaveRequestData[] = data.leaveRequests.map(item => 
            formatSingleLeaveRequest(item, user)
        )

        const payload: CreateLeaveRequestForManyPeople = {
            Leaves: formatData
        };

        try {
            await saveLeaveRequestForManyPeople.mutateAsync(payload);
            navigate("/leave");
        } catch (err) {
            ShowToast(getErrorMessage(err), "error")
        }
    };

    const { data: typeLeaves = [], isPending, isError, error } = useQuery<ITypeLeave[], Error>({
        queryKey: ['get-all-type-leave'],
        queryFn: async () => {
            const res = await typeLeaveApi.getAll({});
            return res.data.data;
        },
    });

    const inputFieldsConfig = [
        { name: "user_code", label: "Mã nhân viên", placeholder: "Mã nhân viên" },
        { name: "name", label: "Họ Tên", placeholder: "Họ Tên" },
        { name: "department", label: "Bộ phận/Phòng ban", placeholder: "Bộ phận/Phòng ban" },
        { name: "position", label: "Chức vụ", placeholder: "Chức vụ" },
    ] as const;

    // const [prevUserCodes, setPrevUserCodes] = useState<Record<number, string>>({});

    // const [loadingUser, setLoadingUser] = useState(false);

    const previousUserCodeRef = useRef<Record<number, string>>({});

    // const previousUserCodeRef = useRef<Record<number, string>>({});
    const [isSearching, setIsSearching] = useState(false)

    // const handleFindUser = async (userCode: string, index: number) => {
    //     if (!userCode?.trim()) return;

    //     try {
    //         setLoadingUser(true);
    //         await new Promise(resolve => setTimeout(resolve, 800));

    //          const values = form.getValues("leaveRequests");
    //         if (!values[index]) return;
    //         // Ví dụ gọi API
    //         // const user = await userApi.findByCode(code);

    //         const fakeUser = {
    //             name: "Nguyễn Văn A",
    //             department: "Phòng Kỹ thuật",
    //             position: "Nhân viên",
    //         };
    //           form.setValue(`leaveRequests.${index}.name`, fakeUser.name);
    //             form.setValue(`leaveRequests.${index}.department`, fakeUser.department);
    //             form.setValue(`leaveRequests.${index}.position`, fakeUser.position);

    //         // Set các trường liên quan
    //         // form.setValue(`leaveRequests.${index}.name`, 'ew');
    //         // form.setValue(`leaveRequests.${index}.department`, 'dd');
    //         // form.setValue(`leaveRequests.${index}.position`, '88');

    //         // Cập nhật prevUserCodes
    //         // setPrevUserCodes(prev => ({ ...prev, [index]: code }));
    //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //     } catch (err) {
    //         ShowToast("Không tìm thấy nhân viên", "error");
    //     }  finally {
    //         setLoadingUser(false);
    //     }
    // };
    const handleFindUser = async (index: number) => {
    const userCode = form.getValues(`leaveRequests.${index}.user_code`)?.trim();

        if (!userCode) {
            form.setValue(`leaveRequests.${index}.name`, "");
            form.setValue(`leaveRequests.${index}.department`, "");
            form.setValue(`leaveRequests.${index}.position`, "");
            previousUserCodeRef.current[index] = ""; // clear ref
            return;
        }

        if (userCode === previousUserCodeRef.current[index]) {
            return;
        }

        try {
            setIsSearching(true);
            await new Promise(resolve => setTimeout(resolve, 800)); // giả lập API

            const foundUser = {
                name: "Nguyễn Văn A",
                department: "Phòng Kỹ thuật",
                position: "Kỹ sư",
            };

            form.setValue(`leaveRequests.${index}.name`, foundUser.name);
            form.setValue(`leaveRequests.${index}.department`, foundUser.department);
            form.setValue(`leaveRequests.${index}.position`, foundUser.position);

            previousUserCodeRef.current[index] = userCode;
        } catch (err) {
            ShowToast("Không tìm thấy nhân viên", "error");
        } finally {
            setIsSearching(false);
        }
    };

useEffect(() => {
    const validIndexes = fields.map((_, idx) => idx);
    const current = previousUserCodeRef.current;

    Object.keys(current).forEach((key) => {
        const index = parseInt(key, 10);
        if (!validIndexes.includes(index)) {
            delete current[index];
        }
    });
}, [fields]);

    return (
        <div className="p-4 pl-1 pt-0 space-y-4 leave-request-form">
            {isSearching && <FullscreenLoader />}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-7">
                <div className="flex flex-col gap-2">
                    <h3 className="font-bold text-xl md:text-2xl">
                        Xin nghỉ phép thay người khác
                    </h3>
                </div>

                <Button onClick={() => navigate("/leave")} className="w-full md:w-auto hover:cursor-pointer">
                    {t("leave_request.create.link_to_list")}
                </Button>
            </div>

            <div className="w-[100%] mt-5">
                <Form {...form}>
                    <form 
                        onSubmit={form.handleSubmit(onSubmit)} 
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                            }
                        }}
                    >
                        {fields.map((field, index) => (
                            <div key={field.id} className="space-y-4">
                                <h2 className="font-bold text-xl text-red-600">Xin nghỉ phép {`#` + (index + 1)}</h2>
                                <div className="flex flex-wrap gap-4">
                                    {inputFieldsConfig.map((inputField) => (
                                        <FormField
                                        key={inputField.name}
                                        control={form.control}
                                        name={`leaveRequests.${index}.${inputField.name}`}
                                        render={({ field: formField }) => (
                                            <FormItem className="flex flex-col w-[180px]">
                                                <FormLabel className="mb-1">{inputField.label}</FormLabel>
                                                <FormControl>
                                                    {
                                                        inputField.name === "user_code" ? (
                                                            <Input
                                                                {...formField}
                                                                onBlur={async () => {
                                                                    formField.onBlur();
                                                                    await handleFindUser(index);
                                                                }}
                                                                placeholder={inputField.placeholder}
                                                                className="w-auto"
                                                            />
                                                        ) : (
                                                            <Input
                                                                {...formField}
                                                                placeholder={inputField.placeholder}
                                                                className="w-auto bg-gray-200 border border-gray-300"
                                                                // readOnly
                                                            />
                                                        )
                                                    }
                                                    
                                                </FormControl>
                                                <FormMessage className="text-sm text-red-500 mt-1" />
                                            </FormItem>
                                        )}
                                        />
                                    ))}

                                    <FormField
                                        control={form.control}
                                        name={`leaveRequests.${index}.type_leave`}
                                        render={({ field, fieldState }) => (
                                            <FormItem className="flex flex-col w-[180px]">
                                                <FormLabel className="mb-1">Loại phép</FormLabel>
                                                <FormControl>
                                                    <select
                                                        {...field}
                                                        className={`dark:bg-[#454545] shadow-xs border ${fieldState.invalid ? "border-red-500" : "border-[#ebebeb]"} p-1 rounded-[5px] hover:cursor-pointer`}
                                                    >
                                                        <option value="">--Select--</option>
                                                        {isPending ? (
                                                        <option value="">Loading...</option>
                                                        ) : isError || typeLeaves.length === 0 ? (
                                                        <option value="" className="text-red-500">
                                                            {isError ? error.message : "No results"}
                                                        </option>
                                                        ) : (
                                                            typeLeaves.map((item: ITypeLeave) => (
                                                                <option key={item.id} value={item.id}>
                                                                {t(item.name)}
                                                                </option>
                                                            ))
                                                        )}
                                                    </select>
                                                </FormControl>
                                                <FormMessage className="text-sm text-red-500 mt-1" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={`leaveRequests.${index}.time_leave`}
                                        render={({ field, fieldState }) => (
                                            <FormItem className="flex flex-col w-[180px]">
                                                <FormLabel className="mb-1">Thời gian nghỉ</FormLabel>
                                                <FormControl>
                                                    <select
                                                        {...field}
                                                        className={`dark:bg-[#454545] shadow-xs border ${fieldState.invalid ? "border-red-500" : "border-[#ebebeb]"} p-1 rounded-[5px] hover:cursor-pointer`}
                                                    >
                                                        <option value="">--Chọn--</option>
                                                        {TIME_LEAVE.map((item) => (
                                                        <option key={item.value} value={item.value}>
                                                            {t(item.label)}
                                                        </option>
                                                        ))}
                                                    </select>
                                                </FormControl>
                                                <FormMessage className="text-sm text-red-500 mt-1" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={`leaveRequests.${index}.from_date`}
                                        render={({ field: rhfField, fieldState }) => (
                                            <FormItem className="flex flex-col w-[180px]">
                                                <FormLabel className="mb-1">Nghỉ từ ngày</FormLabel>
                                                <FormControl>
                                                    <DateTimePicker
                                                        initialDateTime={rhfField.value as string || undefined}
                                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                        onChange={(_selectedDates, dateStr, _instance) => {
                                                            rhfField.onChange(dateStr);
                                                            console.log(dateStr, 8);
                                                        }}
                                                        className={`dark:bg-[#454545] shadow-xs border ${fieldState.invalid ? "border-red-500" : "border-[#ebebeb]"} p-1 rounded-[5px] hover:cursor-pointer`}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-sm text-red-500 mt-1" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={`leaveRequests.${index}.to_date`}
                                        render={({ field: rhfField, fieldState }) => (
                                            <FormItem className="flex flex-col w-[180px]">
                                                <FormLabel className="mb-1">Nghỉ đến ngày</FormLabel>
                                                <FormControl>
                                                    <DateTimePicker
                                                        initialDateTime={rhfField.value as string || undefined}
                                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                        onChange={(_selectedDates, dateStr, _instance) => {
                                                            rhfField.onChange(dateStr);
                                                        }}
                                                        className={`dark:bg-[#454545] shadow-xs border ${fieldState.invalid ? "border-red-500" : "border-[#ebebeb]"} p-1 rounded-[5px] hover:cursor-pointer`}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-sm text-red-500 mt-1" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name={`leaveRequests.${index}.reason`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="mb-1">Lý do</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                placeholder="Nhập lý do"
                                                className="w-full"
                                                {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-sm text-red-500 mt-1" />
                                        </FormItem>
                                    )}
                                />

                                {fields.length > 1 && (
                                    <div className="flex justify-end">
                                        <Button type="button" className="hover:cursor-pointer" variant="destructive" onClick={() => remove(index)}>
                                        Xoá
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}

                        <Button
                            type="button"
                            className="hover:cursor-pointer mr-3"
                            variant="outline"
                            onClick={() =>
                                append({
                                    ...structuredClone(defaultSingleLeaveRequest),
                                    user_code_register: user?.userCode ?? "",
                                })
                            }
                        >
                            Thêm mới
                        </Button>

                        <Button disabled={saveLeaveRequestForManyPeople.isPending} type="submit" className="mt-4 hover:cursor-pointer">
                            {saveLeaveRequestForManyPeople.isPending ? <Spinner className="text-white"/> : 'Xác nhận'}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}
