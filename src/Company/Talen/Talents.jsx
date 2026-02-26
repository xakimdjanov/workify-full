import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { talenApi } from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineBriefcase } from "react-icons/hi";
import { PiMonitorBold } from "react-icons/pi";
import { LuUser } from "react-icons/lu";
import {
  FaUser,
  FaMoneyBillWave,
  FaCity,
  FaEarthAmericas,
  FaPlus,
} from "react-icons/fa6";

const Talents = () => {
  const [allTalents, setAllTalents] = useState([]);
  const [filteredTalents, setFilteredTalents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Skills and expertice");

  // Filter States
  const [selectedSpecs, setSelectedSpecs] = useState([]);
  const [selectedLangs, setSelectedLangs] = useState([]);
  const [occupation, setOccupation] = useState("");
  const [speciality, setSpeciality] = useState("");
  const [skillsRows, setSkillsRows] = useState([
    { id: 1, skill: "", experience: "", isDefault: true },
  ]);

  const [workType, setWorkType] = useState("");
  const [workplaceType, setWorkplaceType] = useState("");
  const [salaryRange, setSalaryRange] = useState({ min: "", max: "" });
  const [location, setLocation] = useState({ country: "", city: "" });

  const popularLanguages = ["Uzbek", "English", "Russian", "Turkish", "German"];
  const defaultAvatar =
    "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=";
  const navigate = useNavigate();

  // --- API DATA FETCH ---
  useEffect(() => {
    const fetchTalents = async () => {
      setIsLoading(true);
      try {
        const res = await talenApi.getAll();
        const data = Array.isArray(res.data) ? res.data : res.data.data || [];
        setAllTalents(data);
        setFilteredTalents(data);
      } catch (err) {
        console.error("Talantlarni yuklashda xatolik:", err);
      } finally {
        // Skeleton effektini ko'rish uchun biroz kechikish (ixtiyoriy)
        setTimeout(() => setIsLoading(false), 800);
      }
    };
    fetchTalents();
  }, []);

  // --- FILTER LOGIC ---
  useEffect(() => {
    let result = [...allTalents];

    if (occupation)
      result = result.filter((t) =>
        t.occupation?.toLowerCase().includes(occupation.toLowerCase()),
      );

    if (speciality)
      result = result.filter((t) =>
        t.specialty?.toLowerCase().includes(speciality.toLowerCase()),
      );

    if (selectedSpecs.length > 0)
      result = result.filter((t) => selectedSpecs.includes(t.specialty));

    if (selectedLangs.length > 0) {
      result = result.filter((talent) => {
        try {
          const tLangs =
            typeof talent.language === "string"
              ? JSON.parse(talent.language)
              : talent.language || [];
          return selectedLangs.some((sl) =>
            tLangs.some(
              (tl) => tl.language?.toLowerCase() === sl.toLowerCase(),
            ),
          );
        } catch {
          return false;
        }
      });
    }

    const activeSkills = skillsRows.filter((r) => r.skill.trim() !== "");
    if (activeSkills.length > 0) {
      result = result.filter((talent) => {
        try {
          const talentSkills =
            typeof talent.skils === "string"
              ? JSON.parse(talent.skils)
              : talent.skils || [];
          return activeSkills.every((fRow) => {
            return talentSkills.some((ts) => {
              const skillMatch = (ts.skill || "")
                .toLowerCase()
                .includes(fRow.skill.toLowerCase());
              const talentExpNumber = parseInt(ts.experience_years) || 0;
              const requiredExpNumber = parseInt(fRow.experience) || 0;
              return (
                skillMatch &&
                (fRow.experience === "" || talentExpNumber >= requiredExpNumber)
              );
            });
          });
        } catch {
          return false;
        }
      });
    }

    if (workType) result = result.filter((t) => t.work_type === workType);
    if (workplaceType)
      result = result.filter((t) => t.workplace_type === workplaceType);
    if (salaryRange.min)
      result = result.filter(
        (t) => (t.minimum_salary || 0) >= Number(salaryRange.min),
      );
    if (salaryRange.max)
      result = result.filter(
        (t) => (t.minimum_salary || 0) <= Number(salaryRange.max),
      );
    if (location.country)
      result = result.filter((t) =>
        t.country?.toLowerCase().includes(location.country.toLowerCase()),
      );
    if (location.city)
      result = result.filter((t) =>
        t.city?.toLowerCase().includes(location.city.toLowerCase()),
      );

    setFilteredTalents(result);
  }, [
    occupation,
    speciality,
    skillsRows,
    selectedSpecs,
    selectedLangs,
    workType,
    workplaceType,
    salaryRange,
    location,
    allTalents,
  ]);

  // SKELETON KARTASI
  const SkeletonCard = () => (
    <div className="bg-white rounded-[40px] border border-gray-100 p-6 text-center w-full max-w-[280px] animate-pulse flex flex-col items-center">
      <div className="w-[115px] h-[115px] bg-gray-200 rounded-full mb-4"></div>
      <div className="h-6 bg-gray-200 rounded-md w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded-md w-1/2 mb-4"></div>
      <div className="h-8 bg-gray-100 rounded-md w-1/3 mb-6"></div>
      <div className="h-10 bg-gray-200 rounded-[20px] w-[170px] mt-auto"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-6 md:py-10 px-4 md:px-6 font-gilroy text-[#111827]">
      <div className="max-w-[1240px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-10">
          <h1 className="text-xl sm:text-2xl font-bold text-[#4B5563] bg-white px-8 py-5 rounded-2xl shadow-sm w-full md:flex-1 border border-gray-100 text-center md:text-left leading-none">
            Talent
          </h1>
          <button
            onClick={() => navigate("/company/post-job")}
            className="bg-[#5CB85C] hover:bg-[#4cae4c] text-white w-full md:w-auto px-10 py-5 rounded-2xl font-bold shadow-md active:scale-95 transition-all text-lg"
          >
            Post a Job
          </button>
        </div>

        {/* Filter Section */}
        <div className="max-w-[1043px] mx-auto mb-6">
          <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-2 flex items-center justify-between gap-2">
            <div className="flex flex-1 gap-1 md:gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
              {["Specialty", "Skills and expertice", "Preferences"].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative flex-1 min-w-[130px] py-3 rounded-[15px] font-bold text-[13px] md:text-[16px] transition-all z-10 whitespace-nowrap ${activeTab === tab ? "text-[#26282c]" : "text-[#C7C7C7]"}`}
                  >
                    {activeTab === tab && (
                      <motion.div
                        layoutId="tabBg"
                        className="absolute inset-0 bg-[#F8F9FA] shadow-sm rounded-[15px] -z-10"
                      />
                    )}
                    {tab}
                  </button>
                ),
              )}
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="px-2 md:px-4 transition-transform"
              style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 bg-white rounded-[25px] md:rounded-[30px] p-5 md:p-8 border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* 1. Specialty Tab */}
                {activeTab === "Specialty" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      ...new Set(
                        allTalents.map((t) => t.specialty).filter(Boolean),
                      ),
                    ].map((spec, i) => (
                      <label
                        key={i}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSpecs.includes(spec)}
                          onChange={() =>
                            setSelectedSpecs((prev) =>
                              prev.includes(spec)
                                ? prev.filter((s) => s !== spec)
                                : [...prev, spec],
                            )
                          }
                          className="w-5 h-5 rounded border-gray-300 text-[#8B39E5]"
                        />
                        <span
                          className={`text-[14px] ${selectedSpecs.includes(spec) ? "text-[#8B39E5] font-bold" : "text-gray-600"}`}
                        >
                          {spec}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {/* 2. Skills and Expertise Tab */}
                {activeTab === "Skills and expertice" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <p className="font-bold">Occupation</p>
                        <div className="relative">
                          <HiOutlineBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-[#163D5C]" />
                          <input
                            type="text"
                            value={occupation}
                            onChange={(e) => setOccupation(e.target.value)}
                            placeholder="e.g. Designer"
                            className="w-full pl-12 pr-4 py-3 bg-[#F8F9FA] rounded-xl outline-none border border-transparent focus:border-[#8B39E5]"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="font-bold">Speciality</p>
                        <div className="relative">
                          <PiMonitorBold className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-[#163D5C]" />
                          <input
                            type="text"
                            value={speciality}
                            onChange={(e) => setSpeciality(e.target.value)}
                            placeholder="e.g. UX/UI"
                            className="w-full pl-12 pr-4 py-3 bg-[#F8F9FA] rounded-xl outline-none border border-transparent focus:border-[#8B39E5]"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="font-bold text-[#163D5C]">Languages</p>
                      <div className="flex flex-wrap gap-2">
                        {popularLanguages.map((lang) => (
                          <button
                            key={lang}
                            onClick={() =>
                              setSelectedLangs((prev) =>
                                prev.includes(lang)
                                  ? prev.filter((l) => l !== lang)
                                  : [...prev, lang],
                              )
                            }
                            className={`px-4 py-2 rounded-xl font-bold text-sm border transition-all ${selectedLangs.includes(lang) ? "bg-[#8B39E5] text-white border-[#8B39E5]" : "bg-[#F8F9FA] text-gray-500 border-transparent hover:border-gray-300"}`}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>
                    {skillsRows.map((row) => (
                      <div
                        key={row.id}
                        className="flex flex-col md:flex-row gap-4"
                      >
                        <div className="relative flex-1">
                          <LuUser className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-[#163D5C]" />
                          <input
                            type="text"
                            placeholder="Skill (e.g. Figma)"
                            value={row.skill}
                            onChange={(e) =>
                              setSkillsRows(
                                skillsRows.map((r) =>
                                  r.id === row.id
                                    ? { ...r, skill: e.target.value }
                                    : r,
                                ),
                              )
                            }
                            className="w-full pl-12 pr-4 py-3 bg-[#F8F9FA] rounded-xl outline-none"
                          />
                        </div>
                        <div className="relative flex-1">
                          <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#163D5C]" />
                          <input
                            type="number"
                            placeholder="Min years experience"
                            value={row.experience}
                            onChange={(e) =>
                              setSkillsRows(
                                skillsRows.map((r) =>
                                  r.id === row.id
                                    ? { ...r, experience: e.target.value }
                                    : r,
                                ),
                              )
                            }
                            className="w-full pl-12 pr-4 py-3 bg-[#F8F9FA] rounded-xl outline-none"
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() =>
                        setSkillsRows([
                          ...skillsRows,
                          { id: Date.now(), skill: "", experience: "" },
                        ])
                      }
                      className="flex items-center gap-2 bg-[#50C594]/10 text-[#50C594] px-6 py-2 rounded-xl font-bold"
                    >
                      <FaPlus /> Add skill
                    </button>
                  </div>
                )}

                {/* 3. Preferences Tab (Full Content) */}
                {activeTab === "Preferences" && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Employment & Workplace */}
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <p className="font-bold text-[#163D5C]">
                            Employment type
                          </p>
                          <div className="flex flex-wrap bg-[#F8F9FA] p-1.5 rounded-2xl gap-1">
                            {[
                              "fulltime",
                              "parttime",
                              "contract",
                              "freelance",
                            ].map((type) => (
                              <button
                                key={type}
                                onClick={() =>
                                  setWorkType(workType === type ? "" : type)
                                }
                                className={`flex-1 py-2 rounded-xl text-sm font-bold capitalize transition-all ${workType === type ? "bg-white shadow-md text-[#8B39E5]" : "text-gray-400"}`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <p className="font-bold text-[#163D5C]">
                            Workplace type
                          </p>
                          <div className="flex bg-[#F8F9FA] p-1.5 rounded-2xl gap-1">
                            {["Onsite", "Remote", "Hybrid"].map((type) => (
                              <button
                                key={type}
                                onClick={() =>
                                  setWorkplaceType(
                                    workplaceType === type ? "" : type,
                                  )
                                }
                                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${workplaceType === type ? "bg-white shadow-md text-[#8B39E5]" : "text-gray-400"}`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Salary & Location */}
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <p className="font-bold text-[#163D5C]">
                            Expected Salary ($)
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                              <FaMoneyBillWave className="absolute left-4 top-1/2 -translate-y-1/2 text-[#163D5C]" />
                              <input
                                type="number"
                                placeholder="Min"
                                value={salaryRange.min}
                                onChange={(e) =>
                                  setSalaryRange({
                                    ...salaryRange,
                                    min: e.target.value,
                                  })
                                }
                                className="w-full pl-11 pr-4 py-3 bg-[#F8F9FA] rounded-xl outline-none"
                              />
                            </div>
                            <div className="relative">
                              <FaMoneyBillWave className="absolute left-4 top-1/2 -translate-y-1/2 text-[#163D5C]" />
                              <input
                                type="number"
                                placeholder="Max"
                                value={salaryRange.max}
                                onChange={(e) =>
                                  setSalaryRange({
                                    ...salaryRange,
                                    max: e.target.value,
                                  })
                                }
                                className="w-full pl-11 pr-4 py-3 bg-[#F8F9FA] rounded-xl outline-none"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="font-bold text-[#163D5C]">Country</p>
                            <div className="relative">
                              <FaEarthAmericas className="absolute left-4 top-1/2 -translate-y-1/2 text-[#163D5C]" />
                              <input
                                type="text"
                                placeholder="Country"
                                value={location.country}
                                onChange={(e) =>
                                  setLocation({
                                    ...location,
                                    country: e.target.value,
                                  })
                                }
                                className="w-full pl-11 pr-4 py-3 bg-[#F8F9FA] rounded-xl outline-none"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="font-bold text-[#163D5C]">City</p>
                            <div className="relative">
                              <FaCity className="absolute left-4 top-1/2 -translate-y-1/2 text-[#163D5C]" />
                              <input
                                type="text"
                                placeholder="City"
                                value={location.city}
                                onChange={(e) =>
                                  setLocation({
                                    ...location,
                                    city: e.target.value,
                                  })
                                }
                                className="w-full pl-11 pr-4 py-3 bg-[#F8F9FA] rounded-xl outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Info */}
        <div className="max-w-[1043px] mx-auto mb-8 pt-6 border-t border-gray-200">
          <h2 className="text-xl md:text-2xl font-bold">
            {isLoading ? "" : `${filteredTalents.length} talents found`}
          </h2>
        </div>

        {/* Talent Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 justify-items-center">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : filteredTalents.map((talent) => (
                <div
                  key={talent.id}
                  className="bg-white rounded-[40px] border border-gray-100 p-6 text-center w-full max-w-[280px] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center"
                >
                  <div className="w-[115px] h-[115px] rounded-full overflow-hidden border-4 border-white shadow-sm mb-4">
                    <img
                      src={talent.image || defaultAvatar}
                      className="w-full h-full object-cover"
                      alt="Avatar"
                    />
                  </div>
                  <h3 className="font-bold text-[20px] text-[#2D2D2D] mb-1 line-clamp-1">
                    {talent.first_name} {talent.last_name}
                  </h3>
                  <p className="text-[#888888] text-[15px] font-medium mb-1 line-clamp-1">
                    {talent.specialty || talent.occupation}
                  </p>
                  <p className="text-[#888888] text-[14px] mb-4">
                    {talent.city}, {talent.country}
                  </p>
                  <div className="mb-6">
                    <span className="font-black text-[22px] text-[#2D2D2D]">
                      ${" "}
                      {new Intl.NumberFormat("de-DE").format(
                        talent.minimum_salary || 0,
                      )}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/company/talents/${talent.id}`)}
                    className="w-[170px] py-2 border-2 border-[#1D3D54] text-[#1d3D54] rounded-[20px] font-bold hover:bg-[#1D3D54] hover:text-white transition-all mt-auto"
                  >
                    View profile
                  </button>
                </div>
              ))}
        </div>

        {!isLoading && filteredTalents.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[40px] mt-10 border-2 border-dashed border-gray-200">
            <p className="text-gray-400 text-lg">
              No talents match your current filters.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 text-[#8B39E5] font-bold"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Talents;
