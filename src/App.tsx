
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Landing from "@/pages/Landing";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/Dashboard";
import SalesList from "@/pages/SalesList";
import NewSale from "@/pages/NewSale";
import CommissionDetails from "@/pages/CommissionDetails";
import CommissionSettings from "@/pages/CommissionSettings";
import SellerManagement from "@/pages/SellerManagement"; 
import Inventory from "@/pages/Inventory";
import UserSettings from "@/pages/UserSettings";
import Pricing from "@/pages/Pricing";
import Messages from "@/pages/Messages";
import SalesHistory from "@/pages/SalesHistory";
import PlanManagement from "@/pages/PlanManagement";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Toaster />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/pricing" element={<Pricing />} />
              
              {/* Protected routes with Layout */}
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/sales" element={<SalesList />} />
                <Route path="/sales/new" element={<NewSale />} />
                <Route path="/sales-history" element={<SalesHistory />} />
                <Route path="/commissions" element={<CommissionDetails />} />
                <Route path="/commission-settings" element={<CommissionSettings />} />
                <Route path="/team" element={<SellerManagement />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/settings" element={<UserSettings />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/plan-management" element={<PlanManagement />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
