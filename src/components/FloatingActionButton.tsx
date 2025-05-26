
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/NotificationBell";
import { Settings, Plus, X } from "lucide-react";
import { Link } from "react-router-dom";

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Secondary actions - only show when open */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 flex flex-col gap-3 mb-2">
          <div className="flex flex-col gap-2 p-2 bg-card border rounded-lg shadow-lg">
            <ThemeToggle />
            <NotificationBell />
            <Button variant="ghost" size="sm" asChild className="h-9 w-9 p-0">
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
        className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        size="icon"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}
