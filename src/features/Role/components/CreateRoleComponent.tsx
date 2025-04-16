import { useState } from "react"
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
import { ShowToast } from "@/ultils"
import roleApi from "@/api/roleApi"
import { AxiosError } from "axios"

const createUserSchema = z.object({
    name: z.string().min(1, { message: "Tên không được để trống" }),
})

type CreateUserFormValues = z.infer<typeof createUserSchema>

type Props = {
    onSuccess?: () => void;
};

export default function CreateRoleComponent({ onSuccess }: Props) {
    const [open, setOpen] = useState(false)
    const [errCustom, setErrCustom] = useState("")

    const form = useForm<CreateUserFormValues>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
          name: "",
        },
    })

    form.setError("root.backendError", {
        type: "server",
        message: "Validation failed from backend",
    })
    
    const onSubmit = async (values: CreateUserFormValues) => {
        try {
            const data = {
                name: values.name
            }
            await roleApi.create(data)
            ShowToast("Add new role successfully!", "success")
            setOpen(false)
            form.reset()
            onSuccess?.()
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error.response?.status === 422) {
                    const serverErrors = error.response.data.errors
                    serverErrors.forEach((err: { field: string, errors: string[] }) => {
                        form.setError("name", {
                            type: "server",
                            message: err.errors[0],
                        })
                    })
                } else {
                    ShowToast("Server error", "error")
                }
            } else {
                setErrCustom("Server error")
                ShowToast("Add new role failed!", "error")
            }
        }
    }

    const handleDialogChange = (isOpen: boolean) => {
        setOpen(isOpen)
        if (!isOpen) {
            form.reset()
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
                <Button variant="outline" className="bg-black hover:bg-black hover:text-white text-white hover:cursor-pointer">Create Role</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>Create New Role</DialogTitle>
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
                            { errCustom && (
                                <div className="text-red-500 m-0 text-sm">{errCustom}</div>
                            )}
                        
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