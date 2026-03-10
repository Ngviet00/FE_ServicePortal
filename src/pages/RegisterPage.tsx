import { Spinner } from "@/components/ui/spinner";
import { getErrorMessage, ShowToast } from "@/lib";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import authApi from "@/api/authApi";
import "./css/Login.css"
import { useAuthStore } from "@/store/authStore";
import { Eye, EyeOff } from "lucide-react";
import SelectedLanguage from "@/components/Header/components/SelectLanguage";
import PasswordRequirementIndicator from "@/components/ComponentCustom/PasswordStrengthIndicator";
import { hasAlphanumeric, hasMinimumLength, hasSpecialCharacter } from "@/lib/password";

export default function RegisterPage() {
    const { t } = useTranslation();
    const lang = useTranslation().i18n.language.split('-')[0]
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [showPassword, setShowPassword] = useState(false);

    const TIME_INTERVAL_RESEND_CODE = 120;

    const [formData, setFormData] = useState({
        userCode: "",
        otp: "",
        password: "",
        confirmPassword: "",
        maskedEmail: "",
        fullEmail: "",
    });

    useEffect(() => {
        const saved = sessionStorage.getItem("reg_state");
        if (saved) {
            const { step: s, data } = JSON.parse(saved);
            setStep(s);
            setFormData(data);
        }

        const expiry = localStorage.getItem('otp_expiry');
        if (expiry) {
            const remaining = Math.floor((new Date(expiry).getTime() - new Date().getTime()) / 1000);
            if (remaining > 0) setCountdown(remaining);
        }
    }, []);

    useEffect(() => {
        sessionStorage.setItem("reg_state", JSON.stringify({ step, data: formData }));
    }, [step, formData]);

    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => {
            setCountdown(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    const startCooldown = () => {
        const expiryTime = new Date(new Date().getTime() + TIME_INTERVAL_RESEND_CODE * 1000);
        localStorage.setItem('otp_expiry', expiryTime.toISOString());
        setCountdown(TIME_INTERVAL_RESEND_CODE);
    };

    const handleStep1 = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await authApi.requestOtp(formData.userCode);
            setFormData({ ...formData, maskedEmail: res.data.data });
            setStep(2);
            startCooldown();
            ShowToast(lang == 'vi' ? 'Mã OTP đã được gửi!' : 'OTP code has been sent', "success");
        } catch (err) {
            ShowToast(getErrorMessage(err), "error");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (countdown > 0 || loading) return;
        setLoading(true);
        try {
            await authApi.requestOtp(formData.userCode);
            setFormData(prev => ({ ...prev, otp: "" }));
            startCooldown();
            ShowToast(lang == 'vi' ? 'Đã gửi lại mã mới!' : 'New code has been sent.', "success");
        } catch (err) {
            ShowToast(getErrorMessage(err), "error");
        } finally {
            setLoading(false);
        }
    };

    const handleStep2 =  async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (formData.otp.length < 6) {
            ShowToast(lang == 'vi' ? 'Vui lòng nhập đủ 6 số OTP' : 'Please enter all 6 OTP codes.', "error");
            setLoading(false);
            return;
        }
        try {
            const res = await authApi.verifyOtp({
                UserCode: formData.userCode,
                Code: formData.otp
            });
            setFormData({ ...formData, fullEmail: res.data.data });
            setStep(3);
            ShowToast(lang == 'vi' ? 'Xác thực mã OTP thành công!' : 'Verify OTP code success', "success");
        }
        catch (err) {
            ShowToast(getErrorMessage(err), "error");
        } finally {
            setLoading(false);
        }
    };

    const handleStep3 = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            ShowToast(lang == 'vi' ? 'Mật khẩu xác nhận không khớp' : 'The verification password does not match.', "error");
            return;
        }

        setLoading(true);
        try {

            const res = await authApi.register({
                userCode: formData.userCode,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                email: formData.fullEmail
            });

            const { user, accessToken, refreshToken } = res.data;
            useAuthStore.getState().setUser(user, accessToken, refreshToken);

            sessionStorage.removeItem("reg_state");
            localStorage.removeItem("otp_expiry"); 
            ShowToast('Success', "success");
            navigate("/")
        } catch (err) {
            ShowToast(getErrorMessage(err), "error");
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex h-[100vh] min-h-screen items-start justify-center py-12 lg:px-8 bg-white p-4">
            <div className="w-full max-w-sm p-8 rounded-2xl border border-gray-100 relative">
                <img src="/logo.png" className="mx-auto w-32 mb-8" alt="Logo" />

                <div className="absolute top-3 right-0">
                    <SelectedLanguage/>
                </div>
                
                <div className="flex gap-2 mb-8">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className={`h-1.5 flex-1 rounded-full ${step >= s ? 'bg-black' : 'bg-gray-200'}`} />
                    ))}
                </div>

                {step === 1 && (
                    <form onSubmit={handleStep1} className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-xl font-bold">{lang == 'vi' ? 'Đăng ký tài khoản' : 'Register new account'}</h2>
                            <p className="text-sm text-gray-500 mt-1">{lang == 'vi' ? 'Nhập mã nhân viên' : 'Input employee code'}</p>
                        </div>
                        <input 
                            autoFocus type="text" placeholder="10xxx"
                            className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-black"
                            value={formData.userCode}
                            onChange={(e) => setFormData({...formData, userCode: e.target.value.toUpperCase()})}
                            required
                        />
                        <button disabled={loading} className="w-full bg-black text-white p-3 rounded-xl font-bold hover:bg-gray-800 transition-all cursor-pointer">
                            {loading ? <Spinner size="small" /> : lang == 'vi' ? 'Tiếp tục' : 'Continue'}
                        </button>

                        <div className="text-center">
                            <Link to="/login" className="sidebar-link underline cursor-pointer inline-block hover:bg-gray-300">
                                {t('login_page.title')}
                            </Link>
                        </div>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleStep2} className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-xl font-bold">{lang == 'vi' ? 'Xác thực mã OTP' : 'Verify OTP'}</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {lang == 'vi' ? 'Mã đã gửi đến email' : 'The code has been sent to your email'}: <span className="font-semibold text-blue-600">{formData.maskedEmail}</span></p>
                        </div>
                        <input 
                            autoFocus type="text" maxLength={6} placeholder="● ● ● ● ● ●"
                            className="w-full p-3 border rounded-xl text-center text-2xl tracking-[0.5em] font-mono font-bold outline-none focus:ring-2 focus:ring-black"
                            value={formData.otp}
                            onChange={(e) => setFormData({...formData, otp: e.target.value})}
                        />
                        <button className="w-full bg-black text-white p-3 rounded-xl font-bold hover:bg-gray-800 transition-all hover:cursor-pointer">
                            {loading ? <Spinner size="small" /> : lang == 'vi' ? 'Tiếp tục' : 'Continue'}
                        </button>
                        
                        <div className="text-center">
                            <button 
                                type="button"
                                disabled={countdown > 0 || loading}
                                onClick={handleResendOtp}
                                className={`text-sm font-medium transition-colors ${countdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800 underline cursor-pointer'}`}
                            >
                                {countdown > 0 ? (lang == 'vi' ? `Gửi lại mã sau (${formatTime(countdown)})` : `Resend OTP after (${formatTime(countdown)})`) : (lang == 'vi' ? 'Gửi lại mã OTP': 'Resend OTP')}
                            </button>
                        </div>

                        <button type="button" onClick={() => { setStep(1); localStorage.removeItem('otp_expiry'); }} className="w-full text-sm text-gray-400 hover:text-black underline cursor-pointer">
                            {lang == 'vi' ? 'Quay lại' : 'Go back'}
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleStep3} className="space-y-5">
                        <div className="text-center">
                            <h2 className="text-xl font-bold">{lang === 'vi' ? 'Đặt mật khẩu mới' : 'Set your password'}</h2>
                            <p className="text-sm text-gray-500">{lang === 'vi' ? 'Thiết lập mật khẩu để đăng nhập lần sau' : 'Create a password for your next login'}</p>
                        </div>

                        <div className="relative">
                            <label htmlFor="" className="font-medium text-[15px]">Email</label>
                            <input 
                                autoFocus 
                                type='text' 
                                placeholder='Email'
                                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-black pr-12"
                                value={formData.fullEmail}
                                onChange={(e) => setFormData({...formData, fullEmail: e.target.value})}
                                required
                            />
                        </div>

                        <div className="relative">
                            <label htmlFor="" className="font-medium text-[15px]">{lang == 'vi' ? 'Mật khẩu mởi' : 'New password'}</label>
                            <input 
                                autoFocus 
                                tabIndex={1}
                                type={showPassword ? "text" : "password"} 
                                placeholder={lang === 'vi' ? 'Mật khẩu mới' : 'New password'}
                                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-black pr-12"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                required
                            />
                            <button
                                type="button"
                                className="absolute right-3 inset-y-0 flex items-center top-6 text-gray-400 hover:text-black cursor-pointer transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <div className="relative">
                            <label htmlFor="" className="font-medium text-[15px]">{lang === 'vi' ? 'Xác nhận mật khẩu' : 'Confirm password'}</label>
                            <input 
                                tabIndex={2}
                                type={showPassword ? "text" : "password"} 
                                placeholder={lang === 'vi' ? 'Xác nhận mật khẩu' : 'Confirm password'}
                                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-black pr-12"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                required
                            />
                        </div>

                        <button disabled={
                            loading ||
                            !hasMinimumLength(formData.password) || 
                            !hasAlphanumeric(formData.password) ||
                            !hasSpecialCharacter(formData.password)
                        } className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 transition-all cursor-pointer disabled:opacity-70 disabled:hover:cursor-not-allowed">
                            {loading ? <Spinner size="small" /> : lang === 'vi' ? 'Hoàn tất đăng ký' : 'Complete Registration'}
                        </button>
                        <span className="text-gray-500 text-sm italic mt-2 inline-block mb-0">{lang == 'vi' ? 'Ví dụ' : 'Ex'}: Quan8386# | Hoang8888@ | Duc6789@</span>
                        <PasswordRequirementIndicator password={formData.password} />
                    </form>
                )}
            </div>
        </div>
    );
}