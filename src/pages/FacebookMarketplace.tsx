
import { FacebookMessaging } from "@/components/FacebookMessaging";
import { useAuth } from "@/context/AuthContext";

const FacebookMarketplace = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Você precisa estar logado para acessar o Facebook Marketplace.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Facebook Marketplace</h1>
        <p className="text-muted-foreground">
          Gerencie mensagens do Facebook Marketplace com respostas automáticas por IA
        </p>
      </div>
      
      <FacebookMessaging />
    </div>
  );
};

export default FacebookMarketplace;
