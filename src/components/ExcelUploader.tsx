/* eslint-disable @typescript-eslint/no-explicit-any */
import { ShowToast } from "@/lib";
import { X } from "lucide-react";
import { useRef, useState } from "react";
import i18n from "@/i18n/i18n";

const ALLOWED_EXT = [".xlsx", ".xls"];
const ALLOWED_TYPES = [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

type ExcelUploaderProps = {
    templateFileUrl: string;
    onSubmit: (file: File) => Promise<boolean>;
    accept?: string;
    showTemplateButton?: boolean;
};

const texts: Record<string, any> = {
    en: {
        title: "Upload Excel",
        download_template: "Download template",
        choose: "Choose",
        submit: "Submit",
        error_select_file: "Please select a file!",
        size_file: "File size must be smaller or equal ",
        invalid_file: "Invalid file type!"
    },
    vi: {
        title: "Tải lên excel",
        download_template: "Tải file mẫu",
        choose: "Chọn",
        submit: "Xác nhận",
        error_select_file: "Chưa chọn file!",
        size_file: "Kích thước file phải nhỏ hơn hoặc bằng ",
        invalid_file: "File không đúng định dạng!"
    },
};

export default function ExcelUploader({ 
    templateFileUrl, 
    onSubmit,
    accept = ".xlsx,.xls",
    showTemplateButton = true,
 }: ExcelUploaderProps) {
    const [file, setFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    const lang = i18n.language as "en" | "vi";
    const t = texts[lang] ?? texts.en;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) {

            // check MIME type
            const isValidType = ALLOWED_TYPES.includes(f.type);

            // check file extension
            const ext = "." + f.name.split(".").pop()?.toLowerCase();
            const isValidExt = ALLOWED_EXT.includes(ext);

            if (!isValidType || !isValidExt) {
                ShowToast(t.error_invalid_file ?? t.invalid_file, "error");
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }

            if (f.size > MAX_FILE_SIZE) {
                ShowToast(`${t.size_file} ${MAX_FILE_SIZE/1024/1024}MB`, "error");
                if (fileInputRef.current) fileInputRef.current.value = ""
                return;
            }

            setFile(f);
        }
    };

    const handleClear = () => {
        setFile(null)

        if (fileInputRef.current) {
             fileInputRef.current.value = ""
        }
    }

    const handleSubmit = async () => {
        if (!file) {
            ShowToast(t.error_select_file, "error");
            return;
        }

        const success = await onSubmit(file);

        if (success) {
            setFile(null);
        }
    };

    return (
        <div className="flex flex-col space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold">{t.title}:</h3> <br />
                {
                    showTemplateButton && (
                         <a
                            href={templateFileUrl}
                            download
                            className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 rounded-md shadow-sm transition text-sm"
                        >
                            {t.download_template}
                        </a>
                    )
                }
                <label className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded-md shadow-sm transition text-sm cursor-pointer">
                    {t.choose}
                    <input
                        ref={fileInputRef}
                        accept={accept}
                        type="file"
                        onChange={handleFileChange} 
                        className="hidden"
                    />
                </label>
            </div>  

            {file && (
                <div className="flex items-center space-x-2 mt-2">
                    <span className="text-gray-700 text-sm">{file.name}</span>
                    <X className="text-red-500 cursor-pointer hover:bg-gray-100 rounded-full p-1" onClick={handleClear}/>
                    <button
                        onClick={handleSubmit}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-md shadow-sm transition text-sm cursor-pointer"
                    >
                        {t.submit}
                    </button>
                </div>
            )}
        </div>
    );
}
