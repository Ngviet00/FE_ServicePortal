// import { useState, useMemo, useEffect } from 'react';

// // --- MOCK DATA ---
// const DEPARTMENTS = ['Sản xuất A', 'Sản xuất B', 'Kho vận', 'QC', 'Đóng gói', 'Bảo trì'];
// const mockEmployees = Array.from({ length: 1000 }, (_, i) => ({
//     id: `NV${(i + 1).toString().padStart(4, '0')}`,
//     name: `Nhân viên ${i + 1}`,
//     dept: DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)],
//     shifts: Array.from({ length: 31 }, () => ['A1', 'A2', 'B1', 'C1', 'C2', 'OFF'][Math.floor(Math.random() * 6)])
// }));

// const MngShift = () => {
//     const [isLoading, setIsLoading] = useState(true); // Trạng thái loading
//     const [currentDate, setCurrentDate] = useState(new Date());
//     const [searchTerm, setSearchTerm] = useState('');
//     const [selectedIds, setSelectedIds] = useState([]);
//     const [showBulkModal, setShowBulkModal] = useState(false);
//     const [currentPage, setCurrentPage] = useState(1);
//     const [rowsPerPage, setRowsPerPage] = useState(50);

//     // Giả lập hiệu ứng loading khi mount hoặc đổi trang/tìm kiếm
//     useEffect(() => {
//         setIsLoading(true);
//         const timer = setTimeout(() => setIsLoading(false), 800); // Load trong 0.8s
//         return () => clearTimeout(timer);
//     }, [currentPage, searchTerm, rowsPerPage]);

//     const filteredEmployees = useMemo(() => {
//         return mockEmployees.filter(emp => 
//             emp.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
//             emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             emp.dept.toLowerCase().includes(searchTerm.toLowerCase())
//         );
//     }, [searchTerm]);

//     const paginatedData = useMemo(() => {
//         const startIndex = (currentPage - 1) * rowsPerPage;
//         return filteredEmployees.slice(startIndex, startIndex + rowsPerPage);
//     }, [filteredEmployees, currentPage, rowsPerPage]);

//     const totalPages = Math.ceil(filteredEmployees.length / rowsPerPage);

//     // --- COMPONENT SKELETON ROW ---
//     const SkeletonRow = () => (
//         <tr className="animate-pulse">
//             <td className="p-2 border-r border-slate-100"><div className="h-4 w-4 bg-slate-200 rounded mx-auto"></div></td>
//             <td className="px-4 py-2 border-r border-slate-200">
//                 <div className="h-2 w-8 bg-slate-200 rounded mb-2"></div>
//                 <div className="h-3 w-32 bg-slate-200 rounded"></div>
//             </td>
//             <td className="px-4 py-2 border-r border-slate-100"><div className="h-3 w-16 bg-slate-100 rounded"></div></td>
//             {Array.from({ length: 31 }).map((_, i) => (
//                 <td key={i} className="border-r border-slate-50 p-2"><div className="h-4 w-6 bg-slate-100 rounded mx-auto"></div></td>
//             ))}
//         </tr>
//     );

//     const getDayName = (day, month, year) => {
//         const date = new Date(year, month, day);
//         const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
//         return {
//             name: days[date.getDay()],
//             isWeekend: date.getDay() === 0 || date.getDay() === 6 // 0 là CN, 6 là T7
//         };
//     };

//     return (
//         <div className="flex flex-col h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
            
//             {/* 1. HEADER */}
//             <header className="bg-white border-b px-6 py-2.5 flex items-center justify-between z-40 shadow-sm shrink-0">
//                 <div className="flex items-center gap-6">
//                     <h1 className="text-lg font-black text-indigo-600 tracking-tighter italic">MNG SHIFT</h1>
//                     <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
//                         <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-1.5 hover:bg-white rounded-md text-slate-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg></button>
//                         <div className="px-4 text-[11px] font-black text-slate-700 uppercase tracking-widest">Tháng {currentDate.getMonth() + 1} / {currentDate.getFullYear()}</div>
//                         <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-1.5 hover:bg-white rounded-md text-slate-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg></button>
//                     </div>
//                     <div className="relative">
//                         <input 
//                             type="text"
//                             placeholder="Search staff, dept..."
//                             className="pl-4 pr-10 py-1.5 bg-slate-100 border border-transparent rounded-lg text-sm w-72 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium"
//                             value={searchTerm}
//                             onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
//                         />
//                     </div>
//                 </div>
//                 <div className="flex gap-2">
//                     <button className="px-4 py-1.5 bg-indigo-600 text-white rounded font-bold text-[10px] hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">SAVE DATA</button>
//                 </div>
//             </header>

//             {/* 2. MAIN TABLE */}
//             <main className="flex-1 overflow-auto p-4 relative">
//                 <div className="bg-white border border-slate-200 rounded-xl shadow-sm h-full overflow-auto relative">
                    
