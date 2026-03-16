/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { handleDownloadTemplate, ShowToast, useDebounce } from '@/lib';
import { FileUp, Plus, Search, X } from 'lucide-react';
import scanMachineApi, { useImportAddAttendanceData } from '@/api/HR/scannerMachineApi';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Spinner } from '@/components/ui/spinner';

const tableHeaders = [
    { en: "No.", vi: "STT" },
    { en: "Emp No", vi: "Mã NV" },
    { en: "Full Name", vi: "Họ Tên" },
    { en: "Dept", vi: "Bộ Phận" },
    { en: "Card No", vi: "Mã Thẻ" },
    { en: "Date", vi: "Ngày" },
    { en: "Time", vi: "Thời Gian" },
    { en: "In/Out", vi: "Vào/Ra" },
    { en: "Device", vi: "Máy CC" },
    { en: "Note", vi: "Ghi chú" }
];

const AddAttendanceData = () => {
    const lang = useTranslation().i18n.language.split('-')[0];
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedName = useDebounce(searchTerm, 400);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const queryClient = useQueryClient()

    const getCurrentTime = () => {
        const now = new Date();
        return now.getHours().toString().padStart(2, '0') + ':' + 
            now.getMinutes().toString().padStart(2, '0');
    };

    const [formData, setFormData] = useState({
        eventTime: getCurrentTime(),
        inOut: 'In',
        machineId: 'B1',
        note: ''
    });

    const { data: listScanTimeKeeping = [] } = useQuery({
        queryKey: ['list-scan-timekeeping'],
        queryFn: async () => {  
            const res = await scanMachineApi.getAll({});
            return res.data.data;
        },
        select: (data) => {
            if (!Array.isArray(data)) return [];
            return data.filter(item => item.typeMachine == 1);
        }
    });

    const { data: dataUserScans = [], isFetching } = useQuery({
        queryKey: ['check-data-user-scan-timekeeping', debouncedName, date],
        queryFn: async () => {
            const res = await scanMachineApi.getDataUserScan({
                type: 1,
                fromDate: date,
                toDate: date,
                departmentName: null,
                keySearch: debouncedName || null,
                page: 1
            })
            return res.data.data
        },
        enabled: debouncedName != ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addAttendanceData = useImportAddAttendanceData()

    const handleSubmitManual = async () => {
        if (searchTerm == '') {
            ShowToast('Chưa nhập mã nhân viên', 'error')
            return
        }

        const fData = new FormData();
        fData.append('userCode', searchTerm)
        fData.append('date', date)
        fData.append('time', `${formData.eventTime}`)
        fData.append('nameMachine', formData.machineId)
        fData.append('inOut', formData.inOut)
        fData.append('note', formData.note)

        await addAttendanceData.mutateAsync(fData)

        queryClient.invalidateQueries({ queryKey: ['check-data-user-scan-timekeeping', debouncedName, date] })
    };

    const handleSubmitHaveExcel = async () => {
        const fData = new FormData();
        if (!selectedFile) return;
        fData.append('file', selectedFile)
        await addAttendanceData.mutateAsync(fData)
        setSelectedFile(null)
        queryClient.invalidateQueries({ queryKey: ['check-data-user-scan-timekeeping', debouncedName, date] })
    }

    const handleFileUpload = (e: ChangeEvent<HTMLInputElement> | { target: { files: FileList | File[] } }) => {
        const files = (e.target as any).files;
        const file = files ? files[0] : null;
        
        if (!file) return;
        setSelectedFile(file);
    };

    const handleRemoveFile = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedFile(null);
        const fileInput = document.getElementById('excel-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            const fileName = file.name.toLowerCase();
            if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
                handleFileUpload({ target: { files: [file] } });
            } else {
                alert(lang === 'vi' ? "Vui lòng chỉ chọn file Excel!" : "Please select Excel files only!");
            }
        }
    };
    
    return (
        <div className="text-slate-900 pl-1">
            <div className="mx-auto space-y-6">
                <div className="bg-white border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="font-bold text-2xl m-0 pb-2">{lang == 'vi' ? 'Bù dữ liệu chấm công' :'Add attendace data'}</h3>
                    </div>
                    <div className='flex items-center content-center'>
                        <div className="flex items-center gap-2 w-full sm:w-auto mr-3">
                            <input 
                                type="date"
                                value={date}
                                onChange={(e) => {
                                    const newDate = e.target.value;
                                    setDate(newDate);
                                }}
                                className="shadow-xs border border-gray-300 p-1 rounded-[5px] hover:cursor-pointer w-full sm:w-[160px] text-sm outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <div className="relative w-full md:w-96">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                                placeholder={lang == 'vi' ? 'Mã nhân viên' : 'Usercode'}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className={`min-w-full divide-y divide-gray-200 `}> 
                            <thead className="bg-gray-50">
                                <tr>
                                    {tableHeaders.map((header, idx: number) => (
                                        <th key={idx} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {lang == 'vi' ? header.vi : header.en}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 text-sm">
                                {(isFetching) ? (
                                    Array.from({ length: 1 }).map((_, skeletonIdx) => (
                                        <tr key={`skeleton-${skeletonIdx}`} className="animate-pulse">
                                            {Array.from({ length: 10 }).map((_, cellIdx) => (
                                                <td key={cellIdx} className="px-4 py-4">
                                                    <div className="h-4 bg-gray-200 rounded-md w-full"></div>
                                                </td>
                                            ))}
                                        </tr>
                                        ))
                                    ) : dataUserScans?.results?.length > 0 ? (
                                            dataUserScans.results.map((emp: any, idx: number) => (
                                            <tr 
                                                key={idx} 
                                                className={`hover:bg-blue-50/30 transition-colors ${emp?.Note ? 'text-red-500 font-medium' : ''}`}
                                            >
                                                <td className='text-center px-4 py-3 whitespace-nowrap text-gray-400'>{idx + 1}</td>
                                                <td className='text-center px-4 py-3'>{emp?.UserCode ?? '-'}</td>
                                                <td className='text-center px-4 py-3'>{emp?.UserName ?? '-'}</td>
                                                <td className='text-center px-4 py-3'>{emp?.DeptName ?? '-'}</td>
                                                <td className='text-center px-4 py-3'>{emp?.EmployeeNo ?? '-'}</td>
                                                <td className='text-center px-4 py-3'>{emp?.EventTime ? emp?.EventTime?.split('T')[0] : '-'}</td>
                                                <td className='text-center px-4 py-3'>{emp?.EventTime ? emp?.EventTime?.split('T')[1]?.substring(0, 5) : '-'}</td>
                                                <td className='text-center px-4 py-3'>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] ${emp?.In_Out === 'In' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                        {emp?.In_Out ?? '-'}
                                                    </span>
                                                </td>
                                                <td className='text-center px-4 py-3'>{emp?.NameMCC ?? '-'}</td>
                                                <td className='text-center px-4 py-3 italic'>{emp?.Note ?? '-'}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={10} className="py-4 text-center bg-white text-gray-400 italic">
                                                {lang === 'vi' ? 'Không tìm thấy dữ liệu phù hợp' : 'No matching data found'}
                                            </td>
                                        </tr>
                                    )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200 font-sans">
                        <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Plus size={18} className="text-blue-500" /> 
                            {lang === 'vi' ? 'Nhập dữ liệu thủ công' : 'Manual Entry'}
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">{lang == 'vi' ? 'Thời gian' : 'Time'}</label>
                                <input 
                                    type="time"
                                    name="eventTime"
                                    value={formData.eventTime}
                                    step="1"
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">{lang == 'vi' ? 'Vào/Ra' : 'In/Out'}</label>
                                <select 
                                    name="inOut"
                                    value={formData.inOut}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white outline-none"
                                >
                                    <option value="In">{lang == 'vi' ? 'Vào' : 'In'}</option>
                                    <option value="Out">{lang == 'vi' ? 'Ra' : 'Out'}</option>
                                </select>
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-xs font-semibold text-gray-600 mb-1">{lang == 'vi' ? 'Máy chấm công' : 'Scan machine'}</label>
                                <select 
                                    name="machineId"
                                    value={formData.machineId}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white outline-none"
                                >
                                    {listScanTimeKeeping?.map(m => (
                                        <option key={m.ddMa} value={m.ddTenV}>{m.ddTenV}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-xs font-semibold text-gray-600 mb-1">{lang == 'vi' ? 'Ghi chú' : 'Note'}</label>
                                <input 
                                    type="text"
                                    name="note"
                                    value={formData.note}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                    placeholder="..."
                                />
                            </div>
                        </div>

                        {!selectedFile && <div className="mt-6 flex gap-3">
                            <button 
                                disabled={searchTerm == '' || addAttendanceData.isPending}
                                onClick={handleSubmitManual}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-85"
                            >
                                {addAttendanceData.isPending ? <Spinner/> : lang === 'vi' ? 'Lưu' : 'Save'}
                            </button>
                        </div>}
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-xl shadow-sm border border-emerald-100 flex flex-col justify-between min-h-[220px]">
                        <div>
                            <h2 className="text-sm font-bold text-emerald-800 mb-2 flex items-center gap-2">
                                <FileUp size={18} /> {lang === 'vi' ? 'Nhập bằng Excel' : 'Import Excel'}
                            </h2>

                            {!selectedFile ? (
                                <label 
                                    htmlFor="excel-upload"
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    className="border-2 border-dashed border-emerald-200 rounded-lg p-6 flex flex-col items-center justify-center bg-white/50 cursor-pointer hover:bg-emerald-100 hover:border-emerald-400 transition-all group"
                                >
                                    <FileUp className="h-8 w-8 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                                    <span className="text-[11px] text-gray-500 font-medium text-center italic">
                                        {lang === 'vi' ? 'Kéo thả hoặc Click chọn file .xlsx' : 'Drag & drop or Click to choose'}
                                    </span>
                                    <input 
                                        id="excel-upload"
                                        type="file" 
                                        className="hidden" 
                                        accept=".xlsx, .xls" 
                                        onChange={handleFileUpload}
                                    />
                                </label>
                            ) : (
                                <div className="bg-white border border-emerald-200 rounded-lg p-4 flex items-center justify-between shadow-sm animate-in fade-in zoom-in duration-200">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="bg-emerald-100 p-2 rounded">
                                            <FileUp className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-sm font-semibold text-gray-700 truncate">
                                                {selectedFile.name}
                                            </span>
                                            <span className="text-[10px] text-gray-400">
                                                {(selectedFile.size / 1024).toFixed(1)} KB
                                            </span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleRemoveFile}
                                        className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors cursor-pointer"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-emerald-100 flex justify-between items-center">
                            <button className="text-[13px] cursor-pointer text-blue-600 hover:underline font-medium" onClick={() => handleDownloadTemplate('/template_excel/bu_quet_mat.xlsx')}>
                                {lang === 'vi' ? 'Tải file mẫu' : 'Template'}
                            </button>
                            {selectedFile && (
                                <button
                                    disabled={addAttendanceData.isPending}
                                    onClick={handleSubmitHaveExcel}
                                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-85"
                                >
                                    {addAttendanceData.isPending ? <Spinner/> : lang === 'vi' ? 'Lưu' : 'Save'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddAttendanceData;