import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Spinner } from "@/components/ui/spinner";

export const ConfirmDialogToHR = ({
    title,
    description,
    onConfirm,
    isPending,
    confirmText,
    cancelText,
    children,
        }: {
    title: string
    description?: string
    onConfirm: () => void
    isPending?: boolean
    confirmText?: string
    cancelText?: string
    children: React.ReactNode
}) => {
    return (
        <AlertDialog>
            <AlertDialogTrigger disabled={isPending} asChild>
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="hover:cursor-pointer">
                        {cancelText ?? "Cancel"}
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm} className="hover:cursor-pointer">
                        {isPending ? <Spinner className="text-white" /> : confirmText ?? "OK"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};