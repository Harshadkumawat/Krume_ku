import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { shippingService } from "./shippingService";

// -------------------- THUNKS --------------------

export const getShippingDetails = createAsyncThunk(
  "SHIPPING/CHECK",
  async (pincode, thunkAPI) => {
    try {
      return await shippingService.checkPincode(pincode);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          "Service not available at this pincode",
      );
    }
  },
);

// -------------------- INITIAL STATE --------------------

const initialState = {
  deliveryInfo: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
};

// -------------------- SLICE --------------------

const shippingSlice = createSlice({
  name: "shipping",
  initialState,
  reducers: {
    resetShipping: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
      state.deliveryInfo = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ==========================
      // CHECK PINCODE / SHIPPING DETAILS
      // ==========================
      .addCase(getShippingDetails.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.message = "";
      })
      .addCase(getShippingDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.deliveryInfo = action.payload.data || action.payload;
        state.message = action.payload?.message || "Pincode is serviceable!";
      })
      .addCase(getShippingDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.message = action.payload;
        state.deliveryInfo = null;
      });
  },
});

export const { resetShipping } = shippingSlice.actions;
export default shippingSlice.reducer;
