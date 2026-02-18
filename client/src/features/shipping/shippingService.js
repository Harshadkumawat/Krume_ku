import axios from "axios";

const API_URL = "http://localhost:8080/api/shipping";

const checkPincode = async (pincode) => {
  const response = await axios.get(`${API_URL}/check/${pincode}`);
  return response.data;
};

export const shippingService = {
  checkPincode,
};
