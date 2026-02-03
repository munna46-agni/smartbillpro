import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProducts, useAddProduct, useUpdateStock, useDeleteProduct, Product, ItemType } from "@/hooks/useProducts";
import { formatCurrency } from "@/lib/format";
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  AlertTriangle,
  ArrowUpCircle,
  ArrowDownCircle,
  Wrench
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

function AddItemModal({ 
  open, 
  onOpenChange, 
  itemType 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  itemType: ItemType;
}) {
  const addProduct = useAddProduct();
  const [form, setForm] = useState({
    name: "",
    cost_price: "",
    selling_price: "",
    stock: "",
    category: "",
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name || !form.selling_price) {
      toast.error("Name and selling price are required");
      return;
    }
    
    await addProduct.mutateAsync({
      name: form.name,
      cost_price: parseFloat(form.cost_price) || 0,
      selling_price: parseFloat(form.selling_price) || 0,
      stock: itemType === "product" ? (parseInt(form.stock) || 0) : 0,
      category: form.category || null,
      item_type: itemType,
    });
    
    setForm({ name: "", cost_price: "", selling_price: "", stock: "", category: "" });
    onOpenChange(false);
  };
  
  const isService = itemType === "service";
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isService ? "Add New Service" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{isService ? "Service Name" : "Product Name"} *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={isService ? "e.g. Xerox, PAN Card" : "e.g. Pen, Notebook"}
            />
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {!isService && (
              <div className="space-y-2">
                <Label htmlFor="cost">Cost Price</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={form.cost_price}
                  onChange={(e) => setForm({ ...form, cost_price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            )}
            <div className={`space-y-2 ${isService ? 'col-span-2' : ''}`}>
              <Label htmlFor="selling">{isService ? "Service Charge" : "Selling Price"} *</Label>
              <Input
                id="selling"
                type="number"
                step="0.01"
                value={form.selling_price}
                onChange={(e) => setForm({ ...form, selling_price: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {!isService && (
              <div className="space-y-2">
                <Label htmlFor="stock">Initial Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  placeholder="0"
                />
              </div>
            )}
            <div className={`space-y-2 ${isService ? 'col-span-2' : ''}`}>
              <Label htmlFor="category">Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {isService ? (
                    <>
                      <SelectItem value="Print Services">Print Services</SelectItem>
                      <SelectItem value="Xerox">Xerox</SelectItem>
                      <SelectItem value="CSC Services">CSC Services</SelectItem>
                      <SelectItem value="Other Services">Other Services</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="Stationery">Stationery</SelectItem>
                      <SelectItem value="Paper">Paper</SelectItem>
                      <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addProduct.isPending}>
              {addProduct.isPending ? "Adding..." : `Add ${isService ? "Service" : "Product"}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function StockUpdateModal({ 
  product, 
  onClose 
}: { 
  product: Product | null; 
  onClose: () => void;
}) {
  const updateStock = useUpdateStock();
  const [change, setChange] = useState("");
  
  const handleUpdate = async (isAdd: boolean) => {
    if (!product || !change) return;
    
    const stockChange = isAdd ? parseInt(change) : -parseInt(change);
    await updateStock.mutateAsync({ id: product.id, stockChange });
    setChange("");
    onClose();
  };
  
  if (!product) return null;
  
  return (
    <Dialog open={!!product} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Stock - {product.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted text-center">
            <p className="text-sm text-muted-foreground">Current Stock</p>
            <p className="text-3xl font-bold">{product.stock}</p>
          </div>
          
          <div className="space-y-2">
            <Label>Quantity to Add/Remove</Label>
            <Input
              type="number"
              value={change}
              onChange={(e) => setChange(e.target.value)}
              placeholder="Enter quantity"
              className="text-center text-lg"
            />
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-12 text-danger border-danger hover:bg-danger/10"
              onClick={() => handleUpdate(false)}
              disabled={!change || updateStock.isPending}
            >
              <ArrowDownCircle className="h-5 w-5 mr-2" />
              Remove
            </Button>
            <Button
              className="flex-1 h-12 bg-success hover:bg-success/90"
              onClick={() => handleUpdate(true)}
              disabled={!change || updateStock.isPending}
            >
              <ArrowUpCircle className="h-5 w-5 mr-2" />
              Add
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ItemsTable({ 
  itemType, 
  search 
}: { 
  itemType: ItemType; 
  search: string;
}) {
  const { data: items, isLoading } = useProducts(itemType);
  const deleteProduct = useDeleteProduct();
  const [stockUpdateProduct, setStockUpdateProduct] = useState<Product | null>(null);
  
  const filteredItems = items?.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.category?.toLowerCase().includes(search.toLowerCase())
  );
  
  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteProduct.mutateAsync(id);
    }
  };
  
  const isService = itemType === "service";
  
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }
  
  if (!filteredItems || filteredItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        {isService ? (
          <Wrench className="h-12 w-12 mb-3 opacity-50" />
        ) : (
          <Package className="h-12 w-12 mb-3 opacity-50" />
        )}
        <p>No {isService ? "services" : "products"} found</p>
      </div>
    );
  }
  
  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{isService ? "Service" : "Product"}</TableHead>
              {!isService && <TableHead className="text-right">Cost</TableHead>}
              <TableHead className="text-right">{isService ? "Charge" : "Selling"}</TableHead>
              {!isService && <TableHead className="text-center">Stock</TableHead>}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.category || "-"}</p>
                  </div>
                </TableCell>
                {!isService && (
                  <TableCell className="text-right">{formatCurrency(item.cost_price)}</TableCell>
                )}
                <TableCell className="text-right font-medium">{formatCurrency(item.selling_price)}</TableCell>
                {!isService && (
                  <TableCell className="text-center">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium
                      ${item.stock < 5 
                        ? 'bg-danger/10 text-danger' 
                        : item.stock < 10 
                          ? 'bg-warning/10 text-warning'
                          : 'bg-success/10 text-success'
                      }`}
                    >
                      {item.stock < 5 && <AlertTriangle className="h-3 w-3" />}
                      {item.stock}
                    </span>
                  </TableCell>
                )}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {!isService && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setStockUpdateProduct(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-danger hover:text-danger"
                      onClick={() => handleDelete(item.id, item.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <StockUpdateModal product={stockUpdateProduct} onClose={() => setStockUpdateProduct(null)} />
    </>
  );
}

export default function Inventory() {
  const { data: products } = useProducts("product");
  const { data: services } = useProducts("service");
  
  const [search, setSearch] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ItemType>("product");

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Manage products and services</p>
        </div>
        <Button onClick={() => setAddModalOpen(true)} className="h-11">
          <Plus className="h-4 w-4 mr-2" />
          Add {activeTab === "service" ? "Service" : "Product"}
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ItemType)}>
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
              <TabsList className="grid w-full sm:w-auto grid-cols-2">
                <TabsTrigger value="product" className="gap-2">
                  <Package className="h-4 w-4" />
                  Products ({products?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="service" className="gap-2">
                  <Wrench className="h-4 w-4" />
                  Services ({services?.length || 0})
                </TabsTrigger>
              </TabsList>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </Tabs>
        </CardHeader>
        <CardContent>
          <ItemsTable itemType={activeTab} search={search} />
        </CardContent>
      </Card>
      
      <AddItemModal 
        open={addModalOpen} 
        onOpenChange={setAddModalOpen} 
        itemType={activeTab}
      />
    </div>
  );
}
