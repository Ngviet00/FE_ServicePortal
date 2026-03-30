import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import userApi, { useUpdateUserReissueIdCard } from '@/api/userApi';
import { ShowToast } from '@/lib';

const reissueSchema = z.object({
    timeKeepingId: z.string().min(1, "Bắt buộc"),
    cardNumber: z.string().min(1, "Bắt buộc").regex(/^\d+$/, "Chỉ được chứa số"),
    cardNumber2: z.string().nullable().optional().refine(val => !val || /^\d+$/.test(val), "Chỉ được chứa số"),
    privilege: z.string().min(1, "Bắt buộc"),
    userCode: z.string(),
    userName: z.string(),
});

type ReissueFormValues = z.infer<typeof reissueSchema>;

const ReissueIdCard = () => {
    const lang = useTranslation().i18n.language.split('-')[0];
    const [loading, setLoading] = useState(false);
    const [searchCode, setSearchCode] = useState('');
    const [hasData, setHasData] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<ReissueFormValues>({
        resolver: zodResolver(reissueSchema),
        defaultValues: {
            privilege: '0',
            cardNumber: '',
            cardNumber2: ''
        }
    });

    const handleSearch = async () => {
        if (!searchCode) return;
        setLoading(true);

		const res = await userApi.getDataUserReissueIdCard(searchCode)
		const finalResult = res.data?.data || null;

		if (finalResult == null) {
			ShowToast("Không tìm thấy nhân viên", "error");
			setHasData(false);
			setLoading(false);
			return
		}

		reset({
			userCode: finalResult.userCode,
			userName: finalResult.userName,
			timeKeepingId: finalResult.timeKeepingId,
			privilege: '0',
			cardNumber: finalResult.cardNumber,
			cardNumber2: finalResult.cardNumber2 || ''
		})

		reset(finalResult);
		setHasData(true);
		setLoading(false);
    };

	const updateUserReissueIdCard = useUpdateUserReissueIdCard();

    const onSubmit = async (data: ReissueFormValues) => {
		const payload = {
			userCode: data.userCode,
			timeKeepingId: data.timeKeepingId,
			cardNumber: data.cardNumber,
			cardNumber2: data.cardNumber2 || null,
			privilege: data.privilege ?? '0'
		}

		await updateUserReissueIdCard.mutateAsync(payload)

		setSearchCode('');
		setHasData(false);
		reset({
			userCode: '',
			userName: '',
			timeKeepingId: '',
			privilege: '0',
			cardNumber: '',
			cardNumber2: ''
    	})
	}

    return (
        <div className="mp-4 pl-1 pt-0 space-y-4">
            <div className="flex justify-between mb-1">
                <h3 className="font-bold text-2xl m-0 pb-2">
                    {lang === 'vi' ? 'Cấp lại thẻ nhân viên' : 'Reissue ID Card'}
                </h3>
            </div>

            <div className="max-w-3xl">
                <div className="p-4 pl-0 pt-0 flex gap-2">
                    <input
                        type="text"
                        placeholder={lang === 'vi' ? 'Nhập mã nhân viên...' : 'Enter employee code...'}
                        className="flex-1 px-4 py-2 rounded-lg border outline-none text-lg font-medium focus:ring-2 focus:ring-blue-500 transition-all border-gray-300"
                        value={searchCode}
                        onChange={(e) => setSearchCode(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 min-w-[80px] hover:cursor-pointer"
                    >
                        {loading ? "..." : (lang === 'vi' ? 'Tìm' : 'Search')}
                    </button>
                </div>

                {hasData ? (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 animate-in fade-in duration-500 bg-white p-1">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-bold text-slate-600">{lang === 'vi' ? 'Mã nhân viên' : 'Usercode'}</label>
                                <input {...register("userCode")} disabled className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-2 cursor-not-allowed font-medium" />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-slate-600">{lang === 'vi' ? 'Họ tên' : 'Full Name'}</label>
                                <input {...register("userName")} disabled className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-2 cursor-not-allowed font-medium" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">{lang === 'vi' ? 'Mã chấm công' : 'Timekeeping ID'}</label>
                            <input
                                {...register("timeKeepingId")}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${errors.timeKeepingId ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-500'}`}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">{lang === 'vi' ? 'Mã thẻ 1' : 'Card Number 1'}</label>
                                <input
                                    {...register("cardNumber")}
                                    placeholder="Thẻ chính"
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${errors.cardNumber ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-500'}`}
                                />
                                {errors.cardNumber && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.cardNumber.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">{lang === 'vi' ? 'Mã thẻ 2' : 'Card Number 2'}</label>
                                <input
                                    {...register("cardNumber2")}
                                    placeholder={lang === 'vi' ? 'Thẻ phụ (nếu có)' : 'Secondary card'}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${errors.cardNumber2 ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-500'}`}
                                />
                                {errors.cardNumber2 && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.cardNumber2.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">{lang === 'vi' ? 'Quyền' : 'Permission'}</label>
                            <select
                                {...register("privilege")}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
                            >
                                <option value="0">{lang === 'vi' ? 'Người dùng' : 'Normal'}</option>
                                <option value="3">{lang === 'vi' ? 'Quản trị viên' : 'Superadmin'}</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-xl shadow-xs disabled:opacity-50 hover:cursor-pointer transition-colors"
                        >
                            {isSubmitting ? (lang === 'vi' ? 'Đang xử lý...' : 'Processing...') : (lang === 'vi' ? 'Lưu' : 'Save')}
                        </button>
                    </form>
                ) : (
                    <div className="text-center py-20 text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
                        {lang === 'vi' ? 'Chưa có dữ liệu nhân viên' : 'No employee data found'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReissueIdCard;