import authApi from "@/api/authApi";
import { AlertError, AlertSuccess } from "@/components/Alert/AlertComponent";
import { Spinner } from "@/components/ui/spinner";
import { getErrorMessage } from "@/lib";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "./css/Login.css";

export default function ChangePasswordPage() {
    const { t } = useTranslation();
    const [new_password, setNewPassword] = useState("")
    const [confirm_password, setConfirmNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const { updateUser } = useAuthStore();

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMsg("")
        setLoading(true);
        setErrorMsg("");
    
        try {
            const res = await authApi.changePassword({ new_password, confirm_password });
            console.log(res);
            updateUser({ isChangePassword: 1 });
            navigate("/", { replace: true });
        }
        catch (err) {
            setErrorMsg(getErrorMessage(err));
        }
        finally {
            setLoading(false);
        }
    };

    return <>
        <div className="flex min-h-full flex-1 flex-col justify-start pb-12 lg:px-1 bg-white change-password-page">
            <h2 className="font-bold text-2xl mb-3">{t('change_password.change_password')}</h2>
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                {successMsg && <AlertSuccess message={successMsg} />}
                {errorMsg && <AlertError message={errorMsg} />}
            </div>
        
            <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm" style={{ margin: 'initial'}}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="mb-5">
                        <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                        {t('change_password.new_password')}
                        </label>
                        <div className="mt-2">
                            <input
                                id="new_password"
                                name="new_password"
                                type="password"
                                required
                                value={new_password}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6"
                            />
                        </div>
                    </div>
        
                    <div className="mb-3">
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                            {t('change_password.confirm_password')}
                            </label>
                        </div>
                        <div className="mt-2">
                            <input
                                id="confirm_password"
                                name="confirm_password"
                                type="password"
                                value={confirm_password}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={ loading }
                            className="cursor-pointer flex w-full bg-black hover:bg-gray-800 justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2"
                        >
                            { loading ? <Spinner size='small' className="text-white"/> : "Submit" }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </>
}