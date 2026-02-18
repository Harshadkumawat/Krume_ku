import axios from "axios";


const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// 2. Shipping API ka full path banao
const API_URL = `${BASE_URL}/api/shipping`;

const checkPincode = async (pincode) => {
  
  const response = await axios.get(`${API_URL}/check/${pincode}`);
  return response.data;
};

export const shippingService = {
  checkPincode,
};