import React, { useEffect, useState, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";

import { fetchCurrentUser } from "./features/auth/authSlice";
import { getCart } from "./features/cart/cartSlice";
import { fetchWishlist } from "./features/wishlist/wishlistSlice";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import GlobalLoader from "./components/GlobalLoader";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/Admin/AdminRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import Policies from "./pages/Policies";

// ── Lazy Loaded Pages ─────────────────────────────────
const Home = lazy(() => import("./pages/Home"));
const Registerpage = lazy(() => import("./pages/Login/Register/Registerpage"));
const Loginpage = lazy(() => import("./pages/Login/Register/Loginpage"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ForgotPassword = lazy(() => import("./pages/Admin/ForgotPassword"));
const Clothes = lazy(() => import("./pages/Clothes"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
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
const Banners = lazy(() => import("./pages/Admin/Banners")); // 🔥 naya banner admin page

// ── Auth Pages (No Navbar/Footer) ─────────────────────
const AUTH_PATHS = ["/login", "/register", "/forgot", "/reset-password"];

const isAuthPage = (pathname) => {
  return AUTH_PATHS.some((path) => pathname.startsWith(path));
};

// ── Layout Wrapper ────────────────────────────────────
const AppLayout = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const showLayout = !isAuthPage(location.pathname);
  const isAdmin = user?.role === "admin";

  return (
    <>
      {showLayout && <Navbar />}

      <main className="min-h-screen">
        <ErrorBoundary>
          <Suspense fallback={<GlobalLoader />}>
            <Routes location={location}>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Registerpage />} />
              <Route path="/login" element={<Loginpage />} />
              <Route path="/forgot" element={<ForgotPassword />} />
              <Route
                path="/reset-password/:token"
                element={<ResetPassword />}
              />
              <Route path="/policies" element={<Policies />} />

              {/* Shopping Routes */}
              <Route path="/products" element={<Clothes />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/item/:id" element={<ProductDetails />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/shipping" element={<Shipping />} />
                <Route path="/placeorder" element={<PlaceOrder />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/order/:id" element={<OrderDetails />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="products" element={<AllProducts />} />
                  <Route path="product/new" element={<ProductForm />} />
                  <Route path="product/:id" element={<ProductForm />} />
                  <Route path="banners" element={<Banners />} />{" "}
                  {/* 🔥 naya route */}
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="coupon" element={<CouponManager />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="returns" element={<AdminReturnRequests />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>

      {showLayout && !isAdmin && <Footer />}
    </>
  );
};

// ── Main App ──────────────────────────────────────────
const App = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initApp = async () => {
      try {
        await dispatch(fetchCurrentUser()).unwrap();
      } catch (error) {
      } finally {
        if (isMounted) setIsAppReady(true);
      }
    };

    initApp();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  useEffect(() => {
    if (isAppReady && user?._id && user.role !== "admin") {
      dispatch(getCart());
      dispatch(fetchWishlist());
    }
  }, [user?._id, isAppReady, dispatch]);

  return (
    <Router>
      <ScrollToTop />
      <AppLayout />
      <ToastContainer
        position="top-center"
        autoClose={2000}
        theme="dark"
        hideProgressBar
      />
    </Router>
  );
};

export default App;
