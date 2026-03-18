import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { companyApi } from "../../services/api";
import { MdEmail } from "react-icons/md";
import { IoMdLock, IoMdRefresh } from "react-icons/io";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
// Captcha komponentlari
import { loadCaptchaEnginge, LoadCanvasTemplate, validateCaptcha } from 'react-simple-captcha';

function SignIn() {
    const [formData, setFormData] = useState({ email: "", password: "", captcha: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({ email: false, password: false });
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showCaptcha, setShowCaptcha] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const redirectPath = queryParams.get("redirect");

    useEffect(() => {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (token && token !== "undefined" && token !== "null" && token.length > 10) {
            navigate(redirectPath || "/company/dashboard", { replace: true });
        }
    }, [navigate, redirectPath]);

    useEffect(() => {
        if (showCaptcha) {
            // Talent bilan bir xil: fon oqish, harflar qora (filtr ishlashi uchun)
            loadCaptchaEnginge(6, '#f8fafc', '#000000');
        }
    }, [showCaptcha]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        let val = value;
        if (id === "password") {
            val = value.replace(/\s/g, "").slice(0, 16);
        }
        setFormData((p) => ({ ...p, [id]: val }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = "Fill in the email field";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
        if (!formData.password) newErrors.password = "Fill in the password field";
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length > 0) {
            setErrors({ email: !!validationErrors.email, password: !!validationErrors.password });
            toast.error(validationErrors.email || validationErrors.password);
            return;
        }

        if (!showCaptcha) {
            setShowCaptcha(true);
            toast("Security check required", { icon: '🛡️' });
            return;
        }

        if (!formData.captcha) {
            toast.error("Please enter the captcha code");
            return;
        }

        if (validateCaptcha(formData.captcha) !== true) {
            toast.error("Invalid Captcha! Try again.");
            setFormData(p => ({ ...p, captcha: "" }));
            loadCaptchaEnginge(6, '#f8fafc', '#000000');
            return;
        }

        setLoading(true);
        try {
            const response = await companyApi.login({
                email: formData.email.trim().toLowerCase(),
                password: formData.password,
            });
            const { token, company } = response.data;
            if (token) {
                localStorage.setItem("token", token);
                localStorage.setItem("user_info", JSON.stringify(company));
                toast.success("Successfully logged in!");
                setTimeout(() => navigate(redirectPath || "/company/dashboard", { replace: true }), 1000);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Wrong email or password");
            if (showCaptcha) loadCaptchaEnginge(6, '#f8fafc', '#000000');
            setFormData(p => ({ ...p, captcha: "" }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Toaster position="top-right" />

            {/* RAINBOW VA QIYSAYTIRISH FILTRI */}
            <svg className="hidden">
                <filter id="company-rainbow-distort">
                    <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" />
                    <feColorMatrix type="hueRotate" values="0">
                        <animate attributeName="values" from="0" to="360" dur="5s" repeatCount="indefinite" />
                    </feColorMatrix>
                </filter>
            </svg>

            <div className="flex flex-col min-h-screen">
                <main className="flex-grow flex flex-col justify-center items-center bg-gray-100 py-10 px-4 font-['Mulish']">
                    <h2 className="text-3xl font-semibold text-center mb-6 text-gray-700">Login</h2>
                    <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-sm border border-gray-200">

                        {/* Email */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <div className="relative">
                                <MdEmail className={`absolute left-3 top-1/2 -translate-y-1/2 text-xl ${errors.email ? "text-red-500" : "text-gray-400"}`} />
                                <input
                                    type="email" id="email" placeholder="admin@company.com"
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 outline-none transition ${errors.email ? "border-red-500 focus:ring-red-300 bg-red-50" : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"}`}
                                    value={formData.email} onChange={handleChange} required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="mb-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <IoMdLock className={`absolute left-3 top-1/2 -translate-y-1/2 text-xl ${errors.password ? "text-red-500" : "text-gray-400"}`} />
                                <input
                                    type={showPassword ? "text" : "password"} id="password" placeholder="••••••••" maxLength={16}
                                    className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 outline-none transition ${errors.password ? "border-red-500 focus:ring-red-300 bg-red-50" : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"}`}
                                    value={formData.password} onChange={handleChange} required
                                />
                                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <FaRegEyeSlash size={20} /> : <FaRegEye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <label className="flex items-center text-sm text-gray-600 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 mr-2 accent-[#163D5C]" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                                Remember me
                            </label>
                            <Link to="/company/forgot-password-1" className="text-sm text-[#163D5C] hover:underline font-medium">Forgot password?</Link>
                        </div>

                        {/* CAPTCHA SECTION - TALENT BILAN BIR HIL DIZAYN */}
                        {showCaptcha && (
                            <div className="mb-6 p-4 bg-[#fcfcfc] rounded-2xl border-2 border-dashed border-gray-200 animate-fade-in relative">
                                <div className="flex justify-between items-center mb-3 px-1">
                                    <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Human Verification</span>
                                    <button type="button" onClick={() => loadCaptchaEnginge(6, '#f8fafc', '#000000')} className="text-[#163D5C] hover:rotate-180 transition-all duration-500">
                                        <IoMdRefresh size={20} />
                                    </button>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <div className="company-captcha-box bg-white rounded-xl h-16 flex items-center justify-center overflow-hidden border border-gray-100 shadow-inner">
                                        <div className="captcha-distort-wrapper">
                                            <LoadCanvasTemplate reloadText="" />
                                        </div>

                                        <style dangerouslySetInnerHTML={{
                                            __html: `
                                            .company-captcha-box { 
                                                background-image: linear-gradient(30deg, #f8fafc 12%, transparent 12.5%, transparent 87%, #f8fafc 87.5%, #f8fafc),
                                                linear-gradient(150deg, #f8fafc 12%, transparent 12.5%, transparent 87%, #f8fafc 87.5%, #f8fafc),
                                                linear-gradient(60deg, #f1f5f9 25%, transparent 25.5%, transparent 75%, #f1f5f9 75%, #f1f5f9);
                                                background-size: 20px 35px;
                                            }
                                            .captcha-distort-wrapper {
                                                filter: url(#company-rainbow-distort);
                                                transform: scale(1.2) rotate(-1deg) skewX(-8deg);
                                            }
                                            .captcha-distort-wrapper canvas { margin: 0 !important; }
                                            .captcha-distort-wrapper span, #reload_href { display: none !important; }
                                        `}} />
                                    </div>

                                    <input
                                        type="text" id="captcha" placeholder="Enter code"
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#163D5C] outline-none text-center font-bold text-2xl transition-all placeholder:text-gray-400 placeholder:text-sm placeholder:font-normal placeholder:tracking-normal"
                                        style={{ letterSpacing: formData.captcha ? '8px' : 'normal' }}
                                        value={formData.captcha} onChange={handleChange} autoComplete="off"
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit" disabled={loading}
                            className={`w-full py-3 rounded-xl text-white font-bold transition-all shadow-md ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#163D5C] hover:bg-[#0f2a40] active:scale-[0.98]"}`}
                        >
                            {loading ? "Processing..." : (showCaptcha ? "VERIFY & SIGN IN" : "Sign In")}
                        </button>

                        <p className="text-center text-sm text-gray-600 mt-6">
                            Don't have an account?{" "}
                            <Link to="/company/signup" className="text-[#163D5C] font-bold hover:underline">Register</Link>
                        </p>
                    </form>
                </main>
            </div>
        </>
    );
}

export default SignIn;