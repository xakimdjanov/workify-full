import { useState } from "react";
import { Link } from "react-router-dom";
import { BiLogoInstagramAlt } from "react-icons/bi";
import { FaFacebook, FaYoutube, FaTelegram } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";

function Footer() {
    const [openSection, setOpenSection] = useState(null);

    const toggleSection = (section) => {
        setOpenSection(openSection === section ? null : section);
    };

    return (
        <footer className="w-full min-h-[497px] flex items-center justify-center bg-[#163D5C] py-8">
            <div className="w-full px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto">
                {/* TOP */}
                <div className="w-full h-auto md:h-[252px] flex flex-col md:flex-row justify-between gap-8 md:gap-6 mb-8 md:mb-0">
                    {/* BRAND */}
                    <div className="w-full md:w-[250px] h-auto flex flex-col justify-between md:justify-start md:gap-4 gap-4">
                        <div className="flex justify-between items-center md:items-start w-full">
                            <div>
                                <p className="text-white text-[28px] md:text-[35px] font-bold">workify</p>
                                <p className="text-white text-[16px] md:text-[20px] mt-1 md:mt-2">Job posting platform</p>
                            </div>
                            <Link to="/contacts">
                                <button className="md:hidden px-6 py-2 bg-white text-[#163D5C] font-bold rounded-lg text-[14px]">
                                    Contacts
                                </button>
                            </Link>
                        </div>

                        <Link to="/contacts">
                            <button className="hidden md:block w-[211px] h-[50px] bg-white text-[#163D5C] font-bold text-[20px] rounded-[8px] hover:bg-[#163D5C] hover:text-white hover:border hover:border-white transition-all duration-300">
                                Contacts
                            </button>
                        </Link>
                    </div>

                    {/* GENERAL */}
                    <div className="flex flex-col border-b border-white/10 md:border-none overflow-hidden">
                        <div
                            className="flex items-center justify-between py-4 md:py-0 md:mb-[20px] cursor-pointer md:cursor-default"
                            onClick={() => toggleSection('general')}
                        >
                            <p className="text-white font-semibold text-[18px] md:text-[20px]">General</p>
                            <IoIosArrowDown className={`text-white transition-transform duration-300 md:hidden ${openSection === 'general' ? 'rotate-180' : ''}`} />
                        </div>
                        <div className={`grid transition-all duration-300 ease-in-out md:block ${openSection === 'general' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 md:opacity-100'}`}>
                            <div className="flex flex-col gap-2 md:gap-[10px] pb-4 md:pb-0 overflow-hidden">
                                <Link to="/signup" className="text-white hover:text-slate-400 text-[14px] font-medium">Sign Up</Link>
                                <Link to="/contacts" className="text-white hover:text-slate-400 text-[14px] font-medium">Contacts</Link>
                                <Link to="/about" className="text-white hover:text-slate-400 text-[14px] font-medium">About</Link>
                                <Link to="/faq" className="text-white hover:text-slate-400 text-[14px] font-medium">FAQ</Link>
                                <Link to="/partners" className="text-white hover:text-slate-400 text-[14px] font-medium">Partners</Link>
                            </div>
                        </div>
                    </div>

                    {/* COMPANY */}
                    <div className="flex flex-col border-b border-white/10 md:border-none overflow-hidden">
                        <div
                            className="flex items-center justify-between py-4 md:py-0 md:mb-[20px] cursor-pointer md:cursor-default"
                            onClick={() => toggleSection('company')}
                        >
                            <p className="text-white font-semibold text-[18px] md:text-[20px]">Company</p>
                            <IoIosArrowDown className={`text-white transition-transform duration-300 md:hidden ${openSection === 'company' ? 'rotate-180' : ''}`} />
                        </div>
                        <div className={`grid transition-all duration-300 ease-in-out md:block ${openSection === 'company' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 md:opacity-100'}`}>
                            <div className="flex flex-col gap-2 md:gap-[10px] pb-4 md:pb-0 overflow-hidden">
                                <Link to="/post-job" className="text-white hover:text-slate-400 text-[14px] font-medium">Post a job</Link>
                                <Link to="/talents" className="text-white hover:text-slate-400 text-[14px] font-medium">Search talents</Link>
                                <Link to="/company-login" className="text-white hover:text-slate-400 text-[14px] font-medium">Company login</Link>
                                <Link to="/company-advice" className="text-white hover:text-slate-400 text-[14px] font-medium">Company advice</Link>
                            </div>
                        </div>
                    </div>

                    {/* TALENTS */}
                    <div className="flex flex-col border-b border-white/10 md:border-none overflow-hidden">
                        <div
                            className="flex items-center justify-between py-4 md:py-0 md:mb-[20px] cursor-pointer md:cursor-default"
                            onClick={() => toggleSection('talents')}
                        >
                            <p className="text-white font-semibold text-[18px] md:text-[20px]">Talents</p>
                            <IoIosArrowDown className={`text-white transition-transform duration-300 md:hidden ${openSection === 'talents' ? 'rotate-180' : ''}`} />
                        </div>
                        <div className={`grid transition-all duration-300 ease-in-out md:block ${openSection === 'talents' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 md:opacity-100'}`}>
                            <div className="flex flex-col gap-2 md:gap-[10px] pb-4 md:pb-0 overflow-hidden">
                                <Link to="/jobs" className="text-white hover:text-slate-400 text-[14px] font-medium">Search jobs</Link>
                                <Link to="/talent-login" className="text-white hover:text-slate-400 text-[14px] font-medium">Talent login</Link>
                                <Link to="/talent-advice" className="text-white hover:text-slate-400 text-[14px] font-medium">Talent advice</Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM */}
                <div className="w-full h-auto md:h-[105px] flex flex-col gap-8 md:gap-[15px] mt-8 md:mt-0">
                    <hr className="border-white/20" />
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
                        <div className="flex md:order-2 gap-6 md:gap-[20px] text-white text-[24px] md:text-[24px]">
                            <a href="https://instagram.com" target="_blank" className="hover:text-slate-300 transition-transform hover:-translate-y-1"><BiLogoInstagramAlt /></a>
                            <a href="https://facebook.com" target="_blank" className="hover:text-slate-300 transition-transform hover:-translate-y-1"><FaFacebook /></a>
                            <a href="https://youtube.com" target="_blank" className="hover:text-slate-300 transition-transform hover:-translate-y-1"><FaYoutube /></a>
                            <a href="https://t.me" target="_blank" className="hover:text-slate-300 transition-transform hover:-translate-y-1"><FaTelegram /></a>
                        </div>
                        <p className="md:order-1 text-[#E1E6F0] text-[16px] md:text-[20px] font-[300] text-center md:text-left">
                            All rights reserved {new Date().getFullYear()}
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;