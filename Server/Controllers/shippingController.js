const asyncHandler = require("express-async-handler");
const axios = require("axios");

// 1. Shiprocket Token Lena (Ye sahi chal raha hai)
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
  const pincode = req.params.pincode || req.body.pincode || req.query.pincode;

  if (!pincode) {
    return res
      .status(400)
      .json({ success: false, message: "Pincode is missing from frontend!" });
  }

  const token = await getShiprocketToken();

  if (!token) {
    return res.status(500).json({
      success: false,
      message: "Shipping service currently unavailable",
    });
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

    // 🔥 Added safety check
    if (
      !data ||
      !data.available_courier_companies ||
      data.available_courier_companies.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Pincode not serviceable by Shiprocket",
      });
    }

    const fastest = data.available_courier_companies[0];

    res.status(200).json({
      success: true,
      etd: fastest.etd,
      courier: fastest.courier_name,
      is_cod: data.is_cod_available,
    });
  } catch (error) {
    console.error(
      "❌ Shiprocket Serviceability API Error:",
      error.response?.data || error.message,
    );

    res.status(400).json({
      success: false,
      message: "Invalid Pincode or Service Error",

      shiprocketSaying: error.response?.data?.message || error.message,
    });
  }
});

module.exports = { checkPincode, getShiprocketToken };
