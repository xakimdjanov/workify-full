import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Yangi import
import { CiUser } from "react-icons/ci";
import { IoWalletOutline } from "react-icons/io5";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import { IoMdArrowDropdown, IoMdLogOut, IoMdPerson } from "react-icons/io";
import { MdDashboard, MdLanguage } from "react-icons/md";
import { GoChevronDown } from "react-icons/go";

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState('Eng');
  const [showLang, setShowLang] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // Yangi state role uchun

  const navigate = useNavigate();

  // Foydalanuvchi ma'lumotlarini olish va token dekodlash
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const userInfo = localStorage.getItem("user_info") || sessionStorage.getItem("user_info");

    if (token) {
      try {
        // Tokenni dekod qilish
        const decodedToken = jwtDecode(token);
        console.log("Decoded token:", decodedToken);

        // Tokendan rolni aniqlash
        const role = decodedToken.role || decodedToken.role_id;
        setUserRole(role);

        // Agar userInfo mavjud bo'lsa, undan foydalanish
        if (userInfo) {
          const parsedUser = JSON.parse(userInfo);
          setUser({ ...parsedUser, role: role });
        } else {
          // Agar userInfo yo'q bo'lsa, faqat tokendan olingan ma'lumotlarni ishlatish
          setUser({
            id: decodedToken.id || decodedToken.user_id,
            email: decodedToken.email,
            role: role,
            // Kompaniya yoki talentga qarab turli xususiyatlar
            company_name: decodedToken.company_name || null,
            name: decodedToken.name || decodedToken.full_name || null
          });
        }
      } catch (error) {
        console.error("Token decode error:", error);
        // Agar tokenni dekod qilishda xatolik bo'lsa, logout qilish
        handleLogout();
      }
    } else if (userInfo) {
      // Agar token yo'q lekin userInfo bo'lsa, faqat userInfo dan foydalanish
      try {
        const parsedUser = JSON.parse(userInfo);
        setUser(parsedUser);
      } catch (e) {
        console.error("User info parse error", e);
      }
    }
  }, []);

  // Foydalanuvchi nomini olish funksiyasi
  const getUserDisplayName = () => {
    if (!user) return '';

    if (userRole === 'company' || userRole === 'employer') {
      return user.company_name || user.email || 'Company';
    } else if (userRole === 'talent' || userRole === 'job_seeker') {
      return user.name || user.full_name || user.email || 'Talent';
    }

    return user.email || 'User';
  };

  // Foydalanuvchi initsialini olish
  const getUserInitial = () => {
    const name = getUserDisplayName();
    return name.charAt(0).toUpperCase();
  };

  // Dashboard linkini roliga qarab o'zgartirish
  const getDashboardLink = () => {
    if (userRole === 'company' || userRole === 'employer') {
      return "/company/dashboard";
    } else if (userRole === 'talent' || userRole === 'job_seeker') {
      return "/talent/dashboard";
    }
    return "/dashboard";
  };

  // Profil linkini roliga qarab o'zgartirish
  const getProfileLink = () => {
    if (userRole === 'company' || userRole === 'employer') {
      return "/company/my-company";
    } else if (userRole === 'talent' || userRole === 'job_seeker') {
      return "/talent/my-profile";
    }
    return "/profile";
  };

  // Logout funksiyasi
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
    setUserRole(null);
    setIsOpen(false);
    setShowUserMenu(false);
    setIsLogoutModalOpen(false);
    window.location.href = "/roleSelection"; // Yo'naltirish
  };

  const handleLangChange = (val) => {
    setLang(val);
    setShowLang(false);
  };

  return (
    <>
      {/* HEADER */}
      <header className="w-full h-[70px] lg:h-[90px] flex items-center justify-center bg-white shadow-sm sticky top-0 z-50 px-4 md:px-0">
        <div className="w-full md:w-[90%] max-w-[1300px] flex items-center justify-between h-full relative">

          {/* LOGO */}
          <Link to="/" className="text-[#343C44] font-[600] text-[26px] lg:text-[34px] font-sans tracking-tight shrink-0">
            workify
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex items-center gap-x-8">
            <NavLink
              to="/talents"
              className={({ isActive }) => `flex items-center gap-2 font-semibold text-[18px] transition-all duration-300 hover:-translate-y-0.5 ${isActive ? "text-[#163D5C]" : "text-[#C2C2C2]"} hover:text-[#163D5C]`}
            >
              <CiUser className="text-[22px]" /> Talents
            </NavLink>
            <NavLink
              to="/jobs"
              className={({ isActive }) => `flex items-center gap-2 font-semibold text-[18px] transition-all duration-300 hover:-translate-y-0.5 ${isActive ? "text-[#163D5C]" : "text-[#C2C2C2]"} hover:text-[#163D5C]`}
            >
              <IoWalletOutline className="text-[22px]" /> Jobs
            </NavLink>
          </nav>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3 lg:gap-6">
            {user ? (
              <div className="flex items-center gap-4">

                {/* DASHBOARD BUTTON - Role ga qarab */}
                <Link to={getDashboardLink()} className="hidden sm:block">
                  <button className="flex items-center gap-2 px-5 h-[48px] bg-[#163D5C] text-white rounded-xl font-bold text-[15px] transition-all hover:shadow-lg active:scale-95">
                    <MdDashboard size={18} /> Dashboard
                  </button>
                </Link>

                {/* USER DROPDOWN */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 h-[48px] bg-gray-50 border border-gray-100 rounded-xl font-bold text-[#343C44] hover:bg-white transition-all shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#163D5C] text-white flex items-center justify-center text-[12px] font-bold">
                      {getUserInitial()}
                    </div>
                    <IoMdArrowDropdown className={`transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showUserMenu && (
                    <div className="absolute top-[55px] right-0 w-[220px] bg-white shadow-2xl rounded-2xl py-2 border border-gray-100 animate-in fade-in zoom-in duration-200 z-[60]">
                      <div className="px-4 py-3 border-b border-gray-50 mb-1">
                        <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">
                          {userRole === 'company' ? 'Company' : userRole === 'talent' ? 'Talent' : 'User'}
                        </p>
                        <p className="text-[14px] font-bold truncate text-[#163D5C]">{getUserDisplayName()}</p>
                      </div>
                      <Link
                        to={getProfileLink()}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-[#343C44] font-semibold transition-colors"
                      >
                        <IoMdPerson size={18} className="text-[#163D5C]" /> My Profile
                      </Link>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setIsLogoutModalOpen(true);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-500 font-semibold transition-colors"
                      >
                        <IoMdLogOut size={18} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 md:gap-3">
                <Link
                  to="/roleSelection"
                  className="hidden sm:flex px-6 py-2.5 text-[16px] items-center justify-center bg-white border-2 border-[#163D5C] rounded-xl font-bold text-[#163D5C] hover:bg-[#163D5C] hover:text-white transition-all"
                >
                  Sign in
                </Link>
                <Link
                  to="/company/signup"
                  className="flex px-6 py-2.5 text-[16px] items-center justify-center bg-[#163D5C] border-2 border-[#163D5C] rounded-xl font-bold text-white hover:bg-white hover:text-[#163D5C] transition-all shadow-md"
                >
                  Join Now
                </Link>
              </div>
            )}

            {/* LANGUAGE SELECTOR */}
            {/* <div className="hidden lg:block relative ml-2">
              <button
                onClick={() => setShowLang(!showLang)}
                className="flex items-center gap-1 font-bold text-[#343D5C] hover:text-[#163D5C] transition-colors"
              >
                {lang}
                <GoChevronDown className={`text-xl transition-transform duration-300 ${showLang ? 'rotate-180' : ''}`} />
              </button>
              <div className={`absolute top-[40px] right-0 w-[100px] bg-white shadow-xl rounded-xl py-2 border border-gray-100 transition-all duration-300 origin-top ${showLang ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
                {['Eng', 'Uzb', 'Rus'].map((item) => (
                  <button key={item} onClick={() => handleLangChange(item)} className="w-full text-left px-4 py-2 hover:bg-gray-50 font-semibold text-[14px]">
                    {item}
                  </button>
                ))}
              </div>
            </div> */}

            {/* MOBILE MENU BUTTON */}
            <button className="lg:hidden text-[32px] text-[#163D5C] hover:bg-gray-50 rounded-lg p-1" onClick={() => setIsOpen(true)}>
              <HiMenuAlt3 />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE SIDEBAR */}
      <div className={`fixed inset-0 z-[100] transition-all duration-300 ${isOpen ? "visible" : "invisible"}`}>
        <div className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setIsOpen(false)} />
        <div className={`absolute right-0 top-0 h-full w-[300px] bg-white shadow-2xl transition-transform duration-300 flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="p-6 flex items-center justify-between border-b">
            <span className="text-xl font-bold text-[#163D5C]">Menu</span>
            <button onClick={() => setIsOpen(false)} className="text-3xl text-gray-400 hover:text-red-500 transition-colors"><HiX /></button>
          </div>

          <div className="p-6 flex flex-col gap-6 flex-1 overflow-y-auto">
            {user && (
              <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-2xl">
                <div className="w-12 h-12 rounded-full bg-[#163D5C] text-white flex items-center justify-center text-lg font-bold shadow-sm">
                  {getUserInitial()}
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold truncate text-[#343C44]">{getUserDisplayName()}</p>
                  <p className="text-xs text-[#163D5C] font-semibold">
                    {userRole === 'company' ? 'Verified Company' : userRole === 'talent' ? 'Talent' : 'User'}
                  </p>
                </div>
              </div>
            )}

            <nav className="flex flex-col gap-2">
              <MobileNavLink to="/talents" icon={<CiUser size={24} />} label="Talents" onClick={() => setIsOpen(false)} />
              <MobileNavLink to="/jobs" icon={<IoWalletOutline size={24} />} label="Jobs" onClick={() => setIsOpen(false)} />
              {user && (
                <>
                  <MobileNavLink
                    to={getDashboardLink()}
                    icon={<MdDashboard size={24} />}
                    label="Dashboard"
                    onClick={() => setIsOpen(false)}
                  />
                  <MobileNavLink
                    to={getProfileLink()}
                    icon={<IoMdPerson size={24} />}
                    label="My Profile"
                    onClick={() => setIsOpen(false)}
                  />
                </>
              )}

              {/* LANGUAGE SELECTOR MOBILE */}
              {/* <div className="mt-4 border-t pt-4 px-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <MdLanguage size={16} /> Select Language
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {['Eng', 'Uzb', 'Rus'].map((item) => (
                    <button
                      key={item}
                      onClick={() => handleLangChange(item)}
                      className={`py-2 rounded-lg text-[14px] font-bold transition-all ${lang === item ? "bg-[#163D5C] text-white" : "bg-gray-100 text-[#343C44] hover:bg-gray-200"}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div> */}
            </nav>

            <div className="mt-auto flex flex-col gap-3">
              {!user ? (
                <>
                  <Link to="/roleSelection" onClick={() => setIsOpen(false)} className="w-full h-[54px] flex items-center justify-center border-2 border-[#163D5C] rounded-xl font-bold text-[#163D5C] active:scale-95 transition-all">
                    Sign in
                  </Link>
                  <Link to="/roleSelection" onClick={() => setIsOpen(false)} className="w-full h-[54px] flex items-center justify-center bg-[#163D5C] rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all">
                    Join Now
                  </Link>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsLogoutModalOpen(true);
                  }}
                  className="w-full h-[54px] flex items-center justify-center gap-2 bg-red-50 text-red-500 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all active:scale-95">
                  <IoMdLogOut size={22} /> Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* LOGOUT MODAL */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[200] px-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full animate-in fade-in zoom-in duration-200">
            <h3 className="text-[20px] font-bold text-[#163D5C] mb-3">Logout</h3>
            <p className="text-[#343C44] mb-8 text-[15px]">Do you really want to logout?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-3 rounded-2xl font-bold border-2 border-[#163D5C] bg-[#163D5C] text-white hover:bg-white hover:text-[#163D5C] transition-all"
              >
                No
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 rounded-2xl font-bold border-2 border-red-500 bg-red-500 text-white hover:bg-white hover:text-red-500 transition-all"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// MOBILE LINK HELPER
const MobileNavLink = ({ to, icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) => `flex items-center gap-4 text-lg font-bold p-4 rounded-xl transition-all ${isActive ? "bg-gray-100 text-[#163D5C]" : "text-gray-500 hover:bg-gray-50"}`}
  >
    {icon} {label}
  </NavLink>
);

export default Header;