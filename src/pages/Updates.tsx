
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Edit, Trash } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Update } from "@/types";

// Mock updates data
const mockUpdates: Update[] = [
  {
    id: "1",
    title: "Novas plantas disponíveis",
    content: "Temos novos tipos de plantas frutíferas disponíveis para venda, incluindo pitanga e acerola. Entre em contato para mais informações.",
    createdAt: new Date(),
    authorId: "1", 
    authorName: "Admin User",
    isHighlighted: true
  },
  {
    id: "2",
    title: "Atualização de comissões",
    content: "A partir do próximo mês, as comissões serão atualizadas para 22% para todos os vendedores.",
    createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
    authorId: "1",
    authorName: "Admin User",
    isHighlighted: false
  },
  {
    id: "3",
    title: "Problemas de entrega em Angra",
    content: "Informamos que não estamos mais realizando entregas na região de Angra dos Reis devido a problemas logísticos.",
    createdAt: new Date(Date.now() - 86400000 * 5), // 5 days ago
    authorId: "1",
    authorName: "Admin User",
    isHighlighted: true
  }
];

const Updates = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isOwner = user?.role === "owner";
  const [updates, setUpdates] = useState<Update[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isHighlighted, setIsHighlighted] = useState(false);
  
  useEffect(() => {
    // In a real app, this would fetch data from an API
    setUpdates(mockUpdates);
  }, []);
  
  const resetForm = () => {
    setTitle("");
    setContent("");
    setIsHighlighted(false);
    setIsCreating(false);
    setIsEditing(null);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !content) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Título e conteúdo são obrigatórios.",
      });
      return;
    }
    
    if (isEditing) {
      // Update existing update
      const updatedUpdates = updates.map(update => {
        if (update.id === isEditing) {
          return {
            ...update,
            title,
            content,
            isHighlighted,
            updatedAt: new Date(),
          };
        }
        return update;
      });
      
      setUpdates(updatedUpdates);
      toast({
        title: "Atualizado com sucesso",
        description: "A atualização foi modificada.",
      });
    } else {
      // Create new update
      const newUpdate: Update = {
        id: `update-${Date.now()}`,
        title,
        content,
        createdAt: new Date(),
        authorId: user?.id || "",
        authorName: user?.name || "",
        isHighlighted,
      };
      
      setUpdates([newUpdate, ...updates]);
      toast({
        title: "Criado com sucesso",
        description: "A nova atualização foi publicada.",
      });
    }
    
    resetForm();
  };
  
  const handleEdit = (update: Update) => {
    setTitle(update.title);
    setContent(update.content);
    setIsHighlighted(update.isHighlighted);
    setIsEditing(update.id);
    setIsCreating(true);
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  const handleDelete = (id: string) => {
    // In a real app, this would make an API call
    setUpdates(updates.filter(update => update.id !== id));
    
    toast({
      title: "Excluído com sucesso",
      description: "A atualização foi removida.",
    });
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  
  return (
    <div className="space-y-6">
      {isOwner && (
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Atualizações para Vendedores</h2>
          {!isCreating ? (
            <Button onClick={() => setIsCreating(true)}>Nova Atualização</Button>
          ) : (
            <Button variant="outline" onClick={resetForm}>Cancelar</Button>
          )}
        </div>
      )}
      
      {isCreating && isOwner && (
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Editar Atualização" : "Nova Atualização"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form id="updateForm" onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título da atualização"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Detalhes da atualização..."
                  className="min-h-[150px]"
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="highlight"
                  checked={isHighlighted}
                  onCheckedChange={setIsHighlighted}
                />
                <Label htmlFor="highlight">Destacar (importante)</Label>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
            <Button type="submit" form="updateForm">
              {isEditing ? "Atualizar" : "Publicar"}
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {(!isCreating || !isOwner) && (
        <div className="space-y-6">
          {updates.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Bell className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">Nenhuma atualização disponível</h3>
                <p className="text-muted-foreground text-center">
                  {isOwner
                    ? "Crie a primeira atualização para seus vendedores."
                    : "O administrador ainda não publicou atualizações."}
                </p>
              </CardContent>
            </Card>
          ) : (
            updates.map((update) => (
              <Card 
                key={update.id} 
                className={update.isHighlighted ? "border-primary" : ""}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        {update.isHighlighted && (
                          <span className="mr-2 inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
                            Importante
                          </span>
                        )}
                        {update.title}
                      </CardTitle>
                      <div className="text-sm text-muted-foreground mt-1">
                        Por {update.authorName} • {formatDate(update.createdAt)}
                      </div>
                    </div>
                    {isOwner && (
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(update)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(update.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    {update.content.split('\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Updates;
