import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaMapMarkerAlt,
  FaPhone,
  FaCalendarAlt,
  FaBuilding,
  FaEye,
  FaEyeSlash,
  FaChevronDown,
} from "react-icons/fa";
import Header from "../../../Company/Header/Header";
import Footer from "../../../Company/Footer/Footer";

export default function RegistrationForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("talent");
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDropUp, setIsDropUp] = useState(false);
  const dropdownRef = useRef(null);

  // Shaharlar ro'yxatini JSON'dan massiv sifatida olamiz
  const cities = t('registration.cities_list', { returnObjects: true });

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    gender: "male",
    date_of_birth: "",
    location: "",
    phone: "+998",
  });

  const checkSpace = () => {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setIsDropUp(spaceBelow < 250);
    }
  };

  useEffect(() => {
    const savedData = localStorage.getItem("step1_data");
    if (savedData) setFormData(JSON.parse(savedData));

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatPhoneNumber = (value) => {
    const phoneNumber = value.replace(/[^\d]/g, "");
    const size = phoneNumber.length;
    if (size <= 3) return `+${phoneNumber}`;
    if (size <= 5) return `+${phoneNumber.slice(0, 3)} (${phoneNumber.slice(3, 5)}`;
    if (size <= 8) return `+${phoneNumber.slice(0, 3)} (${phoneNumber.slice(3, 5)}) ${phoneNumber.slice(5, 8)}`;
    if (size <= 10) return `+${phoneNumber.slice(0, 3)} (${phoneNumber.slice(3, 5)}) ${phoneNumber.slice(5, 8)}-${phoneNumber.slice(8, 10)}`;
    return `+${phoneNumber.slice(0, 3)} (${phoneNumber.slice(3, 5)}) ${phoneNumber.slice(5, 8)}-${phoneNumber.slice(8, 10)}-${phoneNumber.slice(10, 12)}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "phone") {
      newValue = formatPhoneNumber(value.startsWith("+998") ? value : "+998");
    }
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.first_name.trim()) errors.first_name = t('registration.err_first_name_empty');
    if (!formData.last_name.trim()) errors.last_name = t('registration.err_last_name_empty');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = t('registration.err_email_invalid');
    if (formData.password.length < 6) errors.password = t('registration.err_password_weak');
    if (!formData.location) errors.location = t('registration.err_location_empty');
    if (!formData.date_of_birth) errors.date_of_birth = t('registration.err_dob_empty');

    const digits = formData.phone.replace(/[^\d]/g, "");
    if (digits.length < 12) errors.phone = t('registration.err_phone_invalid');

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      localStorage.setItem("step1_data", JSON.stringify(formData));
      localStorage.setItem("user_role", activeTab);
      toast.success(t('registration.success_msg'));
      navigate("/talent/registration/step-2");
    } catch (error) {
      toast.error(t('registration.err_save'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Toaster position="top-right" />
      <Header />
      <main className="flex-grow flex items-center justify-center px-3 xs:px-4 sm:px-6 py-6 sm:py-8 md:py-10">
        <div className="w-full max-w-4xl">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-5 xs:p-6 sm:p-8 md:p-10 lg:p-12">

            {/* Tab Switcher */}
            <div className="relative bg-gray-100 rounded-[50px] border border-gray-200 grid grid-cols-2 p-1 mb-6 sm:mb-8 overflow-hidden">
              <div
                className="absolute top-1 bottom-1 left-1 w-[calc(50%-0.5rem)] bg-white rounded-[50px] shadow-md transition-all duration-300"
                style={{ transform: `translateX(${activeTab === "company" ? "100%" : "0%"})` }}
              ></div>
              <button
                type="button"
                onClick={() => setActiveTab("talent")}
                className={`flex items-center justify-center gap-1 xs:gap-2 px-3 xs:px-4 sm:px-6 py-2 xs:py-3 relative z-10 font-medium text-sm xs:text-base ${activeTab === "talent" ? "text-[#163D5C]" : "text-gray-400"}`}
              >
                <FaUser /> <span className="truncate">{t('registration.tab_talent')}</span>
              </button>
              <Link
                to="/company/signup"
                className={`flex items-center justify-center gap-1 xs:gap-2 px-3 xs:px-4 sm:px-6 py-2 xs:py-3 relative z-10 font-medium text-sm xs:text-base ${activeTab === "company" ? "text-[#163D5C]" : "text-gray-400"}`}
              >
                <FaBuilding /> <span className="truncate">{t('registration.tab_company')}</span>
              </Link>
            </div>

            <form onSubmit={handleNext} className="space-y-5 sm:space-y-6 md:space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-5 sm:gap-6">

                {/* Ism va Familiya */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-sm xs:text-base">{t('registration.first_name_label')} *</label>
                  <div className="relative">
                    <FaUser className="absolute left-3 xs:left-4 top-1/2 -translate-y-1/2 text-[#163D5C]" />
                    <input
                      name="first_name"
                      type="text"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder={t('registration.first_name_placeholder')}
                      className={`w-full pl-9 xs:pl-10 sm:pl-12 pr-3 py-2.5 border rounded-lg focus:outline-none ${formErrors.first_name ? 'border-red-500' : 'border-gray-200'}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-sm xs:text-base">{t('registration.last_name_label')} *</label>
                  <div className="relative">
                    <FaUser className="absolute left-3 xs:left-4 top-1/2 -translate-y-1/2 text-[#163D5C]" />
                    <input
                      name="last_name"
                      type="text"
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder={t('registration.last_name_placeholder')}
                      className={`w-full pl-9 xs:pl-10 sm:pl-12 pr-3 py-2.5 border rounded-lg focus:outline-none ${formErrors.last_name ? 'border-red-500' : 'border-gray-200'}`}
                    />
                  </div>
                </div>

                {/* Email va Password */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-sm xs:text-base">{t('registration.email_label')} *</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 xs:left-4 top-1/2 -translate-y-1/2 text-[#163D5C]" />
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="example@mail.com"
                      className={`w-full pl-9 xs:pl-10 sm:pl-12 pr-3 py-2.5 border rounded-lg focus:outline-none ${formErrors.email ? 'border-red-500' : 'border-gray-200'}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-sm xs:text-base">{t('registration.password_label')} *</label>
                  <div className="relative">
                    <FaLock className="absolute left-3 xs:left-4 top-1/2 -translate-y-1/2 text-[#163D5C]" />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-9 xs:pl-10 sm:pl-12 pr-10 py-2.5 border rounded-lg focus:outline-none ${formErrors.password ? 'border-red-500' : 'border-gray-200'}`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Gender va Date */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-sm xs:text-base">{t('registration.gender_label')}</label>
                  <div className="relative bg-gray-100 rounded-[50px] border grid grid-cols-2 p-1 overflow-hidden">
                    <div className="absolute top-1 bottom-1 left-1 w-[calc(50%-0.5rem)] bg-white rounded-[50px] shadow-sm transition-all duration-300" style={{ transform: `translateX(${formData.gender === "female" ? "100%" : "0%"})` }}></div>
                    <button type="button" onClick={() => setFormData({ ...formData, gender: "male" })} className={`relative z-10 py-1.5 text-sm font-medium ${formData.gender === "male" ? "text-[#163D5C]" : "text-gray-400"}`}>{t('registration.gender_male')}</button>
                    <button type="button" onClick={() => setFormData({ ...formData, gender: "female" })} className={`relative z-10 py-1.5 text-sm font-medium ${formData.gender === "female" ? "text-[#163D5C]" : "text-gray-400"}`}>{t('registration.gender_female')}</button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-sm xs:text-base">{t('registration.dob_label')} *</label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-3 xs:left-4 top-1/2 -translate-y-1/2 text-[#163D5C]" />
                    <input
                      name="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      className={`w-full pl-9 xs:pl-10 sm:pl-12 pr-3 py-2.5 border rounded-lg focus:outline-none ${formErrors.date_of_birth ? 'border-red-500' : 'border-gray-200'}`}
                    />
                  </div>
                </div>

                {/* Location (Shaharlar bilan) */}
                <div className="relative" ref={dropdownRef}>
                  <label className="block text-gray-700 font-medium mb-2 text-sm xs:text-base">{t('registration.location_label')} *</label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 xs:left-4 top-1/2 -translate-y-1/2 text-[#163D5C]" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onFocus={() => { checkSpace(); setShowDropdown(true); }}
                      onChange={(e) => { setFormData({ ...formData, location: e.target.value }); setShowDropdown(true); }}
                      placeholder={t('registration.location_placeholder')}
                      className={`w-full pl-9 xs:pl-10 sm:pl-12 pr-10 py-2.5 border rounded-lg focus:outline-none ${formErrors.location ? 'border-red-500' : 'border-gray-200'}`}
                      autoComplete="off"
                    />
                    <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
                  </div>
                  {showDropdown && (
                    <div className={`absolute z-50 w-full bg-white border rounded-lg shadow-xl max-h-48 overflow-y-auto ${isDropUp ? "bottom-full mb-1" : "mt-1"}`}>
                      {Array.isArray(cities) && cities.filter((c) => c.toLowerCase().includes(formData.location.toLowerCase())).map((city) => (
                        <div
                          key={city}
                          onClick={() => { setFormData({ ...formData, location: city }); setShowDropdown(false); }}
                          className="p-3 hover:bg-gray-50 cursor-pointer text-sm border-b last:border-0"
                        >
                          {city}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-sm xs:text-base">{t('registration.phone_label')} *</label>
                  <div className="relative">
                    <FaPhone className="absolute left-3 xs:left-4 top-1/2 -translate-y-1/2 text-[#163D5C]" />
                    <input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full pl-9 xs:pl-10 sm:pl-12 pr-3 py-2.5 border rounded-lg focus:outline-none ${formErrors.phone ? 'border-red-500' : 'border-gray-200'}`}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex gap-4 justify-center">
                <button type="button" onClick={() => navigate("/")} className="px-10 py-3 border-2 border-[#163D5C] text-[#163D5C] rounded-lg font-medium hover:bg-gray-50 transition-all w-full xs:w-auto">
                  {t('registration.btn_back')}
                </button>
                <button type="submit" disabled={isSubmitting} className="px-10 py-3 bg-[#163D5C] text-white rounded-lg font-medium hover:bg-[#1a4d73] shadow-md w-full xs:w-auto">
                  {isSubmitting ? t('registration.btn_processing') : t('registration.btn_next')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}