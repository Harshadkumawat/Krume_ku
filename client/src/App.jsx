import React, { useEffect, useState, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";

// Actions & Components
import { fetchCurrentUser } from "./features/auth/authSlice";
import { getCart } from "./features/cart/cartSlice";
import { fetchWishlist } from "./features/wishlist/wishlistSlice";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import GlobalLoader from "./components/GlobalLoader";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/Admin/AdminRoute";

// --- Lazy Loaded Pages ---

// Public Pages
const Home = lazy(() => import("./pages/Home"));
const Registerpage = lazy(() => import("./pages/Login/Register/Registerpage"));
const Loginpage = lazy(() => import("./pages/Login/Register/Loginpage"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ForgotPassword = lazy(() => import("./pages/Admin/ForgotPassword"));

// Product Pages
const Clothes = lazy(() => import("./pages/Clothes"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));

// User Pages
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const Cart = lazy(() => import("./pages/Cart"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Shipping = lazy(() => import("./pages/Shipping"));
const PlaceOrder = lazy(() => import("./pages/PlaceOrder"));
const Orders = lazy(() => import("./pages/Orders"));
const OrderDetails = lazy(() => import("./pages/OrderDetails"));

// Admin Pages
const AdminLayout = lazy(() => import("./pages/Admin/AdminLayout"));
const Dashboard = lazy(() => import("./pages/Admin/Dashboard"));
const AllProducts = lazy(() => import("./pages/Admin/AllProducts"));
const ProductForm = lazy(() => import("./components/Admin/Productform"));
const AdminOrders = lazy(() => import("./pages/Admin/AdminOrders"));
const CouponManager = lazy(() => import("./pages/Admin/CouponManager"));
const UserManagement = lazy(() => import("./pages/Admin/UserManagement"));
const AdminReturnRequests = lazy(
  () => import("./pages/Admin/AdminReturnRequests"),
);

const App = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isAppReady, setIsAppReady] = useState(false);

  // 1. Initial App Load (Auth Check)
  useEffect(() => {
    const initApp = async () => {
      try {
        // User verify karo
        await dispatch(fetchCurrentUser()).unwrap();
      } catch (error) {
        console.log("Guest User Detected");
      } finally {
        setIsAppReady(true);
      }
    };
    initApp();
  }, [dispatch]);

  // 2. Fetch Data on Login (With Safety Checks)
  useEffect(() => {
    if (isAppReady && user && user.role !== "admin") {
      dispatch(getCart());
      dispatch(fetchWishlist());
    }
  }, [user, isAppReady, dispatch]);

  if (!isAppReady) return <GlobalLoader />;

  return (
    <Router>
      <ScrollToTop />

      {/* Navbar (Hidden for Admin) */}
      <Navbar />

      <div className="min-h-screen">
        <Suspense fallback={<GlobalLoader />}>
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Registerpage />} />
            <Route path="/login" element={<Loginpage />} />
            <Route path="/forgot" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* --- Shopping Routes --- */}
            <Route path="/products" element={<Clothes />} />
            <Route path="/product/:id" element={<ProductDetails />} />

            {/* --- Protected Routes (User Only) --- */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/shipping" element={<Shipping />} />
              <Route path="/placeorder" element={<PlaceOrder />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/order/:id" element={<OrderDetails />} />
            </Route>

            {/* --- Admin Routes --- */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="products" element={<AllProducts />} />
                <Route path="product/new" element={<ProductForm />} />
                <Route path="product/:id" element={<ProductForm />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="coupon" element={<CouponManager />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="returns" element={<AdminReturnRequests />} />
              </Route>
            </Route>

            {/* --- 404 Route --- */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>

      {/* Footer (Hidden for Admin) */}
      {user?.role !== "admin" && <Footer />}

      <ToastContainer
        position="top-center"
        autoClose={2000}
        theme="colored"
        hideProgressBar={true}
      />
    </Router>
  );
};

export default App;
