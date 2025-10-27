import { Spinner } from "@/components/ui/spinner";
import { getErrorMessage, isValidEmail, ShowToast } from "@/lib";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { hasAlphanumeric, hasMinimumLength, hasSpecialCharacter } from "@/lib/password";
import authApi from "@/api/authApi";
import PasswordRequirementIndicator from "@/components/ComponentCustom/PasswordStrengthIndicator";
import "./css/Login.css";
import DotRequireComponent from "@/components/DotRequireComponent";

export default function ChangePasswordPage() {
    const { t } = useTranslation();
    const lang = useTranslation().i18n.language.split('-')[0]
    const [email, setEmail] = useState("")
    const [emailError, setEmailError] = useState('')
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);
    const { updateUser } = useAuthStore();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const hasEmail = user?.email != null && user?.email != null && user?.email != ''

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword != confirmPassword) {
            ShowToast(t("change_password_page.password_dont_match"), "error")
            return
        }
        
        if (!hasEmail && (email == '' || !isValidEmail(email))) {
            setEmailError('Email is invalid.')
            return
        }

        setLoading(true);
        try {

            await authApi.changePassword({ newPassword, confirmPassword, email });
            updateUser({ isChangePassword: 1 })

             if (!hasEmail) {
                updateUser({ email: email })
            }

            ShowToast("Success", "success")
            setNewPassword("")
            setConfirmNewPassword("")
            setEmailError('')
            navigate("/")
        }
        catch (err) {
            ShowToast(getErrorMessage(err), "error")
        }
        finally {
            setLoading(false);
        }
    };

    const handleChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newEmail = event.target.value;
        setEmail(newEmail);

        if (newEmail.length == 0) {
            setEmailError('')
        } else if (!isValidEmail(newEmail)) {
            setEmailError('Email is invalid.');
        } else {
            setEmailError('')
        }
    }

    const handleChangeNewPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = event.target.value;
        setNewPassword(newPassword);
    };

    const handleChangeConfirmNewPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = event.target.value;
        setConfirmNewPassword(newPassword);
    };

    return <>
        <div className="flex min-h-full flex-1 flex-col justify-start pb-12 lg:px-1 bg-white change-password-page dark:bg-[#454545]">
            <h2 className="font-bold text-2xl mb-3">{t('change_password_page.title')}</h2>
            <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm" style={{ margin: 'initial'}}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {
                        !hasEmail && (
                            <div>
                                <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                                    Email <DotRequireComponent/>
                                </label>
                                <div className="mt-2 relative">
                                    <input
                                        id="email"
                                        name="email"
                                        type="text"
                                        value={email}
                                        required
                                        onChange={handleChangeEmail}
                                        className="h-[36px] block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6"
                                    />
                                    <span className="text-sm text-red-500">{emailError}</span>
                                </div>
                            </div>
                        )
                    }
                    
                    <div className="mb-5">
                        <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                            {t('change_password_page.new_password')} <DotRequireComponent/>
                        </label>
                        <div className="mt-2 relative">
                            <input
                                id="new_password"
                                name="new_password"
                                type={showPassword ? "text" : "password"}
                                value={newPassword}
                                required
                                onChange={handleChangeNewPassword}
                                className="h-[36px] block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6"
                            />
                            <button
                                type="button"
                                className="hover:cursor-pointer absolute right-2 inset-y-0 flex items-center text-gray-500 hover:text-gray-700"
                                onClick={() => setShowPassword((v) => !v)}
                                >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
        
                    <div className="mb-3">
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                                {t('change_password_page.confirm_password')} <DotRequireComponent/>
                            </label>
                        </div>
                        <div className="mt-2 relative">
                            <input
                                id="confirm_password"
                                name="confirm_password"
                                type={showConfirmPw ? "text" : "password"}
                                value={confirmPassword}
                                required
                                onChange={handleChangeConfirmNewPassword}
                                autoComplete="current-password"
                                className="h-[36px] block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6"
                            />
                            <button
                                type="button"
                                className="hover:cursor-pointer absolute right-2 inset-y-0 flex items-center text-gray-500 hover:text-gray-700"
                                onClick={() => setShowConfirmPw((v) => !v)}
                                >
                                {showConfirmPw ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <span className="text-gray-500 text-sm italic mt-2 inline-block">{lang == 'vi' ? 'Ví dụ' : 'Ex'}: Quan8386# | Hoang8888@ | Duc6789@</span>
                        <PasswordRequirementIndicator password={newPassword} />
                    </div>
                    <div>
                        <button type="submit" disabled={
                            loading ||
                            !hasMinimumLength(newPassword) || 
                            !hasAlphanumeric(newPassword) ||
                            !hasSpecialCharacter(newPassword)
                        }
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