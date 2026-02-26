import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jobApi, talentApi, applicationApi } from "../../services/api";
import { MdLocationOn, MdKeyboardArrowLeft, MdClose, MdCheck } from "react-icons/md";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { FiEdit2, FiTrash2, FiAlertCircle, FiDownload } from "react-icons/fi";
import { formatDistanceToNow } from 'date-fns';
import toast, { Toaster } from 'react-hot-toast';

const SkeletonLoader = () => (
  <div className="max-w-5xl mx-auto animate-pulse p-4">
    <div className="h-16 bg-gray-200 rounded-2xl mb-8"></div>
    <div className="h-64 bg-white rounded-[2.5rem] mb-10 shadow-sm border border-gray-100"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="h-44 bg-gray-200 rounded-[2rem]"></div>
      <div className="h-44 bg-gray-200 rounded-[2rem]"></div>
    </div>
  </div>
);

const JobDetailPageCompany = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [allTalents, setAllTalents] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeDetailTab, setActiveDetailTab] = useState('Matches');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        occupation: "", location: "", salary_min: "", salary_max: "",
        description: "", skils: "", specialty: "", job_type: "", workplace_type: ""
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [jobRes, talentRes, appRes] = await Promise.all([
                jobApi.getById(id),
                talentApi.getAll(),
                applicationApi.getAll()
            ]);

            const jobData = jobRes.data;
            setJob(jobData);
            setAllTalents(talentRes.data || []);

            const appsData = appRes.data?.data || appRes.data || [];
            // FILTER: Faqat shu jobga tegishli va REJECTED bo'lmaganlar
            const filteredApps = appsData.filter(app =>
                Number(app.job_id) === Number(id) && app.status !== 'rejected'
            );
            setApplications(filteredApps);

            setFormData({
                occupation: jobData.occupation || "",
                location: jobData.location || "",
                salary_min: jobData.salary_min || "",
                salary_max: jobData.salary_max || "",
                description: jobData.description || "",
                skils: Array.isArray(jobData.skils) ? jobData.skils.join(", ") : jobData.skils || "",
                specialty: jobData.specialty || jobData.occupation || "",
                job_type: jobData.job_type || "Full-time",
                workplace_type: jobData.workplace_type || "Remote"
            });
        } catch (error) {
            toast.error("Ma'lumotlarni yuklashda xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleStatusUpdate = async (appId, newStatus) => {
        try {
            await applicationApi.updateStatus(appId, { status: newStatus });
            toast.success(`Application ${newStatus}!`);
            fetchData();
        } catch (error) {
            toast.error("Statusni yangilashda xatolik");
        }
    };

    const handleSendInvitation = async (talentId) => {
        try {
            await applicationApi.create({
                job_id: id,
                talent_id: talentId,
                status: 'pending'
            });
            toast.success("Taklif muvaffaqiyatli yuborildi!");
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Taklif yuborishda xatolik");
        }
    };

    const handleDeleteJob = async () => {
        try {
            await jobApi.delete(id);
            toast.success("E'lon muvaffaqiyatli o'chirildi");
            navigate('/company/my-jobs');
        } catch (error) {
            toast.error("O'chirishda xatolik yuz berdi");
        } finally {
            setIsDeleteModalOpen(false);
        }
    };

    const handleUpdateJob = async (e) => {
        e.preventDefault();
        const updatePromise = jobApi.update(id, {
            ...formData,
            company_id: job.company_id,
            salary_min: Number(formData.salary_min),
            salary_max: Number(formData.salary_max)
        });

        toast.promise(updatePromise, {
            loading: 'Yangilanmoqda...',
            success: 'Ish muvaffaqiyatli yangilandi! 🎉',
            error: (err) => `Xatolik: ${err.response?.data?.message || 'Saqlab bo‘lmadi'}`,
        });

        try {
            await updatePromise;
            setIsEditModalOpen(false);
            fetchData();
        } catch (error) { console.error(error); }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const getInitials = (firstName, lastName) => {
        const f = firstName ? firstName.charAt(0).toUpperCase() : '';
        const l = lastName ? lastName.charAt(0).toUpperCase() : '';
        return (f + l) || '?';
    };

    const parseTalentSkills = (skillsStr) => {
        try {
            if (!skillsStr) return [];
            const parsed = typeof skillsStr === 'string' ? JSON.parse(skillsStr) : skillsStr;
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) { return []; }
    };

    const getJobSkills = () => {
        if (!job?.skils) return [];
        if (typeof job.skils === 'string') {
            return job.skils.split(',').map(s => s.trim()).filter(s => s !== "");
        }
        return Array.isArray(job.skils) ? job.skils : [];
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency', currency: 'USD', minimumFractionDigits: 0,
        }).format(price || 0);
    };

    const matchedTalents = allTalents.filter(talent => {
        if (!job || !job.skils) return false;
        const isAlreadyApplied = applications.some(app => Number(app.talent_id) === Number(talent.id));
        if (isAlreadyApplied) return false;

        const jobSkillsArr = getJobSkills().map(s => s.toLowerCase());
        const talentSkills = parseTalentSkills(talent.skils);
        return talentSkills.some(t => jobSkillsArr.includes(t.skill?.toLowerCase()));
    });

    if (loading) return <div className="w-full min-h-screen bg-[#F8F9FA] p-8"><SkeletonLoader /></div>;
    if (!job) return <div className="p-10 text-center text-red-500">Job not found</div>;

    return (
        <div className="w-full min-h-screen bg-[#F8F9FA] p-3 sm:p-6 md:p-8 text-left font-sans">
            <Toaster position="top-center" />

            <div className="max-w-5xl mx-auto relative">
                {/* --- DELETE MODAL --- */}
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FiAlertCircle size={40} className="text-red-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Ishonchingiz komilmi?</h2>
                                <p className="text-gray-500 mb-6">Bu e'lonni butunlay o'chirib tashlaysizmi?</p>
                                <div className="flex gap-3">
                                    <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-2xl">Bekor qilish</button>
                                    <button onClick={handleDeleteJob} className="flex-1 py-3.5 bg-red-500 text-white font-bold rounded-2xl">O'chirish</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-[#343C44]">
                  {job.occupation}
                </h2>
                <p className="text-xl text-gray-500 font-semibold">
                  {job.company?.company_name}
                </p>
              </div>
            </div>
            <div className="md:text-right">
              <p className="text-2xl font-bold text-gray-700">
                {formatPrice(job.salary_min)} - {formatPrice(job.salary_max)}
              </p>
              <p className="text-gray-400 mt-1 flex items-center md:justify-end gap-1 font-medium">
                <MdLocationOn /> {job.location}
              </p>
            </div>
          </div>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            {job.description}
          </p>
          <div className="flex flex-wrap gap-2 pt-6 border-t border-gray-50">
            {getJobSkills().map((s, i) => (
              <span
                key={i}
                className="px-5 py-2 bg-gray-100 rounded-xl font-semibold text-gray-600 border"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

                {/* --- EDIT MODAL --- */}
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto text-left">
                            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:bg-gray-100 rounded-full"><MdClose size={28} /></button>
                            <h2 className="text-2xl font-bold text-[#343C44] mb-8">Edit Job Position</h2>
                            <form onSubmit={handleUpdateJob} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-[#343C44]">Occupation</label>
                                    <input name="occupation" value={formData.occupation} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#F8F9FA] border border-gray-100 rounded-xl" required />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-[#343C44]">Location</label>
                                    <input name="location" value={formData.location} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#F8F9FA] border border-gray-100 rounded-xl" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-[#343C44]">Salary Min ($)</label>
                                    <input name="salary_min" type="number" value={formData.salary_min} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#F8F9FA] border border-gray-100 rounded-xl" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-[#343C44]">Salary Max ($)</label>
                                    <input name="salary_max" type="number" value={formData.salary_max} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#F8F9FA] border border-gray-100 rounded-xl" />
                                </div>
                                <div className="flex flex-col gap-2 md:col-span-2">
                                    <label className="text-sm font-bold text-[#343C44]">Skills (comma separated)</label>
                                    <input name="skils" value={formData.skils} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#F8F9FA] border border-gray-100 rounded-xl" />
                                </div>
                                <div className="flex flex-col gap-2 md:col-span-2">
                                    <label className="text-sm font-bold text-[#343C44]">Description</label>
                                    <textarea name="description" rows="4" value={formData.description} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#F8F9FA] border border-gray-100 rounded-xl resize-none" />
                                </div>
                                <button type="submit" className="md:col-span-2 w-full mt-4 py-4 bg-[#5CB85C] text-white font-bold rounded-2xl">Update Job Details</button>
                            </form>
                        </div>
                    </div>
                )}

                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 mt-2 md:mt-0 w-full">
                    <div className="bg-white px-6 sm:px-8 py-4 rounded-2xl shadow-sm border border-gray-100 flex-1 w-full text-center md:text-left">
                        <h1 className="text-xl sm:text-2xl font-bold text-[#4B5563]">Job Details</h1>
                    </div>
                    <button onClick={() => navigate('/company/post-job')} className="bg-[#5CB85C] hover:bg-[#4cae4c] text-white w-full md:w-auto px-10 py-4 rounded-2xl font-bold">Post a Job</button>
                </div>

                {/* Job Header Card */}
                <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 shadow-sm border border-gray-100 mb-10 relative">
                    <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-8 mb-8 lg:pr-12">
                        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                            <div className="w-24 h-24 shrink-0 rounded-full bg-[#00A7AC] flex items-center justify-center text-white text-4xl font-bold overflow-hidden border-4 border-gray-50 shadow-sm">
                                {job.company?.profileimg_url ? <img src={job.company.profileimg_url} className="w-full h-full object-cover" alt="logo" /> : (job.occupation?.charAt(0) || "J")}
                            </div>
                            <div className="max-w-md">
                                <h2 className="text-2xl sm:text-3xl font-bold text-[#343C44] leading-tight">{job.occupation}</h2>
                                <p className="text-[#8E8E8E] font-[600] text-[22px] mt-1">{job.company?.company_name || "Company"}</p>
                                <div className="text-[#a7a6a6] flex items-center justify-center md:justify-start gap-1 mt-2 text-base sm:text-lg font-medium">
                                    <MdLocationOn className="shrink-0" />
                                    <span>{job.location} ({job.workplace_type || "Remote"})</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-center lg:text-right w-full lg:w-auto border-t lg:border-none pt-6 lg:pt-0 mt-2 lg:mt-0">
                            <p className="text-[#8E8E8E] text-base sm:text-[18px] font-[600] mb-1">
                                {job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true }) : 'Recently'}
                            </p>
                            <p className="text-2xl sm:text-[28px] font-bold text-[#4B5563] whitespace-nowrap">
                                ${job.salary_min?.toLocaleString()} {job.salary_max ? `- $${job.salary_max.toLocaleString()}` : ""}
                            </p>
                        </div>
                    </div>
                    <p className="text-[#343C44] text-base sm:text-lg leading-relaxed mb-8 text-center md:text-left">{job.description}</p>
                    <div className="pt-6 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="w-full">
                            <h4 className="text-[#343C44] font-bold mb-4 uppercase text-xs sm:text-sm tracking-widest text-center md:text-left">Required skills</h4>
                            <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3">
                                {getJobSkills().map((skill, index) => (
                                    <span key={index} className="px-4 sm:px-5 py-1.5 sm:py-2 bg-[#F3F4F6] text-[#4B5563] rounded-xl font-semibold border border-gray-100 text-sm sm:text-base">{skill}</span>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <button onClick={() => setIsEditModalOpen(true)} className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-[#73dd73] hover:text-white border border-gray-100"><FiEdit2 size={22} /></button>
                            <button onClick={() => setIsDeleteModalOpen(true)} className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white border border-red-100"><FiTrash2 size={22} /></button>
                        </div>
                    </div>
                  </div>
                </div>

                <button onClick={() => navigate('/company/my-jobs')} className="group flex items-center justify-center gap-3 text-[#1D3D54] font-bold mb-10 w-full sm:w-[240px] h-[60px] border-2 border-[#1D3D54] rounded-2xl bg-white shadow-sm transition-all duration-300 hover:bg-[#1D3D54] hover:text-white">
                    <MdKeyboardArrowLeft size={28} className="transition-transform duration-300 group-hover:-translate-x-2" />
                    <span className="text-[18px]">Back to My jobs</span>
                </button>

                <div className="flex bg-[#E9E9E9] p-1.5 rounded-[1.5rem] w-full relative mb-10 overflow-hidden">
                    <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-[1.2rem] shadow-sm transition-all duration-300 ${activeDetailTab === 'Matches' ? 'left-1.5' : 'left-[calc(50%+3px)]'}`} />
                    <button onClick={() => setActiveDetailTab('Matches')} className={`flex-1 py-3.5 z-10 font-bold text-xs sm:text-sm transition-colors ${activeDetailTab === 'Matches' ? 'text-[#343C44]' : 'text-[#8E8E8E]'}`}>All Matches</button>
                    <button onClick={() => setActiveDetailTab('Invitations')} className={`flex-1 py-3.5 z-10 font-bold text-xs sm:text-sm transition-colors ${activeDetailTab === 'Invitations' ? 'text-[#343C44]' : 'text-[#8E8E8E]'}`}>Invitations sent</button>
                </div>

                <div className="pb-20">
                    <div className="mb-6 flex items-baseline justify-center md:justify-start gap-2">
                        <span className="text-xl sm:text-2xl font-bold text-[#343C44]">
                            {activeDetailTab === 'Matches' ? matchedTalents.length : applications.length}
                        </span>
                        <span className="text-xl sm:text-2xl font-bold text-[#343C44]">candidates</span>
                    </div>

                    <div className="grid grid-cols-1 min-[1350px]:grid-cols-2 gap-6 sm:gap-8 w-full">
                        {(activeDetailTab === 'Matches' ? matchedTalents.map(t => ({ talent: t, isMatch: true })) : applications).map((item, idx) => {
                            const talent = item.talent;
                            const appId = item.id;
                            const status = item.status || 'pending';
                            const resumeUrl = item.resume_url || talent?.resume; // API'dan kelayotgan link

                            return talent && (
                                <div key={talent.id || idx} className="bg-white border border-gray-100 rounded-[2rem] shadow-sm p-6 sm:p-7 flex flex-col justify-between hover:shadow-md transition-all min-h-[400px]">
                                    <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-5 mb-5 w-full">
                                        <div className="flex flex-col lg:flex-row items-center gap-4 flex-1 w-full min-w-0">
                                            <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-full bg-[#F3F4F6] flex items-center justify-center overflow-hidden border border-gray-100">
                                                {talent.image ? <img src={talent.image} className="w-full h-full object-cover" alt="" /> : <span className="text-2xl font-bold text-gray-400">{getInitials(talent.first_name, talent.last_name)}</span>}
                                            </div>
                                            <div className="w-full min-w-0 text-center lg:text-left">
                                                <h2 className="text-[20px] sm:text-[24px] font-bold text-[#3a3a3a] leading-tight mb-1">{talent.specialty || "Specialist"}</h2>
                                                <p className="text-gray-500 text-[16px] sm:text-[18px] font-medium">{talent.first_name} {talent.last_name}</p>
                                            </div>
                                        </div>
                                        <div className="shrink-0 w-full lg:w-auto border-t lg:border-none pt-4 lg:pt-0 text-center lg:text-right">
                                            <div className="text-[22px] sm:text-[26px] font-bold text-[#1D3D54] leading-tight">{formatPrice(talent.minimum_salary)}</div>
                                            <div className="flex items-center justify-center lg:justify-end gap-1 text-gray-400 text-[13px] font-bold uppercase mt-2">
                                                <HiOutlineLocationMarker size={16} className="text-[#00A7AC]" />
                                                <span className="whitespace-nowrap">{talent.city || "UZB"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 my-6">
                                        <h4 className="text-[12px] text-gray-400 font-bold uppercase tracking-wider mb-3 text-center lg:text-left">Candidate Skills:</h4>
                                        <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                                            {parseTalentSkills(talent.skils).slice(0, 6).map((s, i) => (
                                                <span key={i} className="px-4 py-1.5 bg-[#f8fafc] text-[#64748b] text-[13px] font-semibold rounded-xl border border-gray-100">{s.skill}</span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* --- BUTTONS SECTION (CENTERED) --- */}
                                    <div className="flex flex-col sm:flex-row gap-4 mt-auto items-center justify-center w-full">
                                        {/* Har doim ko'rinadigan "View Profile" tugmasi */}
                                        <button onClick={() => navigate(`/company/talents/${talent.id}`)} className="flex-1 w-full py-3 px-4 border-2 border-[#1D3D54] text-[#1D3D54] rounded-2xl font-bold hover:bg-[#1D3D54] hover:text-white transition-all duration-300 shadow-sm text-sm sm:text-base">
                                            View Profile
                                        </button>

                                        {item.isMatch ? (
                                            /* "All Matches" tabida "Send Invitation" tugmasi */
                                            <button onClick={() => handleSendInvitation(talent.id)} className="flex-1 w-full py-3 px-4 rounded-2xl font-bold bg-[#1D3D54] text-white hover:bg-[#2c5a7a] transition-all shadow-md active:scale-95 text-sm sm:text-base">
                                                Send Invitation
                                            </button>
                                        ) : (
                                            /* "Invitations Sent" tabidagi mantiq */
                                            <div className="flex-1 w-full flex items-center justify-center gap-3">
                                                {status === 'pending' ? (
                                                    <>
                                                        {/* RESUME TUGMASI (YANGI QO'SHILDI) */}
                                                        {resumeUrl && (
                                                            <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="flex-1 h-[52px] flex items-center justify-center gap-2 bg-blue-50 text-blue-600 rounded-2xl font-bold hover:bg-blue-600 hover:text-white transition-all border border-blue-100 shadow-sm text-sm" title="Download Resume">
                                                                <FiDownload size={18} /> CV
                                                            </a>
                                                        )}

                                                        {/* ACCEPT/REJECT TUGMALARI */}
                                                        <button onClick={() => handleStatusUpdate(appId, 'accepted')} className="h-12 w-12 shrink-0 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all duration-300 shadow-sm border border-emerald-100 group" title="Accept">
                                                            <MdCheck size={28} className="group-hover:scale-110 transition-transform" />
                                                        </button>
                                                        <button onClick={() => handleStatusUpdate(appId, 'rejected')} className="h-12 w-12 shrink-0 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all duration-300 shadow-sm border border-rose-100 group" title="Reject">
                                                            <MdClose size={28} className="group-hover:scale-110 transition-transform" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    /* Accepted bo'lsa faqat status chiqadi */
                                                    <div className={`flex-1 py-3 text-center rounded-2xl font-bold uppercase text-xs tracking-widest border-2 ${status === 'accepted' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-rose-500 bg-rose-50 text-rose-600'}`}>
                                                        {status}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {activeDetailTab === 'Invitations' && applications.length === 0 && (
                            <div className="col-span-full text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200 text-gray-400">Hech qanday taklif yuborilmagan.</div>
                        )}
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPageCompany;
