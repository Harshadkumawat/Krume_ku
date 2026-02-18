import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import couponService from "./couponService";
import { toast } from "react-toastify";
import { getCart } from "../cart/cartSlice";

const initialState = {
  coupons: [],
  appliedCoupon: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
};

// ==========================================
// ⚡ ASYNC THUNKS
// ==========================================

export const applyCoupon = createAsyncThunk(
  "coupon/apply",
  async (couponData, thunkAPI) => {
    try {
      const response = await couponService.applyCoupon(couponData);
      await thunkAPI.dispatch(getCart()); // Sync cart after applying
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const removeCoupon = createAsyncThunk(
  "coupon/remove",
  async (_, thunkAPI) => {
    try {
      const response = await couponService.removeCoupon();
      await thunkAPI.dispatch(getCart()); // Sync cart after removal
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to remove coupon",
      );
    }
  },
);

export const getAllCoupons = createAsyncThunk(
  "coupon/getAll",
  async (_, thunkAPI) => {
    try {
      return await couponService.getAllCoupons();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch coupons",
      );
    }
  },
);

export const createNewCoupon = createAsyncThunk(
  "coupon/create",
  async (data, thunkAPI) => {
    try {
      return await couponService.createCoupon(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to create coupon",
      );
    }
  },
);

export const updateExistingCoupon = createAsyncThunk(
  "coupon/update",
  async ({ id, couponData }, thunkAPI) => {
    try {
      return await couponService.updateCoupon(id, couponData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Update failed",
      );
    }
  },
);

export const updateCouponStatus = createAsyncThunk(
  "coupon/updateStatus",
  async (id, thunkAPI) => {
    try {
      return await couponService.updateCouponStatus(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Status toggle failed",
      );
    }
  },
);

export const deleteCoupon = createAsyncThunk(
  "coupon/delete",
  async (id, thunkAPI) => {
    try {
      return await couponService.deleteCoupon(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Delete failed",
      );
    }
  },
);

// ==========================================
// 📦 SLICE LOGIC
// ==========================================

export const couponSlice = createSlice({
  name: "coupon",
  initialState,
  reducers: {
    resetCouponState: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // --- APPLY COUPON ---
      .addCase(applyCoupon.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.appliedCoupon =
          action.payload?.data?.appliedCoupon || action.payload?.appliedCoupon;
        toast.success("Coupon Applied! 🎉");
      })
      .addCase(applyCoupon.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.appliedCoupon = null;
        state.message = action.payload;
        toast.error(action.payload);
      })

      // --- REMOVE COUPON ---
      .addCase(removeCoupon.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(removeCoupon.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.appliedCoupon = null;
        toast.info("Coupon removed");
      })
      .addCase(removeCoupon.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // --- GET ALL (Admin) ---
      .addCase(getAllCoupons.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllCoupons.fulfilled, (state, action) => {
        state.isLoading = false;
        state.coupons = action.payload.coupons || action.payload.data || [];
      })
      .addCase(getAllCoupons.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // --- CREATE ---
      .addCase(createNewCoupon.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createNewCoupon.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.coupons.unshift(action.payload.coupon || action.payload.data);
        toast.success("Coupon Created! 🚀");
      })
      .addCase(createNewCoupon.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // --- UPDATE ---
      .addCase(updateExistingCoupon.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateExistingCoupon.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const updated = action.payload.coupon || action.payload.data;
        const index = state.coupons.findIndex((c) => c._id === updated._id);
        if (index !== -1) state.coupons[index] = updated;
        toast.success("Coupon Updated! 🔥");
      })
      .addCase(updateExistingCoupon.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // --- STATUS TOGGLE ---
      .addCase(updateCouponStatus.fulfilled, (state, action) => {
        const updated = action.payload.coupon || action.payload.data;
        const index = state.coupons.findIndex((c) => c._id === updated._id);
        if (index !== -1) state.coupons[index].isActive = updated.isActive;
        toast.success(
          `Coupon ${updated.isActive ? "Activated" : "Deactivated"}`,
        );
      })

      // --- DELETE ---
      .addCase(deleteCoupon.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.coupons = state.coupons.filter((c) => c._id !== action.meta.arg);
        toast.success("Coupon Deleted");
      })
      .addCase(deleteCoupon.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetCouponState } = couponSlice.actions;
export default couponSlice.reducer;
