import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { companyApi } from "../../services/api";
import { IoMdMail } from "react-icons/io";
import { MdLock } from "react-icons/md";
import toast, { Toaster } from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function SignIn() {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({ email: false, password: false });
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        // Qat'iy tekshiruv: token borligi va u yaroqli ekanligi
        if (token && token !== "undefined" && token !== "null" && token.length > 10) {
            navigate("/company/dashboard", { replace: true });
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { id, value, type, checked } = e.target;
        if (id === "remember") {
            setRememberMe(checked);
        } else {
            setFormData((p) => ({ ...p, [id]: value }));
            setErrors((p) => ({ ...p, [id]: false }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email) {
            newErrors.email = "Email kiriting";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Email formati noto'g'ri";
        }
        if (!formData.password) {
            newErrors.password = "Parol kiriting";
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            toast.error("Iltimos, maydonlarni to'g'ri to'ldiring");
            return;
        }

        setLoading(true);
        try {
            // Login so'rovi
            const response = await companyApi.login({
                email: formData.email.trim().toLowerCase(),
                password: formData.password,
            });

            const { token, company, message } = response.data;

            if (token) {
                // DOIM localStorage ga saqlash
                const storage = localStorage;

                // Avval barcha eski qoldiqlarni tozalaymiz
                localStorage.removeItem("token");
                sessionStorage.removeItem("token");
                localStorage.removeItem("user_info");
                sessionStorage.removeItem("user_info");

                // Yangi ma'lumotlarni yozamiz
                storage.setItem("token", token);
                storage.setItem("user_info", JSON.stringify(company));

                toast.success(message || "Login muvaffaqiyatli!");

                // 1 soniyadan keyin dashboardga o'tamiz
                setTimeout(() => {
                    navigate("/company/dashboard", { replace: true });
                }, 1000);
            }
        } catch (error) {
            console.error("Login xatosi:", error.response);
            const errorMessage = error.response?.data?.message || "Email yoki parol noto'g'ri";
            toast.error(errorMessage);
            setErrors({ email: true, password: true });
        } finally {
            setLoading(false);
        }
    };
    
    <Toaster position="top-right" />

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F4F4F4] font-['Mulish'] p-4">

            <h1 className="text-[48px] md:text-[60px] font-bold text-[#404040] mb-8">Login</h1>

            <div className="w-full max-w-[500px] bg-white rounded-[30px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 md:p-12">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                    <div className="flex flex-col gap-2">
                        <label className="text-[18px] font-bold text-[#404040]" htmlFor="email">Email</label>
                        <div className={`flex items-center bg-[#F9FAFB] border rounded-xl px-4 h-[60px] transition-all ${errors.email ? 'border-red-500' : 'border-[#E5E7EB] focus-within:border-[#163D5C]'}`}>
                            <IoMdMail className="text-[#163D5C] text-2xl shrink-0" />
                            <input
                                className="w-full bg-transparent px-4 outline-none text-[#163D5C] placeholder:text-[#C7C7C7]"
                                type="email"
                                id="email"
                                placeholder="Example@gmail.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[18px] font-bold text-[#404040]" htmlFor="password">Password</label>
                        <div className={`flex items-center bg-[#F9FAFB] border rounded-xl px-4 h-[60px] transition-all ${errors.password ? 'border-red-500' : 'border-[#E5E7EB] focus-within:border-[#163D5C]'}`}>
                            <MdLock className="text-[#163D5C] text-2xl shrink-0" />
                            <input
                                className="w-full bg-transparent px-4 outline-none text-[#163D5C] placeholder:text-[#C7C7C7]"
                                type={showPassword ? "text" : "password"}
                                id="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-[#C7C7C7] hover:text-[#163D5C]"
                            >
                                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                            </button>
                        </div>
                        {errors.password && <span className="text-red-500 text-sm">{errors.password}</span>}
                    </div>

                    <div className="flex items-center justify-between text-[14px]">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                id="remember"
                                className="w-4 h-4 accent-[#163D5C]"
                                checked={rememberMe}
                                onChange={handleChange}
                            />
                            <span className="text-[#404040] font-medium">Remember me</span>
                        </label>
                        <Link to="/company/forgot-password-1" className="text-[#163D5C] font-semibold underline">
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-[56px] bg-[#163D5C] text-white rounded-xl font-bold text-[20px] shadow-lg hover:bg-opacity-90 transition-all active:scale-95 disabled:opacity-70"
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>

                    <p className="text-center text-[#343C44] text-[16px]">
                        Have no account yet?{" "}
                        <Link to="/company/signup" className="text-[#163D5C] font-bold hover:underline">
                            Register
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default SignIn;