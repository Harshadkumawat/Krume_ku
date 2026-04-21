const asyncHandler = require("express-async-handler");
const axios = require("axios");
const { ApiError } = require("../Middleware/errorMiddleware");

let cachedToken = null;
let tokenExpiry = null;
let tokenPromise = null;

/**
 * Shiprocket Token - with cache & race condition prevention
 */
const getShiprocketToken = async () => {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  if (tokenPromise) return tokenPromise;

  tokenPromise = (async () => {
    try {
      const res = await axios.post(
        "https://apiv2.shiprocket.in/v1/external/auth/login",
        {
          email: process.env.SHIPROCKET_EMAIL,
          password: process.env.SHIPROCKET_PASSWORD,
        },
        { timeout: 10000 },
      );

      cachedToken = res.data.token;
      tokenExpiry = Date.now() + 23 * 60 * 60 * 1000;
      return cachedToken;
    } catch (error) {
      console.error(
        "❌ Shiprocket Auth Fail:",
        error.response?.data || error.message,
      );
      cachedToken = null;
      tokenExpiry = null;
      return null;
    } finally {
      tokenPromise = null;
    }
  })();

  return tokenPromise;
};

const clearShiprocketToken = () => {
  cachedToken = null;
  tokenExpiry = null;
};

/**
 * Pincode Serviceability Check
 */
const checkPincode = asyncHandler(async (req, res) => {
  const rawPincode =
    req.params.pincode || req.body.pincode || req.query.pincode;

  if (!rawPincode) {
    throw new ApiError(400, "Pincode is missing!");
  }

  const pincodeStr = String(rawPincode).trim();
  if (!/^\d{6}$/.test(pincodeStr)) {
    throw new ApiError(400, "Pincode must be exactly 6 digits");
  }

  const pickupPincode = Number(
    String(process.env.WAREHOUSE_PINCODE || "").trim(),
  );
  if (isNaN(pickupPincode)) {
    throw new ApiError(500, "Warehouse pincode not configured");
  }

  const weight = Number(req.query.weight) || 0.5;
  const cod = req.query.cod !== undefined ? Number(req.query.cod) : 1;

  let token = await getShiprocketToken();
  if (!token) {
    throw new ApiError(500, "Shipping service currently unavailable");
  }

  const deliveryPincode = Number(pincodeStr);

  const makeRequest = async (authToken) => {
    return await axios.get(
      "https://apiv2.shiprocket.in/v1/external/courier/serviceability/",
      {
        params: {
          pickup_postcode: pickupPincode,
          delivery_postcode: deliveryPincode,
          weight,
          cod,
        },
        headers: { Authorization: `Bearer ${authToken}` },
        timeout: 10000,
      },
    );
  };

  try {
    let response;
    try {
      response = await makeRequest(token);
    } catch (error) {
      if (error.response?.status === 401) {
        clearShiprocketToken();
        token = await getShiprocketToken();
        if (!token) throw new ApiError(500, "Shipping authentication failed");
        response = await makeRequest(token);
      } else {
        throw error;
      }
    }

    const data = response.data.data;

    if (
      !data ||
      !data.available_courier_companies ||
      data.available_courier_companies.length === 0
    ) {
      throw new ApiError(
        400,
        "Pincode not serviceable by our shipping partners",
      );
    }

    const fastest = data.available_courier_companies.sort(
      (a, b) =>
        (a.estimated_delivery_days || 99) - (b.estimated_delivery_days || 99),
    )[0];

    res.status(200).json({
      success: true,
      etd: fastest.etd,
      estimatedDays: fastest.estimated_delivery_days,
      courier: fastest.courier_name,
      is_cod: data.is_cod_available,
    });
  } catch (error) {
    if (error.statusCode) throw error;

    console.error(
      "❌ Shiprocket Serviceability API Error:",
      error.response?.data || error.message,
    );
    throw new ApiError(
      400,
      error.response?.data?.message || "Invalid Pincode or Service Error",
    );
  }
});

module.exports = { checkPincode, getShiprocketToken };
