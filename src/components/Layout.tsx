
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { NotificationBell } from "@/components/NotificationBell";
import { 
  Home, 
  ShoppingCart, 
  Users, 
  Package, 
  Settings, 
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
    { name: "Configurações", href: "/settings", icon: Settings, show: true },
  ];

  // Don't show layout on login/register pages
  if (location.pathname === "/login" || location.pathname === "/register") {
    return <>{children}</>;
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <h2 className="text-2xl font-bold">Acesso Necessário</h2>
              <p className="text-muted-foreground">
                Você precisa estar logado para acessar esta página.
              </p>
              <div className="flex gap-3 justify-center">
                <Button asChild className="flex-1">
                  <Link to="/login">Fazer Login</Link>
                </Button>
                <Button variant="outline" asChild className="flex-1">
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="h-9 w-9 p-0"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>

            {/* Logo */}
            <div className="flex items-center">
              <Link to="/dashboard" className="text-xl font-bold text-primary hover:text-primary/80 transition-colors">
                VendaFlow
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-2">
              {navigation.filter(item => item.show).map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === item.href
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
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
                className="relative h-9"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Mensagens</span>
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </Button>

              <NotificationBell />
              
              {/* User menu */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="h-9 w-9 p-0">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-card">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.filter(item => item.show).map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-3 rounded-md text-base font-medium transition-colors ${
                      location.pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
              
              {/* Mobile Messages Button */}
              <button
                onClick={handleMessagesClick}
                className="flex items-center w-full px-3 py-3 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <MessageSquare className="h-5 w-5 mr-3" />
                Mensagens
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {unreadCount}
                  </Badge>
                )}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
