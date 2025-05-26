import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";

interface NewSaleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sellerId?: string;
  onSaleCreated?: () => void;
}

export function NewSaleModal({ open, onOpenChange, sellerId, onSaleCreated }: NewSaleModalProps) {
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    order: "",
    quantity: 1,
    unitPrice: 0,
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Dados do formulário:", formData);
    
    // Simular salvamento
    alert("Venda registrada com sucesso!");
    
    // Resetar formulário
    setFormData({
      customerName: "",
      customerPhone: "",
      order: "",
      quantity: 1,
      unitPrice: 0,
    });

    onSaleCreated?.();
    onOpenChange(false);
  };

  const totalPrice = formData.quantity * formData.unitPrice;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Nova Venda (Teste)
          </DialogTitle>
          <DialogDescription>
            Versão simplificada para teste
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="customerName">Nome do Cliente *</Label>
            <Input
              id="customerName"
              value={formData.customerName}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              placeholder="Nome completo"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="customerPhone">Telefone *</Label>
            <Input
              id="customerPhone"
              value={formData.customerPhone}
              onChange={(e) => handleInputChange('customerPhone', e.target.value)}
              placeholder="(00) 00000-0000"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="order">Pedido *</Label>
            <Input
              id="order"
              value={formData.order}
              onChange={(e) => handleInputChange('order', e.target.value)}
              placeholder="Descrição do pedido"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
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
            
            <div>
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
          
          <div className="border p-4 rounded-md bg-muted/30">
            <div className="flex justify-between items-center">
              <Label>Valor Total:</Label>
              <span className="text-xl font-bold">
                R$ {totalPrice.toFixed(2)}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              Registrar Venda
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
