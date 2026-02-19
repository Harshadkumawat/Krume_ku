import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import orderService from "./orderService";
import { toast } from "react-toastify";

const initialState = {
  orders: [],
  order: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

// -------------------- THUNKS --------------------

export const createOrder = createAsyncThunk(
  "order/create",
  async (orderData, thunkAPI) => {
    try {
      return await orderService.createOrder(orderData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const getMyOrders = createAsyncThunk(
  "order/getMyOrders",
  async (_, thunkAPI) => {
    try {
      return await orderService.getMyOrders();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const getAllOrders = createAsyncThunk(
  "order/getAllOrders",
  async (_, thunkAPI) => {
    try {
      return await orderService.getAllOrders();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const getOrderDetails = createAsyncThunk(
  "order/getDetails",
  async (id, thunkAPI) => {
    try {
      return await orderService.getOrderDetails(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const cancelOrderUser = createAsyncThunk(
  "order/cancel",
  async (id, thunkAPI) => {
    try {
      return await orderService.cancelOrder(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const returnOrder = createAsyncThunk(
  "order/return",
  async ({ id, returnData }, thunkAPI) => {
    try {
      return await orderService.requestReturn(id, returnData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const adminManageReturn = createAsyncThunk(
  "order/adminManageReturn",
  async ({ id, statusData }, thunkAPI) => {
    try {
      return await orderService.manageReturn(id, statusData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

// -------------------- SLICE --------------------

export const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    resetOrderState: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
    clearSingleOrder: (state) => {
      state.order = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* --- 1. CREATE ORDER (Isi me isSuccess TRUE chahiye) --- */
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false; // Reset old success
        state.isError = false;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true; // ✅ Sirf yahan TRUE hona chahiye redirect ke liye
        state.isError = false;
        const newOrder = action.payload?.data || action.payload;
        state.order = newOrder;

        if (newOrder) {
          state.orders.unshift(newOrder);
        }
        toast.success("Order Placed Successfully. 🎉");
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload;
      })

      /* --- 2. GET MY ORDERS (isSuccess MAT lagana) --- */
      .addCase(getMyOrders.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getMyOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        // ❌ state.isSuccess = true;  <-- YE LINE HATA DI (Bug Fix)
        state.isError = false;

        const incomingOrders =
          action.payload?.data ||
          action.payload?.orders ||
          action.payload ||
          [];
        state.orders = incomingOrders;
      })
      .addCase(getMyOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      /* --- 3. GET ALL ORDERS (ADMIN) --- */
      .addCase(getAllOrders.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        // ❌ state.isSuccess = true; <-- YE BHI HATA DI
        state.orders = action.payload.data || action.payload || [];
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      /* --- 4. GET ORDER DETAILS --- */
      .addCase(getOrderDetails.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        // ❌ state.isSuccess = true; <-- YE BHI HATA DI
        state.order = action.payload?.data || action.payload;
      })
      .addCase(getOrderDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      /* --- 5. CANCEL ORDER --- */
      .addCase(cancelOrderUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(cancelOrderUser.fulfilled, (state, action) => {
        state.isLoading = false;
        // Cancel hone par success true rakh sakte hain taaki UI update ho
        // Lekin redirect na ho, isliye dhyan rakhna
        state.isSuccess = true;
        const updatedOrder = action.payload?.data || action.payload;

        if (state.order && state.order._id === updatedOrder._id) {
          state.order.orderStatus = "Cancelled";
        }
        const index = state.orders.findIndex((o) => o._id === updatedOrder._id);
        if (index !== -1) {
          state.orders[index].orderStatus = "Cancelled";
        }
        toast.info("Order Cancelled.");
      })
      .addCase(cancelOrderUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        toast.error(action.payload);
      })

      /* --- 6. USER RETURN REQUEST --- */
      .addCase(returnOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(returnOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const orderId = action.meta.arg.id;

        if (state.order && state.order._id === orderId) {
          state.order.orderStatus = "Return Requested";
          state.order.returnInfo = {
            ...state.order.returnInfo,
            isReturnRequested: true,
            status: "Pending",
          };
        }
        const index = state.orders.findIndex((o) => o._id === orderId);
        if (index !== -1) {
          state.orders[index].orderStatus = "Return Requested";
          state.orders[index].returnInfo = {
            ...state.orders[index].returnInfo,
            isReturnRequested: true,
            status: "Pending",
          };
        }
        toast.info("Return request submitted.");
      })
      .addCase(returnOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        toast.error(action.payload);
      })

      /* --- 7. ADMIN MANAGE RETURN --- */
      .addCase(adminManageReturn.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(adminManageReturn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const orderId = action.meta.arg.id;
        const newStatus = action.meta.arg.statusData.status;

        const index = state.orders.findIndex((o) => o._id === orderId);
        if (index !== -1) {
          state.orders[index].returnInfo.status = newStatus;
          if (newStatus === "Approved")
            state.orders[index].orderStatus = "Return Approved";
          if (newStatus === "Refunded")
            state.orders[index].orderStatus = "Returned";
          if (newStatus === "Rejected")
            state.orders[index].orderStatus = "Delivered";
        }
        toast.success(action.payload?.message || "Status Updated");
      })
      .addCase(adminManageReturn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        toast.error(action.payload);
      });
  },
});

export const { resetOrderState, clearSingleOrder } = orderSlice.actions;
export default orderSlice.reducer;
