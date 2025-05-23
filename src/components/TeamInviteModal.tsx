
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface TeamInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId?: string;
  ownerId?: string;
  ownerName?: string;
}

const TeamInviteModal = ({ isOpen, onClose, teamId, ownerId, ownerName }: TeamInviteModalProps) => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendRequest = async () => {
    if (!user || !ownerId) return;
    
    setIsSubmitting(true);
    
    try {
      // Insert directly using a raw SQL query instead of a table reference
      const { error } = await supabase.rpc('send_direct_message', {
        sender_id_param: user.id,
        sender_name_param: user.name || '',
        receiver_id_param: ownerId,
        message_param: message
      });
        
      if (error) {
        toast({
          title: "Erro ao enviar solicitação",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Solicitação enviada",
        description: `Sua solicitação para participar do time de ${ownerName} foi enviada com sucesso!`,
      });
      
      onClose();
    } catch (error: any) {
      console.error("Error sending team request:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar sua solicitação",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Solicitar integração ao time</DialogTitle>
          <DialogDescription>
            Envie uma solicitação para participar do time de {ownerName || "vendas"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Textarea
              id="message"
              placeholder="Escreva uma mensagem para o proprietário"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSendRequest} disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar solicitação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TeamInviteModal;
