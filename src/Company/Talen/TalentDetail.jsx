import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { talenApi } from "../../services/api";
import { HiOutlineLocationMarker, HiOutlineBriefcase, HiOutlinePhone, HiOutlineMail } from "react-icons/hi";
import { IoChevronBack, IoStarSharp } from "react-icons/io5";
import { MdClose } from "react-icons/md";
import { FiSend } from "react-icons/fi";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const TalentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [talent, setTalent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- MODAL STATES ---
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [notifyForm, setNotifyForm] = useState({
    title: "",
    message: "",
    type: "job",
  });

  useEffect(() => {
    const fetchTalentDetail = async () => {
      setIsLoading(true);
      try {
        const res = await talenApi.getById(id);
        const data = res.data?.data || res.data;
        setTalent(data);

        setNotifyForm((prev) => ({
          ...prev,
          title: `${data.occupation || ""} - New Opportunity!`,
        }));
      } catch (err) {
        console.error("Xatolik:", err);
      } finally {
        setTimeout(() => setIsLoading(false), 500);
      }
    };
    if (id) fetchTalentDetail();
  }, [id]);

  const handleSendAlert = async (e) => {
    e.preventDefault();
    const payload = {
      talent_id: Number(id),
      job_id: null,
      title: notifyForm.title || `Opportunity Alert`,
      message: notifyForm.message,
      type: notifyForm.type,
      is_read: false,
      sent_to_telegram: false,
    };

    try {
      const response = await axios.post(
        "https://workifybackend-production.up.railway.app/api/notifications",
        payload,
      );
      if (response.status === 200 || response.status === 201) {
        toast.success(`Xabarnoma ${talent.first_name}ga yuborildi! 🎉`);
        setIsNotifyModalOpen(false);
        setNotifyForm({ ...notifyForm, message: "" });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Xabarnoma yuborishda xatolik");
    }
  };

  const defaultAvatar = "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=";

  const DetailSkeleton = () => (
    <div className="max-w-[1100px] mx-auto px-6 mt-8 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-[28px] bg-gray-200" />
              <div className="flex-1 space-y-4">
                <div className="h-8 bg-gray-200 rounded-md w-1/2" />
                <div className="h-4 bg-gray-200 rounded-md w-1/3" />
                <div className="flex gap-4 mt-6">
                  <div className="h-10 bg-gray-100 rounded-lg w-24" />
                  <div className="h-10 bg-gray-100 rounded-lg w-24" />
                </div>
              </div>
            </div>
            <div className="mt-10 pt-8 border-t border-gray-50">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-9 w-20 bg-gray-100 rounded-full" />
                ))}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-5/6" />
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-10 bg-gray-200 rounded w-full" />
            <div className="h-14 bg-gray-200 rounded-2xl w-full" />
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFEFF] pb-20">
        <div className="max-w-[1100px] mx-auto px-6 pt-8">
          <div className="h-6 w-32 bg-gray-100 rounded" />
        </div>
        <DetailSkeleton />
      </div>
    );
  }

  if (!talent) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500 font-bold">Talent not found.</p></div>;

  const getSkillsArray = () => {
    const rawSkills = talent.skils || talent.skills;
    if (Array.isArray(rawSkills)) return rawSkills;
    try { return JSON.parse(rawSkills || "[]"); } catch { return []; }
  };

  const skillsArray = getSkillsArray();

  // --- CROSS-PLATFORM FORMATTING ---
  // Telefon raqamidan bo'sh joy va ortiqcha belgilarni olib tashlash (WhatsApp va Tel ilovalar uchun kerak)
  const cleanPhone = String(talent.phone || talent.phone_number || "").replace(/[^\d+]/g, "");

  return (
    <div className="min-h-screen bg-[#FDFEFF] font-gilroy text-[#1A1C21] pb-20">
      <Toaster position="top-center" />

      {/* --- NOTIFY MODAL --- */}
      {isNotifyModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 text-left">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl relative animate-in zoom-in duration-200">
            <button onClick={() => setIsNotifyModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
              <MdClose size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-[#343C44]">
              <FiSend className="text-blue-500" /> Send Alert
            </h2>
            <form onSubmit={handleSendAlert} className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Notification Title</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none"
                  value={notifyForm.title}
                  onChange={(e) => setNotifyForm({ ...notifyForm, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-bold text-gray-600">Message</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNotifyForm({ ...notifyForm, message: `Salom ${talent.first_name}! Bizning jamoada sizning tajribangizga mos keladigan ${talent.occupation} positioni mavjud. Siz bilan bog'lanishdan xursand bo'lardik.` })}
                      className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors border border-blue-100 font-bold"
                    >
                      + Use Template
                    </button>
                    <button type="button" onClick={() => setNotifyForm({ ...notifyForm, message: "" })} className="text-[10px] bg-gray-50 text-gray-600 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors border border-gray-100">Clear</button>
                  </div>
                </div>
                <textarea
                  rows="4"
                  className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none resize-none focus:border-blue-400 transition-all"
                  placeholder="Xabaringizni kiriting..."
                  value={notifyForm.message}
                  onChange={(e) => setNotifyForm({ ...notifyForm, message: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="w-full py-4 bg-[#1D3D54] text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all">
                Send for {talent.occupation} position
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- CONTACTS MODAL (Barcha tizimlar uchun moslandi) --- */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 text-left">
          <div className="bg-white rounded-[2.5rem] p-8 max-sm:p-6 max-w-sm w-full shadow-2xl relative animate-in zoom-in duration-200">
            <button onClick={() => setIsContactModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
              <MdClose size={24} />
            </button>
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <HiOutlinePhone className="text-4xl text-[#1D3D54]" />
              </div>
              <h2 className="text-2xl font-bold text-[#1A1C21]">Contacts</h2>
            </div>
            <div className="space-y-4">
              {/* Telefon tugmasi - Android/iOS/Win/Mac uchun */}
              <a 
                href={`tel:${cleanPhone}`}
                className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-100 transition-all active:scale-95 group"
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-green-50 transition-colors">
                  <HiOutlinePhone className="text-xl text-green-600" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs text-gray-400 font-bold uppercase">Phone</p>
                  <p className="text-sm font-bold text-[#1D3D54] truncate">{talent.phone || talent.phone_number || "Not available"}</p>
                </div>
              </a>

              {/* Email tugmasi - Gmail/Outlook/Mail app uchun */}
              <a 
                href={`mailto:${talent.email || ""}`}
                className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-100 transition-all active:scale-95 group"
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-blue-50 transition-colors">
                  <HiOutlineMail className="text-xl text-blue-600" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs text-gray-400 font-bold uppercase">Email</p>
                  <p className="text-sm font-bold text-[#1D3D54] truncate">{talent.email || "Send Email"}</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-[1100px] mx-auto px-6 pt-8 text-left">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-[#1D3D54] transition-all font-medium group">
          <IoChevronBack className="group-hover:-translate-x-1 transition-transform" /> Back to Search
        </button>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 mt-8 text-left">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <img src={talent.image || talent.profilePhoto || defaultAvatar} className="w-32 h-32 md:w-40 md:h-40 rounded-[28px] object-cover ring-8 ring-[#F9F5FF]" alt="Profile" />
                <div className="flex-1">
                  <h1 className="text-3xl font-bold tracking-tight">{talent.first_name} {talent.last_name}</h1>
                  <p className="text-[#1D3D54] font-bold text-sm mt-2 uppercase">{talent.occupation} • {talent.specialty}</p>
                  <div className="flex flex-wrap gap-5 mt-6 text-gray-500 text-sm font-medium">
                    <div className="flex items-center gap-2 bg-[#F9FAFB] px-3 py-1.5 rounded-lg"><HiOutlineLocationMarker /> {talent.city}, {talent.country}</div>
                    <div className="flex items-center gap-2 bg-[#F9FAFB] px-3 py-1.5 rounded-lg"><HiOutlineBriefcase /> {talent.workplace_type || "Remote"}</div>
                  </div>
                </div>
              </div>
              <div className="mt-10 pt-8 border-t border-gray-50">
                <h3 className="text-lg font-bold mb-4">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {skillsArray.length > 0 ? (
                    skillsArray.map((skill, i) => (
                      <span key={i} className="bg-[#F9F5FF] text-[#1D3D54] px-4 py-2 rounded-full text-sm font-semibold border border-[#F4EBFF]">
                        {typeof skill === "object" ? (skill.skill || skill.name) : skill}
                      </span>
                    ))
                  ) : <p className="text-gray-400 italic">No skills specified</p>}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold mb-4">About</h3>
              <p className="text-gray-500 leading-relaxed">{talent.bio || `${talent.first_name} is a highly skilled specialist.`}</p>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-md sticky top-8">
              <div className="mb-6">
                <span className="text-gray-400 text-sm font-medium">Expected Salary</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-bold text-[#101828]">${talent.minimum_salary?.toLocaleString()}</span>
                  <span className="text-gray-400 font-medium">/month</span>
                </div>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                  <span className="text-gray-500 text-sm">Employment</span>
                  <span className="font-semibold text-sm">{talent.work_type || "Contract"}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                  <span className="text-gray-500 text-sm">Rating</span>
                  <span className="font-semibold text-sm flex items-center gap-1"><IoStarSharp className="text-yellow-400" /> 4.8</span>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <button onClick={() => setIsNotifyModalOpen(true)} className="w-full py-4 border-2 border-[#1D3D54] text-[#1D3D54] font-bold rounded-xl text-sm hover:bg-[#1D3D54] hover:text-white transition-all">Send message</button>
                <button onClick={() => setIsContactModalOpen(true)} className="w-full bg-[#1D3D54] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#2a5675] transition-all shadow-md">Contacts</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentDetail;