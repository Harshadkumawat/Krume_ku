import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import orderService from "./orderService";
import { toast } from "react-toastify";

const extractOrder = (payload) => payload?.data || payload;
const extractOrders = (payload) =>
  payload?.data || payload?.orders || payload || [];

const replaceOrder = (state, updatedOrder) => {
  if (!updatedOrder?._id) return;

  const index = state.orders.findIndex((o) => o._id === updatedOrder._id);
  if (index !== -1) {
    state.orders[index] = updatedOrder;
  }

  if (state.order?._id === updatedOrder._id) {
    state.order = updatedOrder;
  }
};

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

export const getAllOrders = createAsyncThunk(
  "order/getAllOrders",
  async (params = {}, thunkAPI) => {
    try {
      return await orderService.getAllOrders(params);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const updateOrderStatus = createAsyncThunk(
  "order/updateStatus",
  async ({ id, status }, thunkAPI) => {
    try {
      return await orderService.updateOrderStatus(id, status);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const deleteOrder = createAsyncThunk(
  "order/delete",
  async (id, thunkAPI) => {
    try {
      return await orderService.deleteOrder(id);
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

const initialState = {
  orders: [],
  order: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  isMutating: false,
  message: "",
  orderCreated: false,
};

export const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    resetOrderState: (state) => {
      state.isLoading = false;
      state.isMutating = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
      state.orderCreated = false;
    },
    clearSingleOrder: (state) => {
      state.order = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.isMutating = true;
        state.isSuccess = false;
        state.isError = false;
        state.message = "";
        state.orderCreated = false;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isMutating = false;
        state.isSuccess = true;
        state.orderCreated = true;
        const newOrder = extractOrder(action.payload);
        state.order = newOrder;
        if (newOrder?._id) {
          state.orders.unshift(newOrder);
        }
        toast.success("Order Placed Successfully. 🎉");
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isMutating = false;
        state.isError = true;
        state.orderCreated = false;
        state.message = action.payload;
        toast.error(action.payload || "Order placement failed!");
      })
      .addCase(getMyOrders.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "";
      })
      .addCase(getMyOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = extractOrders(action.payload);
      })
      .addCase(getMyOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getAllOrders.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "";
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = extractOrders(action.payload);
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getOrderDetails.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "";
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.order = extractOrder(action.payload);
      })
      .addCase(getOrderDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(cancelOrderUser.pending, (state) => {
        state.isMutating = true;
        state.isError = false;
        state.message = "";
      })
      .addCase(cancelOrderUser.fulfilled, (state, action) => {
        state.isMutating = false;
        state.isSuccess = true;
        const updatedOrder = extractOrder(action.payload);
        replaceOrder(state, updatedOrder);
        toast.info("Order Cancelled.");
      })
      .addCase(cancelOrderUser.rejected, (state, action) => {
        state.isMutating = false;
        state.isError = true;
        state.message = action.payload;
        toast.error(action.payload || "Cancel failed!");
      })
      .addCase(returnOrder.pending, (state) => {
        state.isMutating = true;
        state.isError = false;
        state.message = "";
      })
      .addCase(returnOrder.fulfilled, (state, action) => {
        state.isMutating = false;
        state.isSuccess = true;
        const updatedOrder = extractOrder(action.payload);
        replaceOrder(state, updatedOrder);
        toast.info("Return request submitted.");
      })
      .addCase(returnOrder.rejected, (state, action) => {
        state.isMutating = false;
        state.isError = true;
        state.message = action.payload;
        toast.error(action.payload || "Return request failed!");
      })
      .addCase(adminManageReturn.pending, (state) => {
        state.isMutating = true;
        state.isError = false;
        state.message = "";
      })
      .addCase(adminManageReturn.fulfilled, (state, action) => {
        state.isMutating = false;
        state.isSuccess = true;
        const updatedOrder = extractOrder(action.payload);
        replaceOrder(state, updatedOrder);
        toast.success(action.payload?.message || "Return status updated");
      })
      .addCase(adminManageReturn.rejected, (state, action) => {
        state.isMutating = false;
        state.isError = true;
        state.message = action.payload;
        toast.error(action.payload || "Return management failed!");
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.isMutating = true;
        state.isError = false;
        state.message = "";
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isMutating = false;
        state.isSuccess = true;
        const updatedOrder = extractOrder(action.payload);
        replaceOrder(state, updatedOrder);
        toast.success("Order status updated");
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.isMutating = false;
        state.isError = true;
        state.message = action.payload;
        toast.error(action.payload || "Status update failed!");
      })
      .addCase(deleteOrder.pending, (state) => {
        state.isMutating = true;
        state.isError = false;
        state.message = "";
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.isMutating = false;
        state.isSuccess = true;
        const deletedId = action.meta.arg;
        state.orders = state.orders.filter((o) => o._id !== deletedId);
        if (state.order?._id === deletedId) {
          state.order = null;
        }
        toast.success("Order deleted");
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.isMutating = false;
        state.isError = true;
        state.message = action.payload;
        toast.error(action.payload || "Delete failed!");
      });
  },
});

export const { resetOrderState, clearSingleOrder } = orderSlice.actions;
export default orderSlice.reducer;
