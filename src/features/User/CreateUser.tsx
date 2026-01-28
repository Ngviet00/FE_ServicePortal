import { useImportUserExcel } from "@/api/userApi";
import { useState, ChangeEvent, useRef } from "react";
import { useTranslation } from "react-i18next";

export default function CreateUser() {
    const lang = useTranslation().i18n.language.split('-')[0];

    const [userFile, setUserFile] = useState<File | null>(null);
    const [uploadingUser] = useState(false);
    const userFileRef = useRef<HTMLInputElement>(null);

    const [shiftFile, setShiftFile] = useState<File | null>(null);
    const [uploadingShift] = useState(false);
    const shiftFileRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: 'user' | 'shift') => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (!selectedFile.name.endsWith('.xlsx')) {
                alert(lang === 'vi' ? 'Chỉ chấp nhận file .xlsx' : 'Only .xlsx files are accepted');
                e.target.value = "";
                return;
            }

            if (type == 'user') {
                setUserFile(selectedFile);
            }
            else {
                setShiftFile(selectedFile);
            }
        }
    };

    const removeFile = (type: 'user' | 'shift') => {
        if (type === 'user') {
            setUserFile(null);
            if (userFileRef.current) userFileRef.current.value = "";
        } else {
            setShiftFile(null);
            if (shiftFileRef.current) shiftFileRef.current.value = "";
        }
    };

    const importUserExcel = useImportUserExcel();

    const uploadFile = async (type: 'user' | 'shift') => {
        const file = type === 'user' ? userFile : shiftFile;

        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            await importUserExcel.mutateAsync(formData);
            removeFile(type);
        }
        catch (error) {
            console.error("Upload failed:", error);
        }
    };

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex justify-between mb-1">
                <h3 className="font-bold text-2xl m-0 pb-2">{lang == 'vi' ? 'Thêm người mới' : 'Add new user'}</h3>
            </div>

            <section className="space-y-4 border-b pb-8">
                <h3 className="font-bold text-xl text-blue-800">
                    1. {lang === 'vi' ? 'Thêm mới nhân viên' : 'Upload new users'}
                </h3>
                <div className="flex items-center gap-4">
                    <input 
                        type="file" accept=".xlsx" ref={userFileRef}
                        onChange={(e) => handleFileChange(e, 'user')}
                        className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                    <button 
                        onClick={() => uploadFile('user')}
                        disabled={uploadingUser || !userFile || importUserExcel.isPending}
                        className={`px-6 py-2 rounded-md font-medium cursor-pointer text-white ${importUserExcel.isPending || uploadingUser || !userFile ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {uploadingUser ? '...' : (lang === 'vi' ? 'Xác nhận' : 'Submit')}
                    </button>
                    {userFile && (
                        <button onClick={() => removeFile('user')} className="text-red-500 font-bold ml-2 cursor-pointer">✕</button>
                    )}
                </div>
            </section>

            <section className="space-y-4">
                <h3 className="font-bold text-xl text-green-800">
                    2. {lang === 'vi' ? 'Lịch phân ca' : 'Upload Shift Schedule'}
                </h3>
                <div className="flex items-center gap-4">
                    <input 
                        type="file" accept=".xlsx" ref={shiftFileRef}
                        onChange={(e) => handleFileChange(e, 'shift')}
                        className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
                    />
                    <button 
                        onClick={() => uploadFile('shift')}
                        disabled={uploadingShift || !shiftFile}
                        className={`px-6 py-2 rounded-md font-medium cursor-pointer text-white ${uploadingShift || !shiftFile ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                        {uploadingShift ? '...' : (lang === 'vi' ? 'Xác nhận' : 'Submit')}
                    </button>
                    {shiftFile && (
                        <button onClick={() => removeFile('shift')} className="text-red-500 font-bold ml-2 cursor-pointer">✕</button>
                    )}
                </div>
            </section>
        </div>
    );
}