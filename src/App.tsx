
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
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
import TeamManagement from "@/pages/TeamManagement";
import Inventory from "@/pages/Inventory";
import UserSettings from "@/pages/UserSettings";
import Pricing from "@/pages/Pricing";
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
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/sales" element={<SalesList />} />
                <Route path="/new-sale" element={<NewSale />} />
                {/* Removed redundant routes /sales/new and /sales/history */}
                <Route path="/commissions" element={<CommissionDetails />} />
                <Route path="/commission-settings" element={<CommissionSettings />} />
                <Route path="/sellers" element={<SellerManagement />} />
                <Route path="/teams" element={<TeamManagement />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/settings" element={<UserSettings />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
