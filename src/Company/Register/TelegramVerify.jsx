import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { useTranslation } from "react-i18next"; // i18n qo'shildi
import img1 from "../../assets/img1.svg";
import { companyApi } from "../../services/api";
import LoadingSpinner from "../common/LoadingSpinner";

const TelegramVerify = () => {
  const { t } = useTranslation(); // t funksiyasi
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const { allData } = location.state || {};

  const handleTelegramClick = async () => {
    window.open("https://t.me/Workify1_bot", "_blank");

    if (allData) {
      try {
        setIsLoading(true);
        await companyApi.registerCompany(allData);
        toast.success(t('telegram.success_msg'));
      } catch (err) {
        toast.error(err.message || t('telegram.error_connection'));
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.warning(t('telegram.no_data'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <ToastContainer />
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center border border-gray-100">
        <p className="text-gray-500 text-sm mb-8 font-bold leading-relaxed">
          {t('telegram.description')}
        </p>

        <button
          onClick={handleTelegramClick}
          disabled={isLoading}
          className="w-[185px] h-[50px] bg-[#24A1DE] text-white rounded-2xl font-bold shadow-md hover:bg-[#208aba] transition-all mb-6 flex items-center justify-center mx-auto disabled:opacity-50"
        >
          {isLoading ? <LoadingSpinner size="sm" /> : t('telegram.click_btn')}
        </button>

        <img
          src={img1}
          alt="Illustration"
          className="w-full max-w-[280px] mx-auto mb-6 h-auto"
        />

        <div className="flex gap-4 pt-6 border-t border-gray-100">
          <button
            onClick={() => navigate("/company/signup", { state: { allData } })}
            className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-500 font-medium hover:bg-gray-50"
          >
            {t('telegram.back')}
          </button>
          <button
            onClick={() => navigate("/company/signup/verify", { state: { ...allData } })}
            className="flex-1 py-3 bg-[#163D5C] text-white rounded-xl font-bold hover:opacity-90"
          >
            {t('telegram.next')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TelegramVerify;