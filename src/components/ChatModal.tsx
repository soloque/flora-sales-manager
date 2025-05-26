
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Chat com {selectedMember.name}</DialogTitle>
        </DialogHeader>
        <div className="h-[600px] overflow-hidden">
          <TeamChat 
            selectedMember={selectedMember} 
            onClose={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
