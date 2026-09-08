import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { isLevelMatch } from "./UniversityForms/useFetchFormData";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || '';

function uniqByName(list: any[]) {
  const out: any[] = [];
  const seen = new Set<string>();
  for (const item of list || []) {
    const name = String(item?.name || item?.course_name || '').trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

export const usePopupFormState = (isOpen: boolean, formType: string, universityData?: any) => {
  const [captcha, setCaptcha] = useState("");
  const [userInput, setUserInput] = useState("");
  const [countriesData, setCountriesData] = useState<any[]>([]);
  const [phonecode, setPhonecode] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [allPrograms, setAllPrograms] = useState<Array<{ name: string; level: string }>>([]);
  const [genericCategories, setGenericCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    c_code: "",
    mobile: "",
    nationality: "",
    highest_qualification: "",
    interested_course_category: "",
    preferred_date: "",
    time_zone: "",
    preferred_time: "",
    message: "",
    requestfor: "brochure",
  });

  const generateCaptcha = useCallback(() => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operators = ["+", "-", "*"];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    setCaptcha(`${num1} ${operator} ${num2}`);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const reqType =
        formType === "counselling"
          ? "counselling"
          : formType === "fee"
            ? "fees"
            : "brochure";
      setFormData((prev) => ({ ...prev, requestfor: reqType }));
      generateCaptcha();
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, formType, generateCaptcha]);

  useEffect(() => {
    const fetchData = async () => {
      const parseList = (res: any) => {
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res?.data?.data)) return res.data.data;
        if (Array.isArray(res?.data?.data?.data)) return res.data.data.data;
        return [];
      };

      const localFetch = (path: string) => axios.get(path, {
        headers: API_KEY ? { 'x-api-key': API_KEY } : undefined,
      });

      const remoteFetch = (path: string) => axios.get(`${API_BASE}${path}`, {
        headers: API_KEY ? { 'x-api-key': API_KEY } : undefined,
      });

      const fetchWithFallback = async (localPath: string, remotePath: string) => {
        try {
          return await localFetch(localPath);
        } catch {
          return await remoteFetch(remotePath);
        }
      };

      const [pcRes, cRes, lRes, catRes] = await Promise.allSettled([
        fetchWithFallback('/api/v1/phonecodes', '/phonecodes'),
        fetchWithFallback('/api/v1/countries', '/countries'),
        fetchWithFallback('/api/v1/levels', '/levels'),
        fetchWithFallback('/api/v1/course-categories', '/course-categories'),
      ]);

      const pcData = pcRes.status === 'fulfilled' ? parseList(pcRes.value) : [];
      const cData = cRes.status === 'fulfilled' ? parseList(cRes.value) : [];
      let lData = lRes.status === 'fulfilled' ? parseList(lRes.value) : [];
      let catData = catRes.status === 'fulfilled' ? parseList(catRes.value) : [];
      let progsData: Array<{ name: string; level: string }> = [];

      const uniSlug = universityData?.uname || universityData?.slug ||
        (typeof universityData?.name === 'string'
          ? universityData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
          : '');

      if (uniSlug) {
        try {
          const uniRes = await axios.get(`/api/university/${uniSlug}/courses`);
          const data = uniRes.data as any;
          if (data && !data.error) {
            if (Array.isArray(data.levels) && data.levels.length > 0) {
              lData = data.levels;
            }
            if (Array.isArray(data.all_programs) && data.all_programs.length > 0) {
              progsData = data.all_programs
                .map((p: any) => ({
                  name: String(p.name || p.course_name || '').trim(),
                  level: String(p.level || '').trim(),
                }))
                .filter((p: any) => p.name);
            } else if (Array.isArray(data.programs?.data) && data.programs.data.length > 0) {
              progsData = data.programs.data
                .map((p: any) => ({
                  name: String(p.course_name || p.name || p.title || '').trim(),
                  level: String(p.level || '').trim(),
                }))
                .filter((p: any) => p.name);
            }
          }
        } catch {}
      }

      setPhonecode(pcData);
      setCountriesData(cData);
      setLevels(lData);
      setAllPrograms(progsData);
      setGenericCategories(uniqByName(catData.map((c: any) => ({ name: c.name || c.title || '' }))));
    };
    fetchData();
  }, [universityData]);

  // Dynamically filter course categories by highest_qualification
  const courseCategories = useMemo(() => {
    if (allPrograms.length > 0) {
      if (formData.highest_qualification) {
        const matching = allPrograms.filter((p) => isLevelMatch(p.level, formData.highest_qualification));
        if (matching.length > 0) {
          return uniqByName(matching.map((p) => ({ name: p.name })));
        }
      }
      return uniqByName(allPrograms.map((p) => ({ name: p.name })));
    }
    return genericCategories;
  }, [allPrograms, formData.highest_qualification, genericCategories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "highest_qualification") {
      setFormData((prev) => ({
        ...prev,
        highest_qualification: value,
        interested_course_category: "", // Reset course so user picks matching course for new level
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const newFormData = { ...formData, c_code: code };
    if (code) {
      const matchedCountry = countriesData.find((c) => (c.phonecode == code || c.phone_code == code));
      if (matchedCountry) {
        newFormData.nationality = matchedCountry.name;
      }
    }
    setFormData(newFormData);
  };

  const handleNationalityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    const newFormData = { ...formData, nationality: name };
    const matchedCountry = countriesData.find((c) => c.name === name);
    if (matchedCountry && (matchedCountry.phonecode || matchedCountry.phone_code)) {
      newFormData.c_code = matchedCountry.phonecode || matchedCountry.phone_code;
    }
    setFormData(newFormData);
  };

  return {
    captcha,
    userInput,
    setUserInput,
    countriesData,
    phonecode,
    levels,
    courseCategories,
    loading,
    setLoading,
    formData,
    generateCaptcha,
    handleChange,
    handleCountryCodeChange,
    handleNationalityChange,
  };
};
