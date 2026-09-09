// src/utils/shippingConstants.js

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Chandigarh",
  "Ladakh",
  "Jammu & Kashmir",
  "Puducherry",
  "Andaman & Nicobar Islands",
  "Dadra & Nagar Haveli and Daman & Diu",
  "Lakshadweep",
];

export const ADDRESS_FORM_FIELDS = [
  "fullName",
  "phone",
  "pincode",
  "city",
  "state",
  "landmark",
  "address",
  "addressType",
];

// FIX: state default changed from "Maharashtra" to "" so the user is
// forced to actually pick their real state instead of silently
// inheriting a wrong one (which breaks Shiprocket zone + GST logic).
export const BLANK_FORM = {
  fullName: "",
  phone: "",
  pincode: "",
  city: "",
  state: "",
  landmark: "",
  address: "",
  addressType: "Home",
};

// FIX: force phone/pincode to always be strings, even if a legacy
// DB record stored them as numbers (prevents .replace() crashes
// downstream in AddressForm's onChange handlers).
export const pickFormFields = (addr = {}) =>
  ADDRESS_FORM_FIELDS.reduce((acc, key) => {
    const raw = addr[key] ?? BLANK_FORM[key];
    acc[key] = key === "phone" || key === "pincode" ? String(raw ?? "") : raw;
    return acc;
  }, {});
