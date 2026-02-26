import React, { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { BiSolidCity } from "react-icons/bi";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaGlobe,
  FaChevronDown,
  FaSearch,
  FaLock,
  FaEye,
  FaUser,
  FaBuilding,
  FaEyeSlash,
} from "react-icons/fa";
import { PiFlagPennantFill } from "react-icons/pi";
import PasswordInput from "../common/PasswordInput";
import LoadingSpinner from "../common/LoadingSpinner";
import { COUNTRIES, UZBEK_REGIONS, INDUSTRIES } from "../../services/api";

const SignUpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState("company");
  const [activeTab, setActiveTab] = useState("company");
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    company_name: "",
    phone: "",
    email: "",
    password: "",
    website: "",
    industry: "",
    country: "",
    city: "",
  });

  const [passwordError, setPasswordError] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [industrySearch, setIndustrySearch] = useState("");
  const [citySearch, setCitySearch] = useState("");

  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);

  const countryRef = useRef(null);
  const cityRef = useRef(null);
  const industryRef = useRef(null);

  useEffect(() => {
    if (location.state?.allData) {
      setFormData(location.state.allData);
    }
  }, [location.state]);

  const filteredCountries = COUNTRIES.filter((c) =>
    c.toLowerCase().includes(countrySearch.toLowerCase()),
  );
  const filteredIndustries = INDUSTRIES.filter((i) =>
    i.toLowerCase().includes(industrySearch.toLowerCase()),
  );
  const filteredCities = UZBEK_REGIONS.filter((city) =>
    city.toLowerCase().includes(citySearch.toLowerCase()),
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
      // Parol yozilayotganda xatoni tozalash
      if (name === "password") setPasswordError("");
    }
  };

  const handleNext = (e) => {
    e.preventDefault();

    // 1. MAJBURIY MAYDONLARNI TEKSHIRISH (Website ixtiyoriy)
    const requiredFields = [
      { key: "company_name", label: "Company name" },
      { key: "phone", label: "Phone" },
      { key: "email", label: "Email" },
      { key: "password", label: "Password" },
      { key: "industry", label: "Industry" },
      { key: "country", label: "Country" },
      { key: "city", label: "City" },
    ];

    for (let field of requiredFields) {
      if (
        !formData[field.key] ||
        formData[field.key].toString().trim() === ""
      ) {
        return toast.error(`${field.label} to'ldirilishi shart!`);
      }
    }

// 2. PAROL VALIDATSIYASI
const pass = formData.password;

// 1. Umumiy uzunlikni tekshirish (kamida 6 ta belgi)
if (pass.length < 6) {
  const msg = "Parol uzunligi kamida 6 ta belgidan iborat bo'lishi kerak!";
  setPasswordError(msg);
  return toast.error(msg);
}

// 2. Kamida 1 ta katta harf borligini tekshirish
const hasUpperCase = /[A-Z]/.test(pass);
if (!hasUpperCase) {
  const msg = "Parolda kamida 1 ta katta harf bo'lishi shart!";
  setPasswordError(msg);
  return toast.error(msg);
}

// 3. Kamida 1 ta raqam borligini tekshirish
const hasDigit = /\d/.test(pass);
if (!hasDigit) {
  const msg = "Parolda kamida 1 ta raqam bo'lishi shart!";
  setPasswordError(msg);
  return toast.error(msg);
}

    // Hammasi joyida bo'lsa
    setPasswordError("");
    navigate("/company/signup/telegram", { state: { allData: formData } });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryRef.current && !countryRef.current.contains(event.target))
        setShowCountryDropdown(false);
      if (cityRef.current && !cityRef.current.contains(event.target))
        setShowCityDropdown(false);
      if (industryRef.current && !industryRef.current.contains(event.target))
        setShowIndustryDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInputErrorClass = (fieldName) => {
    return formErrors[fieldName]
      ? "border-red-500 focus:ring-red-300 bg-red-50"
      : "border-gray-200 focus:ring-[#163D5C]";
  };

  const inputStyle =
    "w-full pl-9 xs:pl-10 sm:pl-12 pr-3 xs:pr-4 py-2.5 xs:py-3 border rounded-lg focus:outline-none text-sm xs:text-base";
  const labelStyle =
    "block text-gray-700 font-medium mb-2 text-sm xs:text-base";
  const iconStyle =
    "absolute text-gray-700 left-3 xs:left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm xs:text-base z-10";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-3 xs:px-4 sm:px-6 py-6 sm:py-8 md:py-10 text-left">
      <ToastContainer />
      <div className="w-full max-w-4xl bg-white rounded-xl sm:rounded-2xl shadow-lg p-5 xs:p-6 sm:p-8 md:p-10 transition-all duration-500">
        <div className="relative bg-gray-100 rounded-[50px] border border-gray-200 grid grid-cols-2 p-1 mb-6 sm:mb-8 overflow-hidden">
          <div
            className="absolute top-1 bottom-1 left-1 w-[calc(50%-0.5rem)] bg-white rounded-[50px] shadow-md transition-all duration-300"
            style={{
              transform: `translateX(${activeTab === "talent" ? "0%" : "100%"})`,
            }}
          ></div>
          <Link
            to="/talent/registration/step-1"
            onClick={() => setActiveTab("talent")}
            className={`flex items-center justify-center gap-1 xs:gap-2 px-3 xs:px-4 sm:px-6 py-2 xs:py-3 relative z-10 font-medium text-sm xs:text-base ${
              activeTab === "talent" ? "text-[#163D5C]" : "text-gray-400"
            }`}
          >
            <FaUser />
            <span className="truncate ml-2">Talent</span>
          </Link>
          <button
            type="button"
            onClick={() => setActiveTab("company")}
            className={`flex items-center justify-center gap-1 xs:gap-2 px-3 xs:px-4 sm:px-6 py-2 xs:py-3 relative z-10 font-medium text-sm xs:text-base ${
              activeTab === "company" ? "text-[#163D5C]" : "text-gray-400"
            }`}
          >
            <FaBuilding />
            <span className="truncate ml-2">Company</span>
          </button>
        </div>

        <div className="transition-all duration-500">
          <form onSubmit={handleNext} className="space-y-5 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 sm:gap-y-6">
              <div className="space-y-1">
                <label className={labelStyle}>Company name *</label>
                <div className="relative">
                  <BiSolidCity className={iconStyle} />
                  <input
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    className={inputStyle}
                    placeholder="TechCells"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className={labelStyle}>Phone *</label>
                <div className="relative">
                  <FaPhoneAlt className={iconStyle} />
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={inputStyle}
                    placeholder="+998 (99) 123-45-67"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className={labelStyle}>Email *</label>
                <div className="relative">
                  <FaEnvelope className={iconStyle} />
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputStyle}
                    placeholder="example@domain.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm xs:text-base">
                  Password *{" "}
                  <span className="text-xs text-gray-400 font-normal">
                    (min 6, uppercase, number)
                  </span>
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 xs:left-4 top-1/2 -translate-y-1/2 text-[#163D5C] text-sm xs:text-base" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-9 xs:pl-10 sm:pl-12 pr-10 xs:pr-12 py-2.5 xs:py-3 border rounded-lg focus:outline-none text-sm xs:text-base ${getInputErrorClass(
                      "password",
                    )}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 xs:right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="text-sm xs:text-base" />
                    ) : (
                      <FaEye className="text-sm xs:text-base" />
                    )}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors.password}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className={labelStyle}>Website (Ixtiyoriy)</label>
                <div className="relative">
                  <FaGlobe className={iconStyle} />
                  <input
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className={inputStyle}
                    placeholder="www.TechCells.com"
                  />
                </div>
              </div>

              {/* Country */}
              <div className="relative space-y-1" ref={countryRef}>
                <label className={labelStyle}>Country *</label>
                <div
                  className="relative cursor-pointer"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                >
                  <PiFlagPennantFill className={iconStyle} />
                  <input
                    readOnly
                    value={formData.country}
                    className={`${inputStyle} cursor-pointer`}
                    placeholder="Select Country"
                  />
                  <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
                </div>
                {showCountryDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-52 overflow-y-auto">
                    <div className="sticky top-0 bg-white p-2 border-b border-gray-100">
                      <input
                        className="w-full px-4 py-1.5 bg-gray-50 rounded-lg outline-none text-sm"
                        placeholder="Search..."
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                      />
                    </div>
                    {filteredCountries.map((c) => (
                      <div
                        key={c}
                        onClick={() => {
                          setFormData((p) => ({ ...p, country: c, city: "" }));
                          setShowCountryDropdown(false);
                        }}
                        className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm"
                      >
                        {c}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Industry */}
              <div className="relative space-y-1" ref={industryRef}>
                <label className={labelStyle}>Industry *</label>
                <div
                  className="relative cursor-pointer"
                  onClick={() => setShowIndustryDropdown(!showIndustryDropdown)}
                >
                  <BiSolidCity className={iconStyle} />
                  <input
                    readOnly
                    value={formData.industry}
                    className={`${inputStyle} cursor-pointer`}
                    placeholder="Select Industry"
                  />
                </div>
                {showIndustryDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-52 overflow-y-auto">
                    <div className="sticky top-0 bg-white p-2 border-b border-gray-100">
                      <input
                        className="w-full px-4 py-1.5 bg-gray-50 rounded-lg outline-none text-sm"
                        placeholder="Search..."
                        value={industrySearch}
                        onChange={(e) => setIndustrySearch(e.target.value)}
                      />
                    </div>
                    {filteredIndustries.map((i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setFormData((p) => ({ ...p, industry: i }));
                          setShowIndustryDropdown(false);
                        }}
                        className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm"
                      >
                        {i}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* City */}
              <div className="relative space-y-1" ref={cityRef}>
                <label className={labelStyle}>City *</label>
                <div className="relative">
                  <BiSolidCity className={iconStyle} />
                  {formData.country === "Uzbekistan" ? (
                    <>
                      <input
                        readOnly
                        value={formData.city}
                        onClick={() => setShowCityDropdown(!showCityDropdown)}
                        className={`${inputStyle} cursor-pointer`}
                        placeholder="Select City"
                      />
                      {showCityDropdown && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-52 overflow-y-auto">
                          <div className="sticky top-0 bg-white p-2 border-b border-gray-100">
                            <input
                              className="w-full px-4 py-1.5 bg-gray-50 rounded-lg outline-none text-sm"
                              placeholder="Search city..."
                              value={citySearch}
                              onChange={(e) => setCitySearch(e.target.value)}
                            />
                          </div>
                          {filteredCities.map((city) => (
                            <div
                              key={city}
                              onClick={() => {
                                setFormData((p) => ({ ...p, city: city }));
                                setShowCityDropdown(false);
                              }}
                              className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm"
                            >
                              {city}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <input
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={inputStyle}
                      placeholder="Enter your city"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 sm:pt-6 flex gap-3 sm:gap-4 justify-center">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="px-6 xs:px-8 sm:px-10 md:px-12 py-2.5 xs:py-3 border-2 border-[#163D5C] text-[#163D5C] rounded-lg font-medium text-sm xs:text-base w-full xs:w-auto"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-6 xs:px-8 sm:px-10 md:px-12 py-2.5 xs:py-3 bg-[#163D5C] text-white rounded-lg font-medium text-sm xs:text-base w-full xs:w-auto"
              >
                Next
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;