const asyncHandler = require("express-async-handler");
const axios = require("axios");

// 1. Shiprocket Token Lena
const getShiprocketToken = async () => {
  try {
    const res = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/auth/login",
      {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      },
    );
    return res.data.token;
  } catch (error) {
    console.error(
      "❌ Shiprocket Auth Fail:",
      error.response?.data || error.message,
    );
    return null;
  }
};

// 2. Pincode Serviceability Check
const checkPincode = asyncHandler(async (req, res) => {
  const { pincode } = req.params;
  const token = await getShiprocketToken();

  if (!token) {
    res.status(500);
    throw new Error("Shipping service currently unavailable");
  }

  try {
    const response = await axios.get(
      "https://apiv2.shiprocket.in/v1/external/courier/serviceability/",
      {
        params: {
          pickup_postcode: process.env.WAREHOUSE_PINCODE,
          delivery_postcode: pincode,
          weight: "0.5",
          cod: 1,
        },
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const data = response.data.data;

    if (!data || data.available_courier_companies.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Pincode not serviceable" });
    }

    // Sabse fast courier filter karna
    const fastest = data.available_courier_companies[0];

    res.status(200).json({
      success: true,
      etd: fastest.etd,
      courier: fastest.courier_name,
      is_cod: data.is_cod_available,
    });
  } catch (error) {
    res
      .status(400)
      .json({ success: false, message: "Invalid Pincode or Service Error" });
  }
});

module.exports = { checkPincode, getShiprocketToken };
