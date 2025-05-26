import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/NotificationBell";
import { Logo } from "@/components/Logo";
import { 
  LogOut, 
  BarChart3, 
  ShoppingCart, 
  DollarSign, 
  Settings, 
  Users, 
  Package, 
  MessageSquare,
  History,
  CreditCard,
  HelpCircle,
  Bot
} from "lucide-react";

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  const isOwner = user.role === "owner";
  const isSeller = user.role === "seller";

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: BarChart3,
      show: true
    },
    {
      name: "Vendas",
      href: "/sales",
      icon: ShoppingCart,
      show: true
    },
    {
      name: "Histórico",
      href: "/sales-history",
      icon: History,
      show: true
    },
    {
      name: "Comissões",
      href: "/commissions",
      icon: DollarSign,
      show: true
    },
    {
      name: "Equipe",
      href: "/team",
      icon: Users,
      show: isOwner || isSeller
    },
    {
      name: "Estoque",
      href: "/inventory",
      icon: Package,
      show: isOwner
    },
    {
      name: "Mensagens",
      href: "/messages",
      icon: MessageSquare,
      show: true
    },
    {
      name: "Bot Automático",
      href: "/autobot",
      icon: Bot,
      show: true
    },
    {
      name: "Planos",
      href: "/plan-management",
      icon: CreditCard,
      show: isOwner
    },
    {
      name: "Ajuda",
      href: "/help",
      icon: HelpCircle,
      show: true
    },
    {
      name: "Configurações",
      href: "/settings",
      icon: Settings,
      show: true
    }
  ];

  const handleSignOut = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <Logo />
            <span className="font-semibold text-lg">PlantPro</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <NotificationBell />
            <ThemeToggle />
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {user.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-muted/10 min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-2">
            {navigation
              .filter(item => item.show)
              .map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
