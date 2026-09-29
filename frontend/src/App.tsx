import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { ListingDetailPage } from './pages/ListingDetailPage';
import { AISetupBuilderPage } from './pages/AISetupBuilderPage';
import { ClothingModePage } from './pages/ClothingModePage';
import { FurnitureModePage } from './pages/FurnitureModePage';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import { OwnerDashboardPage } from './pages/OwnerDashboardPage';
import { AddListingWizardPage } from './pages/AddListingWizardPage';
import { ChatPage } from './pages/ChatPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { WishlistPage } from './pages/WishlistPage';

// Admin Portal Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminListingsPage } from './pages/admin/AdminListingsPage';
import { AdminDisputesPage } from './pages/admin/AdminDisputesPage';
import { AdminMapPage } from './pages/admin/AdminMapPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              {/* Marketplace Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/listing/:id" element={<ListingDetailPage />} />
              <Route path="/setup-builder" element={<AISetupBuilderPage />} />
              <Route path="/clothing-mode" element={<ClothingModePage />} />
              <Route path="/furniture-mode" element={<FurnitureModePage />} />
              
              {/* User Dashboard & Interactivity */}
              <Route path="/dashboard" element={<CustomerDashboardPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />

              {/* Owner Portal */}
              <Route path="/owner" element={<OwnerDashboardPage />} />
              <Route path="/add-listing" element={<AddListingWizardPage />} />

              {/* Admin Portal (Dedicated layout & route) */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="listings" element={<AdminListingsPage />} />
                <Route path="disputes" element={<AdminDisputesPage />} />
                <Route path="map" element={<AdminMapPage />} />
                <Route path="analytics" element={<AdminAnalyticsPage />} />
              </Route>
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
