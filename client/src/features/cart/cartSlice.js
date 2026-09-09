import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { cartService } from "./cartService";
import { logout } from "../auth/authSlice";

const getStoredShippingAddress = () => {
  try {
    const stored = localStorage.getItem("shippingAddress");
    return stored ? JSON.parse(stored) : {};
  } catch {
    localStorage.removeItem("shippingAddress");
    return {};
  }
};

const extractCartData = (payload) => {
  const data = payload?.data || payload || {};
  return {
    items: data.items || [],
    billDetails: data.billDetails || null,
    appliedCoupon: data.appliedCoupon || null,
    couponRemoved: data.couponRemoved || false,
  };
};

// ── Thunks ──────────────────────────────────────

export const getCart = createAsyncThunk("cart/getAll", async (_, thunkAPI) => {
  try {
    return await cartService.getCart();
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || error.message,
    );
  }
});

export const addToCart = createAsyncThunk(
  "cart/add",
  async (productData, thunkAPI) => {
    try {
      return await cartService.addToCart(productData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const updateCartItem = createAsyncThunk(
  "cart/update",
  async (updateData, thunkAPI) => {
    try {
      return await cartService.updateCartItem(updateData);
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
      return await cartService.removeCartItem(itemId);
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

export const applyCoupon = createAsyncThunk(
  "cart/applyCoupon",
  async (couponData, thunkAPI) => {
    try {
      return await cartService.applyCoupon(couponData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const removeCoupon = createAsyncThunk(
  "cart/removeCoupon",
  async (_, thunkAPI) => {
    try {
      return await cartService.removeCoupon();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to remove coupon",
      );
    }
  },
);

// ── Initial State ───────────────────────────────

const initialState = {
  cartItems: [],
  billDetails: {
    totalItems: 0,
    cartTotalExclTax: 0,
    discountAmount: 0,
    gstAmount: 0,
    shipping: 0,
    finalTotal: 0,
  },
  appliedCoupon: null,
  shippingAddress: getStoredShippingAddress(),
  isLoading: false,
  isError: false,
  isSuccess: false,
  couponRemoved: false,
  message: "",
};


const applyCartData = (state, action) => {
  const { items, billDetails, appliedCoupon, couponRemoved } = extractCartData(
    action.payload,
  );
  state.isLoading = false;
  state.isError = false;
  state.cartItems = items;
  if (billDetails) state.billDetails = billDetails;
  state.appliedCoupon = appliedCoupon;
  if (couponRemoved) {
    state.couponRemoved = true;
    state.appliedCoupon = null;
  }
};

// ── Slice ───────────────────────────────────────

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

      // ── GET CART ──
      .addCase(getCart.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "";
      })
      .addCase(getCart.fulfilled, (state, action) => {
        applyCartData(state, action);
      })
      .addCase(getCart.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        applyCartData(state, action);
        state.isSuccess = true;
        state.message = "Item added to cart";
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload;
      })

      .addCase(updateCartItem.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "";
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        applyCartData(state, action);
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      .addCase(removeCartItem.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "";
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        applyCartData(state, action);
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ── CLEAR CART ──
      .addCase(clearCart.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(clearCart.fulfilled, (state) => {
        return {
          ...initialState,
          shippingAddress: state.shippingAddress,
        };
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ── APPLY COUPON ──
      .addCase(applyCoupon.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        applyCartData(state, action);
        state.isSuccess = true;
      })
      .addCase(applyCoupon.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload;
      })

      // ── REMOVE COUPON ──
      .addCase(removeCoupon.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(removeCoupon.fulfilled, (state, action) => {
        applyCartData(state, action);
        state.isSuccess = true;
        state.appliedCoupon = null;
      })
      .addCase(removeCoupon.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload;
      })

      // ── LOGOUT ──
      .addCase(logout.fulfilled, () => {
        localStorage.removeItem("shippingAddress");
        return initialState;
      });
  },
});

export const { resetCartState, saveShippingAddress } = cartSlice.actions;
export default cartSlice.reducer;
