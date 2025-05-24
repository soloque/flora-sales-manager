
import { useAuth } from "@/context/AuthContext";
import { DashboardSummary } from "@/components/DashboardSummary";

const Dashboard = () => {
  const { user } = useAuth();
  const isOwner = user?.role === "owner";
  
  return (
    <div>
      <DashboardSummary isOwner={isOwner} />
    </div>
  );
};

export default Dashboard;
