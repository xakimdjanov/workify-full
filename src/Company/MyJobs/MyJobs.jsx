import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { jobApi, companyApi } from '../../services/api';
import { HiOutlineLocationMarker } from "react-icons/hi";
import { ToastContainer, toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import 'react-toastify/dist/ReactToastify.css';

const MyJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentCompany, setCurrentCompany] = useState(null);
    const [expandedJobs, setExpandedJobs] = useState({});

    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (token) {
                const decoded = jwtDecode(token);
                const compRes = await companyApi.getById(decoded.id);
                setCurrentCompany(compRes.data);

                const jobRes = await jobApi.getByCompany(decoded.id);
                setJobs(Array.isArray(jobRes.data) ? jobRes.data : []);
            }
        } catch (error) {
            toast.error("Ma'lumotlarni yuklashda xatolik!");
        } finally {
            setTimeout(() => setLoading(false), 800);
        }
    };

    const toggleExpand = (id) => {
        setExpandedJobs(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const formatDate = (dateString) => {
        try {
            if (!dateString) return 'Recently';
            const res = formatDistanceToNow(new Date(dateString), { addSuffix: true });
            return res.charAt(0).toUpperCase() + res.slice(1);
        } catch (e) {
            return 'Recently';
        }
    };

    const renderLogo = (job) => {
        const logoUrl = job.company?.profileimg_url || currentCompany?.profileimg_url;
        const name = job.company?.company_name || currentCompany?.company_name || "C";
        return logoUrl ? (
            <img src={logoUrl} alt="logo" className="w-full h-full object-cover rounded-full" />
        ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#00A7AC] text-white text-2xl font-bold rounded-full uppercase">
                {name.charAt(0)}
            </div>
        );
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-[#F9FAFB] min-h-screen font-sans text-left relative">
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />

            <div className="max-w-7xl mx-auto flex flex-col min-h-[85vh]">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-xl sm:text-2xl font-bold text-[#4B5563] bg-white px-8 py-5 rounded-2xl shadow-sm w-full md:flex-1 border border-gray-100 text-center md:text-left leading-none">
                        My jobs
                    </h1>
                    <button
                        onClick={() => navigate('/company/post-job')}
                        className="bg-[#5CB85C] hover:bg-[#4cae4c] text-white w-full md:w-auto px-10 py-5 rounded-2xl font-bold shadow-md active:scale-95 transition-all text-lg"
                    >
                        Post a Job
                    </button>
                </div>

                {/* Jobs List */}
                <div className="space-y-4 sm:space-y-6 mb-12">
                    {jobs.length > 0 ? (
                        jobs.map((job) => {
                            const isExpanded = expandedJobs[job.id];
                            const descriptionText = job.description || "";

                            return (
                                <div key={job.id} className="bg-white p-4 sm:p-6 md:p-7 rounded-[1.8rem] sm:rounded-[2.2rem] shadow-sm border border-gray-100 transition-all hover:shadow-md">

                                    {/* 1. Logo va Profil qatori */}
                                    <div className="flex flex-col md:flex-row items-center md:items-start gap-5">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 shadow-sm rounded-full overflow-hidden border border-gray-50 bg-white">
                                            {renderLogo(job)}
                                        </div>

                                        <div className="flex-1 w-full">
                                            <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-3">
                                                {/* Sarlavhalar */}
                                                <div className="text-center md:text-left">
                                                    <h2 className="text-[20px] sm:text-[23px] font-bold text-[#343C44] tracking-tight leading-tight">
                                                        {job.occupation}
                                                    </h2>
                                                    <p className="text-[#8E8E8E] font-[600] text-[16px] sm:text-[19px] mt-0.5">
                                                        {job.company?.company_name || currentCompany?.company_name}
                                                    </p>
                                                    <div className="flex items-center justify-center md:justify-start gap-1 text-[#8E8E8E] text-[13px] sm:text-[17.5px] mt-1 font-[500]">
                                                        <HiOutlineLocationMarker className="hidden sm:block text-[#707272]" size={18} />
                                                        <span>{job.location}</span>
                                                        {job.workplace_type && <span>({job.workplace_type})</span>}
                                                    </div>
                                                </div>

                                                {/* Sana va Maosh */}
                                                <div className="flex flex-col items-center lg:items-end w-full lg:w-auto">
                                                    <p className="text-[#9c9c9c] text-[13px] sm:text-[14px] font-bold mb-0.5 uppercase tracking-wider">
                                                        {formatDate(job.created_at || job.createdAt)}
                                                    </p>
                                                    <p className="text-[22px] sm:text-[26px] font-bold text-[#1D3D54] whitespace-nowrap">
                                                        ${job.salary_min?.toLocaleString()}{job.salary_max ? ` - $${job.salary_max.toLocaleString()}` : ""}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. Job Description */}
                                    <div className="mt-5 border-t border-gray-50 pt-4">
                                        <p className="text-[#343C44] text-[14px] sm:text-[16px] leading-relaxed text-center md:text-left">
                                            {isExpanded ? descriptionText : `${descriptionText.slice(0, 150)}...`}
                                            {descriptionText.length > 150 && (
                                                <span
                                                    onClick={() => toggleExpand(job.id)}
                                                    className="text-[#9c9c9c] opacity-60 cursor-pointer ml-1 hover:opacity-100 font-bold italic text-sm transition-opacity"
                                                >
                                                    {isExpanded ? " show less" : " ... show more"}
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    {/* 3. Footer Tugmalari */}
                                    <div className="mt-5 flex items-center justify-center md:justify-end">
                                        <button
                                            onClick={() => navigate(`/company/job-detail/${job.id}`)}
                                            className="px-8 sm:px-12 py-3 sm:py-3.5 bg-[#1e3a5a] text-white rounded-xl font-bold text-xs sm:text-sm hover:bg-[#152a41] hover:shadow-lg active:scale-95 transition-all uppercase tracking-widest w-full md:w-auto"
                                        >
                                            Job Detail
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="bg-white p-20 rounded-[2.5rem] text-center border border-dashed border-gray-200 text-gray-400 font-bold uppercase italic">
                            No jobs found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyJobs;