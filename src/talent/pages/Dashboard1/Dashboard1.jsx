import React, { useEffect, useState } from "react";
import { talentApi } from "../../services/api";
import { jwtDecode } from "jwt-decode";
import { useTheme } from "../../Context/ThemeContext.jsx";
import { useNavigate } from "react-router-dom";
import { FiPlus } from "react-icons/fi"; // FiPlus importini tekshiring

const Dashboard1 = () => {
  const { settings } = useTheme();
  const isDark = settings.darkMode;
  const navigate = useNavigate();

  const [percent, setPercent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || token === "undefined") {
          setLoading(false);
          return;
        }

        const decoded = jwtDecode(token);
        const res = await talentApi.getById(decoded.id);
        const data = res.data;

        // --- SKILL MODAL MANTIQI (QAYTA TEKSHIRILGAN) ---
        let skillsArray = [];

        // Agar skils string bo'lsa parse qilamiz, aks holda o'zini olamiz
        if (data.skils) {
          skillsArray = typeof data.skils === 'string' ? JSON.parse(data.skils) : data.skils;
        }

        const skillsCount = Array.isArray(skillsArray) ? skillsArray.length : 0;
        const hasSeenModal = sessionStorage.getItem("hasSeenSkillModal");

        // DEBUG: Konsolda tekshirish uchun (Keyin o'chirib tashlang)
        console.log("Skills soni:", skillsCount);
        console.log("Modal ko'rilganmi:", hasSeenModal);

        // Shart: 6 tadan kam bo'lsa VA hali ko'rsatilmagan bo'lsa
        if (skillsCount < 6 && hasSeenModal !== "true") {
          setIsModalOpen(true);
          sessionStorage.setItem("hasSeenSkillModal", "true");
        }
        // ------------------------------------------

        // Foizni hisoblash qismi
        const values = Object.values(data);
        const filtered = values.filter(v => typeof v !== "number" && v !== data.createdAt && v !== data.updatedAt);
        const filled = filtered.filter(v => {
          if (!v) return false;
          if (typeof v === "string" && (v === "[]" || v === "{}")) return false;
          if (Array.isArray(v)) return v.length > 0;
          return true;
        });

        setPercent(Math.round((filled.length / filtered.length) * 100));
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // CircleProgress va getProgressColor funksiyalaringiz o'zgarishsiz qoladi...
  const getProgressColor = (percentage) => {
    if (percentage <= 30) return "#f7481d";
    if (percentage <= 70) return "#FB959D";
    return "#5ABF89";
  };

  const CircleProgress = ({ percentage }) => {
    const [size, setSize] = useState(100);
    useEffect(() => {
      const handleResize = () => {
        if (window.innerWidth < 1024) setSize(120);
        else setSize(144);
      };
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative">
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke={isDark ? "#FFFFFF22" : "#00000011"} strokeWidth={strokeWidth} fill="none" />
          <circle cx={size / 2} cy={size / 2} r={radius} stroke={getProgressColor(percentage)} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 0.6s" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <p className="text-2xl font-bold">{percentage}%</p>
          <p className="text-[10px] uppercase">Complete</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <div className="pt-0 lg:pt-6">
        <div className={`w-full lg:max-w-[350px] h-[350px] rounded-xl flex flex-col items-center justify-center ${isDark ? "bg-slate-800" : "bg-gradient-to-b from-[#163D5C] to-[#6D89CF]"}`}>
          <h1 className="text-white text-xl font-bold">Profile completed</h1>
          <div className="py-8"><CircleProgress percentage={percent} /></div>
          <p className="text-white/90 text-sm text-center px-4">Complete your profile to increase <br /> your job chances</p>
        </div>
      </div>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className={`${isDark ? "bg-[#1E293B] text-white" : "bg-white text-[#1E293B]"} relative w-full max-w-[450px] rounded-[40px] p-10 shadow-2xl text-center scale-up-center`}>
            <div className={`mx-auto mb-8 flex items-center justify-center w-24 h-24 rounded-full ${isDark ? "bg-emerald-500/20" : "bg-emerald-50"}`}>
              <FiPlus className="text-[#4AD395] text-5xl" />
            </div>
            <h2 className="text-3xl font-extrabold mb-4 italic">Boost Your Profile!</h2>
            <p className={`text-lg mb-10 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              It looks like you only added a few skills during registration. To attract top companies, we recommend adding more of your expertise!
            </p>
            <div className="flex gap-4">
              <button onClick={() => setIsModalOpen(false)} className={`flex-1 py-4 rounded-2xl font-semibold ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>Maybe Later</button>
              <button onClick={() => { setIsModalOpen(false); navigate("/talent/profile", { state: { openModal: "skils" } }); }} className="flex-1 py-4 bg-[#4AD395] text-white rounded-2xl font-bold shadow-lg">Add Skills</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard1;