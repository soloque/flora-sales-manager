
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { NewSaleModal } from "@/components/NewSaleModal";

const FloatingNewSaleButton = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Show the button for owners and sellers
  if (!user || (user.role !== "owner" && user.role !== "seller")) {
    return null;
  }

  const handleSaleCreated = () => {
    // Refresh the page or emit an event to update the sales list
    window.location.reload();
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          size="lg" 
          className="shadow-lg"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Nova Venda
        </Button>
      </div>

      <NewSaleModal 
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSaleCreated={handleSaleCreated}
      />
    </>
  );
};

export default FloatingNewSaleButton;
