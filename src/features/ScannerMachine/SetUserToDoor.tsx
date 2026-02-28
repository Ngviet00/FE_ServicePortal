/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import { Trash2, UserPlus, Search, Square, CheckSquare, UserCheck, Users, Contact } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TYPE_SCANNER_MACHINE, ShowToast, getProviderName } from '@/lib';
import { useQuery } from '@tanstack/react-query';
import scannerMachineApi, { usePushManualUserToMachine } from '@/api/HR/scannerMachineApi';
import userApi from '@/api/userApi';

const SetUserToDoor: React.FC = () => {
    const { i18n } = useTranslation('formIT');
    const lang = useMemo(() => i18n.language.split('-')[0], [i18n.language]);

    const [typeScannerMachine, setScannerMachine] = useState('All');
    const [selectedDeviceIds, setSelectedDeviceIds] = useState<number[]>([]);

    const [empCodeInput, setEmpCodeInput] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<any[]>([]);

    const pushUserToMachine =  usePushManualUserToMachine();

    const { data: scannerMachines = [] } = useQuery({
        queryKey: ['get-scan-machines-page-config-user-door'],
        queryFn: async () => {
            const res = await scannerMachineApi.getAll({typeMachine: 0});
            return res.data.data;
        }
    });

    const handleSearchUser = async () => {
        const code = empCodeInput.trim();
        if (!code) return;

        if (selectedUsers.some(u => u.empCode === code)) {
            ShowToast(lang === 'vi' ? 'Nhân viên này đã có trong danh sách' : 'User already in list', 'error');
            return;
        }

        const userFound = await userApi.getByCode(code).then(res => res.data.data).catch(() => null);

        if (userFound && userFound.userCode != null) {  
            setSelectedUsers(prev => [userFound, ...prev]);
            setEmpCodeInput('');
            ShowToast(lang === 'vi' ? 'Đã thêm nhân viên' : 'User added', 'success');
        }
        else {
            ShowToast(lang === 'vi' ? 'Không tìm thấy mã này' : 'Code not found', 'error');
        }
    };

    const removeUser = (userCode: string) => {
        setSelectedUsers(prev => prev.filter(u => u.userCode !== userCode));
    };

    const handleSave = async () => {
        const payload = {
            scannerMachineIds: selectedDeviceIds,
            userCodes: selectedUsers.map(u => u.userCode ?? '')
        };

        await pushUserToMachine.mutateAsync(payload)

        setSelectedDeviceIds([]);
        setSelectedUsers([]);
    };

    const filteredDevices = useMemo(() => {
        if (typeScannerMachine === 'All') return scannerMachines;
        return scannerMachines.filter((d: any) => String(d.typeMachine) === String(typeScannerMachine));
    }, [scannerMachines, typeScannerMachine]);

    return (
        <div className="flex h-screen p-2 bg-slate-50 font-sans text-slate-800 overflow-hidden">
            <aside className="w-80 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col mr-6">
                <header className="p-4 border-b">
                    <h3 className="font-bold text-sm uppercase text-slate-500 mb-3">
                        {lang === 'vi' ? 'Danh sách máy quét' : 'Scanner Devices'}
                    </h3>
                    <select 
                        value={typeScannerMachine} 
                        onChange={(e) => setScannerMachine(e.target.value)} 
                        className="w-full border border-slate-200 p-2.5 rounded-lg text-sm outline-none focus:border-indigo-500 transition-all cursor-pointer"
                    >
                        <option value="All">{lang === 'vi' ? 'Tất cả loại máy' : 'All Types'}</option>
                        {TYPE_SCANNER_MACHINE.map((item: any) => (
                            <option key={item.id} value={item.id}>{lang === 'vi' ? item.name : item.nameE}</option>
                        ))}
                    </select>
                </header>
                
                <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                    {filteredDevices.map((device: any) => {
                        const active = selectedDeviceIds.includes(device.ddMa);
                        return (
                            <button 
                                key={device.ddMa}
                                onClick={() => setSelectedDeviceIds(prev => active ? prev.filter(id => id !== device.ddMa) : [...prev, device.ddMa])}
                                className={`w-full text-left p-2 rounded-lg border-2 transition-all flex items-center gap-3 cursor-pointer ${
                                    active ? 'border-indigo-500 bg-indigo-50/50' : 'border-transparent bg-slate-50 hover:bg-slate-100'
                                }`}
                            >
                                {active ? <CheckSquare size={18} className="text-indigo-600" /> : <Square size={18} className="text-slate-300" />}
                                <div className="overflow-hidden">
                                    <p className={`font-bold text-sm truncate uppercase ${active ? 'text-indigo-700' : 'text-slate-700'}`}>{device?.ddTenV}</p>
                                    <p className="text-[12px] italic">{device?.ddip} - {getProviderName(device?.providerId)}</p>
                                </div>
                            </button>
                        );
                    })}
                </nav>
            </aside>

            <main className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <header className="p-6 border-b flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 max-w-md">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="text"
                                value={empCodeInput}
                                onChange={(e) => setEmpCodeInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchUser()}
                                placeholder={lang === 'vi' ? 'Nhập mã: 10101, 10102...' : 'Enter code: 10101...'}
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 transition-all text-sm"
                            />
                        </div>
                        <button 
                            onClick={handleSearchUser}
                            className="bg-slate-800 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-slate-700 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                        >
                            <UserPlus size={16} />
                            {lang === 'vi' ? 'Thêm' : 'Add'}
                        </button>
                    </div>

                    <button 
                        onClick={handleSave}
                        disabled={selectedDeviceIds.length === 0 || selectedUsers.length === 0}
                        className="bg-indigo-600 text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 transition-all cursor-pointer shadow-lg shadow-indigo-100 flex items-center gap-2"
                    >
                        <UserCheck size={18} />
                        {lang === 'vi' ? 'Lưu cấu hình' : 'Save Config'}
                    </button>
                </header>

                <section className="flex-1 overflow-hidden flex flex-col p-8 bg-slate-50/30">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="text-sm font-bold text-slate-500 flex items-center gap-2">
                            <Users size={18} />
                            {lang === 'vi' ? `NHÂN VIÊN ĐÃ CHỌN (${selectedUsers.length})` : `SELECTED USERS (${selectedUsers.length})`}
                        </h4>
                        {selectedUsers.length > 0 && (
                            <button onClick={() => setSelectedUsers([])} className="text-xs text-red-500 hover:underline cursor-pointer">
                                {lang === 'vi' ? 'Xóa danh sách' : 'Clear all'}
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {selectedUsers.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300">
                                <Contact size={64} strokeWidth={1} className="mb-4 opacity-10" />
                                <p className="text-sm italic">{lang === 'vi' ? 'Chưa có nhân viên nào được chọn' : 'No users selected yet'}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {selectedUsers.map((user) => (
                                    <div 
                                        key={user.userCode}
                                        className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-300 transition-all"
                                    >
                                        <div className="overflow-hidden">
                                            <p className="font-bold text-sm text-indigo-900 truncate">{user.userName}</p>
                                            <p className="text-[12px] mt-0.5">{user.userCode} • {user.departmentName}</p>
                                        </div>
                                        <button 
                                            onClick={() => removeUser(user.userCode)}
                                            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all cursor-pointer"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default SetUserToDoor;