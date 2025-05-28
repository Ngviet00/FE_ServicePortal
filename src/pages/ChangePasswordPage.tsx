import { Spinner } from "@/components/ui/spinner";
import { getErrorMessage, ShowToast } from "@/lib";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import authApi from "@/api/authApi";

import "./css/Login.css";
import { useNavigate } from "react-router-dom";

export default function ChangePasswordPage() {
    const { t } = useTranslation();
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
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

    return <>
        <div className="flex min-h-full flex-1 flex-col justify-start pb-12 lg:px-1 bg-white change-password-page dark:bg-[#454545]">
            <h2 className="font-bold text-2xl mb-3">{t('change_password_page.title')}</h2>
            <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm" style={{ margin: 'initial'}}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="mb-5">
                        <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                            {t('change_password_page.new_password')}
                        </label>
                        <div className="mt-2">
                            <input
                                id="new_password"
                                name="new_password"
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6"
                            />
                        </div>
                    </div>
        
                    <div className="mb-3">
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                                {t('change_password_page.confirm_password')}
                            </label>
                        </div>
                        <div className="mt-2">
                            <input
                                id="confirm_password"
                                name="confirm_password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6"
                            />
                        </div>
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