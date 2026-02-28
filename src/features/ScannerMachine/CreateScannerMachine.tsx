/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PROVIDER_SCAN_MACHINE, TYPE_SCANNER_MACHINE } from '@/lib';
import { useNavigate, useParams } from 'react-router-dom'; // Dùng useParams để lấy ID
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import scanMachineApi, { useCreateOrUpdateScanMachine } from '@/api/HR/scannerMachineApi';

const deviceSchema = z.object({
    id: z.number().nullable().optional(),
    name: z.string().min(1, "Bắt buộc"),
    nameE: z.string().min(1, "Bắt buộc"),
    serial: z.string().min(1, "Bắt buộc"),
    ip: z.string().ip({ message: "IP sai định dạng" }),
    port: z.string().regex(/^\d+$/, "Port phải là số"),
    user: z.string(),
    pass: z.string(),
    type: z.string().min(1),
    providerId: z.string().min(1),
    note: z.string().optional(),
    isDisabled: z.string(),
    metadata: z.object({
        is_training_room: z.boolean(),
        is_restroom: z.boolean(),
        is_special: z.boolean(),
    })
});

type DeviceFormData = z.infer<typeof deviceSchema>;

const CreateScannerMachine = () => {
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();

    const { t } = useTranslation('formIT');
    const lang = useTranslation().i18n.language.split('-')[0];
    const createOrUpdateScanMachine = useCreateOrUpdateScanMachine();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<DeviceFormData>({
        resolver: zodResolver(deviceSchema),
        defaultValues: {
            id: null, name: '', nameE: '', serial: '', ip: '', port: '8000',
            user: 'admin', pass: '', type: '1', providerId: '1', note: '', isDisabled: 'false',
            metadata: { is_training_room: false, is_restroom: false, is_special: false }
        }
    });

    const { data: detailData, isLoading: isLoadingFormDataDetail } = useQuery({
        queryKey: ['get-detail-scan-machine', id],
        queryFn: async () => {
            try {
                const res = await scanMachineApi.getMachineById(Number(id));
                return res.data.data;
            } catch {
                return null;
            }
        },
        enabled: isEditMode,
    });

    useEffect(() => {
        if (detailData) {
            let metaObj = { is_training_room: false, is_restroom: false, is_special: false };
            try {
                if (detailData.metaData) {
                    metaObj = typeof detailData.metaData === 'string' 
                        ? JSON.parse(detailData.metaData) 
                        : detailData.metaData;
                }
            } catch (e) { console.error("Parse metadata error", e); }

            reset({
                id: detailData.id,
                name: detailData.ddTenV ?? '',
                nameE: detailData.ddTenE ?? '',
                serial: detailData.ddSerial ?? '',
                ip: detailData.ddip ?? '',
                port: detailData.ddPort?.toString() ?? '8000',
                user: detailData.ddUserName ?? 'admin',
                pass: detailData.ddPassWord ?? '',
                type: detailData.typeMachine?.toString() ?? '1',
                providerId: detailData.providerId?.toString() ?? '1',
                note: detailData.note ?? '',
                isDisabled: detailData.isDisabled === true ? "true" : "false",
                metadata: metaObj
            });
        }
    }, [detailData, reset]);

    const onSubmit: SubmitHandler<DeviceFormData> = async (data) => {
        const payload = {
            ...data,
            id: isEditMode ? Number(id) : null,
            port: Number(data.port),
            typeMachine: Number(data.type),
            providerId: Number(data.providerId),
            isDisabled: data.isDisabled === "true",
            userName: data.user,
            passWord: data.pass,
            metadata: JSON.stringify(data.metadata) 
        };
        await createOrUpdateScanMachine.mutateAsync(payload);
        navigate('/it/list-scanner-machine');
    };

    if (isEditMode && !detailData) {
        return  <div className='text-red-700 font-semibold'>{lang == 'vi' ? 'Không tìm thấy dữ liệu' : 'Not found data'}</div>;
    }
    
    if (isEditMode && isLoadingFormDataDetail) {
        return <div>{lang === 'vi' ? 'Đang tải dữ liệu...' : 'Loading data...'}</div>;
    }

    return (
        <div className="w-full p-1 space-y-6">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-xl md:text-2xl">{t('scanner_machine.list.add')}</h3>
                <button  className="bg-black text-white text-sm p-2 rounded-sm flex items-center gap-2 font-bold cursor-pointer">
                    {t('scanner_machine.list.title')}
                </button>
             </div>

            <div className="max-w-3xl">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">{lang === 'vi' ? 'Tên thiết vị (VietNam)' : 'Device Name (VietNam)'}</label>
                            <input {...register('name')} placeholder='...' className={`w-full p-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-black/5 transition ${errors.name ? 'border-red-500' : 'border-slate-300 focus:border-black'}`} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">{lang === 'vi' ? 'Tên thiết vị (English)' : 'Device Name (English)'}</label>
                            <input {...register('nameE')} placeholder='...' className={`w-full p-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-black/5 transition ${errors.nameE ? 'border-red-500' : 'border-slate-300 focus:border-black'}`} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">{lang === 'vi' ? 'Serial' : 'Serial Number'}</label>
                            <input {...register('serial')} placeholder='...' className={`w-full p-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-black/5 transition ${errors.serial ? 'border-red-500' : 'border-slate-300 focus:border-black'}`} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">{lang === 'vi' ? 'Địa chỉ IP' : 'IP Address'}</label>
                            <input {...register('ip')} placeholder='...' className={`w-full p-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-black/5 transition ${errors.ip ? 'border-red-500' : 'border-slate-300 focus:border-black'}`} />
                            <span className='text-xs text-red-500'>{errors.ip?.message}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">Port</label>
                            <input {...register('port')} placeholder='...' className={`w-full p-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-black/5 transition ${errors.port ? 'border-red-500' : 'border-slate-300 focus:border-black'}`} />
                            <span className='text-xs text-red-500'>{errors.port?.message}</span>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">{lang === 'vi' ? 'Tài khoản' : 'User'}</label>
                            <input {...register('user')} placeholder='...' className={`w-full p-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-black/5 transition ${errors.user ? 'border-red-500' : 'border-slate-300 focus:border-black'}`} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">{lang === 'vi' ? 'Mật khẩu' : 'Password'}</label>
                            <input type="text" {...register('pass')} placeholder='...' className={`w-full p-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-black/5 transition ${errors.pass ? 'border-red-500' : 'border-slate-300 focus:border-black'}`} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">{lang === 'vi' ? 'Loại máy' : 'Scanner Type'}</label>
                            <select {...register('type')} className="w-full p-2.5 rounded-lg border border-slate-300 bg-white">
                                {TYPE_SCANNER_MACHINE.map((item: any) => (
                                    <option key={item.id} value={item.id}>{lang === 'vi' ? item.name : item.nameE}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">{lang === 'vi' ? 'Hãng' : 'Provider'}</label>
                            <select {...register('providerId')} className="w-full p-2.5 rounded-lg border border-slate-300 bg-white">
                                {PROVIDER_SCAN_MACHINE.map((item: any) => (
                                    <option key={item.id} value={item.id}>{lang === 'vi' ? item.name : item.nameE}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <p className="text-xs font-black uppercase text-slate-400 mb-3 tracking-wider">{lang === 'vi' ? 'Dữ liệu khác' : 'Other Settings'}</p>
                        <div className="flex flex-wrap gap-6">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" {...register('metadata.is_training_room')} className="w-4 h-4 rounded border-slate-300 text-black focus:ring-black" />
                                <span className="text-sm font-medium text-slate-600 group-hover:text-black">{lang === 'vi' ? 'Phòng đào tạo' : 'Training Room'}</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" {...register('metadata.is_restroom')} className="w-4 h-4 rounded border-slate-300 text-black focus:ring-black" />
                                <span className="text-sm font-medium text-slate-600 group-hover:text-black">{lang === 'vi' ? 'Nhà vệ sinh' : 'Restroom'}</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" {...register('metadata.is_special')} className="w-4 h-4 rounded border-slate-300 text-black focus:ring-black" />
                                <span className="text-sm font-medium text-slate-600 group-hover:text-black">{lang === 'vi' ? 'Cần giám đốc điều hành duyệt' : 'Need General Manager Approval'}</span>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1">
                        <div>
                            <label className="text-sm font-bold">{lang == 'vi' ? 'Hoạt động' : 'Enabled'}</label>
                            <select {...register('isDisabled')} className="w-full mt-1 p-2.5 border border-gray-300 rounded-xl outline-none">
                                <option value="false">{lang == 'vi' ? 'Có' : 'Yes'}</option> 
                                <option value="true">{lang == 'vi' ? 'Không' : 'No'}</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">{lang == 'vi' ? 'Ghi chú' : 'Note'}</label>
                        <textarea {...register('note')} rows={2} className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:border-black transition resize-none" />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="submit" 
                            disabled={createOrUpdateScanMachine.isPending}
                            className="cursor-pointer flex-1 py-3 bg-black text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition disabled:bg-slate-400"
                        >
                            {lang == 'vi' ? 'Lưu' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateScannerMachine;