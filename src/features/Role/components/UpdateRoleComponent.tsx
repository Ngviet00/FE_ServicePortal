import { useEffect, useState } from "react"
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
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

const createUserSchema = z.object({
    name: z.string().min(1, { message: "Tên không được để trống" }),
})

type CreateUserFormValues = z.infer<typeof createUserSchema>

type Props = {
    role?: {
        id: number,
        name: string
    } | null,
    onSuccess?: () => void;
};

export default function UpdateRoleComponent({ role, onSuccess }: Props) {
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
            console.log(values.name);
            await roleApi.update(role ? role.id : -1, data)
            ShowToast("Update role successfully!", "success")
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

    useEffect(() => {
        if (open && role) {
            form.setValue("name", role.name)
            form.clearErrors()
        }
    }, [open, role, form])

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <button className="hover:cursor-pointer ml-3 rounded-[3px] px-[5px] py-[2px] bg-[#555555] text-white">
                    Edit
                </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Edit Role</AlertDialogTitle>
                        </AlertDialogHeader>

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
                        {errCustom && <div className="text-red-500 m-0 text-sm">{errCustom}</div>}
                        <AlertDialogFooter>
                            <AlertDialogCancel type="button" className="hover:cursor-pointer">
                                Cancel
                            </AlertDialogCancel>
                            <Button type="submit" className="hover:cursor-pointer">
                                Submit
                            </Button>
                        </AlertDialogFooter>
                    </form>
                </Form>
            </AlertDialogContent>
        </AlertDialog>
    )
}