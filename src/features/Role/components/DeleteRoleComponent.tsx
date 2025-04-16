import roleApi from "@/api/roleApi"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogCancel } from "@/components/ui/alert-dialog"
import { ShowToast } from "@/ultils"
import { useState } from "react"

type DeleteRoleComponentProps = {
    role?: {
        id: number,
        name: string,
    } | null,
    onSuccess?: () => void
}

export default function DeleteRoleComponent({ role, onSuccess }: DeleteRoleComponentProps) {
    const [open, setOpen] = useState(false)

    const handleDelete = async () => {
        try {
            await roleApi.delete(role ? role.id : -1)
            ShowToast(`Delete role successfully`, "success")
            setOpen(false)
            onSuccess?.();
        }
        catch (err) {
            console.log(err);
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <button className="hover:cursor-pointer ml-3 rounded-[3px] px-[5px] py-[2px] bg-black text-white">
                    Delete
                </button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Do you want to delete role <span className="text-red-700">{role ? role.name : ""}</span>?</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="hover:cursor-pointer">Cancel</AlertDialogCancel>
                    <button onClick={handleDelete} className="hover:cursor-pointer inline-flex items-center justify-center rounded-md bg-black text-white px-4 py-2 text-sm font-medium">
                        Confirm
                    </button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}