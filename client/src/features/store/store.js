// features/store.js
import { configureStore } from "@reduxjs/toolkit";
import auth from "../auth/authSlice";
import admin from "../admin/adminSlice";
import products from "../products/productSlice";
import cart from "../cart/cartSlice";
import wishlist from "../wishlist/wishlistSlice";
import order from "../orders/orderSlice";
import coupon from "../coupon/couponSlice";
import shipping from "../shipping/shippingSlice";
import banners from "../banners/bannerSlice";
import { injectStore } from "../../utils/api";

const store = configureStore({
  reducer: {
    auth,
    admin,
    products,
    coupon,
    cart,
    wishlist,
    order,
    shipping,
    banners,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),

  devTools: import.meta.env.DEV,
});

injectStore(store);

export default store;
