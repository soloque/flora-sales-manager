
import { useAuth } from "@/context/AuthContext";
import DashboardSummary from "@/components/DashboardSummary";
import SubscriptionBanner from "@/components/SubscriptionBanner";
import SellerPlanBanner from "@/components/SellerPlanBanner";

const Dashboard = () => {
  const { user } = useAuth();
  
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
          Bem-vindo ao VendaFlow
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Gerencie suas vendas de forma inteligente e eficiente com nossa plataforma completa
        </p>
      </div>

      {/* Banner Section */}
      {user?.role === "owner" ? <SubscriptionBanner /> : <SellerPlanBanner />}
      
      {/* Dashboard Content */}
      <DashboardSummary />
    </div>
  );
};

export default Dashboard;
