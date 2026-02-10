/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { CheckCircle2, Circle, CheckSquare, Square, AlertCircle, Loader2, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TYPE_SCANNER_MACHINE } from '@/lib';
import { useQuery } from '@tanstack/react-query';
import scannerMachineApi, { useSaveScanMachineWithDept } from '@/api/HR/scannerMachineApi';

const ConfigDoorWithDept: React.FC = () => {
    const { i18n } = useTranslation('formIT');
    const lang = useMemo(() => i18n.language.split('-')[0], [i18n.language]);
    
    const [typeScannerMachine, setScannerMachine] = useState('All');
    const [selectedDeviceIds, setSelectedDeviceIds] = useState<number[]>([]);
    const [selectedDeptIds, setSelectedDeptIds] = useState<string[]>([]);
    const [nationality, setNationality] = useState<'VN' | 'Foreign'>('VN');
    const [isLoadingConfig, setIsLoadingConfig] = useState(false);

    const { data } = useQuery({
        queryKey: ['get-page-config-scan-dept'],
        queryFn: async () => {
            const res = await scannerMachineApi.getDataPageConfigScanMachineWithDepartment();
            return res.data.data;
        }
    });

	const scannerMachines = useMemo(() => data?.scannerMachines || [], [data]);

    const fetchConfig = useCallback(async (machineId: number, nation: string) => {
        setIsLoadingConfig(true);
        try {
            const res = await scannerMachineApi.getDepartmentConfigByScanMachineId(machineId, nation)
            const deptIds = res.data.data.map((id: number) => String(id));
            setSelectedDeptIds(deptIds);
        } catch (error) {
            console.error("Fetch config error:", error);
            setSelectedDeptIds([]);
        } finally {
            setIsLoadingConfig(false);
        }
    }, []);

	useEffect(() => {
		if (selectedDeviceIds.length === 1) {
			fetchConfig(selectedDeviceIds[0], nationality);
		} 
	}, [nationality, selectedDeviceIds, fetchConfig]);

    const handleToggleDevice = useCallback((deviceId: number) => {
		setSelectedDeviceIds(prev => {
			const isActivating = !prev.includes(deviceId);
			const next = isActivating ? [...prev, deviceId] : prev.filter(i => i !== deviceId);
			
			if (next.length === 0) {
				setSelectedDeptIds([]);
			}
			
			return next;
		});
	}, []);

    const handleToggleDept = useCallback((deptId: string) => {
        setSelectedDeptIds(prev => 
            prev.includes(deptId) ? prev.filter(id => id !== deptId) : [...prev, deptId]
        );
    }, []);

    const saveScanMachineWithDept = useSaveScanMachineWithDept();

    const handleSave = async () => {
        if (selectedDeviceIds.length === 0 || selectedDeptIds.length === 0) return;

        const payload = {
            ScanMachineIds: selectedDeviceIds,
            DepartmentIds: selectedDeptIds.map(id => Number(id)),
            Nationality: nationality
        };

        await saveScanMachineWithDept.mutateAsync(payload);
    };

    const filteredDevices = useMemo(() => {
        if (!typeScannerMachine || typeScannerMachine === 'All') return scannerMachines;
        return scannerMachines.filter((d: any) => String(d.typeMachine) === String(typeScannerMachine));
    }, [scannerMachines, typeScannerMachine]);

    const selectedDeviceNames = useMemo(() => {
        return scannerMachines
            .filter((d: any) => selectedDeviceIds.includes(d.ddMa))
            .map((d: any) => d.ddTenV)
            .join(', ');
    }, [selectedDeviceIds, scannerMachines]);

    return (
        <div className="flex h-screen p-4 lg:p-2 font-sans text-slate-800 overflow-hidden bg-slate-50">
            <aside className="w-72 lg:w-80 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col mr-6">
                <header className="p-4 border-b">
                    <div className="flex items-center justify-between mb-2">
                        <button onClick={() => { setSelectedDeviceIds([]); setSelectedDeptIds([]); }} className="text-[13px] text-indigo-600 hover:underline cursor-pointer">
                            {lang === 'vi' ? 'Bỏ chọn hết' : 'Clear all selections'}
                        </button>
                    </div>
                    <select 
                        value={typeScannerMachine} 
                        onChange={(e) => setScannerMachine(e.target.value)} 
                        className="border border-gray-200 p-2.5 rounded-lg text-sm bg-white outline-none w-full cursor-pointer focus:border-indigo-500 transition-all"
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
                                onClick={() => handleToggleDevice(device.ddMa)}
                                className={`w-full text-left p-2 rounded-lg border-2 transition-all flex items-center gap-3 cursor-pointer ${
                                    active ? 'border-indigo-500 bg-indigo-50/50' : 'border-transparent bg-slate-50 hover:bg-slate-100'
                                }`}
                            >
                                {active ? <CheckSquare size={18} className="text-indigo-600" /> : <Square size={18} className="text-slate-300" />}
                                <div className="overflow-hidden">
                                    <p className={`font-bold text-sm truncate uppercase ${active ? 'text-indigo-700' : 'text-slate-700'}`}>{device?.ddTenV}</p>
                                    <p className="text-[10px] text-slate-400 font-mono italic">{device?.ddip}</p>
                                </div>
                            </button>
                        );
                    })}
                </nav>
            </aside>

            <main className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
                {isLoadingConfig && (
                    <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                        <Loader2 className="animate-spin text-indigo-600" size={32} />
                    </div>
                )}

				<header className="p-6 border-b border-slate-50 flex items-center justify-between gap-4">
					<div className="flex bg-slate-100 p-1 rounded-xl w-fit shrink-0">
						{['VN', 'Foreign'].map((type) => (
							<button
								key={type}
								onClick={() => setNationality(type as any)}
								className={`px-6 py-1.5 text-sm font-bold rounded-lg transition-all cursor-pointer ${
									nationality === type ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
								}`}
							>
								{type === 'VN' ? (lang === 'vi' ? 'Việt Nam' : 'Vietnam') : (lang === 'vi' ? 'Nước ngoài' : 'Foreign')}
							</button>
						))}
					</div>

					<div className="flex-1 min-w-0 flex justify-center"> 
						{selectedDeviceIds.length > 0 && (
							<div className={`
								flex items-center gap-3 py-2 px-4 rounded-xl border w-full transition-all duration-300
								${selectedDeviceIds.length === 1 
									? 'bg-indigo-50 border-indigo-100' 
									: 'bg-amber-50 border-amber-100'
								}
							`}>
								<div className={`p-1 rounded-full ${selectedDeviceIds.length === 1 ? 'bg-indigo-100' : 'bg-amber-100'}`}>
									<Info size={16} className={selectedDeviceIds.length === 1 ? 'text-indigo-600' : 'text-amber-600'} />
								</div>
								
								<p 
									className={`text-sm font-semibold truncate ${selectedDeviceIds.length === 1 ? 'text-indigo-700' : 'text-amber-700'}`}
									title={selectedDeviceNames}
								>
									{selectedDeviceIds.length === 1 
										? (lang === 'vi' ? `Đang thiết lập cho máy: ${selectedDeviceNames}` : `Configuring device: ${selectedDeviceNames}`)
										: (lang === 'vi' 
											? `CẤU HÌNH HÀNG LOẠT (${selectedDeviceIds.length} máy): ${selectedDeviceNames}` 
											: `BULK CONFIGURATION (${selectedDeviceIds.length} devices): ${selectedDeviceNames}`)
									}
								</p>
							</div>
						)}
					</div>

					<button 
						disabled={saveScanMachineWithDept.isPending || !selectedDeviceIds.length || !selectedDeptIds.length}
						onClick={handleSave}
						className="shrink-0 flex items-center gap-2 bg-indigo-600 text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 transition-all active:scale-95 cursor-pointer shadow-lg shadow-indigo-100"
					>
						{saveScanMachineWithDept.isPending ? <Loader2 size={16} className="animate-spin" /> : (lang === 'vi' ? 'Lưu cấu hình' : 'Save Config')}
					</button>
				</header>

                <section className="flex-1 overflow-y-auto p-8 pt-4 bg-slate-50/30">
                    {selectedDeviceIds.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <AlertCircle size={40} strokeWidth={1} className="mb-4 opacity-20" />
                            <p className="text-sm font-medium italic">
                                {lang === 'vi' ? 'Chọn ít nhất 1 máy bên trái để xem/gán bộ phận' : 'Select at least 1 device to configure'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {data?.departments.map((dept: any) => {
                                const active = selectedDeptIds.includes(String(dept.id));
                                return (
                                    <button 
                                        key={dept.id}
                                        onClick={() => handleToggleDept(String(dept.id))}
                                        className={`p-4 rounded-xl border-2 flex flex-col gap-3 transition-all text-left cursor-pointer group ${
                                            active ? 'border-indigo-500 bg-white shadow-md' : 'border-slate-100 bg-white/50 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center w-full">
                                            {active ? <CheckCircle2 size={20} className="text-indigo-600" /> : <Circle size={20} className="text-slate-200 group-hover:text-slate-300" />}
                                            <span className="text-[9px] font-mono text-slate-300 uppercase">ID: {dept.id}</span>
                                        </div>
                                        <p className={`font-bold text-sm leading-tight ${active ? 'text-indigo-900' : 'text-slate-600'}`}>
                                            {dept.name}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default ConfigDoorWithDept;