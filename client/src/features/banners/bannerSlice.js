import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { bannerService } from "./bannerService";

// ── Thunks ─────────────────────────────────────────────

export const fetchActiveBanners = createAsyncThunk(
  "banners/fetchActive",
  async (_, { rejectWithValue }) => {
    try {
      return await bannerService.getActiveBanners();
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load banners",
      );
    }
  },
);

export const fetchAdminBanners = createAsyncThunk(
  "banners/fetchAdmin",
  async (_, { rejectWithValue }) => {
    try {
      return await bannerService.getAdminBanners();
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load banners",
      );
    }
  },
);

export const createBanner = createAsyncThunk(
  "banners/create",
  async (formData, { rejectWithValue }) => {
    try {
      return await bannerService.createBanner(formData);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create banner",
      );
    }
  },
);

export const updateBanner = createAsyncThunk(
  "banners/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await bannerService.updateBanner(id, formData);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update banner",
      );
    }
  },
);

export const toggleBannerActive = createAsyncThunk(
  "banners/toggleActive",
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      return await bannerService.toggleBannerActive(id, isActive);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update status",
      );
    }
  },
);

export const deleteBanner = createAsyncThunk(
  "banners/delete",
  async (id, { rejectWithValue }) => {
    try {
      await bannerService.deleteBanner(id);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete banner",
      );
    }
  },
);

// ── Slice ──────────────────────────────────────────────
const initialState = {
  list: [], // admin management list
  activeBanners: [], // homepage ke liye
  isLoading: false,
  isSubmitting: false,
  error: null,
};

const bannerSlice = createSlice({
  name: "banners",
  initialState,
  reducers: {
    clearBannerError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch active (homepage)
      .addCase(fetchActiveBanners.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActiveBanners.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeBanners = action.payload.data || [];
      })
      .addCase(fetchActiveBanners.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // fetch admin list
      .addCase(fetchAdminBanners.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminBanners.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload.data || [];
      })
      .addCase(fetchAdminBanners.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // create
      .addCase(createBanner.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createBanner.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.list.unshift(action.payload.data);
      })
      .addCase(createBanner.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // update
      .addCase(updateBanner.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(updateBanner.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const idx = state.list.findIndex(
          (b) => b._id === action.payload.data._id,
        );
        if (idx !== -1) state.list[idx] = action.payload.data;
      })
      .addCase(updateBanner.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // toggle active
      .addCase(toggleBannerActive.fulfilled, (state, action) => {
        const idx = state.list.findIndex(
          (b) => b._id === action.payload.data._id,
        );
        if (idx !== -1) state.list[idx] = action.payload.data;
      })

      // delete
      .addCase(deleteBanner.fulfilled, (state, action) => {
        state.list = state.list.filter((b) => b._id !== action.payload);
      });
  },
});

export const { clearBannerError } = bannerSlice.actions;
export default bannerSlice.reducer;
