import { useEffect, useState } from "react"
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import {
    Form,
    FormField,
    FormItem,
    FormControl,
    FormMessage,
} from "@/components/ui/form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { getErrorMessage, ShowToast } from "@/lib"
import { useAuthStore } from "@/store/authStore"
import { useTranslation } from "react-i18next"
import typeLeaveApi from "@/api/typeLeaveApi"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type Props = {
    typeLeave?: {
        id: number,
        name: string,
        nameE: string,
        code: string,
        typeGroup?: string,
        modified_by?: string,
    },
    onAction?: () => void;
};

export default function CreateTypeLeaveForm({ typeLeave, onAction }: Props) {
    const [open, setOpen] = useState(false)
    const { user } = useAuthStore();
    const { t } = useTranslation();
    const lang = useTranslation().i18n.language.split('-')[0]

    const createUserSchema = z.object({
        name: z.string().min(1, { message: t('type_leave_page.required') }),
        nameE: z.string().min(1, { message: t('type_leave_page.required') }),
        code: z.string().min(1, { message: t('type_leave_page.required') }),
        typeGroup: z.string().min(1, { message: t('type_leave_page.required') }),
        modified_by: z.string().nullable().optional()
    })

    type CreateUserFormValues = z.infer<typeof createUserSchema>

    const form = useForm<CreateUserFormValues>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            name: "",
            nameE: "",
            code: "",
            typeGroup: "USER",
            modified_by: user?.userCode
        },
    })

    useEffect(() => {
        if (typeLeave && open) {
            form.reset({ name: typeLeave.name, nameE: typeLeave.nameE, code: typeLeave.code, typeGroup: typeLeave.typeGroup || "USER" });
        } else {
            form.reset({ name: "" });
        }
    }, [typeLeave, open, form]);

    const onSubmit = async (values: CreateUserFormValues) => {
        try {
            const data = {
                name: values.name,
                nameE: values.nameE,
                code: values.code,
                typeGroup: values.typeGroup,
                modified_by: user?.userCode
            }
            if (typeLeave?.id) {
                await typeLeaveApi.update(typeLeave.id, data);
                ShowToast("Success");
            } else {
                await typeLeaveApi.create(data);
                ShowToast("Success");
            }
            onAction?.();
            setOpen(false);
            form.reset();
        } catch (err) {
            ShowToast(getErrorMessage(err), "error")
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {
                    typeLeave?.id ? (
                        <button className="hover:cursor-pointer ml-3 rounded-[3px] px-[5px] py-[2px] bg-[#555555] text-white">
                            {t('edit')}
                        </button>
                    ) : (
                        <Button variant="outline" className="bg-black hover:bg-black hover:text-white text-white hover:cursor-pointer">
                            {t('type_leave_page.btn_create_type_leave')}
                        </Button>
                    )
                }
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>{typeLeave?.id ? t('type_leave_page.btn_update_type_leave') : t('type_leave_page.btn_create_type_leave')}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <Label htmlFor="name">{t('type_leave_page.name')}</Label>
                                    <FormControl>
                                        <Input id="name" placeholder="..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}  
                        />

                        <FormField
                            control={form.control}
                            name="nameE"
                            render={({ field }) => (
                                <FormItem>
                                    <Label htmlFor="nameV">{t('type_leave_page.nameE')}</Label>
                                    <FormControl>
                                        <Input id="nameV" placeholder="..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}  
                        />

                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <Label htmlFor="code">{t('type_leave_page.code')}</Label>
                                    <FormControl>
                                        <Input id="code" placeholder="..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}  
                        />

                        <FormField
                            control={form.control}
                            name="typeGroup"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>{lang == 'vi' ? 'Loại' : 'Type Group'}</Label>
                                    <Select 
                                        onValueChange={field.onChange} 
                                        value={field.value} 
                                        defaultValue="USER"
                                    >
                                        <FormControl className="w-full">
                                            <SelectTrigger className="hover:cursor-pointer">
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="USER">USER</SelectItem>
                                            <SelectItem value="SYS">SYS</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <div className="flex justify-end">
                            <Button type="submit" className="hover:cursor-pointer">
                                {t('submit')}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}