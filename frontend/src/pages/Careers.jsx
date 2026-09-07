import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Search } from "lucide-react";
import { api } from "../lib/api";
import { useI18n } from "../i18n";
import { Reveal } from "../components/Reveal";
import { PageHero, inputCls } from "../components/FormUI";

export default function Careers() {
  const { t } = useI18n();
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [country, setCountry] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    document.title = "Careers — Yobsman-Tech";
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (department) params.set("department", department);
    if (country) params.set("country", country);
    if (type) params.set("employment_type", type);
    const timer = setTimeout(() => {
      api.get(`/content/jobs?${params}`).then((r) => setJobs(r.data)).catch(() => {});
    }, 250);
    return () => clearTimeout(timer);
  }, [search, department, country, type]);

  const departments = useMemo(() => [...new Set(jobs.map((j) => j.department))].sort(), [jobs]);
  const countries = useMemo(() => [...new Set(jobs.map((j) => j.country))].sort(), [jobs]);
  const types = ["Full-time", "Part-time", "Contract"];

  return (
    <div data-testid="careers-page">
      <PageHero eyebrow={t("sections.careersEyebrow")} title={t("careersPage.title")} desc={t("careersPage.desc")} />
      <section className="pb-24 sm:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
            <div className="relative">
              <Search size={15} className="absolute start-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input data-testid="job-search-input" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder={t("careersPage.search")} className={`${inputCls} ps-10`} />
            </div>
            <select data-testid="job-filter-department" value={department} onChange={(e) => setDepartment(e.target.value)} className={inputCls}>
              <option value="">{t("careersPage.allDepartments")}</option>
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <select data-testid="job-filter-country" value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls}>
              <option value="">{t("careersPage.allCountries")}</option>
              {countries.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select data-testid="job-filter-type" value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
              <option value="">{t("careersPage.allTypes")}</option>
              {types.map((ty) => <option key={ty} value={ty}>{ty}</option>)}
            </select>
          </div>

          {jobs.length === 0 ? (
            <p data-testid="jobs-empty" className="text-zinc-500 text-sm py-16 text-center">{t("careersPage.noJobs")}</p>
          ) : (
            <div data-testid="jobs-list" className="space-y-px rounded-2xl overflow-hidden border border-white/10 bg-white/10">
              {jobs.map((j, i) => (
                <Reveal key={j.id} delay={i * 0.03}>
                  <Link to={`/careers/${j.id}`} data-testid={`job-card-${j.id}`}
                    className="group grid md:grid-cols-12 gap-3 md:items-center bg-[#0A0A0C] hover:bg-[#141418] px-6 sm:px-8 py-7 transition-colors duration-300">
                    <div className="md:col-span-5">
                      <h2 className="font-display text-lg sm:text-xl font-semibold text-zinc-100 group-hover:text-white">{j.title}</h2>
                      <p className="text-xs text-zinc-500 mt-1">{j.department}</p>
                    </div>
                    <p className="md:col-span-3 text-sm text-zinc-400">{j.location}, {j.country}</p>
                    <p className="md:col-span-2 text-xs text-zinc-500">{j.employment_type} · {j.work_mode}</p>
                    <div className="md:col-span-2 md:text-end">
                      <span className="font-mono text-[10px] tracking-widest uppercase text-zinc-600 block">{t("careersPage.deadline")}: {j.deadline}</span>
                      <ArrowUpRight size={16} className="hidden md:inline-block mt-1 text-zinc-600 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