//                     {/* Hiệu ứng mờ khi loading */}
//                     <table className={`w-full border-separate border-spacing-0 transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
//                         <thead>
//                             <tr className="bg-slate-50 text-slate-500">
//                                 <th className="sticky left-0 top-0 z-40 w-12 bg-slate-50 border-b border-r border-slate-200 p-2">
//                                     <input type="checkbox" className="rounded text-indigo-600" onChange={() => {}} />
//                                 </th>
//                                 <th className="sticky left-12 top-0 z-40 w-48 bg-slate-50 border-b border-r border-slate-200 px-4 py-3 text-[10px] font-black uppercase text-left shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Nhân viên</th>
//                                 <th className="sticky top-0 z-20 w-32 bg-slate-50 border-b border-r border-slate-200 px-4 py-3 text-[10px] font-black uppercase text-left">Bộ phận</th>
//                                 {Array.from({ length: 31 }, (_, i) => {
//                                     const { name } = getDayName(i + 1, currentDate.getMonth(), currentDate.getFullYear());
//                                     return (
//                                         <th key={i} className={`${(i+1)%7===0 || (i+1)%7===6 ? 'bg-orange-50 text-orange-600' : ''} sticky top-0 z-20 min-w-[38px] bg-slate-50 border-b border-r border-slate-200 py-3 text-[10px] font-black uppercase tracking-tighter`}>
//                                             {i + 1} <br />
//                                             <span className={`text-[9px] font-bold ${name === 'CN' ? 'text-red-500' : 'text-slate-600'}`}>
//                                                     {name}
//                                                 </span>
//                                         </th>
//                                     )
//                                 })}
//                             </tr>
//                         </thead>
                        
//                         <tbody className="divide-y divide-slate-100">
//                             {isLoading ? (
//                                 // Hiển thị 10 dòng skeleton khi đang load
//                                 Array.from({ length: 15 }).map((_, idx) => <SkeletonRow key={idx} />)
//                             ) : (
//                                 paginatedData.map((emp) => (
//                                     <tr key={emp.id} className={`hover:bg-slate-50 transition-colors ${selectedIds.includes(emp.id) ? 'bg-indigo-50/50' : ''}`}>
//                                         <td className="sticky left-0 z-10 bg-white border-r border-slate-100 p-2 text-center shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
//                                             <input 
//                                                 type="checkbox" 
//                                                 checked={selectedIds.includes(emp.id)}
//                                                 onChange={() => {
//                                                     const id = emp.id;
//                                                     setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
//                                                 }}
//                                                 className="rounded text-indigo-600"
//                                             />
//                                         </td>
//                                         <td className="sticky left-12 z-10 bg-white border-r border-slate-200 px-4 py-2 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
//                                             <div className="flex flex-col">
//                                                 <span className="text-[9px] font-bold text-slate-400 leading-none">{emp.id}</span>
//                                                 <span className="text-[11px] font-bold text-slate-700 uppercase truncate">{emp.name}</span>
//                                             </div>
//                                         </td>
//                                         <td className="px-4 py-2 border-r border-slate-100 text-[10px] text-slate-500 font-bold">{emp.dept}</td>
//                                         {emp.shifts.map((shift, i) => (
//                                             <td key={i} className={`border-r border-slate-50 text-center text-[10px] font-black py-2.5 cursor-pointer hover:bg-indigo-100/50 transition-colors ${shift === 'OFF' ? 'text-rose-500 bg-rose-50/30' : 'text-slate-600'}`}>
//                                                 {shift}
//                                             </td>
//                                         ))}
//                                     </tr>
//                                 ))
//                             )}
//                         </tbody>
//                     </table>

//                     {/* Overlay chữ Loading kiểu tinh tế */}
//                     {isLoading && (
//                         <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
//                             <div className="bg-white/80 backdrop-blur-sm border border-slate-200 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3">
//                                 <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
//                                 <span className="text-sm font-black text-indigo-600 tracking-widest uppercase">Syncing Data...</span>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </main>

//             {/* 3. FOOTER PHÂN TRANG */}
//             <footer className="bg-white border-t p-3 px-6 flex items-center justify-between text-[11px] font-black text-slate-400 shrink-0 uppercase tracking-widest">
//                 <div className="flex items-center gap-6">
//                     <span>Showing {paginatedData.length} of {filteredEmployees.length}</span>
//                     <select 
//                         className="bg-slate-100 rounded px-2 py-1 outline-none font-bold text-slate-600"
//                         value={rowsPerPage}
//                         onChange={(e) => setRowsPerPage(Number(e.target.value))}
//                     >
//                         {[50, 100, 200].map(v => <option key={v} value={v}>{v} rows</option>)}
//                     </select>
//                 </div>

//                 <div className="flex items-center gap-3">
//                     <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1.5 border rounded-lg disabled:opacity-30 hover:bg-slate-50">PREV</button>
//                     <span className="text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-lg border border-indigo-100">Page {currentPage}</span>
//                     <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-1.5 border rounded-lg disabled:opacity-30 hover:bg-slate-50">NEXT</button>
//                 </div>
//             </footer>
//         </div>
//     );
// };

