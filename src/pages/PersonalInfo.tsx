import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import DotRequireComponent from "@/components/DotRequireComponent";
import DateTimePicker from "@/components/ComponentCustom/Flatpickr";
import userApi, { UpdatePersonalInfo, useUpdatePersonalInfo } from "@/api/userApi";
import { useTranslation } from "react-i18next";

const formSchema = z.object({
    phone: z.string().optional().nullable(),
    email: z.string().nonempty({ message: "Required" }),
    dob: z.string().nonempty({ message: "Required" }),
});

export default function PersonalInfo () {
    const { user } = useAuthStore()
    const lang = useTranslation().i18n.language.split('-')[0]
    const updatePersonalInfo = useUpdatePersonalInfo();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            phone: '',
            email: '',
            dob: ''
        },
    });

    useQuery({
        queryKey: ['get-personal-info'],
        queryFn: async () => {
            const res = await userApi.getByCode(user?.userCode);
            const result = res.data.data;

            const email = result.email;
            const phone = result.phone;
            const dob = result.dateOfBirth;

            form.setValue('phone', phone ?? '');
            form.setValue('email', email ?? '');
            form.setValue('dob', dob ?? '');

            return result
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const userCode = user?.userCode ?? undefined

        const data: UpdatePersonalInfo = {
            email: values.email,
            phone: values.phone ?? '',
            dateOfBirth: values.dob
        }

        await updatePersonalInfo.mutateAsync({
            userCode: userCode, 
            data: data
        })
    };

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0">{lang == 'vi' ? 'Cập nhật thông tin cá nhân' : 'Update personal info'}</h3>
            </div>
            
            <div className="w-[50%] mt-5">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {lang == 'vi' ? 'Số điện thoai' : 'Phone'}
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="Số điện thoại" {...field} value={field.value ?? ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Email <DotRequireComponent/>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="Email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="dob"
                            render={({ field: rhfField, fieldState }) => (
                                <FormItem className="flex flex-col w-[180px]">
                                    <FormLabel className="mb-1">{lang == 'vi' ? 'Ngày sinh' : 'Date of birth'} <DotRequireComponent/></FormLabel>
                                    <FormControl>
                                        <DateTimePicker
                                            enableTime={false}
                                            dateFormat="Y-m-d"
                                            initialDateTime={rhfField.value as string || undefined}
                                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                            onChange={(_selectedDates, dateStr, _instance) => {
                                                rhfField.onChange(dateStr);
                                                console.log(dateStr, 8);
                                            }}
                                            className={`dark:bg-[#454545] shadow-xs border ${fieldState.invalid ? "border-red-500" : "border-gray-300"} p-1 rounded-[5px] hover:cursor-pointer`}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-sm text-red-500 mt-1" />
                                </FormItem>
                            )}
                        />

                        <Button disabled={updatePersonalInfo.isPending} type="submit" className="hover:cursor-pointer w-[30%]">
                            {updatePersonalInfo.isPending ? <Spinner className="text-white" /> : 'Save'}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}