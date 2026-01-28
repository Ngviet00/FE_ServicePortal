import { Download, X } from "lucide-react";
import { Spinner } from "../ui/spinner";
import { useState } from "react";

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
    isSelected?: boolean,
    entityId?: number
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
                files?.map((file, index) => (
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
    isShowCheckbox?: boolean,
    quoteSelected?: number,
    handleSetSelectedQuote?: (quoteSelected: number) => void,
    isDisabled?: boolean
};

export function FileListPreviewDownload ({
        uploadedFiles = [],
        onDownload,
        onRemoveUploaded,
        isShowCheckbox = false,
        quoteSelected,
        handleSetSelectedQuote,
        isDisabled = false
    }: FileListPreviewDownloadProps) {

    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

    const handleDownload = async (file: UploadedFileType) => {
        setLoadingMap(prev => ({ ...prev, [file.id]: true }));
        try {
            await new Promise(res => setTimeout(res, 200));
            await onDownload?.(file);
        } finally {
            setLoadingMap(prev => ({ ...prev, [file.id]: false }));
        }
    };

    const hasSelectedFile = uploadedFiles.some(f => f.isSelected);

    const displayFiles = hasSelectedFile
        ? uploadedFiles.filter(f => f.isSelected)
        : uploadedFiles;

    return (
        <ul className="flex flex-wrap gap-2">
            {displayFiles.map((file, index) => {
                const loading = loadingMap[file.id];
                
                return (
                    <li
                        key={file.id}
                        className={`flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-md cursor-pointer transition-colors `}
                    >
                        {
                            isShowCheckbox && handleSetSelectedQuote && (
                                <input
                                    type="checkbox"
                                    disabled={uploadedFiles?.some(e => e?.isSelected) || isDisabled}
                                    checked={quoteSelected == file.entityId}
                                    onChange={() => handleSetSelectedQuote(file?.entityId ?? 0)}
                                    className="cursor-pointer accent-black w-5 h-5"
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
    )
}