// export default MngShift;
// import { useState, useMemo, useEffect } from 'react';

// // --- MOCK DATA ---
// const DEPARTMENTS = ['Sản xuất A', 'Sản xuất B', 'Kho vận', 'QC', 'Đóng gói', 'Bảo trì'];
// const SHIFT_CODES = ['A1', 'A2', 'B1', 'C1', 'AL', 'SH', 'OFF', 'UL'];

// const mockEmployees = Array.from({ length: 1000 }, (_, i) => ({
//     id: `NV${(i + 1).toString().padStart(4, '0')}`,
//     name: `Nhân viên ${i + 1}`,
//     dept: DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)],
//     shifts: Array.from({ length: 31 }, () => SHIFT_CODES[Math.floor(Math.random() * SHIFT_CODES.length)])
// }));

// const MngShift = () => {
//     const [isLoading, setIsLoading] = useState(true);
//     const [currentDate, setCurrentDate] = useState(new Date());
//     const [searchTerm, setSearchTerm] = useState('');
//     const [currentPage, setCurrentPage] = useState(1);
//     const rowsPerPage = 50;

//     useEffect(() => {
//         setIsLoading(true);
//         const timer = setTimeout(() => setIsLoading(false), 500);
//         return () => clearTimeout(timer);
//     }, [currentPage, searchTerm]);

//     const filteredEmployees = useMemo(() => {
//         return mockEmployees.filter(emp => 
//             emp.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
//             emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             emp.dept.toLowerCase().includes(searchTerm.toLowerCase())
//         );
//     }, [searchTerm]);

//     const paginatedData = useMemo(() => {
//         const startIndex = (currentPage - 1) * rowsPerPage;
//         return filteredEmployees.slice(startIndex, startIndex + rowsPerPage);
//     }, [filteredEmployees, currentPage]);

//     const totalPages = Math.ceil(filteredEmployees.length / rowsPerPage);

//     const getDayName = (day, month, year) => {
//         const date = new Date(year, month, day);
//         const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
//         return { name: days[date.getDay()], isSun: date.getDay() === 0 };
//     };

//     return (
//         <div className="flex flex-col h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
            
//             {/* 1. HEADER - TẤT CẢ NGANG HÀNG */}
//             <header className="bg-white border-b px-6 py-2 flex items-center justify-between z-40 shadow-sm shrink-0">
//                 <div className="flex items-center gap-4">
//                     <h1 className="text-lg font-black text-slate-800 tracking-tighter italic mr-2 border-r pr-4 border-slate-200">MNG SHIFT</h1>
                    
//                     <input 
//                         type="text"
//                         placeholder="Tìm mã, tên, bộ phận..."
//                         className="pl-3 pr-8 py-1.5 bg-slate-100 border-none rounded text-xs w-64 focus:ring-1 focus:ring-slate-400 focus:bg-white transition-all font-medium"
//                         value={searchTerm}
//                         onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
//                     />

//                     {/* Điều hướng trang */}
//                     <div className="flex items-center gap-1 ml-2">
//                         <button 
//                             disabled={currentPage === 1} 
//                             onClick={() => setCurrentPage(p => p - 1)}
//                             className="p-1.5 border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-20"
//                         >
//                             <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
//                         </button>
//                         <span className="text-[10px] font-bold px-3 text-slate-500 min-w-[80px] text-center uppercase tracking-widest">Trang {currentPage}/{totalPages || 1}</span>
//                         <button 
//                             disabled={currentPage === totalPages} 
//                             onClick={() => setCurrentPage(p => p + 1)}
//                             className="p-1.5 border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-20"
//                         >
//                             <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
//                         </button>
//                     </div>

//                     {/* Bộ chọn tháng */}
                    // <div className="flex items-center gap-3 ml-2 border-l pl-4 border-slate-200 text-slate-500">
                    //     <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="hover:text-black transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg></button>
                    //     <div className="text-[11px] font-bold uppercase tracking-widest">Tháng {currentDate.getMonth() + 1} / {currentDate.getFullYear()}</div>
                    //     <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="hover:text-black transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg></button>
                    // </div>
//                 </div>

//                 <div className="flex gap-2">
//                     <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded font-bold text-[10px] hover:bg-slate-100 uppercase transition">
//                         Upload File Ca
//                     </button>
//                     <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded font-bold text-[10px] hover:bg-slate-100 uppercase transition">
//                         Upload File Nghỉ
//                     </button>
//                     <button className="px-5 py-1.5 bg-slate-800 text-white rounded font-bold text-[10px] hover:bg-black transition uppercase tracking-widest ml-2">
//                         Lưu Dữ Liệu
//                     </button>
//                 </div>
//             </header>

