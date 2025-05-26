
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Users, 
  ShoppingCart, 
  MessageSquare, 
  Settings, 
  LogOut,
  Home,
  Package,
  FileText,
  CreditCard,
  Crown
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/NotificationBell";
import FloatingActionButton from "@/components/FloatingActionButton";
import PlanStatusBadge from "@/components/PlanStatusBadge";
import { useStripeSubscription } from "@/hooks/useStripeSubscription";

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { openCustomerPortal } = useStripeSubscription();

  const handleSignOut = async () => {
    await logout();
  };

  const handleManageSubscription = () => {
    openCustomerPortal();
  };

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Vendas", href: "/sales", icon: ShoppingCart },
    { name: "Histórico", href: "/sales-history", icon: FileText },
    { name: "Relatórios", href: "/reports", icon: BarChart3 },
    { name: "Equipe", href: "/team", icon: Users },
    { name: "Mensagens", href: "/messages", icon: MessageSquare },
    { name: "Inventário", href: "/inventory", icon: Package },
    { name: "Comissões", href: "/commission-settings", icon: CreditCard },
    { name: "Planos", href: "/plan-management", icon: Crown },
    { name: "Configurações", href: "/settings", icon: Settings },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link to="/dashboard" className="mr-6 flex items-center space-x-2">
              <span className="font-bold text-xl">VendaFlow</span>
            </Link>
          </div>
          
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              {/* Espaço para futuras funcionalidades */}
            </div>
            <nav className="flex items-center space-x-2">
              <NotificationBell />
              <ThemeToggle />
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
                <PlanStatusBadge />
                <Button variant="ghost" size="sm" onClick={handleManageSubscription}>
                  Gerenciar
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                  Sair
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-3.5rem)]">
        {/* Sidebar */}
        <aside className="hidden w-64 flex-col border-r bg-background md:flex">
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-4 text-sm font-medium">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                      isActive ? "bg-muted text-primary" : ""
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="container py-6">
            <Outlet />
          </div>
        </main>
      </div>

      <FloatingActionButton />
    </div>
  );
};

export default Layout;
