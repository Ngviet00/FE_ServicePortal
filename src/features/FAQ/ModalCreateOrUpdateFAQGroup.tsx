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
import faqGroupApi, { FAQGroup } from "@/api/faqGroupApi"

const createUserSchema = z.object({
    title: z.string().min(1, { message: "Bắt buộc" }),
    titleV: z.string().min(1, { message: "Bắt buộc" }),
})

type CreateUserFormValues = z.infer<typeof createUserSchema>

type Props = {
    faqGroup?: FAQGroup,
    onAction?: () => void;
};

export default function ModalCreateOrUpdateFAQGroup({ faqGroup, onAction }: Props) {
    const [open, setOpen] = useState(false)
    const lang = useTranslation().i18n.language.split("-")[0]
    
    const form = useForm<CreateUserFormValues>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            title: "",
            titleV: "",
        },
    })

    useEffect(() => {
        if (faqGroup && open) {
            form.reset({ title: faqGroup.title, titleV: faqGroup.titleV });
        } else {
            form.reset({ title: "", titleV: "" });
        }
    }, [faqGroup, open, form]);

    const onSubmit = async (values: CreateUserFormValues) => {
        try {
            if (faqGroup?.id) {
                await faqGroupApi.update(faqGroup.id, values);
                ShowToast("Success");
            } else {
                await faqGroupApi.create(values);
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
                    faqGroup?.id ? (
                        <button className="hover:cursor-pointer ml-3 rounded-[3px] px-[5px] py-[2px] bg-[#555555] text-white">
                            {lang == 'vi' ? 'Sửa' : 'Edit'}
                        </button>
                    ) : (
                        <Button variant="outline" className="bg-black hover:bg-black hover:text-white text-white hover:cursor-pointer">
                            {lang == 'vi' ? 'Thêm mới nhóm FAQ' : 'Create new FAQ Group'}
                        </Button>
                    )
                }
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>{lang == 'vi' ? 'Nhóm FAQ' : 'FAQ Group'}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <Label htmlFor="title">{lang == 'vi' ? 'Tên tiếng anh' : 'English name'}</Label>
                                    <FormControl>
                                        <Input id="title" placeholder="..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}  
                        />

                        <FormField
                            control={form.control}
                            name="titleV"
                            render={({ field }) => (
                                <FormItem>
                                    <Label htmlFor="titleV">{lang == 'vi' ? 'Tên tiếng việt' : 'Vietnamese name'}</Label>
                                    <FormControl>
                                        <Input id="titleV" placeholder="..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}  
                        />
                        
                        <div className="flex justify-end">
                            <Button type="submit" className="hover:cursor-pointer">
                                {lang == 'vi' ? 'Xác nhận' : 'Submit'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}