//             {/* 2. TABLE - SẠCH SẼ, CHỈ HIỂN THỊ CHỮ */}
//             <main className="flex-1 overflow-auto p-4 relative">
//                 <div className="bg-white border border-slate-200 rounded shadow-sm h-full overflow-auto relative">
//                     <table className={`w-full border-separate border-spacing-0 ${isLoading ? 'opacity-30' : 'opacity-100'}`}>
//                         <thead>
//                             <tr className="bg-slate-50">
//                                 <th className="sticky left-0 top-0 z-40 w-10 bg-slate-50 border-b border-r border-slate-200 p-2 text-center text-slate-400">#</th>
//                                 <th className="sticky left-10 top-0 z-40 w-44 bg-slate-50 border-b border-r border-slate-200 px-4 py-3 text-[10px] font-bold uppercase text-left text-slate-500 shadow-[1px_0_0_rgba(0,0,0,0.05)]">Nhân viên</th>
//                                 <th className="sticky top-0 z-20 w-28 bg-slate-50 border-b border-r border-slate-200 px-3 py-3 text-[10px] font-bold uppercase text-left text-slate-500">Bộ phận</th>
//                                 {Array.from({ length: 31 }, (_, i) => {
//                                     const { name, isSun } = getDayName(i + 1, currentDate.getMonth(), currentDate.getFullYear());
//                                     return (
//                                         <th key={i} className={`sticky top-0 z-20 min-w-[38px] border-b border-r border-slate-200 py-1.5 text-center bg-slate-50 ${isSun ? 'text-red-500' : 'text-slate-400'}`}>
//                                             <div className="text-[10px] font-bold">{i + 1}</div>
//                                             <div className="text-[8px] font-bold uppercase">{name}</div>
//                                         </th>
//                                     );
//                                 })}
//                             </tr>
//                         </thead>
                        
//                         <tbody className="divide-y divide-slate-100">
//                             {!isLoading && paginatedData.map((emp) => (
//                                 <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
//                                     <td className="sticky left-0 z-10 bg-white border-r border-slate-200 p-2 text-center text-[10px] font-bold text-slate-300">
//                                         <input type="checkbox" className="rounded border-slate-300" />
//                                     </td>
//                                     <td className="sticky left-10 z-10 bg-white border-r border-slate-200 px-4 py-2 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
//                                         <div className="flex flex-col">
//                                             <span className="text-[8px] font-bold text-slate-400 leading-none">{emp.id}</span>
//                                             <span className="text-[10px] font-bold text-slate-700 uppercase truncate">{emp.name}</span>
//                                         </div>
//                                     </td>
//                                     <td className="px-3 py-2 border-r border-slate-100 text-[10px] font-bold text-slate-400 italic">{emp.dept}</td>
//                                     {emp.shifts.map((shift, i) => (
//                                         <td key={i} className="border-r border-slate-100 text-center text-[10px] font-bold py-2.5 text-slate-600 hover:bg-slate-100 transition-colors">
//                                             {shift}
//                                         </td>
//                                     ))}
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>

//                     {isLoading && (
//                         <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px] z-50">
//                             <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
//                         </div>
//                     )}
//                 </div>
//             </main>

//             {/* 3. FOOTER */}
//             <footer className="bg-white border-t p-2 px-6 flex items-center justify-between text-[10px] font-bold text-slate-400 shrink-0 uppercase tracking-widest">
//                 <div>Tổng số nhân viên: {filteredEmployees.length}</div>
//                 <div className="flex gap-4">
//                     <span>A1, A2: Ca làm</span>
//                     <span>AL: Phép năm</span>
//                     <span>OFF: Nghỉ tuần</span>
//                 </div>
//             </footer>
//         </div>
//     );
// };

// export default MngShift;
// import { useState, useMemo, useEffect } from 'react';

// // --- MOCK DATA ---
// const DEPARTMENTS = ['Sản xuất A', 'Sản xuất B', 'Kho vận', 'QC', 'Đóng gói', 'Bảo trì'];
// const SHIFT_CODES = ['A1', 'A2', 'B1', 'C1', 'AL', 'SH', 'OFF', 'UL'];

// const mockEmployees = Array.from({ length: 1000 }, (_, i) => ({
//     id: `NV${(i + 1).toString().padStart(4, '0')}`,
//     name: `Nhân viên ${i + 1}`,
//     dept: DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)],
//     shifts: Array.from({ length: 31 }, () => 'A1')
// }));

// const MngShift = () => {
//     const [isLoading, setIsLoading] = useState(true);
//     const [currentDate, setCurrentDate] = useState(new Date());
//     const [searchTerm, setSearchTerm] = useState('');
//     const [currentPage, setCurrentPage] = useState(1);
//     const [selectedIds, setSelectedIds] = useState([]);
//     const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    
//     // State cho việc thay đổi ca
//     const [bulkData, setBulkData] = useState({ day: 1, shift: 'A1' });

//     const rowsPerPage = 50;

//     useEffect(() => {
//         setIsLoading(true);
//         const timer = setTimeout(() => setIsLoading(false), 500);
//         return () => clearTimeout(timer);
//     }, [currentPage, searchTerm]);

