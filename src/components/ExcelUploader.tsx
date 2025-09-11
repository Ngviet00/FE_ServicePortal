import { ShowToast } from "@/lib";
import { X } from "lucide-react";
import { useState } from "react";

type ExcelUploaderProps = {
    templateFileUrl: string;
    onSubmit: (file: File) => Promise<boolean>;
    triggerLabel?: string;
};

export default function ExcelUploader({ templateFileUrl, onSubmit }: ExcelUploaderProps) {
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) setFile(f);
    };

    const handleClear = () => setFile(null);

    const handleSubmit = async () => {
        if (!file) {
            ShowToast("Please select a file!", "error");
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
                <h3 className="text-lg font-semibold">Upload Excel:</h3> <br />
                <a
                    href={templateFileUrl}
                    download
                    className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 rounded-md shadow-sm transition text-sm"
                >
                    Template
                </a>
                <label className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded-md shadow-sm transition text-sm cursor-pointer">
                    Choose
                    <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" />
                </label>
            </div>  

            {file && (
                <div className="flex items-center space-x-2 mt-2">
                    <span className="text-gray-700 text-sm">{file.name}</span>
                    <X className="text-red-500 cursor-pointer hover:bg-gray-100 rounded-full p-1" onClick={handleClear}/>
                    <button
                        onClick={handleSubmit}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-md shadow-sm transition text-sm"
                    >
                        Submit
                    </button>
                </div>
            )}
        </div>
    );
}
