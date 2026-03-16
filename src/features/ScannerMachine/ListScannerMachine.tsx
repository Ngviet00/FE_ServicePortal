/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Trash2, Edit3, Search, Signal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getErrorMessage, getProviderName, PROVIDER_SCAN_MACHINE, ShowToast, TYPE_SCANNER_MACHINE, useDebounce } from '@/lib';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import scanMachineApi, { useDeleteScanMachine } from '@/api/HR/scannerMachineApi';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';

const ListScannerMachine = () => {
    const { t } = useTranslation('formIT');
	const { t: tCommon } = useTranslation('common')
    const lang = useTranslation().i18n.language.split('-')[0];
    const [searchParams, setSearchParams] = useSearchParams();
    
    const [keySearch, setKeySearch] = useState(searchParams.get("keysearch") ?? '');
    const [typeScannerMachine, setScannerMachine] = useState(searchParams.get("type") ?? '1');
	const [provider, setProvider] = useState(searchParams.get("provider") ?? '');
	const debouncedName = useDebounce(keySearch, 300);

	const [connectingIds, setConnectingIds] = useState<number[]>([]);

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

    const updateUrlParams = (overrides: Record<string, any>) => {
        const params: any = { type: typeScannerMachine, keySearch, provider, ...overrides };
        Object.keys(params).forEach(key => { if (!params[key]) delete params[key]; });
        setSearchParams(params);
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
			setConnectingIds(prev => [...prev, id]);
			await scanMachineApi.getInfoMachine(id)
			ShowToast('OK')
		}
		catch (error) {
			ShowToast(getErrorMessage(error), 'error')
		}
		finally {
			setConnectingIds(prev => prev.filter(item => item !== id));
		}
	}

    return (
        <div className="w-full p-1 space-y-6">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-xl md:text-2xl">{t('scanner_machine.list.title')}</h3>
				<Link to="/it/create-scanner-machine" className="bg-black text-white text-sm p-2 rounded-sm flex items-center gap-2 font-bold cursor-pointer">{t('scanner_machine.list.add')}</Link>
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
			
            <div className="overflow-hidden text-sm">
                <table className="w-full text-left">
                    <thead className="">
                        <tr>
							<th className="p-2 border border-gray-300 text-sm">STT</th>
							<th className="p-2 border border-gray-300 text-sm">{t('scanner_machine.list.name_device')}</th>
							<th className="p-2 border border-gray-300 text-sm">{lang == 'vi' ? 'Tên thiết bị (Tiếng anh)' : 'Name device (English)'}</th>
							<th className="p-2 border border-gray-300 text-sm">IP</th>
							<th className="p-2 border border-gray-300 text-sm">Serial Number</th>
							<th className="p-2 border border-gray-300 text-sm">{lang == 'vi' ? 'Hãng' : 'Provider'}</th>
							<th className="p-2 border border-gray-300 text-sm text-center">{lang == 'vi' ? 'Đang hoạt động' : 'Disabled'}</th>
							<th className="p-2 border border-gray-300 text-sm">{lang == 'vi' ? 'Ghi chú' : 'Note'}</th>
							<th className="p-2 border border-gray-300 text-right text-sm">{t('scanner_machine.list.action')}</th>
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
										<td className="px-4 py-1 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></td>
										<td className="px-4 py-1 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300 text-center" /></div></td>
									</tr>  
								))
							) : isError || scanMachines.length == 0 ? (
									<tr>
										<td colSpan={9} className="px-4 py-2 text-center font-bold text-red-700">
											{ error?.message ?? tCommon('no_results') } 
										</td>
									</tr>
							) : (
								scanMachines.map((dev: any, idx: number) => {
									const isRowConnecting = connectingIds.includes(dev.ddMa);

									return (
										<tr key={idx} className="hover:bg-slate-50/50 transition-colors">
											<td className="border-gray-300 border px-3 py-0">{idx+1}</td>
											<td className="border-gray-300 border px-3 py-0">
												<div className="font-bold">{dev.ddTenV}</div>
											</td>
											<td className="px-3 py-0 border-gray-300 border">
												<div className="font-bold">{dev.ddTenE}</div>
											</td>
											<td className="px-3 py-0 border-gray-300 border">{dev.ddip}</td>
											<td className="px-3 py-0 border-gray-300 border">{dev.ddSerial}</td>
											<td className="px-3 py-0 border-gray-300 border">{getProviderName(dev.providerId)}</td>
											<td className="px-3 py-0 text-center border-gray-300 border">
												{dev.isDisabled ? (
													<span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">{lang == 'vi' ? 'Ngưng hoạt động' : 'Disabled'}</span>
												) : (
													<span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">{lang == 'vi' ? 'Hoạt động' : 'Active'}</span>
												)}
											</td>
											<td className="px-3 py-0 border-gray-300 border">{dev.note ?? '--'}</td>
											<td className="px-3 py-0 text-right border-gray-300 border">
												<div className="flex justify-end gap-2">
													<button disabled={isRowConnecting} onClick={() => handleCheckConnect(dev.ddMa)} className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg cursor-pointer">
														{isRowConnecting ? (
															<Spinner className="animate-spin text-indigo-400" />
														) : (
															<Signal size={19}/>
														)}
													</button>
													<Link className='p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg cursor-pointer' to={`/it/edit-scanner-machine/${dev.ddMa}`}><Edit3 size={16}/></Link>
													<button onClick={() => handleRemove(dev.ddMa)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg cursor-pointer"><Trash2 size={16}/></button>
												</div>
											</td>
										</tr>
									)
								})    
							)
						}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ListScannerMachine;