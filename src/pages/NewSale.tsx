import { useState, useMemo } from "react";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useProducts, ItemType } from "@/hooks/useProducts";
import { useCustomerDue, useCreateSale } from "@/hooks/useSales";
import { formatCurrency } from "@/lib/format";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  AlertCircle,
  Printer,
  Save,
  Package,
  Wrench
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CartItem {
  id: string;
  product_name: string;
  quantity: number;
  rate: number;
  discount: number;
  total: number;
  available_stock: number;
  item_type: "product" | "service";
}

function InvoicePreview({ 
  sale, 
  items, 
  onClose 
}: { 
  sale: any; 
  items: CartItem[]; 
  onClose: () => void;
}) {
  const handlePrint = () => {
    window.print();
    onClose();
  };

  const productItems = items.filter(i => i.item_type === "product");
  const serviceItems = items.filter(i => i.item_type === "service");

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md print:shadow-none">
        <DialogHeader>
          <DialogTitle className="text-center">Invoice</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div className="text-center border-b pb-4">
            <h2 className="text-xl font-bold">Smart Bill POS</h2>
            <p className="text-xs text-muted-foreground">Stationery & Common Service Center</p>
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{new Date().toLocaleString('en-IN')}</span>
          </div>
          
          {sale.customer_name && (
            <div className="border-b pb-2">
              <p><strong>Customer:</strong> {sale.customer_name}</p>
              {sale.mobile_number && <p><strong>Mobile:</strong> {sale.mobile_number}</p>}
            </div>
          )}
          
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Item</th>
                <th className="text-center py-2">Qty</th>
                <th className="text-right py-2">Rate</th>
                <th className="text-right py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {productItems.length > 0 && (
                <>
                  <tr><td colSpan={4} className="py-1 text-xs font-semibold text-muted-foreground">Products</td></tr>
                  {productItems.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-2">{item.product_name}</td>
                      <td className="text-center py-2">{item.quantity}</td>
                      <td className="text-right py-2">{formatCurrency(item.rate)}</td>
                      <td className="text-right py-2">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </>
              )}
              {serviceItems.length > 0 && (
                <>
                  <tr><td colSpan={4} className="py-1 text-xs font-semibold text-muted-foreground">Services</td></tr>
                  {serviceItems.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-2">{item.product_name}</td>
                      <td className="text-center py-2">{item.quantity}</td>
                      <td className="text-right py-2">{formatCurrency(item.rate)}</td>
                      <td className="text-right py-2">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
          
          <div className="space-y-1 border-t pt-2">
            <div className="flex justify-between">
              <span>Grand Total:</span>
              <span className="font-bold">{formatCurrency(sale.total_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Paid Amount:</span>
              <span className="text-success">{formatCurrency(sale.paid_amount)}</span>
            </div>
            {sale.balance_amount > 0 && (
              <div className="flex justify-between text-danger font-medium">
                <span>Balance Due:</span>
                <span>{formatCurrency(sale.balance_amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Payment Mode:</span>
              <span>{sale.payment_mode}</span>
            </div>
          </div>
          
          <div className="text-center text-xs text-muted-foreground pt-4 border-t">
            <p>Thank you for your visit!</p>
          </div>
          
          <div className="flex gap-2 print:hidden">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button onClick={handlePrint} className="flex-1">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function NewSale() {
  const [itemTypeFilter, setItemTypeFilter] = useState<ItemType>("product");
  const { data: products, isLoading: productsLoading } = useProducts();
  const createSale = useCreateSale();
  
  const [customerName, setCustomerName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paidAmount, setPaidAmount] = useState<string>("");
  const [paymentMode, setPaymentMode] = useState<"Cash" | "UPI" | "Card">("Cash");
  const [productOpen, setProductOpen] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);
  
  const { data: previousDue } = useCustomerDue(mobileNumber.length >= 10 ? mobileNumber : null);
  
  const grandTotal = useMemo(() => 
    cart.reduce((sum, item) => sum + item.total, 0), 
    [cart]
  );
  
  const balanceDue = useMemo(() => {
    const paid = parseFloat(paidAmount) || 0;
    return Math.max(0, grandTotal - paid);
  }, [grandTotal, paidAmount]);
  
  const filteredProducts = products?.filter(p => p.item_type === itemTypeFilter);
  
  const addToCart = (product: any) => {
    const existing = cart.find(item => item.product_name === product.name);
    
    if (existing) {
      // Services have unlimited "stock"
      if (product.item_type === "product" && existing.quantity >= product.stock) {
        toast.error("Not enough stock available");
        return;
      }
      setCart(cart.map(item => 
        item.product_name === product.name 
          ? { 
              ...item, 
              quantity: item.quantity + 1,
              total: (item.quantity + 1) * item.rate - item.discount
            }
          : item
      ));
    } else {
      if (product.item_type === "product" && product.stock <= 0) {
        toast.error("Product is out of stock");
        return;
      }
      setCart([...cart, {
        id: crypto.randomUUID(),
        product_name: product.name,
        quantity: 1,
        rate: product.selling_price,
        discount: 0,
        total: product.selling_price,
        available_stock: product.stock,
        item_type: product.item_type,
      }]);
    }
    setProductOpen(false);
  };
  
  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        // Services have no stock limit
        const maxQty = item.item_type === "service" ? Infinity : item.available_stock;
        const newQty = Math.max(1, Math.min(maxQty, item.quantity + delta));
        return {
          ...item,
          quantity: newQty,
          total: newQty * item.rate - item.discount,
        };
      }
      return item;
    }));
  };
  
  const updateDiscount = (id: string, discount: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const discountValue = Math.max(0, Math.min(item.quantity * item.rate, discount));
        return {
          ...item,
          discount: discountValue,
          total: item.quantity * item.rate - discountValue,
        };
      }
      return item;
    }));
  };
  
  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };
  
  const handleSave = async () => {
    if (cart.length === 0) {
      toast.error("Please add items to cart");
      return;
    }
    
    const paid = parseFloat(paidAmount) || 0;
    
    const saleData = {
      invoice_date: new Date().toISOString(),
      customer_name: customerName || null,
      mobile_number: mobileNumber || null,
      total_amount: grandTotal,
      paid_amount: paid,
      balance_amount: balanceDue,
      payment_mode: paymentMode,
      bill_type: "Invoice" as const,
      due_date: balanceDue > 0 ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
    };
    
    const items = cart.map(item => ({
      product_name: item.product_name,
      quantity: item.quantity,
      rate: item.rate,
      discount: item.discount,
      total: item.total,
      item_type: item.item_type,
    }));
    
    try {
      await createSale.mutateAsync({ sale: saleData, items });
      setLastSale({ ...saleData, items: cart });
      setShowInvoice(true);
      
      // Reset form
      setCustomerName("");
      setMobileNumber("");
      setCart([]);
      setPaidAmount("");
      setPaymentMode("Cash");
    } catch (error) {
      // Error handled by mutation
    }
  };

  const productCount = cart.filter(i => i.item_type === "product").length;
  const serviceCount = cart.filter(i => i.item_type === "service").length;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Sale</h1>
          <p className="text-muted-foreground">Create a new invoice</p>
        </div>
      </div>
      
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left Panel - Customer & Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Customer Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    placeholder="Enter mobile number"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Customer Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter customer name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>
              
              {previousDue !== undefined && previousDue > 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-danger/10 border border-danger/20 p-3 text-danger">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Previous Due Amount</p>
                    <p className="text-lg font-bold">{formatCurrency(previousDue)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Product/Service Selection */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
                <CardTitle className="text-base">Items</CardTitle>
                <div className="flex gap-2">
                  <Popover open={productOpen} onOpenChange={setProductOpen}>
                    <PopoverTrigger asChild>
                      <Button className="h-10 flex-1 sm:flex-none">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="end">
                      <div className="p-2 border-b">
                        <Tabs value={itemTypeFilter} onValueChange={(v) => setItemTypeFilter(v as ItemType)}>
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="product" className="text-xs gap-1">
                              <Package className="h-3 w-3" />
                              Products
                            </TabsTrigger>
                            <TabsTrigger value="service" className="text-xs gap-1">
                              <Wrench className="h-3 w-3" />
                              Services
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                      <Command>
                        <CommandInput placeholder={`Search ${itemTypeFilter}s...`} />
                        <CommandList>
                          <CommandEmpty>No {itemTypeFilter} found.</CommandEmpty>
                          <CommandGroup>
                            {filteredProducts?.map((product) => (
                              <CommandItem
                                key={product.id}
                                value={product.name}
                                onSelect={() => addToCart(product)}
                                className="cursor-pointer"
                              >
                                <div className="flex-1">
                                  <p className="font-medium">{product.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatCurrency(product.selling_price)}
                                    {product.item_type === "product" && ` • Stock: ${product.stock}`}
                                  </p>
                                </div>
                                {product.item_type === "product" && product.stock < 5 && (
                                  <span className="text-xs text-warning">Low</span>
                                )}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mb-3 opacity-50" />
                  <p>No items in cart</p>
                  <p className="text-sm">Add products or services to start billing</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {productCount > 0 && (
                    <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <Package className="h-3 w-3" /> Products ({productCount})
                    </p>
                  )}
                  {cart.filter(i => i.item_type === "product").map((item) => (
                    <div 
                      key={item.id}
                      className="flex items-center gap-3 rounded-lg border bg-card p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.rate)} × {item.quantity}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="w-20 hidden sm:block">
                        <Input
                          type="number"
                          placeholder="Disc"
                          value={item.discount || ""}
                          onChange={(e) => updateDiscount(item.id, parseFloat(e.target.value) || 0)}
                          className="h-8 text-sm"
                        />
                      </div>
                      
                      <div className="w-24 text-right font-semibold">
                        {formatCurrency(item.total)}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-danger hover:text-danger hover:bg-danger/10"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {serviceCount > 0 && (
                    <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mt-4">
                      <Wrench className="h-3 w-3" /> Services ({serviceCount})
                    </p>
                  )}
                  {cart.filter(i => i.item_type === "service").map((item) => (
                    <div 
                      key={item.id}
                      className="flex items-center gap-3 rounded-lg border border-accent/30 bg-accent/5 p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.rate)} × {item.quantity}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="w-20 hidden sm:block">
                        <Input
                          type="number"
                          placeholder="Disc"
                          value={item.discount || ""}
                          onChange={(e) => updateDiscount(item.id, parseFloat(e.target.value) || 0)}
                          className="h-8 text-sm"
                        />
                      </div>
                      
                      <div className="w-24 text-right font-semibold">
                        {formatCurrency(item.total)}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-danger hover:text-danger hover:bg-danger/10"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Right Panel - Payment */}
        <div className="space-y-4">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-base">Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 border-b pb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Grand Total</span>
                  <span className="text-success">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paid">Paid Amount</Label>
                <Input
                  id="paid"
                  type="number"
                  placeholder="0.00"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  className="h-12 text-lg font-semibold"
                />
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
                <span className="text-sm font-medium">Balance Due</span>
                <span className={cn(
                  "text-xl font-bold",
                  balanceDue > 0 ? "text-danger" : "text-success"
                )}>
                  {formatCurrency(balanceDue)}
                </span>
              </div>
              
              <div className="space-y-2">
                <Label>Payment Mode</Label>
                <Select value={paymentMode} onValueChange={(v) => setPaymentMode(v as any)}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                className="w-full h-14 text-lg font-semibold"
                onClick={handleSave}
                disabled={cart.length === 0 || createSale.isPending}
              >
                <Save className="h-5 w-5 mr-2" />
                {createSale.isPending ? "Saving..." : "Save & Print"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {showInvoice && lastSale && (
        <InvoicePreview
          sale={lastSale}
          items={lastSale.items}
          onClose={() => setShowInvoice(false)}
        />
      )}
    </div>
  );
}
