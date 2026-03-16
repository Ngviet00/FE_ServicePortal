/* eslint-disable @typescript-eslint/no-explicit-any */
import scanMachineApi, { useExportDataUserScan } from '@/api/HR/scannerMachineApi';
import orgUnitApi from '@/api/orgUnitApi';
import DateTimePicker from '@/components/ComponentCustom/Flatpickr';
import { Spinner } from '@/components/ui/spinner';
import i18n from '@/i18n/i18n';
import { ShowToast, TYPE_SCANNER_MACHINE, useDebounce } from '@/lib';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

const CheckDataUserScan = () => {
    const lang = useMemo(() => i18n.language.split('-')[0], []);

    const [type, setType] = useState('');
    const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0])
    const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0])
    const [selectedDepartment, setSelectedDepartment] = useState('')
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const debouncedName = useDebounce(searchTerm, 300);

    const { data: departments = [] } = useQuery({
        queryKey: ['get-all-departments'],
        queryFn: async () => {
            const res = await orgUnitApi.GetAllDepartment()
            return res.data.data
        },
    });

    const selectedDeptName = useMemo(() => {
        return departments.find((d: any) => d.id.toString() === selectedDepartment.toString())?.name || "";
    }, [selectedDepartment, departments]);

    const { data: dataUserScans = [], isPending: isPending, isFetching: isFetching } = useQuery({
        queryKey: ['get-data-user-scan', type, selectedDepartment, debouncedName, currentPage, fromDate, toDate],
        queryFn: async () => {
            const res = await scanMachineApi.getDataUserScan({
                type: type != '' ? Number(type) : -1,
                fromDate: fromDate,
                toDate: toDate,
                departmentName: selectedDeptName || null,
                keySearch: debouncedName || null,
                page: currentPage
            })
            return res.data.data
        },
        placeholderData: keepPreviousData,
        enabled: type != ''
    });

    const exportDataUserScan = useExportDataUserScan();
    const handleExportDataUserScan = async () => {
        if (type == '') {
            ShowToast(lang == 'vi' ? 'Vui lòng chọn loại' : 'Please select type', 'error');
            return;
        }
        
        await exportDataUserScan.mutateAsync({
            type: type != '' ? Number(type) : -1,
            fromDate: fromDate,
            toDate: toDate,
            departmentName: selectedDeptName || null,
            keySearch: debouncedName || null,
            page: currentPage
        })
    }

    return (
        <div className="p-1 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0">{lang == 'vi' ? 'Tìm kiếm dữ liệu' : 'Search Data'}</h3>
            </div>
            <div className='flex flex-col h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans relative'>
                <header className="bg-white border-b z-40 shadow-sm shrink-0">
                    <div className="flex items-center py-2 justify-between">
                        <div className="flex items-center gap-2 shrink-0">
                            <label htmlFor="department" className="whitespace-nowrap">
                                {lang == 'vi' ? 'Chọn:' : 'Select:'}
                            </label>
                            <select
                                value={type}
                                id="type"
                                onChange={(e) => {
                                    setType(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="border py-1.5 px-2 rounded text-sm focus:outline-none min-w-[160px] hover:cursor-pointer border-gray-300"
                            >
                                <option value="">-- {lang == 'vi' ? 'Chọn loại' : 'Select Type'} --</option>
                                {TYPE_SCANNER_MACHINE.map((item: any) => (
                                    <option key={item.id} value={item.id}>{lang === 'vi' ? item.name : item.nameE}</option>
                                ))}
                            </select>
                        </div>


                        <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <label className="whitespace-nowrap">
                                    {lang == 'vi' ? 'Từ ngày:' : 'From date:'}
                                </label>
                                <DateTimePicker
                                    enableTime={false}
                                    dateFormat="Y-m-d"
                                    initialDateTime={fromDate}
                                    onChange={(_, dateStr) => {
                                        setFromDate(dateStr)
                                        setCurrentPage(1)
                                    }}
                                    className=" shadow-xs border border-gray-300 p-1 rounded-[5px] hover:cursor-pointer w-full sm:w-[160px]"
                                />
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <label className="whitespace-nowrap">
                                    {lang == 'vi' ? 'Đến ngày:' : 'To date:'}
                                </label>
                                <DateTimePicker
                                    enableTime={false}
                                    dateFormat="Y-m-d"
                                    initialDateTime={toDate}
                                    onChange={(_, dateStr) => {
                                        setToDate(dateStr)
                                        setCurrentPage(1)
                                    }}
                                    className=" shadow-xs border border-gray-300 p-1 rounded-[5px] hover:cursor-pointer w-full sm:w-[160px]"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <label htmlFor="department" className="whitespace-nowrap">
                                {lang == 'vi' ? 'Bộ phận:' : 'Department:'}
                            </label>
                            <select
                                value={selectedDepartment}
                                id="department"
                                onChange={(e) => {
                                    setSelectedDepartment(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="border py-1.5 px-2 rounded text-sm focus:outline-none min-w-[160px] hover:cursor-pointer border-gray-300"
                            >
                                <option value="">-- {lang == 'vi' ? 'Tất cả' : 'All'} --</option>
                                {departments.map((item: {id: number, name: string}) => (
                                    <option key={item.id} value={item.id}>{item.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <label className="whitespace-nowrap">
                                {lang == 'vi' ? 'Tìm kiếm:' : 'Search:'}
                            </label>
                            <input 
                                type="text" 
                                placeholder={lang == 'vi' ? 'Tìm kiếm theo mã, tên,...' : 'Search by usercode, username...'}
                                className="pl-3 py-1.5 border rounded text-[14px] w-60 focus:outline-none border-gray-300"
                                value={searchTerm}
                                onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                            />
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <label className="whitespace-nowrap font-medium text-slate-500">
                                {lang == 'vi' ? 'Trang:' : 'Page:'}
                            </label>
                            <div className="flex items-center gap-1 rounded border border-slate-200 bg-slate-50/50 p-1">
                                <button 
                                    type="button"
                                    disabled={currentPage === 1 || isPending} 
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                                    className="p-1 hover:bg-white hover:shadow-sm rounded disabled:opacity-20 transition-all hover:cursor-pointer text-slate-600"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>

                                <span className="text-[13px] font-bold px-2 text-slate-700 min-w-[60px] text-center tracking-tight">
                                    {currentPage} / {isPending ? (dataUserScans?.totalPages || '...') : (dataUserScans?.totalPages || 1)}
                                </span>

                                <button 
                                    type="button"
                                    disabled={currentPage >= (dataUserScans?.totalPages || 1) || dataUserScans?.results?.length === 0 || isPending} 
                                    onClick={() => setCurrentPage(p => p + 1)} 
                                    className="p-1 hover:bg-white hover:shadow-sm rounded disabled:opacity-20 transition-all hover:cursor-pointer text-slate-600"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between py-3">
                        <div className="">
                             <button disabled={exportDataUserScan.isPending || type == ''} onClick={handleExportDataUserScan} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded font-bold text-[13px] hover:bg-slate-50 transition shadow-sm cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed">
                                {exportDataUserScan.isPending ? <Spinner className='text-black'/> : lang == 'vi' ? 'Xuất file excel' : 'Export excel'}
                            </button>
                        </div>

                        <div>
                            {lang == 'vi' ? 'Tổng' : 'Total'}: <span className="font-bold">{dataUserScans?.totalItems ?? 0}</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto">
                    <div className="bg-white border border-slate-200 rounded shadow-sm h-full overflow-auto relative">
                        <table className={`w-full ${isPending || isFetching ? 'opacity-30' : 'opacity-100'}`}> 
                            <thead>
                                <tr className="bg-slate-50 font-bold text-slate-500">
                                    <th className="sticky top-0 z-20 text-[14px] w-28 bg-slate-50 border-b border-r border-gray-200 px-3 py-3 text-center">
                                        {lang == 'vi' ? 'Mã nhân viên': 'Usercode'}
                                    </th>
                                    <th className="sticky top-0 z-20 text-[14px] w-28 bg-slate-50 border-b border-r border-gray-300 px-3 py-3 text-center">{lang == 'vi' ? 'Họ tên' : 'Username'}</th>
                                    <th className="sticky top-0 z-20 text-[14px] w-28 bg-slate-50 border-b border-r border-gray-300 px-3 py-3 text-center">{lang == 'vi' ? 'Bộ phận' : 'Department'}</th>
                                    <th className="sticky top-0 z-20 text-[14px] w-28 bg-slate-50 border-b border-r border-gray-300 px-3 py-3 text-center">{lang == 'vi' ? 'Mã thẻ' : 'TimekeepingId'}</th>
                                    <th className="sticky top-0 z-20 text-[14px] w-28 bg-slate-50 border-b border-r border-gray-300 px-3 py-3 text-center">{lang == 'vi' ? 'Ngày' : 'Date'}</th>
                                    <th className="sticky top-0 z-20 text-[14px] w-28 bg-slate-50 border-b border-r border-gray-300 px-3 py-3 text-center">{lang == 'vi' ? 'Thời gian' : 'Time'}</th>
                                    <th className="sticky top-0 z-20 text-[14px] w-28 bg-slate-50 border-b border-r border-gray-300 px-3 py-3 text-center">{lang == 'vi' ? 'Vào/Ra' : 'In/Out'}</th>
                                    <th className="sticky top-0 z-20 text-[14px] w-28 bg-slate-50 border-b border-r border-gray-300 px-3 py-3 text-center">{lang == 'vi' ? 'Máy' : 'Machine'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {dataUserScans?.results?.length > 0 ? (
                                    dataUserScans?.results?.map((emp: any, idx: number) => (
                                        <tr key={idx} className={`hover:bg-slate-50/50 transition-colors`}>
                                            <td className='px-3 py-2 border-r text-center border-gray-300 text-[13px] font-bold border-b'>{emp?.UserCode ?? '-'}</td>
                                            <td className='px-3 py-2 border-r text-center border-gray-300 text-[13px] font-bold border-b'>{emp?.UserName ?? '-'}</td>
                                            <td className='px-3 py-2 border-r text-center border-gray-300 text-[13px] font-bold border-b'>{emp?.DeptName ?? '-'}</td>
                                            <td className='px-3 py-2 border-r text-center border-gray-300 text-[13px] font-bold border-b'>{emp?.EmployeeNo ?? '-'}</td>
                                            <td className='px-3 py-2 border-r text-center border-gray-300 text-[13px] font-bold border-b'>{emp?.EventTime ? emp?.EventTime?.split('T')[0] : '-'}</td>
                                            <td className='px-3 py-2 border-r text-center border-gray-300 text-[13px] font-bold border-b'>{emp?.EventTime ? emp?.EventTime?.split('T')[1] : '-'}</td>
                                            <td className='px-3 py-2 border-r text-center border-gray-300 text-[13px] font-bold border-b'>{emp?.In_Out ?? '-'}</td>
                                            <td className='px-3 py-2 border-r text-center border-gray-300 text-[13px] font-bold border-b'>{emp?.NameMCC ?? '-'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="py-20 text-center bg-white">
                                            <div className="flex flex-col items-center justify-center">
                                                <svg className="w-12 h-12 text-slate-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path 
                                                        strokeLinecap="round" 
                                                        strokeLinejoin="round" 
                                                        strokeWidth="2" 
                                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                                                    />
                                                </svg>
                                                <p className="text-slate-500 font-medium">
                                                    {lang === 'vi' ? 'Không tìm thấy dữ liệu' : 'No found data'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CheckDataUserScan;