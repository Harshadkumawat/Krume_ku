import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { productService } from "./productService";

// -------------------- THUNKS --------------------

export const getAllProducts = createAsyncThunk(
  "products/getAll",
  async (filters, thunkAPI) => {
    try {
      const { signal, ...queryFilters } = filters || {};
      return await productService.getAllProducts(queryFilters, signal);
    } catch (error) {
      if (error.name === "AbortError" || error.code === "ERR_CANCELED") {
        return thunkAPI.rejectWithValue(null);
      }
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch products";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const getSingleProduct = createAsyncThunk(
  "products/getSingle",
  async (id, thunkAPI) => {
    try {
      return await productService.getProductById(id);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch product details";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const getHomeData = createAsyncThunk(
  "products/getHomeData",
  async (_, thunkAPI) => {
    try {
      return await productService.getHomeProducts();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch home data";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// -------------------- INITIAL STATE --------------------
const initialState = {
  products: [],

  meta: {
    total: 0,
    page: 1,
    pages: 1,
    hasMore: false,
  },

  singleProduct: null,
  relatedProducts: [],

  homePageData: {
    newArrivals: [],
    featuredProducts: [],
    hotDeals: [],
    premiumCollection: [],
    allProducts: [],
    categorySummary: [],
  },

  isLoading: false,
  isFetchingMore: false,
  isError: false,
  isSuccess: false,
  message: "",

  currentRequestId: null,
};

// Helper for Infinite Scroll deduplication
const deduplicateProducts = (existingProducts, newProducts) => {
  const existingIds = new Set(existingProducts.map((p) => p._id));
  const uniqueNew = newProducts.filter((p) => !existingIds.has(p._id));
  return [...existingProducts, ...uniqueNew];
};

// -------------------- SLICE --------------------
const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isFetchingMore = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },

    clearProductsList: (state) => {
      state.products = [];
      state.meta = initialState.meta;
      state.isError = false;
      state.message = "";
      state.currentRequestId = null;
    },

    clearSingleProduct: (state) => {
      state.singleProduct = null;
      state.relatedProducts = [];
    },
  },
  extraReducers: (builder) => {
    builder // ==========================
    // GET ALL PRODUCTS (Shop Page)
    // ==========================

      .addCase(getAllProducts.pending, (state, action) => {
        const isScrolling = action.meta.arg?.page > 1;
        state.currentRequestId = action.meta.requestId;

        if (isScrolling) {
          state.isFetchingMore = true;
        } else {
          state.isLoading = true;
          state.products = [];
        }
        state.isSuccess = false;
        state.isError = false;
        state.message = "";
      })
      .addCase(getAllProducts.fulfilled, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) {
          return; // Ignore stale request
        }

        state.isLoading = false;
        state.isFetchingMore = false;
        state.isSuccess = true;
        state.isError = false;

        const newProducts = action.payload?.data || [];

        if (action.meta.arg?.page > 1) {
          state.products = deduplicateProducts(state.products, newProducts);
        } else {
          state.products = newProducts;
        }

        if (action.payload?.meta) {
          state.meta = action.payload.meta;
        }
      })
      .addCase(getAllProducts.rejected, (state, action) => {
        if (action.payload === null) {
          state.isFetchingMore = false;
          return;
        }

        state.isLoading = false;
        state.isFetchingMore = false;
        state.isError = true;
        state.message = action.payload;
      }) // ==========================
      // GET SINGLE PRODUCT
      // ==========================
      .addCase(getSingleProduct.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.message = "";
        state.singleProduct = null;
        state.relatedProducts = [];
      })
      .addCase(getSingleProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.singleProduct = action.payload?.data || action.payload;
        state.relatedProducts = action.payload?.related || [];
      })
      .addCase(getSingleProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload;
        state.singleProduct = null;
        state.relatedProducts = [];
      }) // ==========================
      // GET HOME SCREEN DATA
      // ==========================

      .addCase(getHomeData.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.message = "";
      })
      .addCase(getHomeData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.homePageData =
          action.payload?.data || action.payload || initialState.homePageData;
      })
      .addCase(getHomeData.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload;
      });
  },
});

export const { reset, clearProductsList, clearSingleProduct } =
  productSlice.actions;
export default productSlice.reducer;
