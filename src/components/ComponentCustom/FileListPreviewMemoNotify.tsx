import { Download, X } from "lucide-react";
import { Spinner } from "../ui/spinner";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { UNIT_ENUM } from "@/lib";
import { useAppStore } from "@/store/appStore";

const getFileIcon = (file: { name?: string; type?: string }) => {
    const name = file.name || "";
    const type = file.type || "";

    if (type.includes("image/")) {
        return <img src="/icon-image.png" alt="Image" className="hover:cursor-pointer"/>;
    };

    if (type.includes("pdf") || name.endsWith(".pdf")) {
        return <img src="/icon-pdf.png" alt="Pdf" className="hover:cursor-pointer"/>;
    }

    if (type.includes("word") || name.endsWith(".doc") || name.endsWith(".docx")) {
        return <img src="/icon-word.svg" alt="Word" className="hover:cursor-pointer"/>;
    }

    if (type.includes("excel") || name.endsWith(".xls") || name.endsWith(".xlsx")) {
        return <img src='/icon-excel.svg' alt='Excel' className="hover:cursor-pointer"/>
    }

    return <img src='/icon-file-default.svg' alt='File' className="hover:cursor-pointer"/>
};

type FileType = {
    name: string;
    type?: string;
};

export type UploadedFileType = {
    id: string;
    fileName: string;
    contentType?: string;
    quoteId?: string,
    isSelectedQuote?: boolean
};

export default function FileListPreview({ 
    files,
    uploadedFiles = [],
    onRemove,
    onRemoveUploaded,
 }: {
    files: FileType[];
    uploadedFiles?: UploadedFileType[];
    onRemove: (index: number) => void;
    onRemoveUploaded?: (index: number) => void;
}) {
    return (
        <ul className="mt-2 space-y-2">
            {
                uploadedFiles.map((file, index) => (
                    <li key={`uploaded-${index}`} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                        <div className="flex items-center space-x-2">
                            {getFileIcon({name: file.fileName, type: file.contentType})}
                            <span className="text-sm">{file.fileName}</span>
                        </div>
                        {onRemoveUploaded && (
                            <button type="button" onClick={() => onRemoveUploaded(index)} className="text-red-500 hover:text-red-700 hover:cursor-pointer">
                                <X size={16} />
                            </button>
                        )}
                    </li>
                ))
            }

            {
                files.map((file, index) => (
                    <li 
                        key={`new-${index}`} 
                        className="inline-flex items-center bg-gray-100 p-2 rounded-md mr-3" 
                    >
                        <div className="flex items-center space-x-2">
                            {getFileIcon(file)}
                            <span className="text-sm">{file.name}</span>
                        </div>
                        <button 
                            type="button" 
                            onClick={() => onRemove(index)} 
                            className="text-red-500 hover:text-red-700 hover:cursor-pointer ml-4"
                        >
                            <X size={16} />
                        </button>
                    </li>
                ))
            }
        </ul>
    );
}

type FileListPreviewDownloadProps = {
    uploadedFiles?: UploadedFileType[];
    onDownload?: (file: UploadedFileType) => void;
    onRemoveUploaded?: (index: number) => void;
    isShowCheckbox?: boolean
};

export function FileListPreviewDownload ({
        uploadedFiles = [],
        onDownload,
        onRemoveUploaded,
        isShowCheckbox = true
    }: FileListPreviewDownloadProps) {

    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
    const user = useAuthStore(u => u.user);

    const selectedQuoteId = useAppStore(s => s.selectedQuoteId);
    const setSelectedQuoteId = useAppStore(s => s.setSelectedQuoteId);

    const handleSelectQuote = (id: string) => {
        const newId = selectedQuoteId == +id ? 0 : +id;
        setSelectedQuoteId(newId);
    };

    const handleDownload = async (file: UploadedFileType) => {
        setLoadingMap(prev => ({ ...prev, [file.id]: true }));
        try {
            await new Promise(res => setTimeout(res, 200));
            await onDownload?.(file);
        } finally {
            setLoadingMap(prev => ({ ...prev, [file.id]: false }));
        }
    };

    return (
        <ul className="flex flex-wrap gap-2">
            {uploadedFiles.map((file, index) => {
                const isSelected = selectedQuoteId == Number(file?.quoteId);
                const loading = loadingMap[file.id];
                

                return (
                    <li
                        key={file.id}
                        className={`flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-md cursor-pointer transition-colors ${
                            isSelected ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-200"
                        }`}
                    >
                        {
                            isShowCheckbox && (
                                <input
                                    type="checkbox"
                                    checked={isSelected || file?.isSelectedQuote}
                                    disabled={user?.unitId != UNIT_ENUM.GM || uploadedFiles.some(f => f.isSelectedQuote)}
                                    onChange={() => handleSelectQuote(file?.quoteId ?? '')}
                                    className="cursor-pointer accent-blue-500 w-4 h-4"
                                />
                            )                            
                        }
                        <button
                            type="button"
                            onClick={() => handleDownload(file)}
                            className="flex items-center gap-2 text-gray-700 cursor-pointer"
                        >
                            {getFileIcon({ name: file.fileName, type: file.contentType })}
                            <span className="text-sm break-all">{file.fileName}</span>
                            {loading ? <Spinner className="size-4 ml-1" /> : <Download size={16}/>}
                        </button>

                        {onRemoveUploaded && (
                            <button
                                type="button"
                                onClick={() => onRemoveUploaded(index)}
                                className="text-red-500 hover:text-red-700"
                                title="Xoá"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </li>
                );
            })}
        </ul>
        // <ul className="flex flex-wrap gap-2">
        //     {uploadedFiles.map((file, index) => (
        //         <li
        //         key={`uploaded-${index}`}
        //         className="flex items-center justify-between bg-gray-100 hover:bg-gray-200 transition-colors px-1 py-0.5 rounded-md max-w-full"
        //         >
        //         {/* Vùng click download */}
        //         <button
        //             type="button"
        //             onClick={() => handleDownload(file)}
        //             className="flex items-center gap-2 flex-1 text-left cursor-pointer"
        //         >
        //             {getFileIcon({ name: file.fileName, type: file.contentType })}
        //             <span className="text-sm truncate max-w-[200px]">{file.fileName}</span>
        //         </button>

        //         {/* Hành động */}
        //         <div className="flex items-center gap-2 ml-2">
        //             {loadingMap[file.id] ? (
        //             <Spinner className="size-4" />
        //             ) : (
        //             <button
        //                 type="button"
        //                 onClick={() => handleDownload(file)}
        //                 className="text-gray-600 hover:text-blue-600 cursor-pointer"
        //                 title="Download"
        //             >
        //                 <Download size={16} />
        //             </button>
        //             )}

        //             {onRemoveUploaded && (
        //             <button
        //                 type="button"
        //                 onClick={() => onRemoveUploaded(index)}
        //                 className="text-red-500 hover:text-red-700 cursor-pointer"
        //                 title="Remove"
        //             >
        //                 <X size={16} />
        //             </button>
        //             )}
        //         </div>
        //         </li>
        //     ))}
        // </ul>
    )
}