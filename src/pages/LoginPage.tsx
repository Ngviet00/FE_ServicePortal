import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Spinner } from "@/components/ui/spinner";
import { getErrorMessage, ShowToast } from "@/lib";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "lucide-react";
import authApi from "@/api/authApi";
import "./css/Login.css"
import SelectedLanguage from "@/components/Header/components/SelectLanguage";

export default function LoginPage() {
    const { t } = useTranslation();
    const lang = useTranslation().i18n.language.split('-')[0]
    const [userCode, setUserCode] = useState("")
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
	const navigate = useNavigate()
    
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        if (showPassword) {
            setPassword(input);
        } else {
            const prev = password;
            if (input.length < prev.length) {
                setPassword(prev.slice(0, -1));
            } else {
                const newChar = input[input.length - 1];
                setPassword(prev + newChar);
            }
        }
    };

    const displayValue = showPassword ? password : "•".repeat(password.length);

    return (
        <div className="flex h-[100vh] min-h-screen items-start justify-center py-12 lg:px-8 bg-white p-4">
            <div className="w-full max-w-sm p-8 rounded-2xl border border-gray-100 relative">
                <img src="/logo.png" className="mx-auto w-32 mb-8" alt="Logo" />

                <div className="absolute top-3 right-0">
                    <SelectedLanguage/>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-xl font-bold">{lang == 'vi' ? 'Đăng nhập' : 'Login'}</h2>
                    </div>
                    <div className="mb-5">
                        <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                            {t('login_page.usercode')}
                        </label>
                        <div className="mt-2">
                            <input
                                placeholder="..."
                                autoFocus
                                id="usercode"
                                name="usercode"
                                type="text"
                                required
                                value={userCode}
                                onChange={(e) => setUserCode(e.target.value)}
                                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>
                    </div>
        
                    <div className="mb-3">
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                                {t('login_page.password')}
                            </label>
                        </div>
                        <div className="mt-2 relative">
                            <input
                                placeholder="..."
                                id="password"
                                name="password"
                                type="text"
                                value={displayValue}
                                onChange={handleChange}
                                required
                                autoComplete="off"
                                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-black"
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

                    <button disabled={loading} className="w-full bg-black text-white p-3 rounded-xl font-bold hover:bg-gray-800 transition-all cursor-pointer">
                        {loading ? <Spinner size="small" /> :  t('login_page.title')}
                    </button>

                    <div className="text-center">
                        <Link to="/register" className="sidebar-link underline cursor-pointer inline-block hover:bg-gray-300">
                            {t('register_page.title')}
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}