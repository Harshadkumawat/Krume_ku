// src/utils/shippingValidation.js

// Returns an object: { fieldName: "error message", ... }
// Empty object means form is valid.
export const validateShippingForm = (form) => {
  const errors = {};

  if (!form.fullName?.trim()) {
    errors.fullName = "Full name is required";
  } else if (form.fullName.trim().length < 3) {
    errors.fullName = "Name looks too short";
  }

  const phoneDigits = String(form.phone || "").replace(/\D/g, "");
  if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
    errors.phone = "Enter a valid 10-digit mobile number";
  }

  const pincodeDigits = String(form.pincode || "").replace(/\D/g, "");
  if (!/^[1-9]\d{5}$/.test(pincodeDigits)) {
    errors.pincode = "Enter a valid 6-digit pincode";
  }

  if (!form.city?.trim()) {
    errors.city = "City is required";
  }

  if (!form.state?.trim()) {
    errors.state = "Please select a state";
  }

  if (!form.address?.trim()) {
    errors.address = "Address is required";
  } else if (form.address.trim().length < 5) {
    errors.address = "Address looks too short";
  }

  return errors;
};

// Helper: true if no errors
export const isShippingFormValid = (form) =>
  Object.keys(validateShippingForm(form)).length === 0;
