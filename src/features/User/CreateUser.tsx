import { useImportUserExcel, useImportUserLeavingExcel } from "@/api/userApi";
import { Spinner } from "@/components/ui/spinner";
import { useState, ChangeEvent, useRef } from "react";
import { useTranslation } from "react-i18next";

const IMPORT_TYPES = [
    { key: 'user', labelVi: 'Thêm mới nhân viên', labelEn: 'Upload new users', color: 'blue' },
    { key: 'leaving', labelVi: 'Nghỉ việc', labelEn: 'Reason for Leaving', color: 'orange' },
    // { key: 'shift', labelVi: 'Lịch phân ca', labelEn: 'Upload Shift Schedule', color: 'green' },
];

export default function CreateUser() {
    const { i18n } = useTranslation();
    const lang = i18n.language.split('-')[0];

    const [files, setFiles] = useState<{ [key: string]: File | null }>({});
    const fileRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    const importNewUserExcel = useImportUserExcel();
    const importUserLeaving = useImportUserLeavingExcel()

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: string) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (!selectedFile.name.endsWith('.xlsx')) {
                alert(lang === 'vi' ? 'Chỉ chấp nhận file .xlsx' : 'Only .xlsx files are accepted');
                e.target.value = "";
                return;
            }
            setFiles(prev => ({ ...prev, [type]: selectedFile }));
        }
    };

    const removeFile = (type: string) => {
        setFiles(prev => ({ ...prev, [type]: null }));
        if (fileRefs.current[type]) {
            fileRefs.current[type]!.value = "";
        }
    };

    const uploadFile = async (type: string) => {
        const file = files[type];
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);

        if (type === 'user') await importNewUserExcel.mutateAsync(formData);
        if (type === 'leaving') await importUserLeaving.mutateAsync(formData);
        
        removeFile(type);
    };

    return (
        <div className="p-4 pl-1 pt-0 space-y-6">
            <div className="flex justify-between mb-1">
                <h3 className="font-bold text-2xl m-0 pb-2">
                    {lang === 'vi' ? 'Quản lý Import dữ liệu' : 'Data Import Management'}
                </h3>
            </div>

            {IMPORT_TYPES.map((item, index) => {
                const isPending = 
                (item.key === 'user' && importNewUserExcel.isPending) ||
                (item.key === 'leaving' && importUserLeaving.isPending);

                const currentFile = files[item.key];
                const colorClass = {
                    blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-600',
                    green: 'bg-green-50 text-green-700 hover:bg-green-100 border-green-600',
                    orange: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-600'
                }[item.color] || 'bg-gray-50';

                const btnColor = {
                    blue: 'bg-blue-600 hover:bg-blue-700',
                    green: 'bg-green-600 hover:bg-green-700',
                    orange: 'bg-orange-600 hover:bg-orange-700'
                }[item.color] || 'bg-gray-600';

                return (
                    <section key={item.key} className={`space-y-4 ${index !== IMPORT_TYPES.length - 1 ? 'border-b pb-8' : ''}`}>
                        <h3 className={`font-bold text-xl`} style={{ color: item.color }}>
                            {index + 1}. {lang === 'vi' ? item.labelVi : item.labelEn}
                        </h3>
                        <div className="flex items-center gap-4">
                            <input
                                type="file"
                                accept=".xlsx"
                                ref={(el) => { fileRefs.current[item.key] = el; }}
                                onChange={(e) => handleFileChange(e, item.key)}
                                className={`text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 cursor-pointer ${colorClass} file:${colorClass}`}
                            />
                            <button
                                onClick={() => uploadFile(item.key)}
                                disabled={isPending || !currentFile}
                                className={`px-6 py-2 rounded-md font-medium cursor-pointer text-white transition-all ${isPending || !currentFile ? 'bg-gray-400 cursor-not-allowed' : btnColor}`}
                            >
                                {isPending ? <Spinner /> : (lang === 'vi' ? 'Xác nhận' : 'Submit')}
                            </button>
                            {currentFile && (
                                <button 
                                    onClick={() => removeFile(item.key)} 
                                    className="text-red-500 font-bold ml-2 cursor-pointer hover:scale-110 transition-transform"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}