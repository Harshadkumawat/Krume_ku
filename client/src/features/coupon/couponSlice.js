import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import couponService from "./couponService";
import { toast } from "react-toastify";

const initialState = {
  coupons: [],
  isLoading: false,
  isMutating: false,
  isSuccess: false,
  isError: false,
  message: "",
};

// ── Thunks ───────────────────────────────────────

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

// ── Slice ────────────────────────────────────────

export const couponSlice = createSlice({
  name: "coupon",
  initialState,
  reducers: {
    resetCouponState: (state) => {
      state.isLoading = false;
      state.isMutating = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // ── GET ALL (fetch → isLoading) ──
      .addCase(getAllCoupons.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "";
      })
      .addCase(getAllCoupons.fulfilled, (state, action) => {
        state.isLoading = false;
        state.coupons = action.payload.data || [];
      })
      .addCase(getAllCoupons.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ── CREATE (mutation → isMutating) ──
      .addCase(createNewCoupon.pending, (state) => {
        state.isMutating = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(createNewCoupon.fulfilled, (state, action) => {
        state.isMutating = false;
        state.isSuccess = true;
        const newCoupon = action.payload.data;
        if (newCoupon) state.coupons.unshift(newCoupon);
        toast.success("Coupon Created! 🚀");
      })
      .addCase(createNewCoupon.rejected, (state, action) => {
        state.isMutating = false;
        state.isError = true;
        state.message = action.payload;
        toast.error(action.payload || "Failed to create coupon");
      })

      // ── UPDATE (mutation → isMutating) ──
      .addCase(updateExistingCoupon.pending, (state) => {
        state.isMutating = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(updateExistingCoupon.fulfilled, (state, action) => {
        state.isMutating = false;
        state.isSuccess = true;
        const updated = action.payload.data;
        if (updated?._id) {
          const index = state.coupons.findIndex((c) => c._id === updated._id);
          if (index !== -1) state.coupons[index] = updated;
        }
        toast.success("Coupon Updated! 🔥");
      })
      .addCase(updateExistingCoupon.rejected, (state, action) => {
        state.isMutating = false;
        state.isError = true;
        state.message = action.payload;
        toast.error(action.payload || "Update failed");
      })

      // ── STATUS TOGGLE (mutation → isMutating) ──
      .addCase(updateCouponStatus.pending, (state) => {
        state.isMutating = true;
      })
      .addCase(updateCouponStatus.fulfilled, (state, action) => {
        state.isMutating = false;
        const updated = action.payload.data;
        if (updated?._id) {
          const index = state.coupons.findIndex((c) => c._id === updated._id);
          if (index !== -1) state.coupons[index] = updated;
        }
        toast.success(
          `Coupon ${updated?.isActive ? "Activated" : "Deactivated"}`,
        );
      })
      .addCase(updateCouponStatus.rejected, (state, action) => {
        state.isMutating = false;
        state.isError = true;
        state.message = action.payload;
        toast.error(action.payload || "Status toggle failed");
      })

      // ── DELETE (mutation → isMutating) ──
      .addCase(deleteCoupon.pending, (state) => {
        state.isMutating = true;
        state.isError = false;
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.isMutating = false;
        state.isSuccess = true;
        state.coupons = state.coupons.filter((c) => c._id !== action.meta.arg);
        toast.success("Coupon Deleted");
      })
      .addCase(deleteCoupon.rejected, (state, action) => {
        state.isMutating = false;
        state.isError = true;
        state.message = action.payload;
        toast.error(action.payload || "Delete failed");
      });
  },
});

export const { resetCouponState } = couponSlice.actions;
export default couponSlice.reducer;
