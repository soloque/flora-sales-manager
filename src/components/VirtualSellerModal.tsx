
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface VirtualSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const VirtualSellerModal = ({ isOpen, onClose, onSuccess }: VirtualSellerModalProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Nome é obrigatório."
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('virtual_sellers')
        .insert({
          name: formData.name.trim(),
          email: formData.email.trim() || null,
          owner_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Vendedor virtual criado",
        description: `${formData.name} foi criado como vendedor virtual.`
      });

      setFormData({ name: "", email: "" });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao criar vendedor virtual:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível criar o vendedor virtual."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: "", email: "" });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Vendedor Virtual</DialogTitle>
          <DialogDescription>
            Crie um vendedor virtual que não precisa de login no sistema. 
            Você poderá atribuir vendas a este vendedor.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Vendedor *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nome completo"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email (opcional)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="email@exemplo.com"
            />
            <p className="text-xs text-muted-foreground">
              Email é opcional. Vendedores virtuais não fazem login no sistema.
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Vendedor
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VirtualSellerModal;
