import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // 1. Hook import qilindi
import { jobApi } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import { uz, ru, enUS } from 'date-fns/locale'; // Sene tarjimasi uchun locale'lar
import { HiOutlineLocationMarker } from "react-icons/hi";

function Jobs() {
    const { t, i18n } = useTranslation(); // 2. t va i18n olindi
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedJobs, setExpandedJobs] = useState({});

    // Sana tilini aniqlash uchun yordamchi
    const getLocale = () => {
        if (i18n.language === 'uz') return uz;
        if (i18n.language === 'ru') return ru;
        return enUS;
    };

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setLoading(true);
                const response = await jobApi.getAll();
                setJobs(response.data || []);
            } catch (err) {
                console.error('Fetch error:', err);
                setError(t('jobs.fetch_error')); // Tarjimaga ulandi
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, [t]);

    const toggleExpand = (id) => {
        setExpandedJobs(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const formatDate = (dateString) => {
        try {
            if (!dateString) return t('jobs.recently');
            return formatDistanceToNow(new Date(dateString), {
                addSuffix: true,
                locale: getLocale() // Sanani joriy tilda chiqaradi
            });
        } catch (e) { return t('jobs.recently'); }
    };

    const parseSkills = (skillsData) => {
        if (!skillsData) return [];
        if (typeof skillsData === 'string') {
            return skillsData.split(',').map(s => s.trim()).filter(s => s !== "");
        }
        if (Array.isArray(skillsData)) return skillsData;
        return [];
    };

    const JobSkeleton = () => (
        <div className="bg-white border border-gray-100 rounded-xl shadow-md overflow-hidden animate-pulse">
            <div className="p-5 md:p-8">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    <div className="flex items-center gap-4 md:gap-5 w-full">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded-full shrink-0"></div>
                        <div className="flex-1 space-y-3">
                            <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-7 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="px-5 md:px-8 pb-8 space-y-4">
                <div className="h-6 bg-gray-100 rounded w-3/4"></div>
                <div className="h-4 bg-gray-100 rounded w-full"></div>
                <div className="flex gap-2">
                    <div className="h-8 bg-gray-100 rounded w-20"></div>
                    <div className="h-8 bg-gray-100 rounded w-20"></div>
                </div>
            </div>
        </div>
    );

    if (error) return <div className="flex justify-center items-center min-h-screen text-red-500 font-medium">{error}</div>;

    return (
        <div className="bg-[#fcfcfc] min-h-screen p-4 md:p-8 font-sans">
            <div className="max-w-6xl mx-auto">

                <div className="mb-6">
                    <div className="flex items-baseline gap-2 pb-3">
                        <span className="text-[20px] md:text-[25px] font-medium text-[#404040] tracking-tight">
                            {loading ? "..." : new Intl.NumberFormat('de-DE').format(jobs.length)}
                        </span>
                        <span className="text-[20px] md:text-[25px] font-medium text-[#404040] lowercase tracking-tight">
                            {t('jobs.jobs_count_text')}
                        </span>
                    </div>
                    <div className="h-[1.5px] w-full bg-[#e5e7eb]"></div>
                </div>

                <div className="space-y-5">
                    {loading ? (
                        [1, 2, 3, 4].map(i => <JobSkeleton key={i} />)
                    ) : (
                        jobs.map((job) => {
                            const skills = parseSkills(job.skils);
                            const company = job.company || {};
                            const isExpanded = expandedJobs[job.id];
                            const descriptionText = job.description || t('jobs.no_description');

                            return (
                                <div key={job.id} className="bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
                                    <div className="p-5 md:p-8">
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                            <div className="flex items-center gap-4 md:gap-6">
                                                <div className="w-16 h-16 md:w-24 md:h-24 bg-[#00A193] rounded-full flex items-center justify-center overflow-hidden shrink-0 text-white font-bold">
                                                    {company.profileimg_url ? (
                                                        <img src={company.profileimg_url} alt="logo" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-xl md:text-3xl uppercase">
                                                            {company.company_name?.substring(0, 2) || 'TC'}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex flex-col justify-center">
                                                    <h3 className="text-xl md:text-3xl font-bold text-[#2d3748] leading-tight">
                                                        {company.company_name || 'TechCells'}
                                                    </h3>
                                                    <p className="text-gray-600 text-[16px] md:text-[22px] font-medium">
                                                        {company.industry || 'Computer Software'}
                                                    </p>

                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="flex text-yellow-400 text-xl md:text-3xl">
                                                            ★★★★<span className="text-gray-300">★</span>
                                                        </div>
                                                        <span className="text-gray-500 text-sm md:text-lg font-medium border-l border-gray-300 pl-2 ml-1">
                                                            (4.0) | {t('jobs.reviews_count')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-row md:flex-col justify-between md:items-end items-center gap-1.5 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                                                <div className="flex items-center gap-1 text-[#4b5563] text-sm md:text-lg font-semibold">
                                                    <HiOutlineLocationMarker className="text-[#8b8d8f]" size={22} />
                                                    {job.location || 'Tashkent'}
                                                </div>
                                                <div className="flex flex-col md:items-end items-start">
                                                    <span className="text-gray-600 text-[14px] md:text-[20px] font-medium">{formatDate(job.createdAt)}</span>
                                                    <span className="bg-[#52D195] text-white text-[9px] md:text-[11px] font-black px-2 md:px-2.5 py-1 md:py-2.5 rounded-lg md:rounded-xl uppercase tracking-widest mt-2 md:mt-4">
                                                        {t('jobs.now_hiring')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 mx-6"></div>

                                    <div className="p-5 md:p-6">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                                            <h2 className="text-[18px] md:text-[22px] font-bold text-[#515151] tracking-tight">
                                                {job.occupation || 'Job Title'}
                                            </h2>
                                            <div className="text-[20px] md:text-[25px] font-bold text-[#343434] tracking-tight">
                                                ${job.salary_min}-${job.salary_max}
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <div
                                                className={`text-[#484f57] text-[15px] md:text-[18px] leading-relaxed transition-all duration-300 ${isExpanded ? 'max-h-[150px] overflow-y-auto pr-2' : 'line-clamp-2'}`}
                                            >
                                                {descriptionText}
                                            </div>
                                            {descriptionText.length > 150 && (
                                                <button
                                                    onClick={() => toggleExpand(job.id)}
                                                    className="text-[#1D3D54] font-bold text-sm mt-1 hover:underline cursor-pointer"
                                                >
                                                    {isExpanded ? t('talents.show_less') : t('talents.show_more')}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-5 md:p-6 pt-0">
                                        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-end gap-6">
                                            <div className="w-full">
                                                <h4 className="text-[#1a1a1a] text-[13px] md:text-[14px] font-bold mb-3">
                                                    {t('jobs.required_skills')}:
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {skills.length > 0 ? (
                                                        skills.map((skill, idx) => (
                                                            <span key={idx} className="px-3 py-1.5 md:px-4 md:py-2 bg-[#f1f5f9] text-[#475569] text-[12px] md:text-[14px] font-semibold rounded-lg border border-slate-100">
                                                                {skill}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-400 text-sm italic">{t('talents.no_skills')}</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                                                <button className="px-6 md:px-[60px] py-3 bg-[#1D3D54] text-white text-[16px] md:text-[20px] font-[650] rounded-lg hover:bg-[#152c3d]">
                                                    {t('jobs.quick_apply')}
                                                </button>
                                                <Link to={`/talent/jobs/${job.id}`} className="px-6 md:px-[30px] py-3 border-2 border-[#1D3D54] text-[#1D3D54] text-[16px] md:text-[20px] font-[650] rounded-lg text-center whitespace-nowrap">
                                                    {t('jobs.view_post')}
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {jobs.length === 0 && !loading && (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300 mt-5">
                        <p className="text-gray-400 font-medium">{t('jobs.no_jobs')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Jobs;