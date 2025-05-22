
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import Layout from "./components/Layout";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SalesList from "./pages/SalesList";
import SalesHistory from "./pages/SalesHistory";
import NewSale from "./pages/NewSale";
import Updates from "./pages/Updates";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";
import CommissionSettings from "./pages/CommissionSettings";
import CommissionDetails from "./pages/CommissionDetails";
import Inventory from "./pages/Inventory";
import SellerManagement from "./pages/SellerManagement";
import UserSettings from "./pages/UserSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route
                path="/"
                element={
                  <Layout>
                    <Dashboard />
                  </Layout>
                }
              />
              <Route
                path="/sales"
                element={
                  <Layout>
                    <SalesList />
                  </Layout>
                }
              />
              <Route
                path="/sales/new"
                element={
                  <Layout>
                    <NewSale />
                  </Layout>
                }
              />
              <Route
                path="/sales/history"
                element={
                  <Layout>
                    <SalesHistory />
                  </Layout>
                }
              />
              <Route
                path="/updates"
                element={
                  <Layout>
                    <Updates />
                  </Layout>
                }
              />
              <Route
                path="/commissions"
                element={
                  <Layout>
                    <CommissionDetails />
                  </Layout>
                }
              />
              <Route
                path="/commission-settings"
                element={
                  <Layout>
                    <CommissionSettings />
                  </Layout>
                }
              />
              <Route
                path="/inventory"
                element={
                  <Layout>
                    <Inventory />
                  </Layout>
                }
              />
              <Route
                path="/sellers"
                element={
                  <Layout>
                    <SellerManagement />
                  </Layout>
                }
              />
              <Route
                path="/settings"
                element={
                  <Layout>
                    <UserSettings />
                  </Layout>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
