import authApi from "@/api/authApi";
import { AlertError, AlertSuccess } from "@/components/Alert/AlertComponent";
import { Spinner } from "@/components/ui/spinner";
import axios from "axios";
import { useState } from "react";

export default function ChangePasswordPage() {

    const [new_password, setNewPassword] = useState("")
    const [confirm_password, setConfirmNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMsg("")
        setLoading(true);
        setErrorMsg("");
    
        try {
            const res = await authApi.changePassword({ new_password, confirm_password });
            console.log(res);
            if (res.status === 200) {
                setSuccessMsg("Đổi mật khẩu thành công!");
                setErrorMsg(""); // Clear lỗi nếu có
                setNewPassword("");
                setConfirmNewPassword("");
            } else {
                setErrorMsg("Có lỗi xảy ra, vui lòng thử lại.fdsfd");
            }
        }
        catch (err) {
            if (axios.isAxiosError(err)) {
                const data = err.response?.data;
        
                // Ưu tiên hiển thị lỗi validation nếu có
                if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
                    const firstFieldError = data.errors[0]?.errors?.[0];
                    setErrorMsg(firstFieldError || "Đổi mật khẩu thất bại");
                } 
                // Nếu là lỗi message thông thường (401, 403, 500...)
                else if (data?.message) {
                    setErrorMsg(data.message);
                } 
                // Fallback nếu không có thông tin gì cụ thể
                else {
                    setErrorMsg("Đổi mật khẩu thất bại");
                }
        
                setSuccessMsg(""); // Clear message success nếu có
            } else {
                console.error(err);
                setErrorMsg("Đổi mật khẩu thất bại");
                setSuccessMsg(""); // Clear message success nếu có
            }
        }
        finally {
            setLoading(false);
        }
    };

    return <>
        <div className="flex min-h-full flex-1 flex-col justify-start py-12 lg:px-8 bg-white">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            {successMsg && <AlertSuccess message={successMsg} />}
            {errorMsg && <AlertError message={errorMsg} />}
                <h2 className="mt-2 text-left text-2xl/9 font-bold tracking-tight text-gray-900">
                    Change Password
                </h2>
            </div>
        
            <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="mb-5">
                        <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                            New Password
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
                                Confirm New Password
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
                            { loading ? <Spinner size='small' className="text-white"/> : "Login" }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </>
}