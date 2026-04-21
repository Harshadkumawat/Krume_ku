import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import adminService from "./adminService";

export const createProduct = createAsyncThunk(
  "admin/createProduct",
  async (formData, thunkAPI) => {
    try {
      return await adminService.createProduct(formData);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message,
      );
    }
  },
);

export const getAdminProducts = createAsyncThunk(
  "admin/getProducts",
  async (_, thunkAPI) => {
    try {
      return await adminService.getAdminProducts();
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message,
      );
    }
  },
);

export const deleteProduct = createAsyncThunk(
  "admin/deleteProduct",
  async (id, thunkAPI) => {
    try {
      await adminService.deleteProduct(id);
      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message,
      );
    }
  },
);

export const updateProduct = createAsyncThunk(
  "admin/updateProduct",
  async ({ id, formData }, thunkAPI) => {
    try {
      return await adminService.updateProduct(id, formData);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message,
      );
    }
  },
);

export const fetchStats = createAsyncThunk(
  "admin/fetchStats",
  async (range, thunkAPI) => {
    try {
      return await adminService.getStats(range);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message,
      );
    }
  },
);

const initialState = {
  products: [],
  stats: {
    totalProducts: 0,
    totalInventoryValue: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalSales: 0,
    returnRequests: 0,
    latestOrders: [],
    salesData: [],
    lowStockProducts: [],
  },
  isLoading: false,
  isError: null,
  isSuccess: false,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    resetAdmin: (state) => {
      state.isLoading = false;
      state.isError = null;
      state.isSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAdminProducts.pending, (state) => {
        state.isLoading = true;
        state.isError = null;
      })
      .addCase(getAdminProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload?.data || action.payload || [];
      })
      .addCase(getAdminProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = action.payload;
      })
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true;
        state.isError = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const newProd = action.payload?.data || action.payload;
        if (newProd) state.products.unshift(newProd);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = action.payload;
      })
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true;
        state.isError = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const updated = action.payload?.data || action.payload;
        if (updated?._id) {
          const index = state.products.findIndex((p) => p._id === updated._id);
          if (index !== -1) state.products[index] = updated;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = action.payload;
      })
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
        state.isError = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.products = state.products.filter((p) => p._id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = action.payload;
      })
      .addCase(fetchStats.pending, (state) => {
        if (!state.stats.totalProducts) state.isLoading = true;
        state.isError = null;
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.isLoading = false;
        const incomingStats = action.payload?.data || action.payload;
        state.stats = { ...state.stats, ...incomingStats };
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = action.payload;
      });
  },
});

export const { resetAdmin } = adminSlice.actions;
export default adminSlice.reducer;
