
import { Label } from "@/components/ui/label";

interface Seller {
  id: string;
  name: string;
  email: string;
  type: string;
  is_virtual: boolean;
}

interface SaleSummaryProps {
  totalPrice: number;
  commission: number;
  isOwner: boolean;
  formData: any;
  allSellers: Seller[];
}

export function SaleSummary({ 
  totalPrice, 
  commission, 
  isOwner, 
  formData, 
  allSellers 
}: SaleSummaryProps) {
  return (
    <div className="border p-4 rounded-md bg-muted/30">
      <div className="flex justify-between items-center">
        <Label>Valor Total:</Label>
        <span className="text-xl font-bold">
          R$ {totalPrice.toFixed(2)}
        </span>
      </div>
      <div className="flex justify-between items-center mt-2">
        <Label>Comissão (20%):</Label>
        <span>
          R$ {commission.toFixed(2)}
        </span>
      </div>
      {isOwner && formData.assignedSellerId && (
        <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
          <span>Vendedor responsável:</span>
          <span>
            {formData.assignedSellerId === "new" 
              ? formData.newSellerName || "Novo vendedor virtual"
              : allSellers.find(s => s.id === formData.assignedSellerId)?.name || "Você"
            }
          </span>
        </div>
      )}
    </div>
  );
}
