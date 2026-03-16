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
            
            <div className="w-full md:w-[80%] lg:w-[50%] mt-5">
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
                                        <Input placeholder={lang == 'vi' ? 'Số điện thoai' : 'Phone'} {...field} value={field.value ?? ""} className="border border-gray-300"/>
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
                                        <Input placeholder="Email" {...field} className="border border-gray-300" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="dob"
                            render={({ field: rhfField, fieldState }) => (
                                <FormItem className="flex flex-col w-full sm:w-[180px]">
                                    <FormLabel className="mb-1">{lang == 'vi' ? 'Ngày sinh' : 'Date of birth'} <DotRequireComponent/></FormLabel>
                                    <FormControl>
                                        <DateTimePicker
                                            enableTime={false}
                                            dateFormat="Y-m-d"
                                            initialDateTime={rhfField.value as string || undefined}
                                            onChange={(_selectedDates, dateStr) => {
                                                rhfField.onChange(dateStr);
                                            }}
                                            className={`shadow-xs border ${fieldState.invalid ? "border-red-500" : "border-gray-300"} p-1 rounded-[5px] hover:cursor-pointer`}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-sm text-red-500 mt-1" />
                                </FormItem>
                            )}
                        />

                        <button 
                            disabled={updatePersonalInfo.isPending} 
                            type="submit" 
                            className="cursor-pointer flex px-10 bg-black hover:bg-gray-800 justify-center rounded-md py-1.5 text-sm/6 font-semibold text-white shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2">
                            {updatePersonalInfo.isPending ? <Spinner className="text-white" /> : 'Save'}
                        </button>
                    </form>
                </Form>
            </div>
        </div>
    )
}