//     const filteredEmployees = useMemo(() => {
//         return mockEmployees.filter(emp => 
//             emp.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
//             emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             emp.dept.toLowerCase().includes(searchTerm.toLowerCase())
//         );
//     }, [searchTerm]);

//     const paginatedData = useMemo(() => {
//         const startIndex = (currentPage - 1) * rowsPerPage;
//         return filteredEmployees.slice(startIndex, startIndex + rowsPerPage);
//     }, [filteredEmployees, currentPage]);

//     const totalPages = Math.ceil(filteredEmployees.length / rowsPerPage);

//     const getDayName = (day, month, year) => {
//         const date = new Date(year, month, day);
//         const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
//         return { name: days[date.getDay()], isSun: date.getDay() === 0 };
//     };

//     const handleSelectAll = (e) => {
//         if (e.target.checked) {
//             setSelectedIds(paginatedData.map(emp => emp.id));
//         } else {
//             setSelectedIds([]);
//         }
//     };

//     const toggleSelect = (id) => {
//         setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
//     };

//     return (
//         <div className="flex flex-col h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans relative">
            
//             {/* 1. HEADER */}
//             <header className="bg-white border-b px-6 py-2 flex items-center justify-between z-40 shadow-sm shrink-0">
//                 <div className="flex items-center gap-4">
//                     <h1 className="text-lg font-black text-slate-800 tracking-tighter italic mr-2 border-r pr-4 border-slate-200">MNG SHIFT</h1>
//                     <input 
//                         type="text" 
//                         placeholder="Tìm mã, tên, bộ phận..."
//                         className="pl-3 pr-8 py-1.5 bg-slate-100 border-none rounded text-xs w-64 focus:ring-1 focus:ring-slate-400 focus:bg-white transition-all font-medium"
//                         value={searchTerm}
//                         onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
//                     />
//                     {/* Pagination buttons */}
//                     <div className="flex items-center gap-1 ml-2">
//                         <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1.5 border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-20"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg></button>
//                         <span className="text-[10px] font-bold px-3 text-slate-500 min-w-[80px] text-center uppercase tracking-widest">Trang {currentPage}/{totalPages || 1}</span>
//                         <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-1.5 border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-20"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg></button>
//                     </div>
//                 </div>

//                 <div className="flex items-center gap-3 ml-2 border-l pl-4 border-slate-200 text-slate-500">
//                     <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="hover:text-black transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg></button>
//                     <div className="text-[11px] font-bold uppercase tracking-widest">Tháng {currentDate.getMonth() + 1} / {currentDate.getFullYear()}</div>
//                     <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="hover:text-black transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg></button>
//                 </div>

//                 <div className="flex gap-2">
//                     <button className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded font-bold text-[10px] hover:bg-slate-100 uppercase transition">Upload File Ca</button>
//                     <button className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded font-bold text-[10px] hover:bg-slate-100 uppercase transition">Upload File Nghỉ</button>
//                     <button className="px-5 py-1.5 bg-slate-800 text-white rounded font-bold text-[10px] hover:bg-black transition uppercase tracking-widest ml-2">Lưu Dữ Liệu</button>
//                 </div>
//             </header>

//             {/* 2. TABLE */}
//             <main className="flex-1 overflow-auto p-4 relative">
//                 <div className="bg-white border border-slate-200 rounded shadow-sm h-full overflow-auto relative">
//                     <table className={`w-full border-separate border-spacing-0 ${isLoading ? 'opacity-30' : 'opacity-100'}`}>
//                         <thead>
//                             <tr className="bg-slate-50">
//                                 <th className="sticky left-0 top-0 z-40 w-10 bg-slate-50 border-b border-r border-slate-200 p-2 text-center">
//                                     <input type="checkbox" className="rounded" onChange={handleSelectAll} checked={selectedIds.length === paginatedData.length && paginatedData.length > 0} />
//                                 </th>
//                                 <th className="sticky left-10 top-0 z-40 w-44 bg-slate-50 border-b border-r border-slate-200 px-4 py-3 text-[10px] font-bold uppercase text-left text-slate-500 shadow-[1px_0_0_rgba(0,0,0,0.05)]">Nhân viên</th>
//                                 <th className="sticky top-0 z-20 w-28 bg-slate-50 border-b border-r border-slate-200 px-3 py-3 text-[10px] font-bold uppercase text-left text-slate-500">Bộ phận</th>
//                                 {Array.from({ length: 31 }, (_, i) => {
//                                     const { name, isSun } = getDayName(i + 1, currentDate.getMonth(), currentDate.getFullYear());
//                                     return (
//                                         <th key={i} className={`sticky top-0 z-20 min-w-[38px] border-b border-r border-slate-200 py-1.5 text-center bg-slate-50 ${isSun ? 'text-red-500' : 'text-slate-400'}`}>
//                                             <div className="text-[10px] font-bold">{i + 1}</div>
//                                             <div className="text-[8px] font-bold uppercase">{name}</div>
//                                         </th>
//                                     );
//                                 })}
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-100">
//                             {paginatedData.map((emp) => (
//                                 <tr key={emp.id} className={`${selectedIds.includes(emp.id) ? 'bg-slate-50' : ''} hover:bg-slate-50/50 transition-colors`}>
//                                     <td className="sticky left-0 z-10 bg-white border-r border-slate-200 p-2 text-center">
//                                         <input type="checkbox" checked={selectedIds.includes(emp.id)} onChange={() => toggleSelect(emp.id)} className="rounded border-slate-300" />
//                                     </td>
//                                     <td className="sticky left-10 z-10 bg-white border-r border-slate-200 px-4 py-2 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
//                                         <div className="flex flex-col">
//                                             <span className="text-[8px] font-bold text-slate-400 leading-none">{emp.id}</span>
//                                             <span className="text-[10px] font-bold text-slate-700 uppercase truncate">{emp.name}</span>
//                                         </div>
//                                     </td>
//                                     <td className="px-3 py-2 border-r border-slate-100 text-[10px] font-bold text-slate-400 italic">{emp.dept}</td>
//                                     {emp.shifts.map((shift, i) => (
//                                         <td key={i} className="border-r border-slate-100 text-center text-[10px] font-bold py-2.5 text-slate-600">{shift}</td>
//                                     ))}
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </main>

