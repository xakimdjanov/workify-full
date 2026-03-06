import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // 1. Hookni import qilamiz
import { MdDashboard } from "react-icons/md"; // Company icon
import { CiUser } from "react-icons/ci";       // Talent icon

const RoleSelection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(); // 2. t funksiyasini olamiz

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 font-sans">
      {/* 3. Sarlavha tarjimasi */}
      <h2 className="text-2xl font-bold text-gray-800 mb-8">
        {t('auth.select_role')}
      </h2>

      <div className="flex gap-6 flex-wrap justify-center">

        {/* Company (Employer) Card */}
        <div
          onClick={() => navigate('/company/signin')}
          className="group cursor-pointer w-64 p-6 bg-white border-2 border-[#163D5C] rounded-2xl shadow-lg transition-all hover:scale-105 hover:shadow-2xl"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#163D5C]/10 rounded-xl flex items-center justify-center">
              <MdDashboard className="w-8 h-8 text-[#163D5C]" />
            </div>
            {/* 4. "Company" so'zi tarjimasi */}
            <span className="text-xl font-semibold text-[#163D5C]">
              {t('auth.role_company')}
            </span>
          </div>
          <div className="mt-4 h-1.5 w-full bg-[#163D5C] rounded-full"></div>
        </div>

        {/* Talent Card */}
        <div
          onClick={() => navigate('/talent/signin')}
          className="group cursor-pointer w-64 p-6 bg-white border-2 border-transparent hover:border-[#163D5C]/30 rounded-2xl shadow-sm hover:shadow-md transition-all hover:scale-105"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#163D5C]/5 rounded-xl flex items-center justify-center">
              <CiUser className="w-8 h-8 text-[#163D5C]/70" />
            </div>
            {/* 5. "Talent" so'zi tarjimasi */}
            <span className="text-xl font-semibold text-[#163D5C]/70">
              {t('auth.role_talent')}
            </span>
          </div>
          <div className="mt-4 h-1.5 w-full bg-[#163D5C]/70 rounded-full"></div>
        </div>

      </div>
    </div>
  );
};

export default RoleSelection;