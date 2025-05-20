import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Spinner } from "@/components/ui/spinner";
import { useNavigate } from "react-router-dom";

import authApi from "@/api/authApi";
import "./css/Login.css"
import { getErrorMessage } from "@/lib";

export default function LoginPage() {
    const [user_code, setEmployeeCode] = useState("")
    const [password, setPassword] = useState("123456");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");
    
        try {
            const res = await authApi.login({ user_code, password });
            const { user, accessToken, refreshToken } = res.data;
            useAuthStore.getState().setUser(user, accessToken, refreshToken);
            navigate("/")
        }
        catch (err) {
            setErrorMsg(getErrorMessage(err))
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="flex min-h-full flex-1 flex-col justify-start h-[100vh] py-12 lg:px-8 bg-white login-page">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <img
                        alt="VS Industry Viet Nam"
                        src="/logo.png"
                        className="mx-auto"
                        style={{ width: '150px'}}
                    />
                    <h2 className="mt-2 text-left text-2xl/9 font-bold tracking-tight text-gray-900">
                        Đăng nhập
                    </h2>
                </div>
        
                <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="mb-5">
                            <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                                Mã nhân viên
                            </label>
                            <div className="mt-2">
                                <input
                                    id="employee_code"
                                    name="employee_code"
                                    type="text"
                                    required
                                    value={user_code}
                                    onChange={(e) => setEmployeeCode(e.target.value)}
                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6"
                                />
                            </div>
                        </div>
            
                        <div className="mb-3">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                                    Mật khẩu
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

                        {errorMsg && (
                            <div className="text-red-500 text-sm mb-3">{errorMsg}</div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={ loading }
                                className="cursor-pointer flex w-full bg-black hover:bg-gray-800 justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2"
                            >
                                { loading ? <Spinner size='small' className="text-white"/> : "Đăng nhập" }
                            </button>
                        </div>
                    </form>
            
                    <p className="mt-3 text-center text-sm/6">
                        <Link to="/register" className="sidebar-link font-semibol text-black">
                            Đăng ký
                        </Link>
                    </p>
                </div>
            </div>
        </>
      )
}