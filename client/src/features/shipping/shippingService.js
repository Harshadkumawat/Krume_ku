import api from "../../utils/api"; 

const checkPincode = async (pincode) => {
  const response = await api.get(`/api/shipping/check/${pincode}`);
  return response.data;
};

export const shippingService = {
  checkPincode,
};