//             {/* 3. POPUP THÔNG BÁO ĐANG CHỌN (Floating Bar) */}
//             {selectedIds.length > 0 && (
//                 <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-6 border border-slate-600 animate-in fade-in slide-in-from-bottom-4">
//                     <span className="text-xs font-bold uppercase tracking-widest">Đang chọn <span className="text-yellow-400">{selectedIds.length}</span> nhân sự</span>
//                     <div className="flex gap-2">
//                         <button onClick={() => setIsActionModalOpen(true)} className="px-4 py-1.5 bg-white text-slate-900 rounded-full text-[10px] font-black uppercase hover:bg-slate-200 transition">Thay đổi ca</button>
//                         <button onClick={() => setSelectedIds([])} className="px-4 py-1.5 bg-slate-700 text-white rounded-full text-[10px] font-black uppercase hover:bg-slate-600 transition">Bỏ chọn</button>
//                     </div>
//                 </div>
//             )}

//             {/* 4. MODAL CHỌN NGÀY & CA (Popup chính giữa) */}
//             {isActionModalOpen && (
//                 <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
//                     <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
//                         <div className="p-4 border-b border-slate-100 flex justify-between items-center">
//                             <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Thiết lập ca hàng loạt</h3>
//                             <button onClick={() => setIsActionModalOpen(false)} className="text-slate-400 hover:text-slate-600">
//                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
//                             </button>
//                         </div>
                        
//                         <div className="p-6 space-y-6">
//                             {/* Chọn ngày */}
//                             <div>
//                                 <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">1. Chọn ngày áp dụng</label>
//                                 <select 
//                                     className="w-full bg-slate-100 border-none rounded p-2 text-xs font-bold"
//                                     value={bulkData.day}
//                                     onChange={(e) => setBulkData({...bulkData, day: e.target.value})}
//                                 >
//                                     {Array.from({length: 31}, (_, i) => (
//                                         <option key={i+1} value={i+1}>Ngày {i+1} tháng {currentDate.getMonth() + 1}</option>
//                                     ))}
//                                 </select>
//                             </div>

//                             {/* Chọn Ca */}
//                             <div>
//                                 <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">2. Chọn ca muốn đổi</label>
//                                 <div className="grid grid-cols-4 gap-2">
//                                     {SHIFT_CODES.map(code => (
//                                         <button 
//                                             key={code}
//                                             onClick={() => setBulkData({...bulkData, shift: code})}
//                                             className={`py-2 text-[10px] font-black rounded border transition-all ${bulkData.shift === code ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}
//                                         >
//                                             {code}
//                                         </button>
//                                     ))}
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="p-4 bg-slate-50 flex gap-2">
//                             <button 
//                                 onClick={() => {
//                                     alert(`Đã đổi ${selectedIds.length} nhân viên sang ca ${bulkData.shift} cho ngày ${bulkData.day}`);
//                                     setIsActionModalOpen(false);
//                                     setSelectedIds([]);
//                                 }}
//                                 className="flex-1 py-2 bg-slate-800 text-white rounded text-[10px] font-black uppercase hover:bg-black transition"
//                             >
//                                 Xác nhận áp dụng
//                             </button>
//                             <button onClick={() => setIsActionModalOpen(false)} className="flex-1 py-2 bg-white border border-slate-200 text-slate-500 rounded text-[10px] font-black uppercase hover:bg-slate-100">Hủy</button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             <footer className="bg-white border-t p-2 px-6 flex items-center justify-between text-[10px] font-bold text-slate-400 shrink-0 uppercase tracking-widest">
//                 <div>Tổng số nhân viên: {filteredEmployees.length}</div>
//                 <div className="flex gap-4">
//                     <span>A1, A2: Ca làm</span>
//                     <span>AL: Phép năm</span>
//                     <span>OFF: Nghỉ tuần</span>
//                 </div>
//             </footer>
//         </div>
//     );
// };

