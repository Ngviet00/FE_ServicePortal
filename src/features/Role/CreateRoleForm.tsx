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
import roleApi from "@/api/roleApi"
import { useTranslation } from "react-i18next"

const createUserSchema = z.object({
    name: z.string().min(1, { message: "Tên không được để trống" }),
    code: z.string().min(1, { message: "Mã không được để trống" }),
})

type CreateUserFormValues = z.infer<typeof createUserSchema>

type Props = {
    role?: {
        id: number,
        name: string,
        code: string
    },
    onAction?: () => void;
};

export default function CreateRoleComponent({ role, onAction }: Props) {
    const [open, setOpen] = useState(false)
    const { t } = useTranslation();
    
    const form = useForm<CreateUserFormValues>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            name: "",
            code: "",
        },
    })

    useEffect(() => {
        if (role && open) {
            form.reset({ name: role.name, code: role.code });
        } else {
            form.reset({ name: "", code: "" });
        }
    }, [role, open, form]);

    const onSubmit = async (values: CreateUserFormValues) => {
        try {
            if (role?.id) {
                await roleApi.update(role.id, values);
                ShowToast("Success");
            } else {
                await roleApi.create(values);
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
                    role?.id ? (
                        <button className="hover:cursor-pointer ml-3 rounded-[3px] px-[5px] py-[2px] bg-[#555555] text-white">
                            Edit
                        </button>
                    ) : (
                        <Button variant="outline" className="bg-black hover:bg-black hover:text-white text-white hover:cursor-pointer">
                            {t('list_role_page.btn_create_role')}
                        </Button>
                    )
                }
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>{role?.id ? t('list_role_page.btn_update_role') : t('list_role_page.btn_create_role')}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <Label htmlFor="name">{t('list_role_page.name')}</Label>
                                    <FormControl>
                                        <Input id="name" placeholder="..." {...field} />
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
                                    <Label htmlFor="name">{t('list_role_page.code')}</Label>
                                    <FormControl>
                                        <Input id="code" placeholder="..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}  
                        />
                        
                        <div className="flex justify-end">
                            <Button type="submit" className="hover:cursor-pointer">
                                Submit
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}