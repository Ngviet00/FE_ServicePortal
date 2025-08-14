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
import { useTranslation } from "react-i18next"
import permissionApi from "@/api/permissionApi"

type Props = {
    permission?: {
        id: number,
        name: string,
        group: string
    },
    onAction?: () => void;
};

export default function CreatePermissionForm({ permission, onAction }: Props) {
    const [open, setOpen] = useState(false)
    const { t } = useTranslation('permission');

    const createUserSchema = z.object({
        name: z.string().min(1, { message: t('required') }),
        group: z.string().min(1, { message: t('required') }),
    })

    type CreateUserFormValues = z.infer<typeof createUserSchema>
    
    const form = useForm<CreateUserFormValues>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            name: "",
            group: "",
        },
    })

    useEffect(() => {
        if (permission && open) {
            form.reset({ name: permission.name, group: permission.group });
        } else {
            form.reset({ name: "", group: "" });
        }
    }, [permission, open, form]);

    const onSubmit = async (values: CreateUserFormValues) => {
        try {
            if (permission?.id) {
                await permissionApi.update(permission.id, values);
                ShowToast("Success");
            } else {
                await permissionApi.create(values);
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
                    permission?.id ? (
                        <button className="hover:cursor-pointer ml-3 rounded-[3px] px-[5px] py-[2px] bg-[#555555] text-white">
                            {t('edit')}
                        </button>
                    ) : (
                        <Button variant="outline" className="bg-black hover:bg-black hover:text-white text-white hover:cursor-pointer">
                            {t('add')}
                        </Button>
                    )
                }
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>{permission?.id ? t('edit') : t('add')}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <Label htmlFor="name">{t('name')}</Label>
                                    <FormControl>
                                        <Input id="name" placeholder={t('name')} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}  
                        />

                        <FormField
                            control={form.control}
                            name="group"
                            render={({ field }) => (
                                <FormItem>
                                    <Label htmlFor="name">{t('group')}</Label>
                                    <FormControl>
                                        <Input id="code" placeholder={t('group')} {...field} />
                                    </FormControl>
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