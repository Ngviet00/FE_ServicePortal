/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2 } from 'lucide-react'; // Thêm icon Loader
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
    data: any[];
    onViewExcel: (id: number) => void;
}

const SapSidebar: React.FC<SidebarProps> = ({ data, onViewExcel }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const lang = useTranslation().i18n.language.split('-')[0];
    const listRef = useRef<List>(null);

    useEffect(() => {
        if (isOpen) {
            listRef.current?.scrollToItem(0);
        }
    }, [isOpen]);

    const handleExport = async (id: number) => {
        if (isExporting) return;

        setIsExporting(true);
        
        try {
            await onViewExcel(id);
        } finally {
            setTimeout(() => {
                setIsExporting(false);
            }, 1000); 
        }
    };

    const RowData = ({ index, style, data }: ListChildComponentProps<any[]>) => {
        const item = data[index];
        if (!item) return null;

        return (
            <div style={style} className={`bg-white border-b hover:bg-slate-100 ${isExporting ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="group flex items-center justify-between p-3 mb-2 transition-all">
                    <div className="flex flex-col overflow-hidden">
                        <span 
                            onClick={() => handleExport(item.id)} 
                            className="font-bold text-sm truncate underline text-blue-700 hover:cursor-pointer disabled:text-gray-400"
                        >
                            {item.materialNumber}
                        </span>
                    </div>
                    {isExporting && index === index}
                </div>
            </div>
        );
    };

    return (
        <>
            <button 
                disabled={data.length === 0}
                onClick={() => setIsOpen(true)} 
                className="bg-orange-600 hover:bg-orange-700 py-1 px-2 rounded-[3px] text-white ml-1 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {lang === 'vi' ? `Xem trước excel` : `Preview excel`} {`${data.length > 0 ? `(${data.length})` : ''}`}
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-slate-900/40 z-51" onClick={() => !isExporting && setIsOpen(false)} />
            )}

            <div className={`fixed top-0 right-0 h-full w-[400px] bg-slate-50 z-52 shadow-2xl transform transition-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-5 border-b bg-white flex justify-between items-center">
                    <div className='italic text-[15px] font-semibold flex items-center gap-2'>
                        {isExporting && <Loader2 className="animate-spin text-orange-600" size={16} />}
                        ({lang === 'vi' ? 'Nhấn để mở bằng excel' : 'Click to open by excel'})
                    </div>
                    <button onClick={() => !isExporting && setIsOpen(false)}>
                        <X size={20} className={isExporting ? 'text-gray-300' : 'cursor-pointer'}/>
                    </button>
                </div>

                <div className="h-[calc(100vh-180px)]">
                    {data.length > 0 ? (
                        <List
                            ref={listRef}
                            height={window.innerHeight - 180}
                            itemCount={data.length}
                            itemSize={45}
                            itemData={data}
                            width="100%"
                            className={isExporting ? "pointer-events-none" : ""}
                        >
                            {RowData}
                        </List>
                    ) : (
                        <div className="flex justify-center py-20 text-slate-400 font-medium">
                            {lang === 'vi' ? 'Không có dữ liệu phù hợp' : 'No data'}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default SapSidebar;