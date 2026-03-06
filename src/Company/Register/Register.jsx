import React, { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BiSolidCity } from "react-icons/bi";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaGlobe,
  FaChevronDown,
  FaLock,
  FaEye,
  FaUser,
  FaBuilding,
  FaEyeSlash,
} from "react-icons/fa";
import { PiFlagPennantFill } from "react-icons/pi";
import { COUNTRIES, UZBEK_REGIONS, INDUSTRIES } from "../../services/api";

const SignUpPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("company");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    company_name: "",
    phone: "",
    email: "",
    password: "",
    website: "",
    industry: "",
    country: "Uzbekistan",
    city: "",
  });

  const [countrySearch, setCountrySearch] = useState("");
  const [industrySearch, setIndustrySearch] = useState("");
  const [citySearch, setCitySearch] = useState("");

  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);

  const [dropUpCountry, setDropUpCountry] = useState(false);
  const [dropUpIndustry, setDropUpIndustry] = useState(false);
  const [dropUpCity, setDropUpCity] = useState(false);

  const countryRef = useRef(null);
  const cityRef = useRef(null);
  const industryRef = useRef(null);

  const checkSpace = (ref, setDropUp) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropUp(spaceBelow < 300);
    }
  };

  useEffect(() => {
    if (location.state?.allData) {
      setFormData(location.state.allData);
    }
  }, [location.state]);

  // Qidiruv mantiqi: Tarjima qilingan so'zlar bo'yicha qidiradi
  const filteredCountries = COUNTRIES.filter((c) =>
    c.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const filteredIndustries = INDUSTRIES.filter((i) =>
    t(`industries.${i.toLowerCase()}`).toLowerCase().includes(industrySearch.toLowerCase())
  );

  const filteredCities = UZBEK_REGIONS.filter((city) =>
    t(`cities.${city.toLowerCase().replace(/\s+/g, '_')}`).toLowerCase().includes(citySearch.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const digits = value.replace(/\D/g, "");
      if (digits.length === 0) {
        setFormData((prev) => ({ ...prev, [name]: "" }));
        return;
      }
      let mainDigits = digits.startsWith("998") ? digits.slice(3) : digits;
      mainDigits = mainDigits.substring(0, 9);
      let formatted = "+998 ";
      if (mainDigits.length > 0) formatted += "(" + mainDigits.substring(0, 2);
      if (mainDigits.length > 2) formatted += ") " + mainDigits.substring(2, 5);
      if (mainDigits.length > 5) formatted += "-" + mainDigits.substring(5, 7);
      if (mainDigits.length > 7) formatted += "-" + mainDigits.substring(7, 9);
      setFormData((prev) => ({ ...prev, [name]: formatted }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    const requiredFields = [
      { key: "company_name", label: t('signup.company_name') },
      { key: "phone", label: t('signup.phone') },
      { key: "email", label: t('signup.email') },
      { key: "password", label: t('signup.password') },
      { key: "industry", label: t('signup.industry') },
      { key: "country", label: t('signup.country') },
      { key: "city", label: t('signup.city') },
    ];

    for (let field of requiredFields) {
      if (!formData[field.key]?.toString().trim()) {
        return toast.error(`${field.label} ${t('signup.is_required')}`);
      }
    }

    if (formData.company_name.trim().length < 3) {
      return toast.error(t('signup.error_name_short'));
    }
    if (formData.password.length < 6) {
      return toast.error(t('signup.error_pass_short'));
    }

    navigate("/company/signup/telegram", { state: { allData: formData } });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryRef.current && !countryRef.current.contains(event.target)) setShowCountryDropdown(false);
      if (cityRef.current && !cityRef.current.contains(event.target)) setShowCityDropdown(false);
      if (industryRef.current && !industryRef.current.contains(event.target)) setShowIndustryDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const inputStyle = "w-full pl-10 sm:pl-12 pr-4 py-2.5 border rounded-lg focus:outline-none text-sm bg-white";
  const labelStyle = "block text-gray-700 font-medium mb-2 text-sm";
  const iconStyle = "absolute text-gray-400 left-4 top-1/2 -translate-y-1/2 text-sm z-10";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10 text-left">
      <ToastContainer />
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-6 sm:p-10">

        {/* Tab Selection */}
        <div className="relative bg-gray-100 rounded-[50px] border border-gray-200 grid grid-cols-2 p-1 mb-8 overflow-hidden">
          <div
            className="absolute top-1 bottom-1 left-1 w-[calc(50%-0.5rem)] bg-white rounded-[50px] shadow-md transition-all duration-300"
            style={{ transform: `translateX(${activeTab === "talent" ? "0%" : "100%"})` }}
          ></div>
          <Link to="/talent/registration/step-1" className={`flex items-center justify-center gap-2 py-3 relative z-10 font-medium ${activeTab === "talent" ? "text-[#163D5C]" : "text-gray-400"}`}>
            <FaUser /> <span>{t('login.role_talent')}</span>
          </Link>
          <button onClick={() => setActiveTab("company")} className={`flex items-center justify-center gap-2 py-3 relative z-10 font-medium ${activeTab === "company" ? "text-[#163D5C]" : "text-gray-400"}`}>
            <FaBuilding /> <span>{t('login.role_company')}</span>
          </button>
        </div>

        <form onSubmit={handleNext} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Company Name */}
            <div className="space-y-1">
              <label className={labelStyle}>{t('signup.company_name')} *</label>
              <div className="relative">
                <BiSolidCity className={iconStyle} />
                <input name="company_name" value={formData.company_name} onChange={handleChange} className={inputStyle} placeholder="TechCells" />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className={labelStyle}>{t('signup.phone')} *</label>
              <div className="relative">
                <FaPhoneAlt className={iconStyle} />
                <input name="phone" value={formData.phone} onChange={handleChange} className={inputStyle} placeholder="+998 (99) 123-45-67" />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className={labelStyle}>{t('signup.email')} *</label>
              <div className="relative">
                <FaEnvelope className={iconStyle} />
                <input name="email" type="email" value={formData.email} onChange={handleChange} className={inputStyle} placeholder="example@domain.com" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className={labelStyle}>{t('signup.password')} * <span className="text-xs text-gray-400 font-normal">({t('signup.pass_hint')})</span></label>
              <div className="relative">
                <FaLock className={iconStyle} />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className={inputStyle}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Website */}
            <div className="space-y-1">
              <label className={labelStyle}>{t('signup.website')} ({t('signup.optional')})</label>
              <div className="relative">
                <FaGlobe className={iconStyle} />
                <input name="website" value={formData.website} onChange={handleChange} className={inputStyle} placeholder="www.example.com" />
              </div>
            </div>

            {/* Country Dropdown */}
            <div className="relative space-y-1" ref={countryRef}>
              <label className={labelStyle}>{t('signup.country')} *</label>
              <div className="relative cursor-pointer" onClick={() => { checkSpace(countryRef, setDropUpCountry); setShowCountryDropdown(!showCountryDropdown); }}>
                <PiFlagPennantFill className={iconStyle} />
                <input readOnly value={formData.country} className={`${inputStyle} cursor-pointer`} placeholder={t('signup.select_country')} />
                <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
              </div>
              {showCountryDropdown && (
                <div className={`absolute z-50 w-full bg-white border rounded-xl shadow-xl max-h-52 overflow-y-auto ${dropUpCountry ? "bottom-full mb-1" : "mt-1"}`}>
                  <input className="w-full p-2 bg-gray-50 outline-none text-sm sticky top-0" placeholder={t('signup.search')} value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)} />
                  {filteredCountries.map(c => (
                    <div key={c} onClick={() => { setFormData({ ...formData, country: c, city: "" }); setShowCountryDropdown(false); }} className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm">{c}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Industry Dropdown - TARJIMA QILINGAN */}
            <div className="relative space-y-1" ref={industryRef}>
              <label className={labelStyle}>{t('signup.industry')} *</label>
              <div className="relative cursor-pointer" onClick={() => { checkSpace(industryRef, setDropUpIndustry); setShowIndustryDropdown(!showIndustryDropdown); }}>
                <BiSolidCity className={iconStyle} />
                <input
                  readOnly
                  value={formData.industry ? t(`industries.${formData.industry.toLowerCase()}`) : ""}
                  className={`${inputStyle} cursor-pointer`}
                  placeholder={t('signup.select_industry')}
                />
                <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
              </div>
              {showIndustryDropdown && (
                <div className={`absolute z-50 w-full bg-white border rounded-xl shadow-xl max-h-52 overflow-y-auto ${dropUpIndustry ? "bottom-full mb-1" : "mt-1"}`}>
                  <input className="w-full p-2 bg-gray-50 outline-none text-sm sticky top-0" placeholder={t('signup.search')} value={industrySearch} onChange={(e) => setIndustrySearch(e.target.value)} />
                  {filteredIndustries.map(i => (
                    <div key={i} onClick={() => { setFormData({ ...formData, industry: i }); setShowIndustryDropdown(false); }} className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm">
                      {t(`industries.${i.toLowerCase()}`)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* City Dropdown - TARJIMA QILINGAN */}
            <div className="relative space-y-1" ref={cityRef}>
              <label className={labelStyle}>{t('signup.city')} *</label>
              <div className="relative cursor-pointer" onClick={() => { checkSpace(cityRef, setDropUpCity); setShowCityDropdown(!showCityDropdown); }}>
                <BiSolidCity className={iconStyle} />
                <input
                  readOnly
                  value={formData.city ? t(`cities.${formData.city.toLowerCase().replace(/\s+/g, '_')}`) : ""}
                  className={`${inputStyle} cursor-pointer`}
                  placeholder={t('signup.select_city')}
                />
                <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
              </div>
              {showCityDropdown && (
                <div className={`absolute z-50 w-full bg-white border rounded-xl shadow-xl max-h-52 overflow-y-auto ${dropUpCity ? "bottom-full mb-1" : "mt-1"}`}>
                  <input className="w-full p-2 bg-gray-50 outline-none text-sm sticky top-0" placeholder={t('signup.search')} value={citySearch} onChange={(e) => setCitySearch(e.target.value)} />
                  {filteredCities.map((city) => {
                    // 1. Kelayotgan shaharni kichik harfga o'giramiz
                    // 2. Probellar bo'lsa, ularni pastki chiziq (_) ga almashtiramiz
                    const cityKey = city.toLowerCase().replace(/\s+/g, '_');

                    return (
                      <div
                        key={city}
                        onClick={() => {
                          setFormData({ ...formData, city: city });
                          setShowCityDropdown(false);
                        }}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                      >
                        {/* Agar tarjima topilmasa, shunchaki city'ni o'zini chiqaradi */}
                        {t(`cities.${cityKey}`, city)}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          <div className="pt-6 flex gap-4 justify-center">
            <button type="button" onClick={() => navigate("/")} className="px-12 py-3 border-2 border-[#163D5C] text-[#163D5C] rounded-lg font-medium text-sm w-full sm:w-auto">
              {t('signup.back')}
            </button>
            <button type="submit" className="px-12 py-3 bg-[#163D5C] text-white rounded-lg font-medium text-sm w-full sm:w-auto">
              {t('signup.next')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;