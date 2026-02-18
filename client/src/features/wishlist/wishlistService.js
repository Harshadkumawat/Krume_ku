import axios from "axios";


const API_URL = "http://localhost:8080/api/wishlist";

// 1. Get User Wishlist
const getWishlist = async () => {
  const response = await axios.get(API_URL, { withCredentials: true });
  return response.data; 
};

// 2. Add Item
const addToWishlist = async (productId) => {
  const response = await axios.post(
    `${API_URL}/add`,
    { productId }, 
    { withCredentials: true },
  );
  return response.data;
};

// 3. Remove Item
const removeFromWishlist = async (productId) => {
  const response = await axios.put(
    `${API_URL}/remove`,
    { productId },
    { withCredentials: true },
  );
  return response.data;
};

export const wishlistService = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
