
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User } from "@/types";
import { MessageSquare, Mail, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ChatModal } from "@/components/ChatModal";
import { formatDistance } from "date-fns";
import { ptBR } from "date-fns/locale";

const SellerTeamView = () => {
  const { user } = useAuth();
  const [owner, setOwner] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOwnerInfo();
    }
  }, [user]);

  const fetchOwnerInfo = async () => {
    setIsLoading(true);
    try {
      // Get the owner information for this seller
      const { data, error } = await supabase.rpc(
        'get_seller_team',
        { seller_id_param: user!.id }
      );

      if (error) {
        console.error("Error fetching owner info:", error);
        return;
      }

      if (data && Array.isArray(data) && data.length > 0) {
        const ownerData = data[0];
        const ownerUser: User = {
          id: ownerData.id,
          name: ownerData.name || "Proprietário",
          email: ownerData.email || "",
          role: "owner",
          createdAt: new Date(ownerData.created_at),
          avatar_url: ownerData.avatar_url
        };
        setOwner(ownerUser);
      }
    } catch (error) {
      console.error("Error fetching owner info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChat = () => {
    setIsChatModalOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando informações da equipe...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Minha Equipe</CardTitle>
            <CardDescription>
              Informações sobre o proprietário e sua equipe de vendas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {owner ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 border rounded-lg bg-muted/10">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Proprietário</p>
                      <p className="text-lg font-semibold">{owner.name}</p>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Mail className="h-3 w-3 mr-1" />
                        {owner.email}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Membro desde {formatDistance(owner.createdAt, new Date(), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </p>
                    </div>
                  </div>
                  <Button onClick={handleOpenChat}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Enviar Mensagem
                  </Button>
                </div>

                <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    Informações da Equipe
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Você faz parte da equipe de vendas gerenciada por {owner.name}. 
                    Para questões sobre comissões, metas ou outras dúvidas relacionadas à equipe, 
                    entre em contato diretamente através do chat.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <UserIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  Nenhuma equipe encontrada
                </h3>
                <p className="text-sm text-muted-foreground">
                  Você ainda não está associado a nenhuma equipe de vendas. 
                  Entre em contato com um proprietário para se juntar a uma equipe.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ChatModal 
        isOpen={isChatModalOpen}
        onClose={handleCloseChat}
        selectedMember={owner}
      />
    </>
  );
};

export default SellerTeamView;
