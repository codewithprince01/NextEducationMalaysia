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
