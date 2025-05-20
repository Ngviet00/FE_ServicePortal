import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Spinner } from "@/components/ui/spinner";
import { useNavigate } from "react-router-dom";
import { getErrorMessage, ShowToast } from "@/lib";
import { useTranslation } from "react-i18next";
import authApi from "@/api/authApi";

import "./css/Login.css"

export default function LoginPage() {
    const { t } = useTranslation();
    const [userCode, setUserCode] = useState("")
    const [password, setPassword] = useState("123456");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await authApi.login({ userCode, password });
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
        <div className="flex min-h-full flex-1 flex-col justify-start h-[100vh] py-12 lg:px-8 bg-white login-page">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <img
                    alt="VS Industry Viet Nam"
                    src="/logo.png"
                    className="mx-auto"
                    style={{ width: '150px'}}
                />
                <h2 className="mt-2 text-left text-2xl/9 font-bold tracking-tight text-gray-900">
                    {t('login_page.title')}
                </h2>
            </div>
        
            <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="mb-5">
                        <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                            {t('login_page.usercode')}
                        </label>
                        <div className="mt-2">
                            <input
                                id="usercode"
                                name="usercode"
                                type="text"
                                required
                                value={userCode}
                                onChange={(e) => setUserCode(e.target.value)}
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6"
                            />
                        </div>
                    </div>
        
                    <div className="mb-3">
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                                {t('login_page.password')}
                            </label>
                        </div>
                        <div className="mt-2">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                            { loading ? <Spinner size='small' className="text-white"/> : t('login_page.title') }
                        </button>
                    </div>
                </form>
        
                <p className="mt-3 text-center text-sm/6">
                    <Link to="/register" className="sidebar-link font-semibol text-black">
                        {t('register_page.title')}
                    </Link>
                </p>
            </div>
        </div>
    )
}