export const validateEmail = (email: string) => {
  if (!email || email.trim() === "") {
    return "Email is required";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Invalid email address";
  }
  return "";
};

export const validatePassword = (password: string) => {
  if (!password || password.trim() === "") {
    return "Password is required";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
    return "Password must contain uppercase, lowercase, number, and special character";
  }
  return "";
};

export const validateConfirmPassword = (password: string, confirmPassword: string) => {
  if (!confirmPassword || confirmPassword.trim() === "") {
    return "Please confirm your password";
  }
  if (password !== confirmPassword) {
    return "Passwords do not match";
  }
  return "";
};

export const validateRequired = (value: any, fieldName: string = "This field") => {
  if (!value || value.toString().trim() === "") {
    return `${fieldName} is required`;
  }
  return "";
};

export const getPasswordStrength = (password: string) => {
  if (!password) return { level: 0, color: "gray", text: "" };

  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

  if (strength <= 2) return { level: 1, color: "red", text: "Weak" };
  if (strength <= 4) return { level: 2, color: "yellow", text: "Medium" };
  return { level: 3, color: "green", text: "Strong" };
};

export const validatePhone = (phone: string, fieldName: string = "Phone number") => {
  if (!phone || phone.trim() === "") {
    return `${fieldName} is required`;
  }

  const cleanPhone = phone.replace(/[\s\-()]/g, "");
  const phoneRegex = /^\d{8,15}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return "Invalid phone number format";
  }

  return "";
};

export const validatePassport = (passport: string) => {
  if (!passport || passport.trim() === "") {
    return "Passport number is required";
  }

  const passportRegex = /^[A-Z0-9]{6,9}$/i;
  if (!passportRegex.test(passport.replace(/[\s\-]/g, ""))) {
    return "Invalid passport format (6-9 characters)";
  }

  return "";
};

export const validateName = (name: string, fieldName: string = "Name") => {
  if (!name || name.trim() === "") {
    return `${fieldName} is required`;
  }

  if (name.trim().length < 2) {
    return `${fieldName} must be at least 2 characters`;
  }

  const nameRegex = /^[a-zA-Z\s.'-]+$/;
  if (!nameRegex.test(name)) {
    return `${fieldName} can only contain letters, spaces, and basic punctuation`;
  }

  return "";
};

export const validateDateOfBirth = (date: string, fieldName: string = "Date of birth") => {
  if (!date || date.trim() === "") {
    return `${fieldName} is required`;
  }

  const selectedDate = new Date(date);
  const today = new Date();
  const age = today.getFullYear() - selectedDate.getFullYear();

  if (selectedDate > today) {
    return `${fieldName} cannot be in the future`;
  }

  if (age < 10) {
    return "You must be at least 10 years old";
  }

  if (age > 120) {
    return "Please enter a valid date of birth";
  }

  return "";
};

export const validateZipcode = (zipcode: string) => {
  if (!zipcode || zipcode.trim() === "") {
    return "Zipcode/Postal code is required";
  }

  const zipcodeRegex = /^[A-Z0-9\s\-]{3,10}$/i;
  if (!zipcodeRegex.test(zipcode)) {
    return "Invalid zipcode format";
  }

  return "";
};

export const validateSelect = (value: string, fieldName: string = "This field") => {
  if (!value || value === "" || value === "Select" || value === "Code") {
    return `Please select ${fieldName.toLowerCase()}`;
  }
  return "";
};

export const validateScore = (
  score: string,
  fieldName: string = "Score",
  min: number = 0,
  max: number = 100,
) => {
  if (!score || score.trim() === "") {
    return `${fieldName} is required`;
  }

  const numScore = parseFloat(score);
  if (Number.isNaN(numScore)) {
    return `${fieldName} must be a number`;
  }

  if (numScore < min || numScore > max) {
    return `${fieldName} must be between ${min} and ${max}`;
  }

  return "";
};
