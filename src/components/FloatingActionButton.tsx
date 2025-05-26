
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/NotificationBell";
import { Settings, Plus, X } from "lucide-react";
import { Link } from "react-router-dom";

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Secondary actions - only show when open */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 flex flex-col gap-3 mb-2 animate-fade-in">
          <div className="flex flex-col gap-3 p-4 bg-card/90 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl">
            <ThemeToggle />
            <NotificationBell />
            <Button variant="ghost" size="sm" asChild className="h-10 w-10 p-0 rounded-xl hover:bg-accent/50">
              <Link to="/settings">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}
      
      {/* Main floating button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="h-16 w-16 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-br from-primary to-primary/80 hover:scale-105"
        size="icon"
      >
        {isOpen ? (
          <X className="h-7 w-7 transition-transform duration-200" />
        ) : (
          <Plus className="h-7 w-7 transition-transform duration-200" />
        )}
      </Button>
    </div>
  );
};

export default FloatingActionButton;
