import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authService } from "./authService";

// -------------------- THUNKS --------------------

export const registerUser = createAsyncThunk(
  "AUTH/REGISTER",
  async (data, thunkAPI) => {
    try {
      return await authService.authRegister(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Registration failed",
      );
    }
  },
);

export const loginUser = createAsyncThunk(
  "AUTH/LOGIN",
  async (data, thunkAPI) => {
    try {
      return await authService.authLogin(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Login failed",
      );
    }
  },
);

export const googleLoginUser = createAsyncThunk(
  "AUTH/GOOGLE_LOGIN",
  async (googleData, thunkAPI) => {
    try {
      return await authService.authGoogle(googleData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Google Login failed",
      );
    }
  },
);

// 🔥 NEW: Isse export karna zaroori tha Dashboard ke liye
export const getAllUsers = createAsyncThunk(
  "AUTH/GET_ALL_USERS",
  async (_, thunkAPI) => {
    try {
      return await authService.getAllUsers();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Fetch users failed",
      );
    }
  },
);

export const logout = createAsyncThunk("AUTH/LOGOUT", async (_, thunkAPI) => {
  try {
    return await authService.authLogout();
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Logout failed",
    );
  }
});

export const fetchCurrentUser = createAsyncThunk(
  "AUTH/FETCH_CURRENT_USER",
  async (_, thunkAPI) => {
    try {
      return await authService.getCurrentUser();
    } catch (error) {
      return thunkAPI.rejectWithValue("Not authenticated");
    }
  },
);

export const resetPassword = createAsyncThunk(
  "AUTH/RESET_PASSWORD",
  async ({ token, password }, thunkAPI) => {
    try {
      return await authService.resetPassword(token, password);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Password reset failed",
      );
    }
  },
);

export const forgotPassword = createAsyncThunk(
  "AUTH/FORGOT_PASSWORD",
  async (email, thunkAPI) => {
    try {
      return await authService.forgotPassword(email);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to send reset email",
      );
    }
  },
);

// -------------------- INITIAL STATE --------------------

const initialState = {
  user: null,
  allUsers: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
};

// -------------------- SLICE --------------------

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // ==========================
      // REGISTER CASES
      // ==========================
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.user = action.payload?.data || action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload;
      })

      // ==========================
      // LOGIN CASES
      // ==========================
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.user = action.payload?.data || action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload;
      })

      // ==========================
      // GOOGLE LOGIN CASES
      // ==========================
      .addCase(googleLoginUser.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
      })
      .addCase(googleLoginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.user = action.payload?.data || action.payload;
      })
      .addCase(googleLoginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload;
      })

      // ==========================
      // GET ALL USERS (Admin Only)
      // ==========================
      .addCase(getAllUsers.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.allUsers = action.payload.data || action.payload;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload;
      })

      // ==========================
      // FETCH CURRENT USER CASES
      // ==========================
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.user = action.payload?.data || action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isSuccess = false;
        state.isError = false;
      })

      // ==========================
      // LOGOUT CASES
      // ==========================
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.allUsers = [];
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = false;
        state.message = "";
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // ==========================
      // RESET PASSWORD CASES
      // ==========================
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.message = "Password reset successfully!";
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload;
      }) // ==========================
      // FORGOT PASSWORD CASES
      // ==========================
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.message =
          action.payload?.message || "Reset link sent to your email!";
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload;
      });
  },
});

export const { reset, setUser } = authSlice.actions;
export default authSlice.reducer;
