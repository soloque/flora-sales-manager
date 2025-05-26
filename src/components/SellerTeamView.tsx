
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@/types";
import { MessageSquare, Mail, User as UserIcon, LogOut, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ChatModal } from "@/components/ChatModal";
import { formatDistance } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TeamInviteModal from "@/components/TeamInviteModal";

const SellerTeamView = () => {
  const { user } = useAuth();
  const [owner, setOwner] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<User | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

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
      } else {
        setOwner(null);
      }
    } catch (error) {
      console.error("Error fetching owner info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (!user || !owner) return;

    try {
      // Remove seller from team
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('seller_id', user.id)
        .eq('owner_id', owner.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Equipe abandonada",
        description: `Você saiu da equipe de ${owner.name} com sucesso.`,
      });

      // Reset state to show search interface
      setOwner(null);
      setSearchEmail("");
      setSearchResults([]);
    } catch (error: any) {
      console.error("Error leaving team:", error);
      toast({
        variant: "destructive",
        title: "Erro ao sair da equipe",
        description: error.message || "Ocorreu um erro ao tentar sair da equipe.",
      });
    }
  };

  const handleSearchOwner = async () => {
    if (!searchEmail.trim()) {
      toast({
        variant: "destructive",
        title: "Email obrigatório",
        description: "Digite o email do proprietário para buscar.",
      });
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'owner')
        .ilike('email', `%${searchEmail.trim()}%`);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const owners = data.map(owner => ({
          id: owner.id,
          name: owner.name || "Sem nome",
          email: owner.email || "",
          role: "owner" as const,
          createdAt: new Date(owner.created_at),
          avatar_url: owner.avatar_url
        }));
        setSearchResults(owners);
      } else {
        setSearchResults([]);
        toast({
          title: "Nenhum resultado",
          description: "Não foram encontrados proprietários com este email.",
        });
      }
    } catch (error: any) {
      console.error("Error searching owners:", error);
      toast({
        variant: "destructive",
        title: "Erro na busca",
        description: error.message || "Ocorreu um erro ao buscar proprietários.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleRequestToJoin = (owner: User) => {
    setSelectedOwner(owner);
    setIsInviteModalOpen(true);
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
              {owner 
                ? "Informações sobre o proprietário e sua equipe de vendas"
                : "Busque por um proprietário para se juntar a uma equipe"
              }
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
                  <div className="flex gap-2">
                    <Button onClick={handleOpenChat}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Enviar Mensagem
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <LogOut className="h-4 w-4 mr-2" />
                          Sair da Equipe
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Sair da Equipe</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja sair da equipe de {owner.name}? 
                            Você não poderá mais registrar vendas através desta equipe 
                            e precisará solicitar uma nova integração para voltar.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={handleLeaveTeam}>
                            Sair da Equipe
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
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
              <div className="space-y-6">
                <div className="text-center py-8">
                  <UserIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                    Nenhuma equipe encontrada
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Você não está associado a nenhuma equipe de vendas. 
                    Busque por um proprietário para enviar uma solicitação.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="search-email">Buscar Proprietário</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="search-email"
                        type="email"
                        placeholder="Digite o email do proprietário"
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearchOwner()}
                      />
                      <Button onClick={handleSearchOwner} disabled={isSearching}>
                        <Search className="h-4 w-4 mr-2" />
                        {isSearching ? "Buscando..." : "Buscar"}
                      </Button>
                    </div>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {searchResults.map((owner) => (
                            <TableRow key={owner.id}>
                              <TableCell>{owner.name}</TableCell>
                              <TableCell>{owner.email}</TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleRequestToJoin(owner)}
                                >
                                  Solicitar Integração
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
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
        isOpen={isInviteModalOpen}
        onClose={() => {
          setIsInviteModalOpen(false);
          setSelectedOwner(null);
          // Refresh owner info after sending request
          fetchOwnerInfo();
        }}
        ownerId={selectedOwner?.id}
        ownerName={selectedOwner?.name}
      />
    </>
  );
};

export default SellerTeamView;
