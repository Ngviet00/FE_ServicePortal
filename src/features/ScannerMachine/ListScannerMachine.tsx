/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Trash2, Edit3, X, Save, Search, Signal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getErrorMessage, getProviderName, PROVIDER_SCAN_MACHINE, ShowToast, TYPE_SCANNER_MACHINE, useDebounce } from '@/lib';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import scanMachineApi, { useCreateOrUpdateScanMachine, useDeleteScanMachine } from '@/api/HR/scannerMachineApi';
import { Skeleton } from '@/components/ui/skeleton';

const deviceSchema = z.object({
	id: z.number().nullable().optional(),
    name: z.string().min(1),
	nameE: z.string().min(1),
	serial: z.string().min(1),
    ip: z.string().ip({ message: "IP không đúng định dạng" }),
    port: z.string().regex(/^\d+$/, "Port phải là số"),
    user: z.string().min(1, "User không được để trống"),
    pass: z.string().min(1, "Password không được để trống"),
    type: z.string().min(1, "Vui lòng chọn loại máy"),
	providerId: z.string().min(1, "Vui lòng chọn hãng"),
    note: z.string().optional(),
});

type DeviceFormData = z.infer<typeof deviceSchema>;

const ListScannerMachine = () => {
    const { t } = useTranslation('formIT');
	const { t: tCommon } = useTranslation('common')
    const lang = useTranslation().i18n.language.split('-')[0];
    const [searchParams, setSearchParams] = useSearchParams();
    
    const [keySearch, setKeySearch] = useState(searchParams.get("keysearch") ?? '');
    const [typeScannerMachine, setScannerMachine] = useState(searchParams.get("type") ?? '1');
	const [provider, setProvider] = useState(searchParams.get("provider") ?? '');
	const [, setCheckConnect] = useState(false)
	const debouncedName = useDebounce(keySearch, 300);

	const queryClient = useQueryClient()

	const { data: scanMachines = [], isPending, isError, error } = useQuery({
        queryKey: ['get-list-scan-machines', { debouncedName, provider, typeScannerMachine }],
        queryFn: async () => {
            const res = await scanMachineApi.getAll({
				providerId: provider == '' ? null : Number(provider),
				typeMachine: Number(typeScannerMachine),
				keySearch: keySearch
            });
            return res.data.data;
        },
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [,setEditingId] = useState<number | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<DeviceFormData>({
        resolver: zodResolver(deviceSchema),
        defaultValues: {
			id: null,
			name: '',
			ip: '',
			port: '8000',
			user: 'admin',
			pass: '',
			type: '1',
			providerId: '1',
			note: ''
		}
    });

    const updateUrlParams = (overrides: Record<string, any>) => {
        const params: any = { type: typeScannerMachine, keySearch, provider, ...overrides };
        Object.keys(params).forEach(key => { if (!params[key]) delete params[key]; });
        setSearchParams(params);
    };

    const openAddModal = () => {
        setEditingId(null);
        reset({ name: '', ip: '', port: '8000', user: 'admin', pass: '', type: '1', note: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (device: any) => {
        setEditingId(device.ddMa);
        reset({
			id: device.ddMa,
			name: device.ddTenV ?? '',
			nameE: device.ddTenE ?? '',
			serial: device.ddSerial ?? '',
			ip: device.ddip ?? '',
			port: device.ddPort?.toString() ?? '8000',
			user: device.ddUserName ?? 'admin',
			pass: device.ddPassWord ?? '',
			type: device.typeMachine?.toString() ?? '1',
			providerId: device.providerId?.toString() ?? '1',
			note: device.note ?? '',
		});
        setIsModalOpen(true);
    };

	const createOrUpdateScanMachine = useCreateOrUpdateScanMachine()

    const onSubmit = async (data: DeviceFormData) => {
		const device = {
			id: data?.id ?? null, 
			ip: data?.ip ?? '',
			port: data?.port ? Number(data.port) : 8000, 
			username: data?.user ?? 'admin',
			password: data?.pass ?? 'VSHIK2022@#',
			name: data?.name ?? '',
			nameE: data?.nameE ?? '',
			serial: data?.serial ?? '',
			typeMachine: data?.type ? Number(data.type) : 1,
			providerId: data?.providerId ? Number(data.providerId) : 1,
		};

		await createOrUpdateScanMachine.mutateAsync(device)

        setIsModalOpen(false);

		queryClient.invalidateQueries({ queryKey: ['get-list-scan-machines'] });
	};

	const deleteScanMachine = useDeleteScanMachine();
    const handleRemove = async (id: number) => {
        if (window.confirm("Bạn có chắc muốn xóa máy này không?")) {
			await deleteScanMachine.mutateAsync(id)
			queryClient.invalidateQueries({ queryKey: ['get-list-scan-machines'] });
        }
    };
	
	const handleKeySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value
		setKeySearch(val)
		updateUrlParams({ keySearch: e.target.value });
	}

	const handleOnChangeTypeScannerMachine = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const val = e.target.value
		setScannerMachine(val)
		updateUrlParams({ type: e.target.value });
	}

	const handleSetProvider = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const val = e.target.value
		setProvider(val)
		updateUrlParams({ provider: e.target.value });
	}

	const handleCheckConnect = async (id: number) => {
		try {
			setCheckConnect(true)
			await scanMachineApi.getInfoMachine(id)
			ShowToast('Online')
		}
		catch (error) {
			ShowToast(getErrorMessage(error), 'error')
		}
		finally {
			setCheckConnect(false)
		}
	}

    return (
        <div className="w-full p-1 space-y-6">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-xl md:text-2xl">{t('scanner_machine.list.title')}</h3>
                <button onClick={openAddModal} className="bg-black text-white text-sm p-2 rounded-sm flex items-center gap-2 font-bold cursor-pointer">
                    {t('scanner_machine.list.add')}
                </button>
            </div>

			<div className="mb-5 flex flex-wrap gap-4 items-center">
				<div className="relative flex-1 min-w-[300px]">
					<Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
					<input type="text" onChange={(e) => handleKeySearch(e)} placeholder="IP, Serial..." className="pl-10 w-full p-2.5 border border-gray-200 rounded-lg outline-none text-sm" />
				</div>
				<select value={typeScannerMachine} onChange={(e) => handleOnChangeTypeScannerMachine(e)} className="border border-gray-200 p-2.5 rounded-lg text-sm bg-white outline-none cursor-pointer">
					{
						TYPE_SCANNER_MACHINE.map((item: any, idx: number) => {
							return (
								<option key={idx} value={item.id}>{lang == 'vi' ? item.name : item.nameE}</option>
							)
						})
					}
				</select>
				<select value={provider} onChange={(e) => handleSetProvider(e)} className="border border-gray-200 p-2.5 rounded-lg text-sm bg-white outline-none cursor-pointer">
					<option value=''>{lang == 'vi' ? '--Chọn--' : '--Select--'}</option>
					{
						PROVIDER_SCAN_MACHINE.map((item: any, idx: number) => {
							return (
								<option key={idx} value={item.id}>{lang == 'vi' ? item.name : item.nameE}</option>
							)
						})
					}
				</select>
			</div>
			
            <div className="rounded-sm shadow-sm border border-slate-200 overflow-hidden text-sm">
                <table className="w-full text-left">
                    <thead className="border-b">
                        <tr>
							<th className="p-2 text-sm">STT</th>
							<th className="p-2 text-sm">{t('scanner_machine.list.name_device')}</th>
							<th className="p-2 text-sm">{lang == 'vi' ? 'Tên thiết bị (Tiếng anh)' : 'Name device (English)'}</th>
							<th className="p-2 text-sm">IP</th>
							<th className="p-2 text-sm">Serial Number</th>
							<th className="p-2 text-sm">{lang == 'vi' ? 'Hãng' : 'Provider'}</th>
							<th className="p-2 text-sm">{lang == 'vi' ? 'Ghi chú' : 'Note'}</th>
							<th className="p-2 text-right text-sm">{t('scanner_machine.list.action')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
						{
							isPending ? (
								Array.from({ length: 3 }).map((_, index) => (
									<tr key={index}>
										<td className="px-4 py-1 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></td>
										<td className="px-4 py-1 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></td>
										<td className="px-4 py-1 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300 text-center" /></div></td>
										<td className="px-4 py-1 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></td>
										<td className="px-4 py-1 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></td>
										<td className="px-4 py-1 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300 text-center" /></div></td>
										<td className="px-4 py-1 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></td>
										<td className="px-4 py-1 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300 text-center" /></div></td>
									</tr>  
								))
							) : isError || scanMachines.length == 0 ? (
									<tr>
										<td colSpan={8} className="px-4 py-2 text-center font-bold text-red-700">
											{ error?.message ?? tCommon('no_results') } 
										</td>
									</tr>
							) : (
								scanMachines.map((dev: any, idx: number) => (
									<tr key={idx} className="hover:bg-slate-50/50 transition-colors">
										<td className="px-3 py-0">{idx+1}</td>
										<td className="px-3 py-0">
											<div className="font-bold">{dev.ddTenV}</div>
										</td>
										<td className="px-3 py-0">
											<div className="font-bold">{dev.ddTenE}</div>
										</td>
										<td className="px-3 py-0">{dev.ddip}</td>
										<td className="px-3 py-0">{dev.ddSerial}</td>
										<td className="px-3 py-0">{getProviderName(dev.providerId)}</td>
										<td className="px-3 py-0">{dev.note ?? '--'}</td>
										<td className="px-3 py-0 text-right">
											<div className="flex justify-end gap-2">
												<button onClick={() => handleCheckConnect(dev.ddMa)} className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg cursor-pointer">
													<Signal size={19}/>
												</button>
												<button onClick={() => openEditModal(dev)} className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg cursor-pointer"><Edit3 size={16}/></button>
												<button onClick={() => handleRemove(dev.ddMa)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg cursor-pointer"><Trash2 size={16}/></button>
											</div>
										</td>
									</tr>
								))    
							)
						}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-sm shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h2 className="text-xl font-black">{lang == 'vi' ? 'Máy quét' : 'Scan machine'}</h2>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={24}/></button>
                        </div>

                        <div className="p-4 space-y-3 overflow-y-auto max-h-[70vh]">
                            <div>
                                <label className="text-sm font-bold">{lang == 'vi' ? 'Tên thiết bị (Tiếng việt)' : 'Name device (Vietnamese)'}</label>
                                <input {...register('name')} placeholder='...' className={`w-full mt-1 p-2.5 rounded-xl border ${errors.name ? 'border-red-500' : 'border-gray-300'}`} />
                            </div>

							<div>
                                <label className="text-sm font-bold">{lang == 'vi' ? 'Tên thiết bị (Tiếng anh)' : 'Name device (English)'}</label>
                                <input {...register('nameE')} placeholder='...' className={`w-full mt-1 p-2.5 rounded-xl border ${errors.name ? 'border-red-500' : 'border-gray-300'}`} />
                            </div>

							<div>
                                <label className="text-sm font-bold">Serial</label>
                                <input {...register('serial')} placeholder='...' className={`w-full mt-1 p-2.5 rounded-xl border ${errors.serial ? 'border-red-500' : 'border-gray-300'}`} />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-bold">IP</label>
                                    <input {...register('ip')} placeholder='...' className={`w-full mt-1 p-2.5 rounded-xl border ${errors.ip ? 'border-red-500' : 'border-gray-300'}`} />
                                    {errors.ip && <p className="text-red-500 text-xs mt-1">{errors.ip.message}</p>}
                                </div>
                                <div>
                                    <label className="text-sm font-bold">Port</label>
                                    <input {...register('port')} placeholder='...' className={`w-full mt-1 p-2.5 rounded-xl border ${errors.port ? 'border-red-500' : 'border-gray-300'}`} />
                                    {errors.port && <p className="text-red-500 text-xs mt-1">{errors.port.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-bold">{t('scanner_machine.list.user')}</label>
                                    <input {...register('user')} className={`w-full mt-1 p-2.5 rounded-xl border border-gray-300 ${errors.user ? 'border-red-500' : 'border-gray-300'}`} />
									{errors.user && <p className="text-red-500 text-xs mt-1">{errors.user.message}</p>}
                                </div>
                                <div>
                                    <label className="text-sm font-bold">{t('scanner_machine.list.password')}</label>
                                    <input type="text" {...register('pass')} className={`w-full mt-1 p-2.5 rounded-xl border border-gray-300 ${errors.pass ? 'border-red-500' : 'border-gray-300'}`} placeholder='...'/>
                                </div>
                            </div>

							<div className="grid grid-cols-2 gap-3">
                                <div>
									<label className="text-sm font-bold">{t('scanner_machine.list.type')}</label>
									<select {...register('type')} className="w-full mt-1 p-2.5 border border-gray-300 rounded-xl outline-none">
										{TYPE_SCANNER_MACHINE.map((item: any) => (
											<option key={item.id} value={item.id}>{lang === 'vi' ? item.name : item.nameE}</option>
										))}
									</select>
								</div>
								<div>
									<label className="text-sm font-bold">{lang == 'vi' ? 'Hãng' : 'Provider'}</label>
									<select {...register('providerId')} className="w-full mt-1 p-2.5 border border-gray-300 rounded-xl outline-none">
										{PROVIDER_SCAN_MACHINE.map((item: any) => (
											<option key={item.id} value={item.id}>{lang === 'vi' ? item.name : item.nameE}</option>
										))}
									</select>
								</div>
                            </div>

                            <div>
                                <label className="text-sm font-bold">{lang == 'vi' ? 'Ghi chú' : 'Note'}</label>
                                <textarea {...register('note')} rows={2} className="w-full mt-1 p-2.5 rounded-xl border border-gray-300 outline-none focus:ring-1 focus:ring-black" placeholder="..." />
                            </div>
                        </div>

                        <div className="p-6 flex gap-3 bg-slate-50">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-200 rounded-xl transition cursor-pointer">{t('scanner_machine.list.cancel')}</button>
                            <button disabled={createOrUpdateScanMachine.isPending} type="submit" className="flex-1 py-3 bg-black text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-400">
                                <Save size={18}/> {t('scanner_machine.list.save')}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ListScannerMachine;