// export default MngShift;
import { useState, useMemo, useEffect } from 'react';

// --- MOCK DATA ---
const DEPARTMENTS = ['Sản xuất A', 'Sản xuất B', 'Kho vận', 'QC', 'Đóng gói', 'Bảo trì'];
// Giả lập danh sách ca rất dài
const SHIFT_CODES = [
    'A1', 'A2', 'A3', 'B1', 'B2', 'C1', 'C2', 'AL', 'SH', 'OFF', 'UL', 'KL', 
    'CT1', 'CT2', 'H1', 'H2', 'N1', 'N2', 'P1', 'P2', 'V1', 'V2', 'W1', 'X1'
];

const mockEmployees = Array.from({ length: 1000 }, (_, i) => ({
    id: `NV${(i + 1).toString().padStart(4, '0')}`,
    name: `Nhân viên ${i + 1}`,
    dept: DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)],
    shifts: Array.from({ length: 31 }, () => 'A1')
}));

const MngShift = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    
    // State cho thay đổi ca hàng loạt
    const [bulkData, setBulkData] = useState({ 
        fromDay: 1, 
        toDay: 1, 
        shift: 'A1',
        shiftSearch: '' // Tìm nhanh mã ca trong modal
    });

    const rowsPerPage = 50;

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 400);
        return () => clearTimeout(timer);
    }, [currentPage, searchTerm]);

    const filteredEmployees = useMemo(() => {
        return mockEmployees.filter(emp => 
            emp.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
            emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.dept.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        return filteredEmployees.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredEmployees, currentPage]);

    const totalPages = Math.ceil(filteredEmployees.length / rowsPerPage);

    const getDayName = (day, month, year) => {
        const date = new Date(year, month, day);
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        return { name: days[date.getDay()], isSun: date.getDay() === 0 };
    };

    // Lọc danh sách ca trong modal
    const filteredShiftCodes = SHIFT_CODES.filter(code => 
        code.toLowerCase().includes(bulkData.shiftSearch.toLowerCase())
    );

    return (
        <div className="flex flex-col h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans relative">
            <header className="bg-white border-b px-6 py-2 flex items-center justify-between z-40 shadow-sm shrink-0">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-black mr-2 pr-4">Quản lý ca</h2>
                    <input 
                        type="text" 
                        placeholder="Tìm nhân viên..."
                        className="pl-3 py-1.5 bg-slate-100 border-none rounded text-xs w-64 focus:ring-1 focus:ring-slate-400 font-medium border"
                        value={searchTerm}
                        onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                    />
                    <div className="flex items-center gap-1 ml-2">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1.5 border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-20"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg></button>
                        <span className="text-[10px] font-bold px-3 text-slate-500 min-w-[80px] text-center uppercase tracking-widest">Trang {currentPage}/{totalPages || 1}</span>
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-1.5 border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-20"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg></button>
                    </div>
                </div>

                <div className="flex items-center gap-3 border-l pl-4 border-slate-200 text-slate-500">
                    <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="hover:text-black transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg></button>
                    <div className="text-[11px] font-bold uppercase tracking-widest italic">Tháng {currentDate.getMonth() + 1} / {currentDate.getFullYear()}</div>
                    <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="hover:text-black transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg></button>
                </div>

                <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded font-bold text-[10px] hover:bg-slate-100 uppercase transition">Upload File Ca</button>
                    <button className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded font-bold text-[10px] hover:bg-slate-100 uppercase transition">Upload File Nghỉ</button>
                </div>
            </header>

            <main className="flex-1 overflow-auto p-4">
                <div className="bg-white border border-slate-200 rounded shadow-sm h-full overflow-auto relative">
                    <table className={`w-full border-separate border-spacing-0 ${isLoading ? 'opacity-30' : 'opacity-100'}`}>
                        <thead>
                            <tr className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500">
                                <th className="sticky left-0 top-0 z-40 w-10 bg-slate-50 border-b border-r border-slate-200 p-2 text-center">
                                    <input type="checkbox" className="rounded" onChange={(e) => setSelectedIds(e.target.checked ? paginatedData.map(emp => emp.id) : [])} checked={selectedIds.length === paginatedData.length && paginatedData.length > 0} />
                                </th>
                                <th className="sticky left-10 top-0 z-40 w-44 bg-slate-50 border-b border-r border-slate-200 px-4 py-3 text-left shadow-[1px_0_0_rgba(0,0,0,0.05)]">Nhân viên</th>
                                <th className="sticky top-0 z-20 w-28 bg-slate-50 border-b border-r border-slate-200 px-3 py-3 text-left">Bộ phận</th>
                                {Array.from({ length: 31 }, (_, i) => {
                                    const { name, isSun } = getDayName(i + 1, currentDate.getMonth(), currentDate.getFullYear());
                                    return (
                                        <th key={i} className={`sticky top-0 z-20 min-w-[38px] border-b border-r border-slate-200 py-1.5 text-center bg-slate-50 ${isSun ? 'text-red-500' : 'text-slate-400'}`}>
                                            <div className="text-[10px] font-bold">{i + 1}</div>
                                            <div className="text-[8px] uppercase">{name}</div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedData.map((emp) => (
                                <tr key={emp.id} className={`${selectedIds.includes(emp.id) ? 'bg-slate-50' : ''} hover:bg-slate-50/50 transition-colors`}>
                                    <td className="sticky left-0 z-10 bg-white border-r border-slate-200 p-2 text-center">
                                        <input type="checkbox" checked={selectedIds.includes(emp.id)} onChange={() => setSelectedIds(prev => prev.includes(emp.id) ? prev.filter(i => i !== emp.id) : [...prev, emp.id])} className="rounded" />
                                    </td>
                                    <td className="sticky left-10 z-10 bg-white border-r border-slate-200 px-4 py-2 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-bold text-slate-400 leading-none">{emp.id}</span>
                                            <span className="text-[10px] font-bold text-slate-700 uppercase">{emp.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 border-r border-slate-100 text-[10px] font-bold text-slate-400 italic">{emp.dept}</td>
                                    {emp.shifts.map((shift, i) => (
                                        <td key={i} className="border-r border-slate-100 text-center text-[10px] font-bold py-2.5 text-slate-600">{shift}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            {selectedIds.length > 0 && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-4">
                    <span className="text-[10px] font-black uppercase tracking-widest">Đã chọn {selectedIds.length} người</span>
                    <button onClick={() => setIsActionModalOpen(true)} className="px-4 py-1.5 bg-white text-black rounded-full text-[10px] font-black uppercase hover:bg-slate-200 transition">Thay đổi ca</button>
                    <button onClick={() => setSelectedIds([])} className="text-slate-400 hover:text-white transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
            )}

            {isActionModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Cập nhật ca làm việc hàng loạt</h3>
                            <button onClick={() => setIsActionModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">×</button>
                        </div>
                        
                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5">Từ ngày</label>
                                    <select className="w-full bg-slate-100 border-none rounded-md p-2 text-[11px] font-bold" value={bulkData.fromDay} onChange={(e) => setBulkData({...bulkData, fromDay: e.target.value})}>
                                        {Array.from({length: 31}, (_, i) => (<option key={i+1} value={i+1}>Ngày {i+1}</option>))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5">Đến ngày</label>
                                    <select className="w-full bg-slate-100 border-none rounded-md p-2 text-[11px] font-bold" value={bulkData.toDay} onChange={(e) => setBulkData({...bulkData, toDay: e.target.value})}>
                                        {Array.from({length: 31}, (_, i) => (<option key={i+1} value={i+1}>Ngày {i+1}</option>))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5">Chọn mã ca ({filteredShiftCodes.length})</label>
                                <div className="border border-slate-200 rounded-md overflow-hidden">
                                    <input 
                                        type="text" 
                                        placeholder="Tìm mã ca nhanh..."
                                        className="w-full border-none border-b border-slate-100 bg-slate-50 px-3 py-2 text-[11px] focus:ring-0"
                                        value={bulkData.shiftSearch}
                                        onChange={(e) => setBulkData({...bulkData, shiftSearch: e.target.value})}
                                    />
                                    <div className="h-40 overflow-y-auto bg-white divide-y divide-slate-50 custom-scrollbar">
                                        {filteredShiftCodes.map(code => (
                                            <button 
                                                key={code}
                                                onClick={() => setBulkData({...bulkData, shift: code})}
                                                className={`w-full text-left px-4 py-2.5 text-[11px] font-bold transition-colors flex justify-between items-center ${bulkData.shift === code ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                                            >
                                                <span>Ca {code}</span>
                                                {bulkData.shift === code && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 flex gap-3">
                            <button 
                                onClick={() => {
                                    alert(`Cập nhật cho ${selectedIds.length} người từ ngày ${bulkData.fromDay} đến ${bulkData.toDay} là ca ${bulkData.shift}`);
                                    setIsActionModalOpen(false);
                                    setSelectedIds([]);
                                }}
                                className="flex-[2] py-2.5 bg-slate-900 text-white rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-black transition"
                            >
                                Xác nhận cập nhật
                            </button>
                            <button onClick={() => setIsActionModalOpen(false)} className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-400 rounded-md text-[10px] font-black uppercase hover:bg-slate-100 transition">Hủy</button>
                        </div>
                    </div>
                </div>
            )}

            <footer className="bg-white border-t p-2 px-6 flex items-center justify-between text-[10px] font-bold text-slate-400 shrink-0 uppercase tracking-widest italic">
                <div>Total: {filteredEmployees.length} staffs</div>
                <div>MngShift Minimal Version 2.0</div>
            </footer>
        </div>
    );
};

export default MngShift;