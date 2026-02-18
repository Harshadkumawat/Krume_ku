import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { cartService } from "./cartService";
import { logout } from "../auth/authSlice";

// -------------------- ASYNC THUNKS --------------------

export const getCart = createAsyncThunk("cart/getAll", async (_, thunkAPI) => {
  try {
    return await cartService.getCart();
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const addToCart = createAsyncThunk(
  "cart/add",
  async (productData, thunkAPI) => {
    try {
      const response = await cartService.addToCart(productData);
      thunkAPI.dispatch(getCart()); // Sync cart after adding
      return response;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to add item";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const updateCartItem = createAsyncThunk(
  "cart/update",
  async (updateData, thunkAPI) => {
    try {
      const response = await cartService.updateCartItem(updateData);
      thunkAPI.dispatch(getCart()); // Sync cart after update
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Update failed",
      );
    }
  },
);

export const removeCartItem = createAsyncThunk(
  "cart/remove",
  async (itemId, thunkAPI) => {
    try {
      const response = await cartService.removeCartItem(itemId);
      thunkAPI.dispatch(getCart()); // Sync cart after remove
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Remove failed",
      );
    }
  },
);

export const clearCart = createAsyncThunk("cart/clear", async (_, thunkAPI) => {
  try {
    return await cartService.clearCart();
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Clear failed",
    );
  }
});

// -------------------- INITIAL STATE --------------------

const initialState = {
  cartItems: [],
  billDetails: {
    totalItems: 0,
    cartTotalExclTax: 0,
    discountAmount: 0,
    gstAmount: 0,
    shipping: 0,
    finalTotal: 0,
    minOrderLimit: 999,
  },
  appliedCoupon: null,
  shippingAddress: localStorage.getItem("shippingAddress")
    ? JSON.parse(localStorage.getItem("shippingAddress"))
    : {},
  isLoading: false,
  isError: false,
  isSuccess: false,
  couponRemoved: false,
  message: "",
};

// -------------------- SLICE --------------------

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    resetCartState: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.couponRemoved = false;
      state.message = "";
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem("shippingAddress", JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder
      // ==========================
      // GET CART CASES
      // ==========================
      .addCase(getCart.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.isLoading = false;
        const payloadData = action.payload.cart || action.payload.data || {};
        state.cartItems = payloadData.items || payloadData.cartItems || [];
        state.billDetails = payloadData.billDetails || initialState.billDetails;

        if (state.billDetails.discountAmount === 0) {
          state.appliedCoupon = null;
        }
      })
      .addCase(getCart.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ==========================
      // ADD TO CART CASES
      // ==========================
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
      })
      .addCase(addToCart.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = "Item added to cart";
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ==========================
      // UPDATE CART CASES
      // ==========================
      .addCase(updateCartItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (action.payload?.couponRemoved) {
          state.couponRemoved = true;
          state.appliedCoupon = null;
        }
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ==========================
      // REMOVE CART CASES
      // ==========================
      .addCase(removeCartItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (action.payload?.couponRemoved) {
          state.couponRemoved = true;
          state.appliedCoupon = null;
        }
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ==========================
      // CLEAR CART CASES
      // ==========================
      .addCase(clearCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.cartItems = [];
        state.billDetails = initialState.billDetails;
        state.appliedCoupon = null;
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ==========================
      // LOGOUT (Sync with Auth)
      // ==========================
      .addCase(logout.fulfilled, (state) => {
        localStorage.removeItem("shippingAddress");
        return initialState;
      });
  },
});

export const { resetCartState, saveShippingAddress } = cartSlice.actions;
export default cartSlice.reducer;
