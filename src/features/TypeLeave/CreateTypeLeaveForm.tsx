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
import { ShowToast } from "@/lib"
import { AxiosError } from "axios"
import { useAuthStore } from "@/store/authStore"
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

    const form = useForm<CreateUserFormValues>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            name: "",
            modified_by: user?.name
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
                modified_by: user?.name
            }
            console.log(data, 22);
            if (typeLeave?.id) {
                await typeLeaveApi.update(typeLeave.id, data);
                ShowToast("Success", "success");
            } else {
                await typeLeaveApi.create(data);
                ShowToast("Success", "success");
            }
            onAction?.();
            setOpen(false);
            form.reset();
        } catch (err: unknown) {
            const error = err as AxiosError<{ message: string }>
            const message = error?.response?.data?.message ?? "Something went wrong"
			form.setError("name", {
				type: "server",
				message,
			})
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
                        <Button variant="outline" className="bg-black hover:bg-black hover:text-white text-white hover:cursor-pointer">Create Type Leave</Button>
                    )
                }
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>{typeLeave?.id ? "Update" : "Create New"} Type Leave</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <Label htmlFor="name">Name</Label>
                                    <FormControl>
                                        <Input id="name" placeholder="Input role..." {...field} />
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