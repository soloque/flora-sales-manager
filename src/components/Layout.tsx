
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { Logo } from "@/components/Logo";
import { 
  Home, 
  ShoppingCart, 
  Users, 
  Package, 
  LogOut, 
  DollarSign,
  MessageSquare,
  BarChart3,
  Menu,
  X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const isOwner = user?.role === "owner";

  // Check for unread messages
  useEffect(() => {
    if (!user) return;

    const fetchUnreadCount = async () => {
      try {
        const { data, error } = await supabase
          .from('direct_messages')
          .select('id')
          .eq('receiver_id', user.id)
          .eq('read', false);

        if (error) throw error;
        setUnreadCount(data?.length || 0);
      } catch (error) {
        console.error("Error fetching unread messages:", error);
      }
    };

    fetchUnreadCount();

    const channel = supabase
      .channel('unread_messages')
      .on('postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `receiver_id=eq.${user.id}`
        },
        () => {
          fetchUnreadCount();
        }
      )
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'direct_messages',
          filter: `receiver_id=eq.${user.id}`
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleMessagesClick = () => {
    navigate("/messages");
    setIsMobileMenuOpen(false);
  };

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home, show: true },
    { name: "Vendas", href: "/sales", icon: ShoppingCart, show: true },
    { name: "Comissões", href: "/commissions", icon: DollarSign, show: true },
    { name: "Configurar Comissões", href: "/commission-settings", icon: BarChart3, show: isOwner },
    { name: "Gerenciar Vendedores", href: "/sellers", icon: Users, show: isOwner },
    { name: "Estoque", href: "/inventory", icon: Package, show: isOwner },
  ];

  // Don't show layout on login/register pages
  if (location.pathname === "/login" || location.pathname === "/register") {
    return <>{children}</>;
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <Card className="w-full max-w-md mx-4 shadow-xl border-0 bg-card/80 backdrop-blur-sm">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-8">
              <div className="space-y-3">
                <h2 className="text-3xl font-bold tracking-tight">Acesso Necessário</h2>
                <p className="text-muted-foreground text-lg">
                  Você precisa estar logado para acessar esta página.
                </p>
              </div>
              <div className="flex gap-4 justify-center">
                <Button asChild className="flex-1 h-12 text-base font-medium">
                  <Link to="/login">Fazer Login</Link>
                </Button>
                <Button variant="outline" asChild className="flex-1 h-12 text-base font-medium">
                  <Link to="/register">Registrar</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md shadow-sm border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="h-10 w-10 p-0 rounded-xl"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>

            {/* Logo */}
            <div className="flex items-center">
              <Logo />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              {navigation.filter(item => item.show).map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    <span className="hidden lg:inline">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right side items */}
            <div className="flex items-center space-x-3">
              {/* Messages Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleMessagesClick}
                className="relative h-11 px-4 rounded-xl border-border/50 hover:bg-accent/50 transition-all duration-200"
              >
                <MessageSquare className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline font-medium">Mensagens</span>
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-bold shadow-lg"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </Button>
              
              {/* User menu */}
              <div className="flex items-center space-x-3 bg-accent/30 rounded-xl p-2">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-sm">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block">
                    <p className="text-sm font-semibold leading-none">{user.name}</p>
                    <p className="text-xs text-muted-foreground capitalize mt-1">{user.role}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout} 
                  className="h-10 w-10 p-0 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-card/95 backdrop-blur-md">
            <div className="px-4 pt-4 pb-6 space-y-2">
              {navigation.filter(item => item.show).map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-4 rounded-xl text-base font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-4" />
                    {item.name}
                  </Link>
                );
              })}
              
              {/* Mobile Messages Button */}
              <button
                onClick={handleMessagesClick}
                className="flex items-center w-full px-4 py-4 rounded-xl text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
              >
                <MessageSquare className="h-5 w-5 mr-4" />
                Mensagens
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-auto shadow-lg">
                    {unreadCount}
                  </Badge>
                )}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-8 px-6 lg:px-8">
        <div className="space-y-8">
          {children}
        </div>
      </main>

      {/* Floating Action Button */}
      <FloatingActionButton />
    </div>
  );
};

export default Layout;
