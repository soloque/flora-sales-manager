
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2,
  AlertCircle,
  PackagePlus,
  PackageX,
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

// Interface for inventory items
interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  reorderPoint: number;
  supplier: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mock data for demonstration
const mockInventoryItems: InventoryItem[] = [
  {
    id: "1",
    name: "Muda de Acerola",
    description: "Muda de Acerola em saco de 1L",
    category: "Frutíferas",
    costPrice: 15,
    sellingPrice: 30,
    quantity: 25,
    reorderPoint: 10,
    supplier: "Viveiro São Paulo",
    createdAt: new Date(2023, 5, 12),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Muda de Pitanga",
    description: "Muda de Pitanga em saco de 1L",
    category: "Frutíferas",
    costPrice: 15,
    sellingPrice: 30,
    quantity: 18,
    reorderPoint: 10,
    supplier: "Viveiro São Paulo",
    createdAt: new Date(2023, 6, 3),
    updatedAt: new Date(),
  },
  {
    id: "3",
    name: "Muda de Jabuticaba",
    description: "Muda de Jabuticaba em saco de 3L",
    category: "Frutíferas",
    costPrice: 45,
    sellingPrice: 90,
    quantity: 7,
    reorderPoint: 5,
    supplier: "Viveiro Minas Gerais",
    createdAt: new Date(2023, 5, 12),
    updatedAt: new Date(),
  },
  {
    id: "4",
    name: "Muda de Caju",
    description: "Muda de Caju em saco de 3L",
    category: "Frutíferas",
    costPrice: 40,
    sellingPrice: 80,
    quantity: 12,
    reorderPoint: 8,
    supplier: "Viveiro Nordeste",
    createdAt: new Date(2023, 6, 15),
    updatedAt: new Date(),
  },
  {
    id: "5",
    name: "Adubo Orgânico",
    description: "Saco de 5kg de adubo orgânico",
    category: "Insumos",
    costPrice: 25,
    sellingPrice: 45,
    quantity: 30,
    reorderPoint: 15,
    supplier: "AgroSupply",
    createdAt: new Date(2023, 7, 2),
    updatedAt: new Date(),
  },
  {
    id: "6",
    name: "Saco de Cultivo 1L",
    description: "Pacote com 100 sacos para mudas",
    category: "Insumos",
    costPrice: 30,
    sellingPrice: 60,
    quantity: 5,
    reorderPoint: 3,
    supplier: "AgroSupply",
    createdAt: new Date(2023, 7, 2),
    updatedAt: new Date(),
  },
];

// Categories for filter and new items
const categories = ["Frutíferas", "Ornamentais", "Insumos", "Ferramentas", "Vasos", "Outros"];

// Default empty item
const emptyItem: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'> = {
  name: "",
  description: "",
  category: "Frutíferas",
  costPrice: 0,
  sellingPrice: 0,
  quantity: 0,
  reorderPoint: 0,
  supplier: "",
};

