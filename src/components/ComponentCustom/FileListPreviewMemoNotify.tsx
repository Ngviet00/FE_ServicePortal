import { Download, X } from "lucide-react";
import { Spinner } from "../ui/spinner";
import { useState } from "react";

const getFileIcon = (file: { name?: string; type?: string }) => {
    const name = file.name || "";
    const type = file.type || "";

    if (type.includes("image/")) {
        return <img src="/icon-image.png" alt="Image"/>;
    };

    if (type.includes("pdf") || name.endsWith(".pdf")) {
        return <img src="/icon-pdf.png" alt="Pdf"/>;
    }

    if (type.includes("word") || name.endsWith(".doc") || name.endsWith(".docx")) {
        return <img src="/icon-word.svg" alt="Word"/>;
    }

    if (type.includes("excel") || name.endsWith(".xls") || name.endsWith(".xlsx")) {
        return <img src='/icon-excel.svg' alt='Excel'/>
    }

    return <img src='/icon-file-default.svg' alt='File'/>
};

type FileType = {
    name: string;
    type?: string;
};

export type UploadedFileType = {
    id: string;
    fileName: string;
    contentType?: string;
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

            {/* new file */}
            {
                files.map((file, index) => (
                    <li key={`new-${index}`} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                        <div className="flex items-center space-x-2">
                            {getFileIcon(file)}
                            <span className="text-sm">{file.name}</span>
                        </div>
                        <button type="button" onClick={() => onRemove(index)} className="text-red-500 hover:text-red-700 hover:cursor-pointer">
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
};

export function FileListPreviewDownload ({
        uploadedFiles = [],
        onDownload,
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

    return (
        <ul className="flex flex-wrap gap-2">
            {
                 uploadedFiles.map((file, index) => (
                    <li onClick={() => handleDownload(file)} key={`uploaded-${index}`} className="hover:cursor-pointer inline-flex items-center hover:bg-gray-200 bg-gray-100 px-3 py-1 rounded-md max-w-full">
                        <div className="flex items-center space-x-2 pr-3">
                            {getFileIcon({name: file.fileName, type: file.contentType})}
                            <span className="text-sm ">{file.fileName}</span>
                        </div>
                        <button>
                            {
                                loadingMap[file.id] ? (<Spinner className="size-4"/>) : (<Download size={16} /> )
                            }
                        </button>
                    </li>
                ))
            }
        </ul>
    )
}