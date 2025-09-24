import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { theme } from './config/theme';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { BookingProvider } from './context/BookingContext';
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { HomePage } from './pages/HomePage';
import { BookingPage } from './pages/BookingPage';
import { LocationPickerPage } from './pages/LocationPickerPage';
import { ChooseServicePage } from './pages/ChooseServicePage';
import { ReviewBookingPage } from './pages/ReviewBookingPage';
import { PaymentPage } from './pages/PaymentPage';
import { BookingConfirmedPage } from './pages/BookingConfirmedPage';
import { ReferEarnPage } from './pages/ReferEarnPage';
import { OrdersPage } from './pages/OrdersPage';
import { ProfilePage } from './pages/ProfilePage';
import { AddressSetupPage } from './pages/AddressSetupPage';
import { ProfileSetupPage } from './pages/ProfileSetupPage';
import { ManageAddressesPage } from './pages/ManageAddressesPage';
import { BookingDetailsPage } from './pages/BookingDetailsPage';
import { ApiTestPage } from './pages/ApiTestPage';
import { PaymentCallbackPage } from './pages/PaymentCallbackPage';
import { PaymentSuccessPage } from './pages/PaymentSuccessPage';
import { PaymentFailedPage } from './pages/PaymentFailedPage.tsx';
import { AppBottomNavigation } from './components/common/BottomNavigation';
import './styles/globals.scss';

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route 
        path="/auth" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />} 
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/address-setup"
        element={
          <ProtectedRoute>
            <AddressSetupPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile-setup"
        element={
          <ProtectedRoute>
            <ProfileSetupPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manage-addresses"
        element={
          <ProtectedRoute>
            <ManageAddressesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/location-picker"
        element={
          <ProtectedRoute>
            <LocationPickerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/choose-service"
        element={
          <ProtectedRoute>
            <ChooseServicePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking"
        element={
          <ProtectedRoute>
            <BookingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/review-booking"
        element={
          <ProtectedRoute>
            <ReviewBookingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment"
        element={
          <ProtectedRoute>
            <PaymentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment/callback"
        element={
          <ProtectedRoute>
            <PaymentCallbackPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment/success"
        element={
          <ProtectedRoute>
            <PaymentSuccessPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment/failed"
        element={
          <ProtectedRoute>
            <PaymentFailedPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking-confirmed"
        element={
          <ProtectedRoute>
            <BookingConfirmedPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking-details/:bookingId"
        element={
          <ProtectedRoute>
            <BookingDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/refer-earn"
        element={
          <ProtectedRoute>
            <ReferEarnPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/api-test"
        element={
          <ProtectedRoute>
            <ApiTestPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <LocationProvider>
          <BookingProvider>
            <Router>
              <AppRoutes />
              <AppBottomNavigation />
            </Router>
          </BookingProvider>
        </LocationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;