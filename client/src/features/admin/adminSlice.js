import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import adminService from "./adminService";

// --- THUNKS ---

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

export const fetchAllOrders = createAsyncThunk(
  "admin/fetchOrders",
  async (_, thunkAPI) => {
    try {
      return await adminService.getAllOrders();
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message,
      );
    }
  },
);

export const updateOrder = createAsyncThunk(
  "admin/updateOrder",
  async ({ id, status }, thunkAPI) => {
    try {
      return await adminService.updateOrderStatus(id, status);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message,
      );
    }
  },
);

export const deleteOrder = createAsyncThunk(
  "admin/deleteOrder",
  async (id, thunkAPI) => {
    try {
      await adminService.deleteOrder(id);
      return id;
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

// --- SLICE ---
const adminSlice = createSlice({
  name: "admin",
  initialState: {
    products: [],
    orders: [],
    stats: {
      totalProducts: 0,
      totalInventoryValue: 0,
      totalUsers: 0,
      totalOrders: 0,
      totalSales: 0,
      latestOrders: [],
      monthlySales: [],
      salesData: [],
    },
    isLoading: false,
    isError: null,
    isSuccess: false,
  },
  reducers: {
    resetAdmin: (state) => {
      state.isLoading = false;
      state.isError = null;
      state.isSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // ==========================
      // 🟢 PRODUCTS ACTIONS
      // ==========================

      // Get Admin Products
      .addCase(getAdminProducts.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = null;
      })
      .addCase(getAdminProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = null;
        state.products = action.payload.data || action.payload;
      })
      .addCase(getAdminProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = action.payload;
      })

      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = null;
        const newProd = action.payload.data || action.payload;
        if (newProd) state.products.unshift(newProd);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = action.payload;
      })

      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = null;
        const updated = action.payload.data || action.payload;
        const index = state.products.findIndex((p) => p._id === updated._id);
        if (index !== -1) state.products[index] = updated;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = action.payload;
      })

      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = null;
        state.products = state.products.filter((p) => p._id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = action.payload;
      })

      // ==========================
      // 🔵 ORDERS ACTIONS
      // ==========================

      // Fetch All Orders
      .addCase(fetchAllOrders.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = null;
        state.orders = action.payload.data || action.payload;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = action.payload;
      })

      // Update Order Status
      .addCase(updateOrder.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = null;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = null;
        const updatedOrder = action.payload.data || action.payload;
        const index = state.orders.findIndex((o) => o._id === updatedOrder._id);
        if (index !== -1) state.orders[index] = updatedOrder;
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = action.payload;
      })

      // Delete Order
      .addCase(deleteOrder.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = null;
        state.orders = state.orders.filter((o) => o._id !== action.payload);
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = action.payload;
      })

      // ==========================
      // 📊 STATS ACTIONS
      // ==========================

      .addCase(fetchStats.pending, (state) => {
        state.isError = null;
        state.isSuccess = false;
        
        if (!state.stats.totalProducts) state.isLoading = true;
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = null;
        const incomingStats = action.payload?.data || action.payload;
        state.stats = { ...state.stats, ...incomingStats };
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = action.payload;
      });
  },
});

export const { resetAdmin } = adminSlice.actions;
export default adminSlice.reducer;
