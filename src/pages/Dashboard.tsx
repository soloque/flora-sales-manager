
import { useAuth } from "@/context/AuthContext";
import DashboardSummary from "@/components/DashboardSummary";
import SubscriptionBanner from "@/components/SubscriptionBanner";

const Dashboard = () => {
  const { user } = useAuth();
  
  return (
    <div>
      <SubscriptionBanner />
      <DashboardSummary />
    </div>
  );
};

export default Dashboard;
