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
import itCategoryApi, { ITCategoryInterface } from "@/api/itCategoryApi"

type Props = {
    itCategory?: ITCategoryInterface,
    onAction?: () => void;
};

export default function CreateRoleComponent({ itCategory, onAction }: Props) {
    const [open, setOpen] = useState(false)
    const { t } = useTranslation('admin')
    const { t:tCommon } = useTranslation('common')
    
    const createUserSchema = z.object({
        name: z.string().min(1, { message: tCommon('required') }),
        code: z.string().min(1, { message: tCommon('required') }),
    })

    type CreateUserFormValues = z.infer<typeof createUserSchema>

    const form = useForm<CreateUserFormValues>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            name: "",
            code: "",
        },
    })

    useEffect(() => {
        if (itCategory && open) {
            form.reset({ name: itCategory.name, code: itCategory.code });
        } else {
            form.reset({ name: "", code: "" });
        }
    }, [itCategory, open, form]);

    const onSubmit = async (values: CreateUserFormValues) => {
        try {
            if (itCategory?.id) {
                await itCategoryApi.update(itCategory.id, values);
                ShowToast("Success");
            } else {
                await itCategoryApi.create(values);
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
                    itCategory?.id ? (
                        <button className="hover:cursor-pointer ml-3 rounded-[3px] px-[5px] py-[2px] bg-[#555555] text-white">
                            {t('it_category_page.update')}
                        </button>
                    ) : (
                        <Button variant="outline" className="bg-black hover:bg-black hover:text-white text-white hover:cursor-pointer">
                            {t('it_category_page.create')}
                        </Button>
                    )
                }
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>{itCategory?.id ? t('it_category_page.update') : t('it_category_page.create')}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <Label htmlFor="name">{t('it_category_page.name')}</Label>
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
                                    <Label htmlFor="code">{t('it_category_page.code')}</Label>
                                    <FormControl>
                                        <Input id="code" placeholder="..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}  
                        />
                        
                        <div className="flex justify-end">
                            <Button type="submit" className="hover:cursor-pointer">
                                {t('it_category_page.submit')}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}