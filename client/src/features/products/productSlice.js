import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { productService } from "./productService";

// -------------------- THUNKS --------------------

export const getAllProducts = createAsyncThunk(
  "products/getAll",
  async (filters, thunkAPI) => {
    try {
      return await productService.getProduct(filters);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch products";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const getSingleProduct = createAsyncThunk(
  "products/getSingle",
  async (id, thunkAPI) => {
    try {
      return await productService.singleProduct(id);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
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
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch home data";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// -------------------- STATE --------------------
const initialState = {
  products: [],
  singleProduct: null,
  relatedProducts: [],

  homePageData: {
    newArrivals: [],
    featuredProducts: [],
    hotDeals: [],
    premiumCollection: [],
  },

  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // ==========================
      // GET ALL PRODUCTS (Shop Page)
      // ==========================
      .addCase(getAllProducts.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
      })
      .addCase(getAllProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.products = action.payload.data || action.payload || [];
      })
      .addCase(getAllProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload;
        state.products = [];
      })

      // ==========================
      // GET SINGLE PRODUCT (Details Page)
      // ==========================
      .addCase(getSingleProduct.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
      })
      .addCase(getSingleProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.singleProduct = action.payload.data || action.payload;
        state.relatedProducts = action.payload.related || [];
      })
      .addCase(getSingleProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload;
        state.singleProduct = null;
      })

      // ==========================
      // GET HOME SCREEN DATA
      // ==========================
      .addCase(getHomeData.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
      })
      .addCase(getHomeData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.homePageData = action.payload.data ||
          action.payload || {
            newArrivals: [],
            featuredProducts: [],
            hotDeals: [],
            premiumCollection: [],
          };
      })
      .addCase(getHomeData.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload;
      });
  },
});

export const { reset } = productSlice.actions;
export default productSlice.reducer;
