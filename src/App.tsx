import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Button } from "./components/ui/button";
import { AppLayout } from "./components/layout/AppLayout";
import { Dashboard } from "./pages/Dashboard";
import { LoginPage } from "./pages/Login";
import Products from "./pages/Products";
import ProductView from "./pages/ProductView";
import Orders from "./pages/Orders";
import OrderView from "./pages/OrderView";
import Transactions from "./pages/Transactions";
import Refund from "./pages/Refund";
import Customers from "./pages/Customers";
import CustomerReviews from "./pages/CustomerReviews";
import Profile from "./pages/Profile";
import Report from "./pages/Report";
import CategoryPage from "./pages/Category";
import ContactEnquiries from "./pages/ContactEnquiries";

import { SidebarProvider } from "./context/SidebarContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ResetPasswordPage } from "./pages/ResetPassword";
import { VerifyOTPPage } from "./pages/VerifyOTP";
import { ForgotPasswordPage } from "./pages/ForgotPassword";
import HelpCenterPage from "./pages/HelpCenterPage";
import DiscountPage from "./pages/Discount";
import ProductRentLease from "./pages/ProductRentLease";
import DeliveryChargePage from "./pages/DeliveryCharges";

// App.tsx - Update ProtectedRoute component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Store the attempted URL for redirect after login
    const currentPath = window.location.pathname + window.location.search;
    sessionStorage.setItem("redirectAfterLogin", currentPath);
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Public Route wrapper
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <div className="flex min-h-screen items-center justify-center bg-muted/10 p-4">
              <LoginPage />
            </div>
          </PublicRoute>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <div className="flex min-h-screen items-center justify-center bg-muted/10 p-4">
              <ForgotPasswordPage />
            </div>
          </PublicRoute>
        }
      />

      <Route
        path="/verify-otp"
        element={
          <PublicRoute>
            <div className="flex min-h-screen items-center justify-center bg-muted/10 p-4">
              <VerifyOTPPage />
            </div>
          </PublicRoute>
        }
      />

      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <div className="flex min-h-screen items-center justify-center bg-muted/10 p-4">
              <ResetPasswordPage />
            </div>
          </PublicRoute>
        }
      />

      {/* Dashboard */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Help Center */}
      <Route
        path="/help"
        element={
          <ProtectedRoute>
            <AppLayout>
              <HelpCenterPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Products List */}
      <Route
        path="/admin/products"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Products />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/discounts"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DiscountPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/products/:id"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ProductView />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Profile />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Orders />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders/:id"
        element={
          <ProtectedRoute>
            <AppLayout>
              <OrderView />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/rent-lease"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ProductRentLease />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/transactions"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Transactions />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/category"
        element={
          <ProtectedRoute>
            <AppLayout>
              <CategoryPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/delivery-charges"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DeliveryChargePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/refunds"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Refund />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/customers"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Customers />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/customer-reviews"
        element={
          <ProtectedRoute>
            <AppLayout>
              <CustomerReviews />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/contact-enquiries"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ContactEnquiries />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/report"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Report />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold">404</h1>
                  <p className="text-muted-foreground">Page not found</p>
                  <Button
                    className="mt-4"
                    onClick={() => (window.location.href = "/")}
                  >
                    Go Home
                  </Button>
                </div>
              </div>
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <SidebarProvider>
            <AppRoutes />
          </SidebarProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
