import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authService } from "./authService";

// ── Thunks ───────────────────────────────────────────────────

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

export const getUserStats = createAsyncThunk(
  "AUTH/GET_USER_STATS",
  async (_, thunkAPI) => {
    try {
      return await authService.getUserStats();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Fetch user stats failed",
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

export const updateProfile = createAsyncThunk(
  "AUTH/UPDATE_PROFILE",
  async (userData, thunkAPI) => {
    try {
      return await authService.updateProfile(userData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Profile update failed",
      );
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

export const addUserAddress = createAsyncThunk(
  "AUTH/ADD_ADDRESS",
  async (addressData, thunkAPI) => {
    try {
      return await authService.addUserAddress(addressData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to add address",
      );
    }
  },
);

export const updateUserAddress = createAsyncThunk(
  "AUTH/UPDATE_ADDRESS",
  async ({ id, addressData }, thunkAPI) => {
    try {
      return await authService.updateUserAddress(id, addressData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update address",
      );
    }
  },
);

export const deleteUserAddress = createAsyncThunk(
  "AUTH/DELETE_ADDRESS",
  async (id, thunkAPI) => {
    try {
      return await authService.deleteUserAddress(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to delete address",
      );
    }
  },
);

// ── Helpers ──────────────────────────────────────────────────

const extractUser = (payload) => payload?.data || payload;

const mergeAddresses = (state, action) => {
  state.isMutating = false;
  state.isSuccess = true;
  if (state.user && action.payload?.data) {
    state.user.addresses = action.payload.data;
  }
};

// ── Slice ────────────────────────────────────────────────────

const initialState = {
  user: null,
  allUsers: [],
  userStats: null,
  isLoading: false,
  isMutating: false,
  isSuccess: false,
  isError: false,
  message: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isMutating = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
      state.allUsers = [];
      state.userStats = null;
      state.isLoading = false;
      state.isMutating = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Register ──────────────────────────────
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "";
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = extractUser(action.payload);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ── Login ─────────────────────────────────
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = extractUser(action.payload);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ── Google Login ──────────────────────────
      .addCase(googleLoginUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "";
      })
      .addCase(googleLoginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = extractUser(action.payload);
      })
      .addCase(googleLoginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ── Logout ────────────────────────────────
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.allUsers = [];
        state.userStats = null;
        state.isLoading = false;
        state.isMutating = false;
        state.isSuccess = false;
        state.isError = false;
        state.message = "";
      })
      .addCase(logout.rejected, (state) => {
        state.user = null;
        state.allUsers = [];
        state.userStats = null;
        state.isLoading = false;
        state.isMutating = false;
        state.isSuccess = false;
        state.isError = false;
        state.message = "";
      })

      // ── Fetch Current User ────────────────────
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = extractUser(action.payload);
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.message = action.payload || "";
      })

      // ── Update Profile ────────────────────────
      .addCase(updateProfile.pending, (state) => {
        state.isMutating = true;
        state.isError = false;
        state.message = "";
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isMutating = false;
        state.isSuccess = true;
        state.user = extractUser(action.payload);
        state.message = "Profile updated successfully!";
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isMutating = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ── Forgot Password ──────────────────────
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "";
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload?.message || "Reset link sent!";
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ── Reset Password ───────────────────────
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "";
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const userData = extractUser(action.payload);
        if (userData?._id) {
          state.user = userData;
          state.message = "Password reset successful! You are now logged in.";
        } else {
          state.message = "Password reset successfully!";
        }
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ── Get All Users (Admin) ────────────────
      .addCase(getAllUsers.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allUsers = action.payload?.data || action.payload || [];
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ── Get User Stats (Admin) ───────────────
      .addCase(getUserStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userStats = action.payload?.data || action.payload;
      })
      .addCase(getUserStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ── Add Address ──────────────────────────
      .addCase(addUserAddress.pending, (state) => {
        state.isMutating = true;
        state.isError = false;
      })
      .addCase(addUserAddress.fulfilled, mergeAddresses)
      .addCase(addUserAddress.rejected, (state, action) => {
        state.isMutating = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ── Update Address ───────────────────────
      .addCase(updateUserAddress.pending, (state) => {
        state.isMutating = true;
        state.isError = false;
      })
      .addCase(updateUserAddress.fulfilled, mergeAddresses)
      .addCase(updateUserAddress.rejected, (state, action) => {
        state.isMutating = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ── Delete Address ───────────────────────
      .addCase(deleteUserAddress.pending, (state) => {
        state.isMutating = true;
        state.isError = false;
      })
      .addCase(deleteUserAddress.fulfilled, mergeAddresses)
      .addCase(deleteUserAddress.rejected, (state, action) => {
        state.isMutating = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
