import { useTranslation } from "react-i18next";
import Modal from "./Modal";
import { Button } from "./ui/button";

interface ModalConfirmProps {
    type?: string,
    isOpen: boolean;
    onClose: () => void;
    onSave: (type: string) => void;
    isPending?: boolean
}

const ModalConfirm: React.FC<ModalConfirmProps> = ({
    type,
    isOpen,
    onClose,
    onSave,
    isPending
}) => {
    const { t } = useTranslation()
    
    const handleSaveClick = () => {
        onSave(type?? "");
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="min-w-[500px] min-h-[100px]">
            <h2 className="text-xl font-semibold mb-2">
                { t('confirm') }
            </h2>
            
            <div className="flex justify-end mt-5">
                <Button disabled={isPending == true} className="mt-4 mr-2 px-4 py-2 bg-red-500 text-white rounded hover:cursor-pointer hover:bg-red-700" onClick={onClose}>
                    { t('cancel') }
                </Button>
                <Button disabled={isPending == true} className="mt-4 px-4 py-2 bg-blue-700 text-white rounded hover:cursor-pointer hover:bg-blue-900" onClick={handleSaveClick}>
                    { t('save') }
                </Button>
            </div>
        </Modal>
    )
}

export default ModalConfirm