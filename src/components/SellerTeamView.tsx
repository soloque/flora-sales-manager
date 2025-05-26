import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "@/types";
import { MessageSquare, Mail, User as UserIcon, Search, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ChatModal } from "@/components/ChatModal";
import { formatDistance } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import TeamInviteModal from "@/components/TeamInviteModal";
import { useIsMobile } from "@/hooks/use-mobile";

const SellerTeamView = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [owner, setOwner] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerSearchResults, setOwnerSearchResults] = useState<User[]>([]);
  const [selectedOwner, setSelectedOwner] = useState<User | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOwnerInfo();
    }
  }, [user]);

  const fetchOwnerInfo = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc(
        'get_seller_team',
        { seller_id_param: user!.id }
      );

      if (error) {
        console.error("Error fetching owner info:", error);
        setOwner(null);
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
      } else {
        setOwner(null);
      }
    } catch (error) {
      console.error("Error fetching owner info:", error);
      setOwner(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchOwner = async () => {
    if (!ownerEmail.trim()) {
      toast({
        title: "Email em branco",
        description: "Por favor, informe um email para buscar",
        variant: "destructive",
      });
      return;
    }
    
    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'owner')
        .ilike('email', `%${ownerEmail}%`);
        
      if (error) {
        toast({
          title: "Erro ao buscar proprietário",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      if (data && data.length > 0) {
        const formattedOwners = data.map(owner => ({
          id: owner.id,
          name: owner.name || "Sem nome",
          email: owner.email || "Sem email",
          role: owner.role as "seller" | "inactive" | "owner",
          createdAt: new Date(owner.created_at),
          avatar_url: owner.avatar_url
        }));
        
        setOwnerSearchResults(formattedOwners);
      } else {
        setOwnerSearchResults([]);
        toast({
          title: "Nenhum resultado",
          description: "Não encontramos proprietários com este email",
        });
      }
    } catch (error) {
      console.error("Error searching owner:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao buscar proprietários",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleOpenChat = () => {
    setIsChatModalOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatModalOpen(false);
  };

  const handleInviteModalClose = () => {
    setShowInviteModal(false);
    setSelectedOwner(null);
    fetchOwnerInfo();
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
      <div className={`space-y-${isMobile ? '4' : '6'} w-full`}>
        <Card className="w-full">
          <CardHeader className={isMobile ? 'p-4' : ''}>
            <CardTitle className={isMobile ? 'text-lg' : ''}>Minha Equipe</CardTitle>
            <CardDescription className={isMobile ? 'text-sm' : ''}>
              {owner 
                ? "Informações sobre o proprietário e sua equipe de vendas"
                : "Procure por um proprietário para se juntar a uma equipe"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className={isMobile ? 'p-4' : ''}>
            {owner ? (
              <div className={`space-y-${isMobile ? '4' : '6'}`}>
                <div className={`flex ${isMobile ? 'flex-col' : 'items-center justify-between'} p-${isMobile ? '4' : '6'} border rounded-lg bg-muted/10 gap-4`}>
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Proprietário</p>
                      <p className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>{owner.name}</p>
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
                  <div className={`flex gap-2 ${isMobile ? 'w-full' : ''}`}>
                    <Button onClick={handleOpenChat} className={isMobile ? 'flex-1' : ''} size={isMobile ? 'sm' : 'default'}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {isMobile ? 'Mensagem' : 'Enviar Mensagem'}
                    </Button>
                  </div>
                </div>

                <div className={`p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20`}>
                  <h3 className={`${isMobile ? 'text-sm' : 'text-sm'} font-semibold text-blue-800 dark:text-blue-200 mb-2`}>
                    Informações da Equipe
                  </h3>
                  <p className={`${isMobile ? 'text-sm' : 'text-sm'} text-blue-700 dark:text-blue-300 mb-4`}>
                    Você faz parte da equipe de vendas gerenciada por {owner.name}. 
                    Para questões sobre comissões, metas ou outras dúvidas relacionadas à equipe, 
                    entre em contato diretamente através do chat.
                  </p>
                  <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-blue-600 dark:text-blue-400 mb-4`}>
                    Nota: Apenas o proprietário pode remover membros da equipe. 
                    Você será notificado caso isso aconteça.
                  </p>
                  
                  <div className={`flex ${isMobile ? 'flex-col' : ''} gap-2`}>
                    <Button asChild size={isMobile ? 'sm' : 'default'} className={isMobile ? 'w-full' : ''}>
                      <Link to="/sales/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Registrar Nova Venda
                      </Link>
                    </Button>
                    <Button variant="outline" asChild size={isMobile ? 'sm' : 'default'} className={isMobile ? 'w-full' : ''}>
                      <Link to="/sales">
                        Minhas Vendas
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`space-y-${isMobile ? '4' : '6'}`}>
                <div className="text-center py-8">
                  <UserIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-muted-foreground mb-2`}>
                    Nenhuma equipe encontrada
                  </h3>
                  <p className={`${isMobile ? 'text-sm' : 'text-sm'} text-muted-foreground mb-6`}>
                    Você ainda não está associado a nenhuma equipe de vendas. 
                    Busque por um proprietário pelo email para enviar uma solicitação.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className={`flex ${isMobile ? 'flex-col' : ''} space-${isMobile ? 'y' : 'x'}-2`}>
                    <Input 
                      placeholder="Email do proprietário" 
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      className={`${isMobile ? 'w-full mb-2' : 'flex-1'}`}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearchOwner()}
                    />
                    <Button 
                      onClick={handleSearchOwner} 
                      disabled={isSearching}
                      className={isMobile ? 'w-full' : ''}
                      size={isMobile ? 'sm' : 'default'}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      {isSearching ? "Buscando..." : "Buscar"}
                    </Button>
                  </div>
                  
                  {ownerSearchResults.length > 0 && (
                    <div className="border rounded-md overflow-x-auto">
                      {isMobile ? (
                        <div className="space-y-3 p-4">
                          {ownerSearchResults.map((owner) => (
                            <div key={owner.id} className="border rounded-lg p-3 space-y-2">
                              <div>
                                <p className="font-medium">{owner.name}</p>
                                <p className="text-sm text-muted-foreground">{owner.email}</p>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                  setSelectedOwner(owner);
                                  setShowInviteModal(true);
                                }}
                              >
                                Solicitar Integração
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nome</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {ownerSearchResults.map((owner) => (
                              <TableRow key={owner.id}>
                                <TableCell>{owner.name}</TableCell>
                                <TableCell>{owner.email}</TableCell>
                                <TableCell className="text-right">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      setSelectedOwner(owner);
                                      setShowInviteModal(true);
                                    }}
                                  >
                                    Solicitar Integração
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  )}
                </div>
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

      <TeamInviteModal 
        isOpen={showInviteModal}
        onClose={handleInviteModalClose}
        ownerId={selectedOwner?.id}
        ownerName={selectedOwner?.name}
      />
    </>
  );
};

export default SellerTeamView;
