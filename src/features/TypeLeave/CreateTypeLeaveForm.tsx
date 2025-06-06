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

const createUserSchema = z.object({
    name: z.string().min(1, { message: "Tên không được để trống" }),
    modified_by: z.string().nullable().optional()
})

type CreateUserFormValues = z.infer<typeof createUserSchema>

type Props = {
    typeLeave?: {
        id: number,
        name: string,
        modified_by?: string,
    },
    onAction?: () => void;
};

export default function CreateTypeLeaveForm({ typeLeave, onAction }: Props) {
    const [open, setOpen] = useState(false)
    const { user } = useAuthStore();
    const { t } = useTranslation();

    const form = useForm<CreateUserFormValues>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            name: "",
            modified_by: user?.userCode
        },
    })

    useEffect(() => {
        if (typeLeave && open) {
            form.reset({ name: typeLeave.name });
        } else {
            form.reset({ name: "" });
        }
    }, [typeLeave, open, form]);

    const onSubmit = async (values: CreateUserFormValues) => {
        try {
            const data = {
                name: values.name,
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
                            Edit
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