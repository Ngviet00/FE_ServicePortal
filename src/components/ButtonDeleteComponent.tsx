import { 
  AlertDialog, 
  AlertDialogTrigger, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogFooter, 
  AlertDialogTitle, 
  AlertDialogCancel,
  AlertDialogDescription
} from "@/components/ui/alert-dialog"

import { useState } from "react"
import { useTranslation } from "react-i18next"

type DeleteDepartmentComponentProps = {
    id: unknown,
    onDelete: () => void,
    className?: string
}

export default function ButtonDeleteComponent({ onDelete, className }: DeleteDepartmentComponentProps) {
    const [open, setOpen] = useState(false)
    const { t } = useTranslation('common')

    const handleConfirm = () => {
        onDelete()
        setOpen(false)
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <button className={`hover:cursor-pointer mx-1 rounded-[3px] px-[5px] py-[2px] bg-red-700 text-white ${className}`}>
                    {t('delete')}
                </button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('confirm_delete')}</AlertDialogTitle>
                    <AlertDialogDescription>
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel className="hover:cursor-pointer">{t('cancel')}</AlertDialogCancel>
                    <button 
                        onClick={handleConfirm} 
                        className="hover:cursor-pointer inline-flex items-center justify-center rounded-md bg-black text-white px-4 py-2 text-sm font-medium"
                    >
                        {t('submit')}
                    </button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
