
import { useAuth } from "@/context/AuthContext";
import DashboardSummary from "@/components/DashboardSummary";

const Dashboard = () => {
  const { user } = useAuth();
  
  return (
    <div>
      <DashboardSummary />
    </div>
  );
};

export default Dashboard;
