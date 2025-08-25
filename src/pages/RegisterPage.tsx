import { Spinner } from "@/components/ui/spinner";
import { getErrorMessage, ShowToast } from "@/lib";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useTranslation } from "react-i18next";
import authApi from "@/api/authApi";
import "./css/Login.css"

export default function RegisterPage() {
    const { t } = useTranslation();
    const [userCode, setUserCode] = useState("")
    const lang = useTranslation().i18n.language.split('-')[0]
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (userCode == '') {
            ShowToast(lang == 'vi' ? 'Vui lòng nhập mã nhân viên' : 'Please enter user code', "error")
            return
        }

        setLoading(true);

        try {
            const res = await authApi.register({ userCode });
            const { user, accessToken, refreshToken } = res.data;
            useAuthStore.getState().setUser(user, accessToken, refreshToken);
            navigate("/")
        }
        catch (err) {
            ShowToast(getErrorMessage(err), "error")
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-full flex-1 flex-col justify-start py-12 lg:px-8 bg-white h-[100vh] register-page">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <img
                    alt="VS Industry Viet Nam"
                    src="/logo.png"
                    className="mx-auto"
                    style={{ width: '150px'}}
                />
                <h2 className="mt-2 text-left text-2xl/9 font-bold tracking-tight text-gray-900">
                    {t('register_page.title')}
                </h2>
            </div>
        
            <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="mb-5">
                        <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                            {t('register_page.usercode')}
                        </label>
                        <div className="mt-2">
                            <input
                                autoFocus
                                id="employee_code"
                                name="employee_code"
                                type="text"
                                value={userCode}
                                onChange={(e) => setUserCode(e.target.value)}
                                required
                                autoComplete="email"
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6"
                            />
                        </div>
                    </div>
        
                    <div>
                        <button
                            disabled={loading}
                            type="submit"
                            className="bg-black hover:cursor-pointer flex w-full justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            { loading ? <Spinner size='small' className="text-white"/> : t('register_page.title') }
                        </button>
                    </div>
                </form>
        
                <p className="mt-3 text-center text-sm/6">
                    <Link to="/login" className="sidebar-link underline">
                        {t('login_page.title')}
                    </Link>
                </p>
            </div>
        </div>
    )
}