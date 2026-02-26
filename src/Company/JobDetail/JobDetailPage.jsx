import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { jobApi, talentApi } from "../../services/api";
import { MdLocationOn, MdKeyboardArrowLeft } from "react-icons/md";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { formatDistanceToNow } from 'date-fns';

const JobDetailPageCompany = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [allTalents, setAllTalents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeDetailTab, setActiveDetailTab] = useState('Matches');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [jobRes, talentRes] = await Promise.all([
                    jobApi.getById(id),
                    talentApi.getAll()
                ]);
                setJob(jobRes.data);
                setAllTalents(talentRes.data || []);
            } catch (error) {
                console.error("Ma'lumotlarni yuklashda xatolik:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // --- Skeleton Components ---
    const HeaderSkeleton = () => (
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 animate-pulse">
            <div className="bg-gray-200 h-16 rounded-2xl flex-1 w-full"></div>
            <div className="bg-gray-200 h-16 w-full md:w-40 rounded-2xl"></div>
        </div>
    );

    const JobCardSkeleton = () => (
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 mb-6 animate-pulse">
            <div className="flex flex-col lg:flex-row justify-between gap-6 mb-8">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="w-24 h-24 rounded-full bg-gray-200"></div>
                    <div className="space-y-3 flex-1">
                        <div className="h-8 bg-gray-200 rounded w-64 mx-auto md:mx-0"></div>
                        <div className="h-5 bg-gray-200 rounded w-40 mx-auto md:mx-0"></div>
                        <div className="h-4 bg-gray-200 rounded w-32 mx-auto md:mx-0"></div>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-24 ml-auto"></div>
                    <div className="h-8 bg-gray-200 rounded w-32 ml-auto"></div>
                </div>
            </div>
            <div className="space-y-3 mb-8">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div className="flex gap-3 pt-6 border-t border-gray-50">
                <div className="h-10 bg-gray-200 rounded-xl w-24"></div>
                <div className="h-10 bg-gray-200 rounded-xl w-24"></div>
                <div className="h-10 bg-gray-200 rounded-xl w-24"></div>
            </div>
        </div>
    );

    const TalentCardSkeleton = () => (
        <div className="bg-white border border-gray-100 rounded-[2rem] p-8 animate-pulse">
            <div className="flex flex-col md:flex-row justify-between mb-6">
                <div className="flex gap-6 items-center">
                    <div className="w-20 h-20 rounded-full bg-gray-200"></div>
                    <div className="space-y-2">
                        <div className="h-6 bg-gray-200 rounded w-48"></div>
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </div>
                </div>
                <div className="space-y-2 mt-4 md:mt-0">
                    <div className="h-4 bg-gray-200 rounded w-24 ml-auto"></div>
                    <div className="h-6 bg-gray-200 rounded w-20 ml-auto"></div>
                </div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-full mb-6"></div>
            <div className="flex justify-between items-end pt-6 border-t border-gray-50">
                <div className="flex gap-2">
                    <div className="h-8 bg-gray-200 rounded-lg w-20"></div>
                    <div className="h-8 bg-gray-200 rounded-lg w-20"></div>
                </div>
                <div className="h-12 bg-gray-200 rounded-xl w-32"></div>
            </div>
        </div>
    );

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
        return Array.isArray(job.skils) ? job.skils : job.skils.split(',').map(s => s.trim());
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency', currency: 'USD', minimumFractionDigits: 0,
        }).format(price || 0);
    };

    const matchedTalents = allTalents.filter(talent => {
        if (!job || !job.skils) return false;
        const jobSkillsArr = getJobSkills().map(s => s.toLowerCase());
        const talentSkills = parseTalentSkills(talent.skils);
        return talentSkills.some(t => jobSkillsArr.includes(t.skill.toLowerCase()));
    });

    if (loading) {
        return (
            <div className="w-full min-h-screen bg-[#F8F9FA] p-3 sm:p-6 md:p-8">
                <div className="max-w-5xl mx-auto">
                    <HeaderSkeleton />
                    <JobCardSkeleton />
                    <div className="h-16 bg-gray-200 rounded-[1.5rem] mb-10"></div>
                    <div className="space-y-6">
                        <TalentCardSkeleton />
                        <TalentCardSkeleton />
                    </div>
                </div>
            </div>
        );
    }

    if (!job) return <div className="p-10 text-center text-red-500">Job not found</div>;

    return (
        <div className="w-full min-h-screen bg-[#F8F9FA] p-3 sm:p-6 md:p-8 text-left font-sans">
            <div className="max-w-5xl mx-auto">

                {/* 1. Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 mt-2 md:mt-0 w-full">
                    <div className="bg-white px-6 sm:px-8 py-4 rounded-2xl shadow-sm border border-gray-100 flex-1 w-full">
                        <h1 className="text-xl sm:text-2xl font-bold text-[#4B5563] text-center md:text-left">
                            Job Details
                        </h1>
                    </div>
                    <button className="bg-[#5CB85C] hover:bg-[#4cae4c] text-white w-full md:w-auto px-10 py-4 rounded-2xl font-bold shadow-md active:scale-95 transition-all shrink-0">
                        Post a Job
                    </button>
                </div>

                {/* 2. Main Job Card */}
                <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 md:p-10 shadow-sm border border-gray-100 mb-6">
                    <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-6 mb-8">
                        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                            <div className="w-24 h-24 shrink-0 rounded-full bg-[#00A7AC] flex items-center justify-center text-white text-4xl font-bold overflow-hidden border-4 border-gray-50 shadow-sm">
                                {job.company?.profileimg_url ? (
                                    <img src={job.company.profileimg_url} className="w-full h-full object-cover" alt="logo" />
                                ) : (job.occupation?.charAt(0) || "J")}
                            </div>
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-[#343C44]">{job.occupation}</h2>
                                <p className="text-[#8E8E8E] font-[600] text-[22px] sm:text-[22px] mt-1">{job.company?.company_name}</p>
                                <div className="text-[#a7a6a6] flex items-center justify-center md:justify-start gap-1 mt-2 text-base sm:text-lg font-medium">
                                    <MdLocationOn /> {job.location} ({job.work_type || "Onsite"})
                                </div>
                            </div>
                        </div>

                        <div className="text-center lg:text-right w-full lg:w-auto border-t lg:border-none pt-4 lg:pt-0">
                            <p className="text-[#8E8E8E] text-base sm:text-[18px] font-[600] mb-1">
                                {job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true }) : 'Recently'}
                            </p>
                            <p className="text-2xl sm:text-[28px] font-bold text-[#4B5563]">
                                ${job.salary_min?.toLocaleString()} {job.salary_max ? `- $${job.salary_max.toLocaleString()}` : ""}
                            </p>
                        </div>
                    </div>

                    <p className="text-[#343C44] text-base sm:text-lg leading-relaxed mb-8 text-center md:text-left">{job.description}</p>

                    <div className="pt-6 border-t border-gray-50">
                        <h4 className="text-[#343C44] font-bold mb-4 uppercase text-xs sm:text-sm tracking-widest text-center md:text-left">Required skills</h4>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3">
                            {getJobSkills().map((skill, index) => (
                                <span key={index} className="px-4 sm:px-5 py-1.5 sm:py-2 bg-[#F3F4F6] text-[#4B5563] rounded-xl font-semibold border border-gray-100 text-sm sm:text-base">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => navigate(-1)}
                    className="group flex items-center justify-center md:justify-start gap-2 text-[#1D3D54] font-bold mb-10 py-2 px-4 rounded-lg transition-all duration-300 hover:bg-[#1D3D54]/5 w-full md:w-auto"
                >
                    <div className="p-1 rounded-full bg-transparent group-hover:bg-[#1D3D54] group-hover:text-white transition-all duration-300">
                        <MdKeyboardArrowLeft size={20} />
                    </div>
                    <span>Back to my jobs</span>
                </button>
                {/* 3. Sliding Tabs */}
                <div className="flex bg-[#E9E9E9] p-1.5 rounded-[1.5rem] w-full relative mb-10 overflow-hidden">
                    <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-[1.2rem] shadow-sm transition-all duration-300
                        ${activeDetailTab === 'Matches' ? 'left-1.5' : 'left-[calc(50%+3px)]'}`} />

                    <button onClick={() => setActiveDetailTab('Matches')} className={`flex-1 py-3.5 sm:py-4 z-10 font-bold text-xs sm:text-sm transition-colors ${activeDetailTab === 'Matches' ? 'text-[#343C44]' : 'text-[#8E8E8E]'}`}>
                        All Matches
                    </button>
                    <button onClick={() => setActiveDetailTab('Invitations')} className={`flex-1 py-3.5 sm:py-4 z-10 font-bold text-xs sm:text-sm transition-colors ${activeDetailTab === 'Invitations' ? 'text-[#343C44]' : 'text-[#8E8E8E]'}`}>
                        Invitations sent
                    </button>
                </div>

                {/* 4. Matches Content */}
                <div className="pb-20">
                    {activeDetailTab === 'Matches' ? (
                        <>
                            <div className="mb-6 flex items-baseline justify-center md:justify-start gap-2">
                                <span className="text-xl sm:text-2xl font-bold text-[#343C44]">{matchedTalents.length}</span>
                                <span className="text-xl sm:text-2xl font-bold text-[#343C44]">candidates</span>
                            </div>

                            <div className="space-y-6">
                                {matchedTalents.length > 0 ? matchedTalents.map(talent => {
                                    const tSkills = parseTalentSkills(talent.skils);
                                    return (
                                        <div key={talent.id} className="bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-md transition-all p-6 sm:p-8">
                                            <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4 mb-6">
                                                <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6 text-center md:text-left">
                                                    <div className="w-20 h-20 shrink-0 rounded-full overflow-hidden border-2 border-gray-100 bg-[#E6E7E9] flex items-center justify-center shadow-sm">
                                                        {talent.image ? (
                                                            <img
                                                                src={talent.image}
                                                                className="w-full h-full object-cover grayscale"
                                                                alt="talent"
                                                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                            />
                                                        ) : null}
                                                        <span className="text-[#1D3D54] text-2xl font-bold" style={{ display: talent.image ? 'none' : 'flex' }}>
                                                            {getInitials(talent.first_name, talent.last_name)}
                                                        </span>
                                                    </div>

                                                    <div>
                                                        <h2 className="text-xl sm:text-2xl font-bold text-[#3a3a3a] leading-tight">
                                                            {talent.specialty || talent.occupation || "Specialist"}
                                                        </h2>
                                                        <p className="text-gray-500 text-base sm:text-lg font-medium mt-1">
                                                            {talent.first_name} {talent.last_name}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="text-center md:text-right border-t md:border-none pt-3 md:pt-0 w-full md:w-auto">
                                                    <div className="flex items-center justify-center md:justify-end gap-1 text-gray-400 font-semibold mb-1 text-sm sm:text-base">
                                                        <HiOutlineLocationMarker size={20} /> {talent.city || talent.location || "Uzbekistan"}
                                                    </div>
                                                    <div className="text-xl sm:text-2xl font-bold text-[#4c4c4c]">
                                                        {formatPrice(talent.minimum_salary)}
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-gray-600 text-sm sm:text-[17px] leading-relaxed line-clamp-2 mb-6 text-center md:text-left">
                                                {talent.about || "Experience and passion in building great products..."}
                                            </p>

                                            <div className="flex flex-col xl:flex-row justify-between items-center xl:items-end gap-6 border-t border-gray-50 pt-6">
                                                <div className="w-full">
                                                    <h4 className="text-gray-400 text-[11px] sm:text-[13px] font-bold uppercase mb-3 tracking-widest text-center md:text-left">Candidate skills:</h4>
                                                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                                        {tSkills.length > 0 ? tSkills.map((s, i) => (
                                                            <span key={i} className="px-3 sm:px-4 py-1 sm:py-1.5 bg-[#f1f5f9] text-[#475569] text-xs sm:text-sm font-semibold rounded-lg border border-gray-50">
                                                                {s.skill} ({s.experience_years})
                                                            </span>
                                                        )) : <span className="text-gray-400 italic text-sm">No skills listed</span>}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
                                                    <Link to={`/talents/${talent.id}`} className="px-6 sm:px-10 py-3 bg-[#1D3D54] text-white text-center font-bold rounded-xl hover:bg-[#162f41] transition-all text-sm sm:text-base">
                                                        View profile
                                                    </Link>
                                                    <button className="px-6 sm:px-8 py-3 border-2 border-[#1D3D54] text-[#1D3D54] font-bold rounded-xl hover:bg-gray-50 transition-all text-sm sm:text-base">
                                                        Send alert
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200 text-gray-400 text-lg px-4">
                                        Hozircha mos keladigan talentlar topilmadi.
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200 text-gray-400 text-lg px-4">
                            Yuborilgan taklifnomalar ro'yxati bo'sh.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobDetailPageCompany;