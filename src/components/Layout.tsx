
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Moon, Sun, User, Home, FileText, Settings, Bell, LogOut, Database, BarChart } from "lucide-react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    // Close mobile sidebar when navigating
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !location.pathname.includes("/login")) {
      navigate("/login");
    }
  }, [isAuthenticated, location, navigate]);

  if (!isAuthenticated && !location.pathname.includes("/login")) {
    return null; // Will redirect to login
  }

  // Skip layout for login and register pages
  if (location.pathname.includes("/login") || location.pathname.includes("/register")) {
    return <>{children}</>;
  }

  const ownerLinks = [
    { name: "Dashboard", path: "/", icon: <Home className="w-5 h-5" /> },
    { name: "Vendas", path: "/sales", icon: <FileText className="w-5 h-5" /> },
    { name: "Financeiro", path: "/finance", icon: <BarChart className="w-5 h-5" /> },
    { name: "Vendedores", path: "/sellers", icon: <User className="w-5 h-5" /> },
    { name: "Estoque", path: "/inventory", icon: <Database className="w-5 h-5" /> },
    { name: "Atualizações", path: "/updates", icon: <Bell className="w-5 h-5" /> },
    { name: "Configurações", path: "/settings", icon: <Settings className="w-5 h-5" /> },
  ];

  const sellerLinks = [
    { name: "Dashboard", path: "/", icon: <Home className="w-5 h-5" /> },
    { name: "Vendas", path: "/sales", icon: <FileText className="w-5 h-5" /> },
    { name: "Nova Venda", path: "/sales/new", icon: <FileText className="w-5 h-5" /> },
    { name: "Comissões", path: "/commissions", icon: <BarChart className="w-5 h-5" /> },
    { name: "Atualizações", path: "/updates", icon: <Bell className="w-5 h-5" /> },
    { name: "Configurações", path: "/settings", icon: <Settings className="w-5 h-5" /> },
  ];

  const links = user?.role === "owner" ? ownerLinks : sellerLinks;

  const sidebarWidth = isSidebarCollapsed ? "w-16" : "w-64";
  const sidebarClass = isMobile
    ? `fixed left-0 top-0 z-40 h-full transform transition-transform duration-300 ease-in-out ${
        isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } w-64`
    : `${sidebarWidth} transition-all duration-300 ease-in-out h-screen`;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Backdrop for mobile sidebar */}
      {isMobile && isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`bg-sidebar text-sidebar-foreground ${sidebarClass}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <div className={`flex items-center ${isSidebarCollapsed ? "justify-center" : ""}`}>
              {!isSidebarCollapsed && (
                <span className="text-xl font-bold">Plant Sales</span>
              )}
              {isSidebarCollapsed && (
                <span className="text-xl font-bold">PS</span>
              )}
            </div>
            {!isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
                className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                {isSidebarCollapsed ? "→" : "←"}
              </Button>
            )}
          </div>

          <div className="flex-grow overflow-y-auto py-4">
            <nav>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className={`flex items-center px-4 py-3 ${
                        location.pathname === link.path
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground"
                      } ${isSidebarCollapsed ? "justify-center" : ""}`}
                    >
                      <span className="mr-3">{link.icon}</span>
                      {!isSidebarCollapsed && <span>{link.name}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="p-4 border-t border-sidebar-border">
            <div className={`flex items-center ${isSidebarCollapsed ? "justify-center" : "justify-between"}`}>
              {!isSidebarCollapsed && (
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-sm opacity-75">
                    {user?.role === "owner" ? "Administrador" : "Vendedor"}
                  </p>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <header className="bg-background border-b p-4 flex justify-between items-center">
          {isMobile && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setMobileSidebarOpen(true)}
              className="mr-2"
            >
              ☰
            </Button>
          )}
          <h1 className="text-2xl font-bold">
            {links.find((link) => link.path === location.pathname)?.name || "Dashboard"}
          </h1>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="ml-auto"
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
