import api from "../../utils/api";

// PUBLIC — Homepage ke liye active banners
const getActiveBanners = async () => {
  const response = await api.get("/api/banners");
  return response.data;
};

// ADMIN — sab banners (active + inactive), management page ke liye
const getAdminBanners = async () => {
  const response = await api.get("/api/banners/admin");
  return response.data;
};

// ADMIN — naya banner create (multipart form-data — image + fields)
const createBanner = async (formData) => {
  const response = await api.post("/api/banners", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// ADMIN — banner update (image optional, isActive toggle bhi isi se)
const updateBanner = async (id, formData) => {
  const response = await api.put(`/api/banners/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// ADMIN — quick active/inactive toggle (bina image ke, sirf isActive bhejna)
const toggleBannerActive = async (id, isActive) => {
  const response = await api.put(`/api/banners/${id}`, { isActive });
  return response.data;
};

// ADMIN — delete
const deleteBanner = async (id) => {
  const response = await api.delete(`/api/banners/${id}`);
  return response.data;
};

export const bannerService = {
  getActiveBanners,
  getAdminBanners,
  createBanner,
  updateBanner,
  toggleBannerActive,
  deleteBanner,
};
