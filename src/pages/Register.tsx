
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun, BarChart3, TrendingUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    navigate("/dashboard");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Senhas não coincidem",
        description: "Verifique se as senhas são iguais.",
      });
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password, name);
      toast({
        title: "Registro realizado com sucesso",
        description: "Você foi registrado com sucesso. Faça login para continuar.",
      });
      navigate("/login");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Falha no registro",
        description: error.message || "Erro ao criar conta. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/10 p-4">
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className="fixed top-4 right-4 h-12 w-12 rounded-xl border-border/50 bg-background/80 backdrop-blur-md"
      >
        {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </Button>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-3 text-primary hover:text-primary/80 transition-all duration-200 group mb-8">
            <div className="relative">
              <div className="bg-gradient-to-br from-primary to-primary/80 p-3 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-200">
                <BarChart3 className="h-6 w-6 text-primary-foreground" />
                <TrendingUp className="h-3 w-3 absolute -top-1 -right-1 text-blue-400 bg-background rounded-full p-0.5" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold leading-none bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                VendaFlow
              </span>
              <span className="text-xs text-muted-foreground leading-none font-medium">
                Gestão de Vendas
              </span>
            </div>
          </Link>
        </div>

        <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="space-y-4 pb-6">
            <CardTitle className="text-2xl font-bold text-center">Criar sua conta</CardTitle>
            <CardDescription className="text-center text-base">
              Preencha os dados abaixo para criar sua conta gratuita
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Nome completo</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Seu nome completo"
                  className="h-12 rounded-xl border-border/50 bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="h-12 rounded-xl border-border/50 bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="********"
                  className="h-12 rounded-xl border-border/50 bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmar senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="********"
                  className="h-12 rounded-xl border-border/50 bg-background/50"
                />
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300" disabled={isLoading}>
                {isLoading ? "Criando conta..." : "Criar conta gratuita"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-0">
            <p className="text-center text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Faça login aqui
              </Link>
            </p>
          </CardFooter>
        </Card>
        
        <div className="text-center">
          <Link to="/" className="text-primary hover:underline text-sm font-medium">
            ← Voltar para página inicial
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
