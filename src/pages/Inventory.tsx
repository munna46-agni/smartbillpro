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
  DialogTrigger,
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
import { useProducts, useAddProduct, useUpdateStock, useDeleteProduct, Product } from "@/hooks/useProducts";
import { formatCurrency } from "@/lib/format";
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  AlertTriangle,
  ArrowUpCircle,
  ArrowDownCircle
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

function AddProductModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
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
      stock: parseInt(form.stock) || 0,
      category: form.category || null,
    });
    
    setForm({ name: "", cost_price: "", selling_price: "", stock: "", category: "" });
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter product name"
            />
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
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
            <div className="space-y-2">
              <Label htmlFor="selling">Selling Price *</Label>
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
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. Groceries"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addProduct.isPending}>
              {addProduct.isPending ? "Adding..." : "Add Product"}
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

export default function Inventory() {
  const { data: products, isLoading } = useProducts();
  const deleteProduct = useDeleteProduct();
  
  const [search, setSearch] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [stockUpdateProduct, setStockUpdateProduct] = useState<Product | null>(null);
  
  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );
  
  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteProduct.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Manage your products and stock</p>
        </div>
        <Button onClick={() => setAddModalOpen(true)} className="h-11">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-5 w-5" />
              Products ({filteredProducts?.length || 0})
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredProducts && filteredProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Selling</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.category || "-"}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(product.cost_price)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(product.selling_price)}</TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium
                          ${product.stock < 5 
                            ? 'bg-danger/10 text-danger' 
                            : product.stock < 10 
                              ? 'bg-warning/10 text-warning'
                              : 'bg-success/10 text-success'
                          }`}
                        >
                          {product.stock < 5 && <AlertTriangle className="h-3 w-3" />}
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setStockUpdateProduct(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-danger hover:text-danger"
                            onClick={() => handleDelete(product.id, product.name)}
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
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mb-3 opacity-50" />
              <p>No products found</p>
              <Button 
                variant="link" 
                onClick={() => setAddModalOpen(true)}
                className="mt-2"
              >
                Add your first product
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <AddProductModal open={addModalOpen} onOpenChange={setAddModalOpen} />
      <StockUpdateModal product={stockUpdateProduct} onClose={() => setStockUpdateProduct(null)} />
    </div>
  );
}
