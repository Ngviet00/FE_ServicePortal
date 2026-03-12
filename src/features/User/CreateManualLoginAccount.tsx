import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import PasswordRequirementIndicator from '@/components/ComponentCustom/PasswordStrengthIndicator';
import { getErrorMessage, ShowToast } from '@/lib';
import authApi from '@/api/authApi';
import { hasAlphanumeric, hasMinimumLength, hasSpecialCharacter } from '@/lib/password';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

const createLoginManualSchema = z.object({
    userCode: z.string().min(1),
    password: z.string().min(6),
    confirmPassword: z.string().min(6)
});

type LoginManualFormValues = z.infer<typeof createLoginManualSchema>;

const CreateManualLoginAccount = () => {
    const lang = useTranslation().i18n.language.split('-')[0];
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<LoginManualFormValues>({
        resolver: zodResolver(createLoginManualSchema),
        defaultValues: {
            userCode: '',
            password: '',
            confirmPassword: ''
        }
    });

    const onSubmit = async (data: LoginManualFormValues) => {
        if (data.password.trim() == '' || data.confirmPassword.trim() == '') {
            ShowToast(lang == 'vi' ? 'Mật khẩu không được để trống' : 'Password can not empty', 'error')
            return
        }

        if (data.password.trim() != data.confirmPassword.trim()) {
            ShowToast(lang == 'vi' ? 'Mật khẩu không giống nhau' : 'Password dost not match', 'error')
            return
        }

        const payload = {
            userCode: data.userCode,
            password: data.password,
            confirmPassword: data.confirmPassword
        }

        try {
            await authApi.createManualLoginAccount(payload)
            ShowToast('success')
            reset({
                userCode: '',
                password: '',
                confirmPassword: ''
            })
        }
        catch (err) {
            ShowToast(getErrorMessage(err), 'error')
        }
    }

    const passwordValue = watch("password");

    return (
        <div className="mp-4 pl-1 pt-0 space-y-4">
            <div className="flex justify-between mb-1">
                <h3 className="font-bold text-2xl m-0 pb-2">
                    {lang === 'vi' ? 'Tạo tài khoản đăng nhập' : 'Create manual login account'}
                </h3>
            </div>

            <div className="max-w-3xl">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 animate-in fade-in duration-500 bg-white p-1">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-bold text-slate-600">{lang === 'vi' ? 'Mã nhân viên' : 'Usercode'}</label>
                            <input tabIndex={1} {...register("userCode")} className={`w-full border border-gray-200 rounded-lg px-4 py-2 ${errors.userCode ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-500'}`}  placeholder={lang === 'vi' ? 'Mã nhân viên' : 'Usercode'} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className='relative'>
                            <label className="block text-sm font-bold text-slate-700 mb-1">{lang === 'vi' ? 'Mật khẩu' : 'Password'}</label>
                            <input
                                tabIndex={2}
                                {...register("password")}
                                placeholder={lang === 'vi' ? 'Mật khẩu' : 'Password'}
                                type={showPassword ? "text" : "password"} 
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${errors.password ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-500'}`}
                            />
                            <button
                                type="button"
                                className="absolute right-3 inset-y-0 flex items-center top-6 text-gray-400 hover:text-black cursor-pointer transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">{lang === 'vi' ? 'Xác nhận mật khẩu' : 'Confirm password'}</label>
                            <input
                                tabIndex={3}
                                {...register("confirmPassword")}
                                type={showPassword ? "text" : "password"} 
                                placeholder={lang === 'vi' ? 'Xác nhận mật khẩu' : 'Confirm password'}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${errors.confirmPassword ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-500'}`}
                            />
                        </div>
                        <div>
                            <span className="text-gray-500 text-sm italic mt-2 inline-block">{lang == 'vi' ? 'Ví dụ' : 'Ex'}: Quan8386# | Hoang8888@ | Duc6789@</span>
                            <PasswordRequirementIndicator password={passwordValue} />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !hasMinimumLength(passwordValue) || !hasAlphanumeric(passwordValue) || !hasSpecialCharacter(passwordValue)}
                        className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-xl shadow-xs disabled:opacity-80 hover:cursor-pointer transition-colors disabled:hover:cursor-not-allowed"
                    >
                        {isSubmitting ? <Spinner/> : (lang === 'vi' ? 'Lưu' : 'Save')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateManualLoginAccount;