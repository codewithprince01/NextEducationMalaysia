import React from "react";
import { FaClock, FaCalendarAlt, FaGlobe } from "react-icons/fa";
import { LuRefreshCw } from "react-icons/lu";

interface CommonFieldsProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleCountryCodeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleNationalityChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  phonecode: any[];
  countriesData: any[];
  levels: any[];
}

export const CommonFields: React.FC<CommonFieldsProps> = ({
  formData,
  handleChange,
  handleCountryCodeChange,
  handleNationalityChange,
  phonecode,
  countriesData,
  levels,
}) => (
  <>
    <input
      type="text"
      name="name"
      value={formData.name}
      onChange={handleChange}
      placeholder="Full Name*"
      className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
      required
    />
    <input
      type="email"
      name="email"
      value={formData.email}
      onChange={handleChange}
      placeholder="Email*"
      className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
      required
    />

    <div className="flex col-span-2">
      <select
        name="c_code"
        value={formData.c_code}
        onChange={handleCountryCodeChange}
        className="border border-gray-300 rounded-l-lg p-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        required
      >
        <option value="">Code</option>
        {phonecode.map((code, idx) => (
          <option key={idx} value={code.phonecode}>
            +{code.phonecode}
          </option>
        ))}
      </select>
      <input
        type="text"
        name="mobile"
        value={formData.mobile}
        onChange={handleChange}
        placeholder="Mobile/WhatsApp No*"
        className="border border-gray-300 p-2 rounded-r-lg flex-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        required
      />
    </div>

    <select
      name="nationality"
      value={formData.nationality}
      onChange={handleNationalityChange}
      className="border border-gray-300 p-2 rounded-lg col-span-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      required
    >
      <option value="">Nationality*</option>
      {countriesData.map((country, idx) => (
        <option key={idx} value={country.name}>
          {country.name}
        </option>
      ))}
    </select>

    <select
      name="highest_qualification"
      value={formData.highest_qualification}
      onChange={handleChange}
      className="border border-gray-300 p-2 rounded-lg col-span-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      required
    >
      <option value="">Highest Qualification*</option>
      {levels.map((level, idx) => (
        <option key={idx} value={level.level || level.name}>
          {level.level || level.name}
        </option>
      ))}
    </select>
  </>
);

interface CounsellingFieldsProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  courseCategories: any[];
}

export const CounsellingFields: React.FC<CounsellingFieldsProps> = ({
  formData,
  handleChange,
  courseCategories,
}) => (
  <>
    <select
      name="interested_course_category"
      value={formData.interested_course_category}
      onChange={handleChange}
      className="border border-gray-300 p-2 rounded-lg col-span-1 focus:ring-2 focus:ring-green-500 focus:outline-none"
      required
    >
      <option value="">Interested Course Category*</option>
      {courseCategories.map((category, idx) => (
        <option key={idx} value={category.name}>
          {category.name}
        </option>
      ))}
    </select>

    <div className="col-span-1">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Select Time*
      </label>
      <div className="relative">
        <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <select
          name="preferred_time"
          value={formData.preferred_time}
          onChange={handleChange}
          className="border border-gray-300 p-3 pl-10 rounded-lg w-full focus:ring-2 focus:ring-green-500 focus:outline-none"
          required
        >
          <option value="">Choose time slot</option>
          <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
          <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
          <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
          <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
          <option value="03:00 PM - 04:00 PM">03:00 PM - 04:00 PM</option>
          <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
        </select>
      </div>
    </div>

    <div className="col-span-1">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Date*
      </label>
      <div className="relative">
        <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="date"
          name="preferred_date"
          value={formData.preferred_date}
          onChange={handleChange}
          className="border border-gray-300 p-3 pl-10 rounded-lg w-full focus:ring-2 focus:ring-green-500 focus:outline-none"
          required
        />
      </div>
    </div>

    <div className="col-span-1">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Time Zone*
      </label>
      <div className="relative">
        <FaGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <select
          name="time_zone"
          value={formData.time_zone}
          onChange={handleChange}
          className="border border-gray-300 p-3 pl-10 rounded-lg w-full focus:ring-2 focus:ring-green-500 focus:outline-none"
          required
        >
          <option value="">Select your timezone</option>
          <option value="GMT+00:00">(GMT+00:00) London, Dublin, Lisbon</option>
          <option value="GMT-12:00">(GMT-12:00) International Date Line West</option>
          <option value="GMT-11:00">(GMT-11:00) Midway Island, Samoa</option>
          <option value="GMT-10:00">(GMT-10:00) Hawaii</option>
          <option value="GMT-09:00">(GMT-09:00) Alaska</option>
          <option value="GMT-08:00">(GMT-08:00) Pacific Time (US & Canada)</option>
          <option value="GMT-07:00">(GMT-07:00) Mountain Time (US & Canada)</option>
          <option value="GMT-06:00">(GMT-06:00) Central Time (US & Canada)</option>
          <option value="GMT-05:00">(GMT-05:00) Eastern Time (US & Canada)</option>
          <option value="GMT-04:00">(GMT-04:00) Atlantic Time (Canada)</option>
          <option value="GMT-03:30">(GMT-03:30) Newfoundland</option>
          <option value="GMT-03:00">(GMT-03:00) Brasilia, Buenos Aires</option>
          <option value="GMT-02:00">(GMT-02:00) Mid-Atlantic</option>
          <option value="GMT-01:00">(GMT-01:00) Azores, Cape Verde Islands</option>
          <option value="GMT+01:00">(GMT+01:00) Berlin, Paris, Rome</option>
          <option value="GMT+02:00">(GMT+02:00) Cairo, Athens, Helsinki</option>
          <option value="GMT+03:00">(GMT+03:00) Moscow, Kuwait, Riyadh</option>
          <option value="GMT+03:30">(GMT+03:30) Tehran</option>
          <option value="GMT+04:00">(GMT+04:00) Abu Dhabi, Muscat, Baku</option>
          <option value="GMT+04:30">(GMT+04:30) Kabul</option>
          <option value="GMT+05:00">(GMT+05:00) Islamabad, Karachi, Tashkent</option>
          <option value="GMT+05:30">(GMT+05:30) Mumbai, Kolkata, New Delhi</option>
          <option value="GMT+05:45">(GMT+05:45) Kathmandu</option>
          <option value="GMT+06:00">(GMT+06:00) Dhaka, Almaty</option>
          <option value="GMT+06:30">(GMT+06:30) Yangon (Rangoon)</option>
          <option value="GMT+07:00">(GMT+07:00) Bangkok, Hanoi, Jakarta</option>
          <option value="GMT+08:00">(GMT+08:00) Beijing, Hong Kong, Singapore, Kuala Lumpur</option>
          <option value="GMT+09:00">(GMT+09:00) Tokyo, Seoul, Osaka</option>
          <option value="GMT+09:30">(GMT+09:30) Adelaide, Darwin</option>
          <option value="GMT+10:00">(GMT+10:00) Sydney, Melbourne, Brisbane</option>
          <option value="GMT+11:00">(GMT+11:00) Solomon Islands, New Caledonia</option>
          <option value="GMT+12:00">(GMT+12:00) Auckland, Wellington, Fiji</option>
          <option value="GMT+13:00">(GMT+13:00) Nuku'alofa</option>
        </select>
      </div>
    </div>

    <textarea
      name="message"
      value={formData.message}
      onChange={handleChange}
      placeholder="Additional Message (Optional)"
      rows={3}
      className="border border-gray-300 p-2 rounded-lg col-span-2 focus:ring-2 focus:ring-green-500 focus:outline-none resize-none"
    />
  </>
);

interface CaptchaSectionProps {
  captcha: string;
  userInput: string;
  setUserInput: (val: string) => void;
  generateCaptcha: () => void;
}

export const CaptchaSection: React.FC<CaptchaSectionProps> = ({
  captcha,
  userInput,
  setUserInput,
  generateCaptcha,
}) => (
  <div className="flex items-center gap-3 col-span-2">
    <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
      Captcha: {captcha} =
    </span>
    <input
      type="text"
      value={userInput}
      onChange={(e) => setUserInput(e.target.value)}
      placeholder="Enter Answer"
      className="border border-gray-300 p-2 rounded-lg flex-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      required
    />
    <button
      type="button"
      onClick={generateCaptcha}
      className="text-blue-600 hover:text-blue-800 cursor-pointer"
    >
      <LuRefreshCw className="h-5 w-5" />
    </button>
  </div>
);
