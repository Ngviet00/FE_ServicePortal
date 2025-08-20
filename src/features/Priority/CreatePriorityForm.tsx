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
import priorityApi, { IPriority } from "@/api/priorityApi"

type Props = {
    priority?: IPriority,
    onAction?: () => void;
};

export default function CreatePriorityForm({ priority, onAction }: Props) {
    const [open, setOpen] = useState(false)
    const { t } = useTranslation('admin')
    const { t:tCommon } = useTranslation('common')

    const createUserSchema = z.object({
        name: z.string().min(1, { message: tCommon('required') }),
        nameE: z.string().min(1, { message: tCommon('required') }),
    })

    type CreateUserFormValues = z.infer<typeof createUserSchema>
    
    const form = useForm<CreateUserFormValues>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            name: "",
            nameE: "",
        },
    })

    useEffect(() => {
        if (priority && open) {
            form.reset({ name: priority.name, nameE: priority.nameE });
        } else {
            form.reset({ name: "", nameE: "" });
        }
    }, [priority, open, form]);

    const onSubmit = async (values: CreateUserFormValues) => {
        try {
            if (priority?.id) {
                await priorityApi.update(priority.id, values);
                ShowToast("Success");
            } else {
                await priorityApi.create(values);
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
                    priority?.id ? (
                        <button className="hover:cursor-pointer ml-3 rounded-[3px] px-[5px] py-[2px] bg-[#555555] text-white">
                            {t('priority_page.update')}
                        </button>
                    ) : (
                        <Button variant="outline" className="bg-black hover:bg-black hover:text-white text-white hover:cursor-pointer">
                            {t('priority_page.create')}
                        </Button>
                    )
                }
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>{priority?.id ? t('priority_page.update') : t('priority_page.create')}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <Label htmlFor="name">{t('priority_page.name')}</Label>
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
                                    <Label htmlFor="name">{t('priority_page.nameE')}</Label>
                                    <FormControl>
                                        <Input id="code" placeholder="..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}  
                        />
                        
                        <div className="flex justify-end">
                            <Button type="submit" className="hover:cursor-pointer">
                                {t('priority_page.submit')}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}