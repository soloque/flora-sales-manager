
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { User } from "@/types";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { createNotification } from "@/services/notificationService";

interface SellerActionsProps {
  seller: User;
  onDeleteSuccess: () => void;
}

export function SellerDeleteConfirm({ seller, onDeleteSuccess }: SellerActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmId, setConfirmId] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmId !== seller.id) {
      toast({
        variant: "destructive",
        title: "ID incorreto",
        description: "Por favor, digite o ID do vendedor corretamente para confirmar."
      });
      return;
    }

    setIsDeleting(true);
    try {
      // First remove team memberships
      await supabase
        .from('team_members')
        .delete()
        .eq('seller_id', seller.id);
        
      // Then deactivate the user by changing role to 'inactive'
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'inactive' })
        .eq('id', seller.id);
        
      if (error) throw error;
      
      // Create notification for the seller about being removed
      await createNotification(
        seller.id,
        "Removido da equipe",
        "Você foi removido da equipe pelo proprietário. Suas vendas foram mantidas no sistema.",
        "status_change"
      );
      
      toast({
        title: "Vendedor removido",
        description: `${seller.name} foi removido do time e notificado. As vendas foram mantidas.`
      });
      
      setIsOpen(false);
      onDeleteSuccess();
    } catch (error) {
      console.error("Error removing seller:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível remover o vendedor. Tente novamente."
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button 
        variant="destructive" 
        size="sm"
        onClick={() => setIsOpen(true)}
      >
        Excluir
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription className="pt-2">
              <p className="mb-4">
                Esta ação removerá <strong>{seller.name}</strong> do time e desativará sua conta.
                O vendedor será notificado automaticamente. As vendas registradas serão mantidas.
              </p>
              <div className="my-4 p-2 bg-destructive/10 border border-destructive rounded-md">
                <p className="mb-2 font-medium">ID do vendedor: {seller.id}</p>
                <p className="text-sm text-muted-foreground">
                  Para confirmar a exclusão, digite o ID acima no campo abaixo:
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-id">ID de confirmação</Label>
                <Input
                  id="confirm-id"
                  value={confirmId}
                  onChange={(e) => setConfirmId(e.target.value)}
                  placeholder="Digite o ID do vendedor para confirmar"
                />
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting || confirmId !== seller.id}
            >
              {isDeleting ? "Excluindo..." : "Excluir vendedor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
