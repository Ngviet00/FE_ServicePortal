import authApi from "@/api/authApi";
import { Spinner } from "@/components/ui/spinner";
import { getErrorMessage } from "@/lib";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
    const [user_code, setUserCode] = useState("")
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const setUser = useAuthStore((state) => state.setUser);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");
    
        try {
            const res = await authApi.register({ Usercode: user_code, Password: password });
            setUser(res.data.user);
            navigate("/")
        }
        catch (err) {
            setErrorMsg(getErrorMessage(err));
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="flex min-h-full flex-1 flex-col justify-start py-12 lg:px-8 bg-white h-[100vh]">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <img
                    alt="VS Industry Viet Nam"
                    src="/logo.png"
                    className="mx-auto"
                    style={{ width: '150px'}}
                />
                <h2 className="mt-2 text-left text-2xl/9 font-bold tracking-tight text-gray-900">
                    Đăng ký
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
                                value={user_code}
                                onChange={(e) => setUserCode(e.target.value)}
                                required
                                autoComplete="email"
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
        
                    { errorMsg && (<div className="text-red-500 text-sm mb-3">{errorMsg}</div>)}

                    <div>
                        <button
                            disabled={ loading }
                            type="submit"
                            className="bg-black hover:cursor-pointer flex w-full justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            { loading ? <Spinner size='small' className="text-white"/> : "Đăng ký" }
                        </button>
                    </div>
                </form>
        
                <p className="mt-3 text-center text-sm/6">
                    <Link to="/login" className="sidebar-link underline">
                        Đăng nhập
                    </Link>
                </p>
                </div>
            </div>
        </>
      )
}