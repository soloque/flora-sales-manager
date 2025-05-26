
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users } from "lucide-react";
import { Link } from "react-router-dom";

interface Seller {
  id: string;
  name: string;
  email: string;
  type: string;
  is_virtual: boolean;
}

interface SellerAssignmentSectionProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  allSellers: Seller[];
  preSelectedSellerId?: string | null;
}

export function SellerAssignmentSection({ 
  formData, 
  handleInputChange, 
  allSellers, 
  preSelectedSellerId 
}: SellerAssignmentSectionProps) {
  return (
    <div className="border rounded-lg p-4 bg-blue-50/50">
      <div className="flex items-center gap-2 mb-3">
        <Users className="h-5 w-5 text-blue-600" />
        <h3 className="font-medium text-blue-800">Atribuição de Venda</h3>
      </div>
      <div className="space-y-4">
        <div>
          <Label>Atribuir venda para vendedor</Label>
          <Select 
            value={formData.assignedSellerId} 
            onValueChange={(value) => handleInputChange('assignedSellerId', value)}
            disabled={!!preSelectedSellerId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um vendedor ou deixe vazio para atribuir a você" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Atribuir a mim (proprietário)</SelectItem>
              {allSellers.map((seller) => (
                <SelectItem key={seller.id} value={seller.id}>
                  {seller.name} ({seller.email}) {seller.is_virtual ? '(Virtual)' : '(Real)'}
                </SelectItem>
              ))}
              <SelectItem value="new">➕ Criar novo vendedor virtual</SelectItem>
            </SelectContent>
          </Select>
          {preSelectedSellerId && (
            <p className="text-sm text-blue-600 mt-1">
              Vendedor pré-selecionado da lista de equipe
            </p>
          )}
        </div>

        {formData.assignedSellerId === "new" && (
          <div className="border rounded-lg p-4 bg-yellow-50/50 space-y-3">
            <h4 className="font-medium text-yellow-800">Dados do Novo Vendedor Virtual</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newSellerName">Nome do Vendedor *</Label>
                <Input
                  id="newSellerName"
                  value={formData.newSellerName}
                  onChange={(e) => handleInputChange('newSellerName', e.target.value)}
                  placeholder="Nome completo"
                  required
                />
              </div>
              <div>
                <Label htmlFor="newSellerEmail">Email do Vendedor *</Label>
                <Input
                  id="newSellerEmail"
                  type="email"
                  value={formData.newSellerEmail}
                  onChange={(e) => handleInputChange('newSellerEmail', e.target.value)}
                  placeholder="email@exemplo.com"
                  required
                />
              </div>
            </div>
            <p className="text-sm text-yellow-700">
              Este vendedor virtual será criado no sistema. Vendedores virtuais não podem fazer login.
            </p>
          </div>
        )}

        {allSellers.length === 0 && formData.assignedSellerId !== "new" && (
          <p className="text-sm text-muted-foreground">
            Você ainda não tem vendedores na sua equipe. 
            <Link to="/team" className="text-primary hover:underline ml-1">
              Adicione vendedores aqui
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
