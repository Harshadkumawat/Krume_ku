import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { wishlistService } from "./wishlistService";
import { toast } from "react-toastify";
import { logout } from "../auth/authSlice";

// -------------------- INITIAL STATE --------------------

const initialState = {
  wishlistItems: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
};

// -------------------- THUNKS --------------------

// 1. Fetch Wishlist
export const fetchWishlist = createAsyncThunk(
  "wishlist/fetch",
  async (_, thunkAPI) => {
    try {
      return await wishlistService.getWishlist();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// 2. Add to Wishlist
export const addToWishlist = createAsyncThunk(
  "wishlist/add",
  async (productId, thunkAPI) => {
    try {
      await wishlistService.addToWishlist(productId);
      thunkAPI.dispatch(fetchWishlist()); // Refresh list
      return productId;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// 3. Remove from Wishlist
export const removeFromWishlist = createAsyncThunk(
  "wishlist/remove",
  async (productId, thunkAPI) => {
    try {
      await wishlistService.removeFromWishlist(productId);
      thunkAPI.dispatch(fetchWishlist()); // Refresh list
      return productId;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// -------------------- SLICE --------------------

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    resetWishlistState: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // ==========================
      // FETCH WISHLIST CASES
      // ==========================
      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.wishlistItems = action.payload.data || action.payload || [];
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ==========================
      // ADD TO WISHLIST CASES
      // ==========================
      .addCase(addToWishlist.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
      })
      .addCase(addToWishlist.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        toast.success("Added to Wishlist! ❤️");
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        toast.error(action.payload);
      })

      // ==========================
      // REMOVE FROM WISHLIST CASES
      // ==========================
      .addCase(removeFromWishlist.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
      })
      .addCase(removeFromWishlist.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        toast.info("Removed from Wishlist");
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        toast.error(action.payload);
      })

      // ==========================
      // LOGOUT (Sync with Auth)
      // ==========================
      .addCase(logout.fulfilled, (state) => {
        return initialState;
      });
  },
});

export const { resetWishlistState } = wishlistSlice.actions;
export default wishlistSlice.reducer;
