import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api';
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || '';

export const usePopupFormState = (isOpen: boolean, formType: string) => {
  const [captcha, setCaptcha] = useState("");
  const [userInput, setUserInput] = useState("");
  const [countriesData, setCountriesData] = useState<any[]>([]);
  const [phonecode, setPhonecode] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [courseCategories, setCourseCategories] = useState<any[]>([]);
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
      const lData = lRes.status === 'fulfilled' ? parseList(lRes.value) : [];
      const catData = catRes.status === 'fulfilled' ? parseList(catRes.value) : [];

      setPhonecode(pcData);
      setCountriesData(cData);
      setLevels(lData);
      setCourseCategories(catData);
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
