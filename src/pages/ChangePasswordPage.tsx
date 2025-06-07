import { Spinner } from "@/components/ui/spinner";
import { getErrorMessage, ShowToast } from "@/lib";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { checkPasswordStrength, PasswordStrength } from "@/lib/password";
import authApi from "@/api/authApi";
import PasswordStrengthIndicator from "@/components/ComponentCustom/PasswordStrengthIndicator";

import "./css/Login.css";

export default function ChangePasswordPage() {
    const { t } = useTranslation();
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);
    const [strengthNewPassword, setStrengthNewPw] = useState<PasswordStrength>('');
    const [strengthConfirmPassword, setStrengthConfirmPw] = useState<PasswordStrength>('');
    const { updateUser } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await authApi.changePassword({ newPassword, confirmPassword });
            console.log(res.data)
            updateUser({ isChangePassword: 1 })
            ShowToast("Success", "success")
            setNewPassword("")
            setConfirmNewPassword("")
            navigate("/")
        }
        catch (err) {
            ShowToast(getErrorMessage(err), "error")
        }
        finally {
            setLoading(false);
        }
    };

    const handleChangeNewPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = event.target.value;
        setNewPassword(newPassword);
        setStrengthNewPw(checkPasswordStrength(newPassword));
    };

    const handleChangeConfirmNewPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = event.target.value;
        setConfirmNewPassword(newPassword);
        setStrengthConfirmPw(checkPasswordStrength(newPassword));
    };

    return <>
        <div className="flex min-h-full flex-1 flex-col justify-start pb-12 lg:px-1 bg-white change-password-page dark:bg-[#454545]">
            <h2 className="font-bold text-2xl mb-3">{t('change_password_page.title')}</h2>
            <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm" style={{ margin: 'initial'}}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="mb-5">
                        <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                            {t('change_password_page.new_password')}
                        </label>
                        <div className="mt-2 relative">
                            <input
                                id="new_password"
                                name="new_password"
                                type={showPassword ? "text" : "password"}
                                required
                                value={newPassword}
                                onChange={handleChangeNewPassword}
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6"
                            />
                            <button
                                type="button"
                                className="hover:cursor-pointer absolute right-2 inset-y-0 flex items-center text-gray-500 hover:text-gray-700"
                                onClick={() => setShowPassword((v) => !v)}
                                >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <span className="text-sm text-gray-500 italic mb-0">Mật khẩu có 6 ký tự bao gồm !@#$%^&*<span/></span>
                        {
                            newPassword && ( <PasswordStrengthIndicator strength={strengthNewPassword}/> )
                        }
                    </div>
        
                    <div className="mb-3">
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                                {t('change_password_page.confirm_password')}
                            </label>
                        </div>
                        <div className="mt-2 relative">
                            <input
                                id="confirm_password"
                                name="confirm_password"
                                type={showConfirmPw ? "text" : "password"}
                                value={confirmPassword}
                                onChange={handleChangeConfirmNewPassword}
                                required
                                autoComplete="current-password"
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6"
                            />
                            <button
                                type="button"
                                className="hover:cursor-pointer absolute right-2 inset-y-0 flex items-center text-gray-500 hover:text-gray-700"
                                onClick={() => setShowConfirmPw((v) => !v)}
                                >
                                {showConfirmPw ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <span className="text-sm text-gray-500 italic mb-0">Mật khẩu có 6 ký tự bao gồm !@#$%^&*<span/></span>
                        {
                            confirmPassword && ( <PasswordStrengthIndicator strength={strengthConfirmPassword}/> )
                        }
                    </div>

                    <div>
                        <button type="submit" disabled={ loading }
                            className="cursor-pointer flex w-full bg-black hover:bg-gray-800 justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2"
                        >
                            { loading ? <Spinner size='small' className="text-white"/> : t('update') }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </>
}