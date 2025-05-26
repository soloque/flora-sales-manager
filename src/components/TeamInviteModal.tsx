
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { validateTeamMembership } from "@/utils/databaseValidation";

interface TeamInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownerId?: string;
  ownerName?: string;
}

const TeamInviteModal = ({ isOpen, onClose, ownerId, ownerName }: TeamInviteModalProps) => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !ownerId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Informações de usuário ou proprietário não encontradas."
      });
      return;
    }

    if (!message.trim()) {
      toast({
        variant: "destructive",
        title: "Mensagem obrigatória",
        description: "Por favor, escreva uma mensagem para o proprietário."
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Check if user is already a team member of this owner
      const isAlreadyMember = await validateTeamMembership(user.id, ownerId);
      
      if (isAlreadyMember) {
        toast({
          variant: "destructive",
          title: "Já é membro",
          description: "Você já faz parte desta equipe."
        });
        setIsSubmitting(false);
        return;
      }

      // Check if there's already a pending request
      const { data: existingRequest, error: requestError } = await supabase
        .from('team_requests')
        .select('*')
        .eq('seller_id', user.id)
        .eq('owner_id', ownerId)
        .eq('status', 'pending')
        .maybeSingle();

      if (requestError && requestError.code !== 'PGRST116') {
        throw requestError;
      }

      if (existingRequest) {
        toast({
          variant: "destructive",
          title: "Solicitação já enviada",
          description: "Você já tem uma solicitação pendente para este proprietário."
        });
        setIsSubmitting(false);
        return;
      }

      // Get user profile info
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      // Send team request using the database function
      const { error } = await supabase.rpc('send_team_request', {
        seller_id_param: user.id,
        seller_name_param: profile.name || user.email || 'Vendedor',
        owner_id_param: ownerId,
        message_param: message.trim()
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Solicitação enviada",
        description: `Sua solicitação foi enviada para ${ownerName || 'o proprietário'} com sucesso!`
      });

      setMessage("");
      onClose();
    } catch (error: any) {
      console.error("Error sending team request:", error);
      toast({
        variant: "destructive",
        title: "Erro ao enviar solicitação",
        description: error.message || "Ocorreu um erro ao enviar a solicitação."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar Integração</DialogTitle>
          <DialogDescription>
            Envie uma solicitação para se juntar à equipe de {ownerName || 'este proprietário'}.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              placeholder="Escreva uma mensagem explicando por que você gostaria de se juntar à equipe..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Esta mensagem será enviada para o proprietário junto com sua solicitação.
            </p>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar Solicitação"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TeamInviteModal;
