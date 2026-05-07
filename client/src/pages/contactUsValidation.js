export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactUs({ name, email, message }) {
  const errors = {};
  if (!String(name || "").trim()) errors.name = "Name is required.";
  if (!String(email || "").trim()) errors.email = "Email is required.";
  else if (!EMAIL_REGEX.test(String(email).trim())) errors.email = "Enter a valid email address.";
  if (!String(message || "").trim()) errors.message = "Message is required.";
  return errors;
}

