// src/App.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingFallback from "./components/LoadingFallback";

// User Pages
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const UserPage = lazy(() => import("./pages/UserPage"));
const CategoryDetailPage = lazy(() => import("./pages/CategoryDetailPage"));
const BookingPage = lazy(() => import("./pages/BookingPage"));
const UserCart = lazy(() => import("./pages/UserCart"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const SubCategoryPage = lazy(() => import("./pages/SubCategoryPage"));
const MyBookingsPage = lazy(() => import("./pages/MyBookingsPage"));
const MyAddressPage = lazy(() => import("./pages/MyAddressPage"));
const UserHelpPage = lazy(() => import("./pages/UserHelpPage"));
const UserWalletPage = lazy(() => import("./pages/UserWalletPage"));
const BookingDetailPage = lazy(() => import("./pages/BookingDetailPage"));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const ChatListPage = lazy(() => import("./pages/ChatListPage"));
const WorkerProfilePage = lazy(() => import("./pages/WorkerProfilePage"));
const AddAddressPage = lazy(() => import("./pages/AddAddressPage"));
const UserProfilePage = lazy(() => import("./pages/UserProfilePage"));
const EditProfilePage = lazy(() => import("./pages/EditProfilePage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const HomeTips = lazy(() => import("./pages/HomeTips"));
const HomeTipDetail = lazy(() => import("./pages/HomeTipDetail"));
const MembershipPlanPage = lazy(() => import("./pages/MembershipPlanPage"));
const AMCPlanPage = lazy(() => import("./pages/AMCPlanPage"));

// Admin Pages
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));
const AdminRegisterPage = lazy(() => import("./pages/AdminRegisterPage"));
const AdminLayout = lazy(() => import("./components/admin-panel/AdminLayout"));


// Worker Auth Pages
const WorkerLoginPage = lazy(() => import("./components/worker-registration/WorkerLoginPage"));
const WorkerDashboard = lazy(() => import("./components/worker-registration/WorkerDashboard"));
const WorkerRegistrationPage = lazy(() => import("./components/worker-registration/WorkerRegistrationPage"));

// Worker Dashboard Pages
const WorkerActiveBookings = lazy(() => import("./worker/active-bookings"));
const WorkerBookingDetails = lazy(() => import("./worker/booking-details"));
const WorkerCompletedBookings = lazy(() => import("./worker/completed-bookings"));
const WorkerPendingBookings = lazy(() => import("./worker/pending-bookings"));
const WorkerProfile = lazy(() => import("./worker/profile"));
const WorkerReviews = lazy(() => import("./worker/reviews"));
const WorkerTotalBookings = lazy(() => import("./worker/total-bookings"));
const WorkerTotalPending = lazy(() => import("./worker/total-pending"));
const WorkerWallet = lazy(() => import("./worker/wallet"));
const WorkerBookings = lazy(() => import("./pages/WorkerBookings"));

import { SocketProvider } from "./context/SocketContext";
import { LocationProvider } from './context/LocationContext';

import AssignWorkerPage from './pages/AssignWorkerPage';

import DashboardContent from "./components/admin-panel/DashboardContent";
import UserAppDashboard from "./components/admin-panel/UserAppDashboard";
import WorkerAppDashboard from "./components/admin-panel/WorkerAppDashboard";
import BookingManagement from "./components/admin-panel/BookingManagement";
import UserManagement from "./components/admin-panel/UserManagement";
import WorkerManagement from "./components/admin-panel/WorkerManagement";
import CategoryManagement from "./components/admin-panel/CategoryManagement";
import ServiceManagement from "./components/admin-panel/ServiceManagement";
import AddCityManagement from "./components/admin-panel/AddCityManagement";
import BannerManagement from "./components/admin-panel/BannerManagement";
import CouponManagement from "./components/admin-panel/CouponManagement";
import CoinsManagement from "./components/admin-panel/CoinsManagement";
import FeeManagement from "./components/admin-panel/FeeManagement";
import FinanceManagement from "./components/admin-panel/FinanceManagement";
import WithdrawalManagement from "./components/admin-panel/WithdrawalManagement";
import HelpManagement from "./components/admin-panel/HelpManagement";
import UserPushNotifications from "./components/admin-panel/UserPushNotifications";
import WorkerPushNotifications from "./components/admin-panel/WorkerPushNotifications";
import EmployeeManagement from "./components/admin-panel/EmployeeManagement";
const PayoutHistory = lazy(() => import("./components/admin-panel/PayoutHistory"));

import HomeTipsManagement from "./components/admin-panel/HomeTipsManagement";
import TestimonialsManagement from "./components/admin-panel/TestimonialsManagement";
const AdminChangePassword = lazy(() => import("./pages/AdminChangePassword"));
const VerifyWorker = lazy(() => import("./pages/VerifyWorker"));

import UserLayout from "./components/UserLayout";

// ... existing imports ...

export default function App() {
  return (
    <SocketProvider>
      <LocationProvider>
        <Toaster />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* USER ROUTES WRAPPED IN LAYOUT */}
            <Route element={<UserLayout />}>
              <Route path="/" element={<UserPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/category/:id" element={<CategoryDetailPage />} />
              <Route path="/subcategory/:id" element={<SubCategoryPage />} />
              <Route path="/booking/:id" element={<BookingPage />} />
              <Route path="/book-worker/service" element={<BookingPage />} />
              <Route path="/worker-profile/:id" element={<WorkerProfilePage />} />

              {/* PROTECTED USER ROUTES */}
              <Route element={<ProtectedRoute allowedRoles={['user']} redirectPath="/login" />}>
                <Route path="/user_cart" element={<UserCart />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/my-bookings" element={<MyBookingsPage />} />
                <Route path="/booking/:id" element={<BookingDetailPage />} />
                <Route path="/my-address" element={<MyAddressPage />} />
                <Route path="/add-address" element={<AddAddressPage />} />
                <Route path="/profile" element={<UserProfilePage />} />
                <Route path="/edit-profile" element={<EditProfilePage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/help" element={<UserHelpPage />} />
                <Route path="/user-wallet" element={<UserWalletPage />} />
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/chat/:bookingId" element={<ChatPage />} />
                <Route path="/chat/:bookingId" element={<ChatPage />} />
                <Route path="/chats" element={<ChatListPage />} />
              </Route>
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/home-tips" element={<HomeTips />} />
              <Route path="/home-tips/:id" element={<HomeTipDetail />} />
              <Route path="/membership-plan" element={<MembershipPlanPage />} />
              <Route path="/marriage-event-package" element={<AMCPlanPage />} />
              <Route path="/verify-worker/:id" element={<VerifyWorker />} />
            </Route>

            {/* ADMIN ROUTES */}
            <Route path="/admin-login" element={<AdminLoginPage />} />
            <Route path="/admin-register" element={<AdminRegisterPage />} />
            <Route element={<ProtectedRoute allowedRoles={['admin', 'superadmin', 'employee']} redirectPath="/admin-login" />}>
              <Route path="/admin-dashboard" element={<AdminLayout />}>
                <Route index element={<DashboardContent />} />
                <Route path="user-app" element={<UserAppDashboard />} />
                <Route path="worker-app" element={<WorkerAppDashboard />} />
                <Route path="bookings" element={<BookingManagement />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="workers" element={<WorkerManagement />} />
                <Route path="categories" element={<CategoryManagement />} />
                <Route path="services" element={<ServiceManagement />} />
                <Route path="cities" element={<AddCityManagement />} />
                <Route path="banners" element={<BannerManagement />} />
                <Route path="coupons" element={<CouponManagement />} />
                <Route path="coins" element={<CoinsManagement />} />
                <Route path="fees" element={<FeeManagement />} />
                <Route path="finance" element={<FinanceManagement />} />
                <Route path="home-tips" element={<HomeTipsManagement />} />
                <Route path="testimonials" element={<TestimonialsManagement />} />
                <Route path="withdrawals" element={<WithdrawalManagement />} />
                <Route path="payout-history" element={<PayoutHistory />} />
                <Route path="help" element={<HelpManagement />} />
                <Route path="notifications/user" element={<UserPushNotifications />} />
                <Route path="notifications/worker" element={<WorkerPushNotifications />} />
                <Route path="employees" element={<EmployeeManagement />} />
                <Route path="change-password" element={<AdminChangePassword />} />
              </Route>
              {/* Assign Worker Page - Outside Layout to take full width/focus */}
              <Route path="/admin/bookings/:id/assign" element={<AssignWorkerPage />} />
            </Route>

            {/* WORKER AUTH */}
            <Route path="/worker-login" element={<WorkerLoginPage />} />
            <Route path="/worker-register" element={<WorkerRegistrationPage />} />

            {/* PROTECTED WORKER ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={['worker', 'admin']} redirectPath="/worker-login" />}>
              <Route path="/worker-dashboard" element={<WorkerDashboard />} />
              <Route path="/worker/active-bookings" element={<WorkerActiveBookings />} />
              <Route path="/worker/booking/:id" element={<WorkerBookingDetails />} />
              <Route path="/worker/completed-bookings" element={<WorkerCompletedBookings />} />
              <Route path="/worker/pending-bookings" element={<WorkerPendingBookings />} />
              <Route path="/worker/profile" element={<WorkerProfile />} />
              <Route path="/worker/reviews" element={<WorkerReviews />} />
              <Route path="/worker/total-bookings" element={<WorkerTotalBookings />} />
              <Route path="/worker/total-pending" element={<WorkerTotalPending />} />
              <Route path="/worker/wallet" element={<WorkerWallet />} />
              <Route path="/worker/my-bookings" element={<WorkerBookings />} />
              <Route path="/worker/chat/:bookingId" element={<ChatPage />} />
              <Route path="/worker/chats" element={<ChatListPage />} />
            </Route>
          </Routes>
        </Suspense>
      </LocationProvider>
    </SocketProvider>
  );
}
