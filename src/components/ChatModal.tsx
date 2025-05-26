
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TeamChat } from "@/components/TeamChat";
import { User } from "@/types";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMember: User | null;
}

export function ChatModal({ isOpen, onClose, selectedMember }: ChatModalProps) {
  if (!selectedMember) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b bg-background">
          <DialogTitle className="text-lg font-semibold">
            Chat com {selectedMember.name}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(85vh-80px)]">
            <div className="p-6">
              <TeamChat 
                selectedMember={selectedMember} 
                onClose={onClose}
              />
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