const Inventory = () => {
  const { user } = useAuth();
  const isOwner = user?.role === "owner";
  
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  
  // Search and filter
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  
  // Item management
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
  const [newItem, setNewItem] = useState(emptyItem);
  const [restockAmount, setRestockAmount] = useState(0);
  
  useEffect(() => {
    // In a real app, this would be an API call
    setItems(mockInventoryItems);
  }, []);
  
  useEffect(() => {
    // Apply filters
    let result = [...items];
    
    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        item =>
          item.name.toLowerCase().includes(search) ||
          item.description.toLowerCase().includes(search) ||
          item.supplier.toLowerCase().includes(search)
      );
    }
    
    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter(item => item.category === categoryFilter);
    }
    
    // Apply stock filter
    if (stockFilter === "low") {
      result = result.filter(item => item.quantity <= item.reorderPoint);
    } else if (stockFilter === "out") {
      result = result.filter(item => item.quantity === 0);
    }
    
    setFilteredItems(result);
  }, [items, searchTerm, categoryFilter, stockFilter]);
  
  const handleAddItem = () => {
    const newId = `new-${Date.now()}`;
    const itemToAdd: InventoryItem = {
      ...newItem,
      id: newId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setItems([...items, itemToAdd]);
    setNewItem(emptyItem);
    setIsAddDialogOpen(false);
    
    toast({
      title: "Item adicionado",
      description: `${itemToAdd.name} foi adicionado ao estoque.`,
    });
  };
  
  const handleEditItem = () => {
    if (!currentItem) return;
    
    const updatedItems = items.map(item => 
      item.id === currentItem.id ? { ...currentItem, updatedAt: new Date() } : item
    );
    
    setItems(updatedItems);
    setCurrentItem(null);
    setIsEditDialogOpen(false);
    
    toast({
      title: "Item atualizado",
      description: `${currentItem.name} foi atualizado com sucesso.`,
    });
  };
  
  const handleDeleteItem = () => {
    if (!currentItem) return;
    
    const updatedItems = items.filter(item => item.id !== currentItem.id);
    
    setItems(updatedItems);
    setCurrentItem(null);
    setIsDeleteDialogOpen(false);
    
    toast({
      title: "Item removido",
      description: `${currentItem.name} foi removido do estoque.`,
    });
  };
  
  const handleRestockItem = () => {
    if (!currentItem || restockAmount <= 0) return;
    
    const updatedItems = items.map(item => {
      if (item.id === currentItem.id) {
        return {
          ...item,
          quantity: item.quantity + restockAmount,
          updatedAt: new Date()
        };
      }
      return item;
    });
    
    setItems(updatedItems);
    setCurrentItem(null);
    setRestockAmount(0);
    setIsRestockDialogOpen(false);
    
    toast({
      title: "Estoque atualizado",
      description: `Foram adicionadas ${restockAmount} unidades de ${currentItem.name}.`,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  // Redirect non-owners
  if (!isOwner) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Você não tem permissão para acessar esta página.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Estoque</CardTitle>
          <CardDescription>
            Controle o inventário de suas plantas e insumos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar itens..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Categorias</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={stockFilter}
                onValueChange={setStockFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Estado do Estoque" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo Estoque</SelectItem>
                  <SelectItem value="low">Estoque Baixo</SelectItem>
                  <SelectItem value="out">Sem Estoque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Item
            </Button>
          </div>
          
          {/* Inventory table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead className="text-right">Custo</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Nenhum item encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">{item.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {item.quantity <= item.reorderPoint ? (
                            <Badge variant="destructive" className="mr-2">
                              Baixo
                            </Badge>
                          ) : null}
                          <span>
                            {item.quantity}
                            <span className="text-xs text-muted-foreground ml-1">
                              (Min: {item.reorderPoint})
                            </span>
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.costPrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.sellingPrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCurrentItem(item);
                              setIsRestockDialogOpen(true);
                            }}
                            title="Repor estoque"
                          >
                            <PackagePlus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCurrentItem(item);
                              setIsEditDialogOpen(true);
                            }}
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setCurrentItem(item);
                              setIsDeleteDialogOpen(true);
                            }}
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {filteredItems.length} itens encontrados
          </div>
          <div className="text-sm">
            Total em estoque: {formatCurrency(
              filteredItems.reduce(
                (sum, item) => sum + item.costPrice * item.quantity, 
                0
              )
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Item</DialogTitle>
            <DialogDescription>
              Preencha as informações do novo item para adicionar ao estoque.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Nome do item"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={newItem.category}
                  onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Descrição do item"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="costPrice">Preço de Custo (R$)</Label>
                <Input
                  id="costPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newItem.costPrice}
                  onChange={(e) => setNewItem({ ...newItem, costPrice: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sellingPrice">Preço de Venda (R$)</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newItem.sellingPrice}
                  onChange={(e) => setNewItem({ ...newItem, sellingPrice: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade Inicial</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reorderPoint">Ponto de Reposição</Label>
                <Input
                  id="reorderPoint"
                  type="number"
                  min="0"
                  value={newItem.reorderPoint}
                  onChange={(e) => setNewItem({ ...newItem, reorderPoint: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supplier">Fornecedor</Label>
              <Input
                id="supplier"
                value={newItem.supplier}
                onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
                placeholder="Nome do fornecedor"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddItem}>Adicionar Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      {currentItem && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Editar Item</DialogTitle>
              <DialogDescription>
                Atualize as informações do item de estoque.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome</Label>
                  <Input
                    id="edit-name"
                    value={currentItem.name}
                    onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Categoria</Label>
                  <Select
                    value={currentItem.category}
                    onValueChange={(value) => setCurrentItem({ ...currentItem, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  value={currentItem.description}
                  onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-costPrice">Preço de Custo (R$)</Label>
                  <Input
                    id="edit-costPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={currentItem.costPrice}
                    onChange={(e) => setCurrentItem({ ...currentItem, costPrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-sellingPrice">Preço de Venda (R$)</Label>
                  <Input
                    id="edit-sellingPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={currentItem.sellingPrice}
                    onChange={(e) => setCurrentItem({ ...currentItem, sellingPrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-quantity">Quantidade em Estoque</Label>
                  <Input
                    id="edit-quantity"
                    type="number"
                    min="0"
                    value={currentItem.quantity}
                    onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-reorderPoint">Ponto de Reposição</Label>
                  <Input
                    id="edit-reorderPoint"
                    type="number"
                    min="0"
                    value={currentItem.reorderPoint}
                    onChange={(e) => setCurrentItem({ ...currentItem, reorderPoint: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-supplier">Fornecedor</Label>
                <Input
                  id="edit-supplier"
                  value={currentItem.supplier}
                  onChange={(e) => setCurrentItem({ ...currentItem, supplier: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditItem}>Salvar Alterações</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {currentItem && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir "{currentItem.name}" do estoque? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteItem}>
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Restock Dialog */}
      {currentItem && (
        <Dialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Repor Estoque</DialogTitle>
              <DialogDescription>
                Adicione unidades de "{currentItem.name}" ao estoque.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-2">
                <Label htmlFor="restock-amount">Quantidade a adicionar</Label>
                <Input
                  id="restock-amount"
                  type="number"
                  min="1"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="mt-4 text-sm">
                <p>Estoque atual: <strong>{currentItem.quantity} unidades</strong></p>
                <p>Após reposição: <strong>{currentItem.quantity + restockAmount} unidades</strong></p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRestockDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleRestockItem}>Repor Estoque</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Inventory;
