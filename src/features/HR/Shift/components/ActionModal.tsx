/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo } from 'react';
import { Spinner } from '@/components/ui/spinner';

type BulkData = { fromDay: string; toDay: string; shift: string; shiftSearch: string };

type ActionModalProps = {
    open: boolean;
    lang: string;
    shifts: any[];
    filteredShifts: any[];
    bulkData: BulkData;
    setBulkData: React.Dispatch<React.SetStateAction<BulkData>>;
    loading: boolean;
    onClose: () => void;
    onConfirm: () => void;
};

const ActionModal = memo(function ActionModal({
    open,
    lang,
    shifts,
    filteredShifts,
    bulkData,
    setBulkData,
    loading,
    onClose,
    onConfirm,
}: ActionModalProps) {
   if (!open) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full min-h-[85vh] max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-[18px] font-medium">{lang == 'vi' ? 'Cập nhật ca' : 'Update shifts'}</h3>
                    <button onClick={onClose} className="font-medium text-xl cursor-pointer">
                        X
                    </button>
                </div>

                <div className="px-6 py-3 space-y-7">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="text-[15px] font-medium block mb-1.5">{lang == 'vi' ? 'Từ ngày' : 'From day'}</label>
                        <select
                            className="w-full bg-slate-100 border-none rounded-md p-2 text-[13px] font-bold cursor-pointer"
                            value={bulkData.fromDay}
                            onChange={(e) => setBulkData((prev) => ({ ...prev, fromDay: e.target.value }))}
                        >
                            {Array.from({ length: 31 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {lang == 'vi' ? `Ngày ${i + 1}` : `Day ${i + 1}`}
                            </option>
                            ))}
                        </select>
                        </div>

                        <div>
                        <label className="text-[15px] font-medium block mb-1.5">{lang == 'vi' ? 'Đến ngày' : 'To day'}</label>
                        <select
                            className="w-full bg-slate-100 border-none rounded-md p-2 text-[13px] font-bold cursor-pointer"
                            value={bulkData.toDay}
                            onChange={(e) => setBulkData((prev) => ({ ...prev, toDay: e.target.value }))}
                        >
                            {Array.from({ length: 31 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {lang == 'vi' ? `Ngày ${i + 1}` : `Day ${i + 1}`}
                            </option>
                            ))}
                        </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-[14px] font-medium block mb-1.5">
                        {lang == 'vi' ? 'Chọn mã ca' : 'Select shift code'} ({filteredShifts?.length}/{shifts?.length})
                        </label>

                        <div className="border border-slate-200 rounded-md">
                        <input
                            type="text"
                            placeholder={lang == 'vi' ? 'Tìm kiếm ca...' : 'Search shift code...'}
                            className="w-full border-none border-b border-slate-100 bg-slate-50 px-3 py-2 text-[13px] focus:ring-0"
                            value={bulkData.shiftSearch}
                            onChange={(e) => setBulkData((prev) => ({ ...prev, shiftSearch: e.target.value }))}
                        />

                        <div className="h-90 overflow-y-auto bg-white divide-y divide-slate-50 custom-scrollbar">
                            {filteredShifts.length > 0 ? (
                            filteredShifts.map((shift: any) => (
                                <button
                                key={shift.shiftId}
                                type="button"
                                onClick={() => setBulkData((prev) => ({ ...prev, shift: shift.shiftCode }))}
                                className={`w-full text-left px-4 py-2.5 text-[13px] font-bold transition-colors flex justify-between items-center 
                                    ${bulkData.shift === shift.shiftCode ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                <span>{shift.shiftCode}</span>
                                {bulkData.shift === shift.shiftCode && (
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                    />
                                    </svg>
                                )}
                                </button>
                            ))
                            ) : (
                            <div className="p-4 text-center text-slate-400 text-[12px]">
                                {lang == 'vi' ? 'Không tìm thấy ca nào' : 'No shift found'}
                            </div>
                            )}
                        </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 flex gap-3">
                    <button
                        disabled={loading}
                        onClick={onConfirm}
                        className="flex-[2] py-2.5 bg-slate-900 text-white rounded-md text-[15px] font-medium hover:bg-black transition cursor-pointer"
                    >
                        {loading ? <Spinner /> : lang == 'vi' ? 'Xác nhận' : 'Confirm'}
                    </button>

                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-400 rounded-md cursor-pointer text-[15px] font-black uppercase hover:bg-slate-100 transition"
                    >
                        {lang == 'vi' ? 'Hủy' : 'Cancel'}
                    </button>
                </div>
            </div>
        </div>
    );
});

export default ActionModal;