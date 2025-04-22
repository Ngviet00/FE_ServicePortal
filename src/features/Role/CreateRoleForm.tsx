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
import roleApi from "@/api/roleApi"
import { AxiosError } from "axios"

const createUserSchema = z.object({
    name: z.string().min(1, { message: "Tên không được để trống" }),
})

type CreateUserFormValues = z.infer<typeof createUserSchema>

type Props = {
    role?: {
        id: number,
        name: string
    },
    onAction?: () => void;
};

export default function CreateRoleComponent({ role, onAction }: Props) {
    const [open, setOpen] = useState(false)

    const form = useForm<CreateUserFormValues>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            name: "",
        },
    })

    useEffect(() => {
        if (role && open) {
            form.reset({ name: role.name });
        } else {
            form.reset({ name: "" });
        }
    }, [role, open, form]);

    const onSubmit = async (values: CreateUserFormValues) => {
        try {
            if (role?.id) {
                await roleApi.update(role.id, values);
                ShowToast("Update role success", "success");
            } else {
                await roleApi.create(values);
                ShowToast("Add new role success", "success");
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
                    role?.id ? (
                        <button className="hover:cursor-pointer ml-3 rounded-[3px] px-[5px] py-[2px] bg-[#555555] text-white">
                            Edit
                        </button>
                    ) : (
                        <Button variant="outline" className="bg-black hover:bg-black hover:text-white text-white hover:cursor-pointer">Create Role</Button>
                    )
                }
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>{role?.id ? "Update" : "Create New"} Role</DialogTitle>
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