import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api';

export const usePopupFormState = (isOpen: boolean, formType: string, onClose: () => void) => {
  const [captcha, setCaptcha] = useState("");
  const [userInput, setUserInput] = useState("");
  const [countriesData, setCountriesData] = useState<any[]>([]);
  const [phonecode, setPhonecode] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [courseCategories, setCourseCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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

  const resetForm = useCallback(() => {
    setFormData({
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
      requestfor: formType === "counselling" ? "counselling" : formType === "fee" ? "fees" : "brochure",
    });
    setUserInput("");
    generateCaptcha();
  }, [formType, generateCaptcha]);

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
      try {
        const [pcRes, cRes, lRes, catRes]: any[] = await Promise.all([
          axios.get(`${API_BASE}/phonecodes`),
          axios.get(`${API_BASE}/countries`),
          axios.get(`${API_BASE}/levels`),
          axios.get(`${API_BASE}/course-categories`),
        ]);

        setPhonecode(Array.isArray(pcRes.data) ? pcRes.data : pcRes.data.data || []);
        setCountriesData(Array.isArray(cRes.data) ? cRes.data : cRes.data.data || []);
        setLevels(lRes.data.data || []);
        setCourseCategories(Array.isArray(catRes.data) ? catRes.data : catRes.data.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    let newFormData = { ...formData, c_code: code };
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
    let newFormData = { ...formData, nationality: name };
    const matchedCountry = countriesData.find((c) => c.name === name);
    if (matchedCountry && (matchedCountry.phonecode || matchedCountry.phone_code)) {
      newFormData.c_code = matchedCountry.phonecode || matchedCountry.phone_code;
    }
    setFormData(newFormData);
  };

  const onSuccessOk = () => {
    setShowSuccess(false);
    resetForm();
    onClose();
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
    showSuccess,
    setShowSuccess,
    formData,
    generateCaptcha,
    handleChange,
    handleCountryCodeChange,
    handleNationalityChange,
    onSuccessOk,
  };
};
