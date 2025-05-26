
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
  Crown,
  Menu
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/NotificationBell";
import PlanStatusBadge from "@/components/PlanStatusBadge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await logout();
    // Force navigation to login page
    window.location.href = "/login";
  };

  // Filter navigation based on user role
  const getNavigation = () => {
    const baseNavigation = [
      { name: "Dashboard", href: "/dashboard", icon: Home },
      { name: "Vendas", href: "/sales", icon: ShoppingCart },
      { name: "Histórico", href: "/sales-history", icon: FileText },
      { name: "Equipe", href: "/team", icon: Users },
      { name: "Mensagens", href: "/messages", icon: MessageSquare },
      { name: "Configurações", href: "/settings", icon: Settings },
    ];

    // Add owner-specific navigation items
    if (user && user.role === "owner") {
      baseNavigation.splice(5, 0, 
        { name: "Inventário", href: "/inventory", icon: Package },
        { name: "Comissões", href: "/commission-settings", icon: CreditCard },
        { name: "Planos", href: "/plan-management", icon: Crown }
      );
    }

    // Add "Nova Venda" only for sellers (not owners)
    if (user && user.role !== "owner") {
      baseNavigation.splice(2, 0, { 
        name: "Nova Venda", 
        href: "/sales/new", 
        icon: BarChart3
      });
    }

    return baseNavigation;
  };

  const navigation = getNavigation();

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
    );
  }

  const NavigationItems = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;
        const Component = mobile ? "div" : "div";
        
        return (
          <Component key={item.name}>
            <Link
              to={item.href}
              onClick={mobile ? () => setIsMobileMenuOpen(false) : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary ${
                isActive ? "bg-muted text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          </Component>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="flex items-center gap-4">
            {/* Mobile menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex flex-col gap-4 mt-6">
                  <div className="px-3">
                    <h2 className="mb-2 text-lg font-semibold">Menu</h2>
                  </div>
                  <nav className="grid gap-1">
                    <NavigationItems mobile />
                  </nav>
                </div>
              </SheetContent>
            </Sheet>

            <Link to="/dashboard" className="flex items-center space-x-2">
              <span className="font-bold text-xl">VendaFlow</span>
            </Link>
          </div>
          
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <NotificationBell />
              <ThemeToggle />
              <div className="hidden sm:flex items-center space-x-2">
                <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                  {user.email}
                </span>
                <PlanStatusBadge />
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Sair</span>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 flex-col border-r bg-background">
          <div className="flex-1 overflow-auto py-4">
            <nav className="grid items-start px-4 text-sm font-medium gap-1">
              <NavigationItems />
            </nav>
          </div>
          
          {/* Quick Actions at bottom of sidebar - only for sellers */}
          {user.role !== "owner" && (
            <div className="border-t p-4">
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Ações Rápidas
                </h3>
                <Button size="sm" className="w-full justify-start" asChild>
                  <Link to="/sales/new">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Nova Venda
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <Link to="/messages">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Mensagens
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="container py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
