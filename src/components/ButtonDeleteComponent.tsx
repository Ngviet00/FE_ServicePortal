import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogCancel } from "@/components/ui/alert-dialog"

import { useState } from "react"

type DeleteDepartmentComponentProps = {
    id: unknown,
    onDelete: () => void,
    className?: string
}

export default function ButtonDeleteComponent({ onDelete, className }: DeleteDepartmentComponentProps) {
    const [open, setOpen] = useState(false)

    const handleConfirm = () => {
        onDelete();
        setOpen(false);
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <button className={`hover:cursor-pointer ml-3 rounded-[3px] px-[5px] py-[2px] bg-red-700 text-white ${className}`}>
                    Delete
                </button>
            </AlertDialogTrigger>

            <AlertDialogContent aria-describedby="custom-description">
                <AlertDialogHeader>
                    <AlertDialogTitle>Do you want to delete?</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="hover:cursor-pointer">Cancel</AlertDialogCancel>
                    <button onClick={handleConfirm} className="hover:cursor-pointer inline-flex items-center justify-center rounded-md bg-black text-white px-4 py-2 text-sm font-medium">
                        Confirm
                    </button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}