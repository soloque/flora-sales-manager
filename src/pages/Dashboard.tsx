
import { useAuth } from "@/context/AuthContext";
import DashboardSummary from "@/components/DashboardSummary";
import SubscriptionBanner from "@/components/SubscriptionBanner";
import SellerPlanBanner from "@/components/SellerPlanBanner";
import { useExampleData } from "@/hooks/useExampleData";
import ExampleDataBanner from "@/components/ExampleDataBanner";

const Dashboard = () => {
  const { user } = useAuth();
  const isOwner = user?.role === "owner";
  const isSeller = user?.role === "seller";
  const { showExamples, dismissExamples } = useExampleData();
  
  return (
    <div className="space-y-6">
      {/* Example Data Banner */}
      {showExamples && <ExampleDataBanner onDismiss={dismissExamples} />}

      {/* Banner Section */}
      {isOwner && <SubscriptionBanner />}
      {isSeller && <SellerPlanBanner />}

      {/* Discrete Welcome Message */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/10">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <p className="text-lg font-medium text-foreground">
            Olá, <span className="text-primary font-semibold">{user?.name}</span> 👋
          </p>
        </div>
        <p className="text-muted-foreground mt-1 ml-5">
          Bem-vindo de volta! Vamos acompanhar seus resultados hoje.
        </p>
      </div>

      {/* Dashboard Content */}
      <DashboardSummary />
    </div>
  );
};

export default Dashboard;
