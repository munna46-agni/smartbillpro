import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProducts } from "@/hooks/useProducts";
import { usePurchases, useAddPurchase } from "@/hooks/usePurchases";
import { formatCurrency, formatDate } from "@/lib/format";
import { Truck, Plus, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function Purchases() {
  const { data: products } = useProducts();
  const { data: purchases, isLoading } = usePurchases();
  const addPurchase = useAddPurchase();
  
  const [form, setForm] = useState({
    supplier_name: "",
    invoice_no: "",
    item_name: "",
    quantity: "",
    cost: "",
  });
  
  const totalAmount = (parseFloat(form.quantity) || 0) * (parseFloat(form.cost) || 0);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.supplier_name || !form.item_name || !form.quantity) {
      toast.error("Please fill in required fields");
      return;
    }
    
    await addPurchase.mutateAsync({
      date: new Date().toISOString(),
      supplier_name: form.supplier_name,
      invoice_no: form.invoice_no || null,
      item_name: form.item_name,
      quantity: parseInt(form.quantity),
      cost: parseFloat(form.cost) || 0,
      total_amount: totalAmount,
    });
    
    setForm({
      supplier_name: "",
      invoice_no: "",
      item_name: "",
      quantity: "",
      cost: "",
    });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Purchase Entry</h1>
        <p className="text-muted-foreground">Record new stock purchases</p>
      </div>
      
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Entry Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="h-5 w-5" />
              New Purchase
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier Name *</Label>
                <Input
                  id="supplier"
                  value={form.supplier_name}
                  onChange={(e) => setForm({ ...form, supplier_name: e.target.value })}
                  placeholder="Enter supplier name"
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="invoice">Invoice No.</Label>
                <Input
                  id="invoice"
                  value={form.invoice_no}
                  onChange={(e) => setForm({ ...form, invoice_no: e.target.value })}
                  placeholder="Optional"
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="item">Item *</Label>
                <Select 
                  value={form.item_name} 
                  onValueChange={(v) => setForm({ ...form, item_name: v })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.map((product) => (
                      <SelectItem key={product.id} value={product.name}>
                        {product.name} (Stock: {product.stock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-3 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="qty">Quantity *</Label>
                  <Input
                    id="qty"
                    type="number"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    placeholder="0"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost/Unit</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: e.target.value })}
                    placeholder="0.00"
                    className="h-11"
                  />
                </div>
              </div>
              
              <div className="p-3 rounded-lg bg-muted">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Amount</span>
                  <span className="text-lg font-bold">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12"
                disabled={addPurchase.isPending}
              >
                <Package className="h-4 w-4 mr-2" />
                {addPurchase.isPending ? "Saving..." : "Save & Update Stock"}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {/* Purchase History */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Recent Purchases
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : purchases && purchases.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchases.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell className="text-sm">
                          {formatDate(purchase.date)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{purchase.supplier_name}</p>
                            {purchase.invoice_no && (
                              <p className="text-xs text-muted-foreground">#{purchase.invoice_no}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{purchase.item_name}</TableCell>
                        <TableCell className="text-center font-medium">{purchase.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(purchase.cost)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(purchase.total_amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Truck className="h-12 w-12 mb-3 opacity-50" />
                <p>No purchases recorded yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
