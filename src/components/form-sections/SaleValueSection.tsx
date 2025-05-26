
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface SaleValueSectionProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
}

export function SaleValueSection({ formData, handleInputChange }: SaleValueSectionProps) {
  return (
    <div className="border-t pt-4">
      <h3 className="font-medium mb-4">Valor da Venda</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantidade *</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            step="1"
            value={formData.quantity}
            onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="unitPrice">Preço Unitário (R$) *</Label>
          <Input
            id="unitPrice"
            type="number"
            min="0.01"
            step="0.01"
            value={formData.unitPrice}
            onChange={(e) => handleInputChange('unitPrice', parseFloat(e.target.value) || 0)}
            required
          />
        </div>
      </div>
    </div>
  );
}
