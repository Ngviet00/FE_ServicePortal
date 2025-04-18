
import departmentApi from "@/api/departmentApi"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogCancel } from "@/components/ui/alert-dialog"
import { ShowToast } from "@/ultils"
import { useMutation } from "@tanstack/react-query"

import { useState } from "react"

type DeleteDepartmentComponentProps = {
    id: number,
    remainingCount?: number, // <--- thêm cái này
    onSuccess?: (shouldGoBack?: boolean) => void
}

export default function DeleteDepartmentComponent({ id, remainingCount, onSuccess }: DeleteDepartmentComponentProps) {
    const [open, setOpen] = useState(false)

	const mutation = useMutation({
		mutationFn: async () => {
			await departmentApi.delete(id);
		}
	});

    const handleDelete = async () => {
        try {
            await mutation.mutateAsync();
            const shouldGoBack = (remainingCount === 1); // nếu là item cuối
            onSuccess?.(shouldGoBack);
            ShowToast("Delete department success", "success")
            setOpen(false)
        } catch (err) {
            console.error("Failed to delete department:", err);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <button className="hover:cursor-pointer ml-3 rounded-[3px] px-[5px] py-[2px] bg-black text-white">
                    Delete
                </button>
            </AlertDialogTrigger>

            <AlertDialogContent aria-describedby="custom-description">
                <AlertDialogHeader>
                    <AlertDialogTitle>Do you want to delete?</AlertDialogTitle>
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