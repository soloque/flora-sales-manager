
import { useAuth } from "@/context/AuthContext";
import DashboardSummary from "@/components/DashboardSummary";
import SubscriptionBanner from "@/components/SubscriptionBanner";
import SellerPlanBanner from "@/components/SellerPlanBanner";

const Dashboard = () => {
  const { user } = useAuth();
  
  return (
    <div>
      {user?.role === "owner" ? <SubscriptionBanner /> : <SellerPlanBanner />}
      <DashboardSummary />
    </div>
  );
};

export default Dashboard;
