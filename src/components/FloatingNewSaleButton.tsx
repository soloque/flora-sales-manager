
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const FloatingNewSaleButton = () => {
  const { user } = useAuth();
  
  // Show the button for owners and sellers
  if (!user || (user.role !== "owner" && user.role !== "seller")) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button size="lg" asChild className="shadow-lg">
        <Link to="/sales/new">
          <PlusCircle className="h-5 w-5 mr-2" />
          Nova Venda
        </Link>
      </Button>
    </div>
  );
};

export default FloatingNewSaleButton;
