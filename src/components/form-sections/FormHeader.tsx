
import { PlusCircle } from "lucide-react";

interface FormHeaderProps {
  isOwner: boolean;
}

export function FormHeader({ isOwner }: FormHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <PlusCircle className="h-5 w-5" />
      <h1 className="text-2xl font-bold">Nova Venda</h1>
      {isOwner && (
        <span className="text-sm font-normal text-muted-foreground">
          (Proprietário)
        </span>
      )}
    </div>
  );
}
