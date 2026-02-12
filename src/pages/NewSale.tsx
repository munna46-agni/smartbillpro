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
import { useShopSettings } from "@/hooks/useShopSettings";
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
  Wrench,
  Store,
  Smartphone,
  Shield,
  Calendar
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type BillingMode = "product" | "recharge" | "insurance";

interface CartItem {
  id: string;
  product_name: string;
  quantity: number;
  rate: number;
  discount: number;
  total: number;
  available_stock: number;
  item_type: "product" | "service" | "recharge" | "insurance";
  validity_days?: number | null;
  expiry_date?: string | null;
  policy_number?: string | null;
}

function InvoicePreview({ 
  sale, 
  items, 
  onClose,
  shopSettings
}: { 
  sale: any; 
  items: CartItem[]; 
  onClose: () => void;
  shopSettings: any;
}) {
  const handlePrint = () => {
    window.print();
    onClose();
  };

  const productItems = items.filter(i => i.item_type === "product");
  const serviceItems = items.filter(i => i.item_type === "service");

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-[210mm] max-h-[90vh] overflow-y-auto print:max-w-none print:max-h-none print:overflow-visible print:shadow-none">
        <DialogHeader className="print:hidden">
          <DialogTitle className="text-center">Invoice Preview</DialogTitle>
        </DialogHeader>
        
        {/* A4 Invoice Container */}
        <div 
          className="bg-white text-black p-8 relative print:p-[15mm] print:m-0"
          style={{ 
            width: '210mm', 
            minHeight: '297mm',
            margin: '0 auto',
            boxSizing: 'border-box'
          }}
        >
          {/* Watermark */}
          {shopSettings.showWatermark && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              {shopSettings.watermarkType === "image" && shopSettings.watermarkImageUrl ? (
                <img 
                  src={shopSettings.watermarkImageUrl} 
                  alt="Watermark" 
                  className="max-w-[60%] max-h-[60%] object-contain opacity-[0.08] rotate-[-15deg]"
                />
              ) : shopSettings.watermarkText ? (
                <span className="text-8xl font-bold text-gray-900 opacity-[0.06] rotate-[-30deg] whitespace-nowrap">
                  {shopSettings.watermarkText}
                </span>
              ) : null}
            </div>
          )}
          
          <div className="relative z-10 flex flex-col min-h-[267mm]">
            {/* Header with Logo */}
            <div className="text-center border-b-2 border-gray-300 pb-6">
              {shopSettings.logoUrl && (
                <div className="flex justify-center mb-3">
                  <img 
                    src={shopSettings.logoUrl} 
                    alt="Shop Logo" 
                    className="h-16 w-16 object-contain"
                  />
                </div>
              )}
              <h1 className="text-2xl font-bold text-gray-900">{shopSettings.shopName}</h1>
              {shopSettings.shopTagline && (
                <p className="text-sm text-gray-600 mt-1">{shopSettings.shopTagline}</p>
              )}
              {shopSettings.shopAddress && (
                <p className="text-sm text-gray-600 mt-2">{shopSettings.shopAddress}</p>
              )}
              <div className="flex justify-center gap-4 mt-2 text-sm text-gray-600">
                {shopSettings.shopPhone && <span>Ph: {shopSettings.shopPhone}</span>}
                {shopSettings.shopGST && <span>GST: {shopSettings.shopGST}</span>}
              </div>
            </div>
            
            {/* Invoice Title & Date */}
            <div className="flex justify-between items-center py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">TAX INVOICE</h2>
              <div className="text-right text-sm text-gray-600">
                <p>Date: {new Date().toLocaleDateString('en-IN')}</p>
                <p>Time: {new Date().toLocaleTimeString('en-IN')}</p>
              </div>
            </div>
            
            {/* Customer Details */}
            {sale.customer_name && (
              <div className="py-4 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Bill To:</h3>
                <p className="text-base font-medium">{sale.customer_name}</p>
                {sale.mobile_number && <p className="text-sm text-gray-600">Mobile: {sale.mobile_number}</p>}
              </div>
            )}
            
            {/* Items Table */}
            <div className="flex-1 py-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300 bg-gray-50">
                    <th className="text-left py-3 px-2 font-semibold">S.No</th>
                    <th className="text-left py-3 px-2 font-semibold">Item Description</th>
                    <th className="text-center py-3 px-2 font-semibold">Qty</th>
                    <th className="text-right py-3 px-2 font-semibold">Rate</th>
                    <th className="text-right py-3 px-2 font-semibold">Disc</th>
                    <th className="text-right py-3 px-2 font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {productItems.length > 0 && (
                    <>
                      <tr className="bg-gray-50">
                        <td colSpan={6} className="py-2 px-2 text-xs font-semibold text-gray-600">Products</td>
                      </tr>
                      {productItems.map((item, index) => (
                        <tr key={item.id} className="border-b border-gray-100">
                          <td className="py-3 px-2">{index + 1}</td>
                          <td className="py-3 px-2">{item.product_name}</td>
                          <td className="text-center py-3 px-2">{item.quantity}</td>
                          <td className="text-right py-3 px-2">{formatCurrency(item.rate)}</td>
                          <td className="text-right py-3 px-2">{item.discount > 0 ? formatCurrency(item.discount) : '-'}</td>
                          <td className="text-right py-3 px-2 font-medium">{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                    </>
                  )}
                  {serviceItems.length > 0 && (
                    <>
                      <tr className="bg-gray-50">
                        <td colSpan={6} className="py-2 px-2 text-xs font-semibold text-gray-600">Services</td>
                      </tr>
                      {serviceItems.map((item, index) => (
                        <tr key={item.id} className="border-b border-gray-100">
                          <td className="py-3 px-2">{productItems.length + index + 1}</td>
                          <td className="py-3 px-2">{item.product_name}</td>
                          <td className="text-center py-3 px-2">{item.quantity}</td>
                          <td className="text-right py-3 px-2">{formatCurrency(item.rate)}</td>
                          <td className="text-right py-3 px-2">{item.discount > 0 ? formatCurrency(item.discount) : '-'}</td>
                          <td className="text-right py-3 px-2 font-medium">{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Totals Section */}
            <div className="border-t-2 border-gray-300 pt-4">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-base">
                    <span className="font-medium">Grand Total:</span>
                    <span className="font-bold text-lg">{formatCurrency(sale.total_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Paid Amount:</span>
                    <span className="text-green-600 font-medium">{formatCurrency(sale.paid_amount)}</span>
                  </div>
                  {sale.balance_amount > 0 && (
                    <div className="flex justify-between text-red-600 font-medium">
                      <span>Balance Due:</span>
                      <span>{formatCurrency(sale.balance_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-gray-600 pt-2 border-t border-gray-200">
                    <span>Payment Mode:</span>
                    <span>{sale.payment_mode}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer with Thank You and Signature */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-end">
                {/* Thank you message */}
                <div className="text-center">
                  <p className="text-sm text-gray-600">Thank you for your business!</p>
                </div>
                
                {/* Proprietor Signature Section */}
                <div className="text-right">
                  {shopSettings.signatureImageUrl && (
                    <div className="mb-2 flex justify-end">
                      <img 
                        src={shopSettings.signatureImageUrl} 
                        alt="Signature/Seal" 
                        className="h-16 w-auto object-contain"
                      />
                    </div>
                  )}
                  <div className="border-t border-gray-400 pt-2 min-w-[150px]">
                    <p className="text-sm font-medium">{shopSettings.proprietorName || 'Proprietor'}</p>
                    <p className="text-xs text-gray-500">Authorized Signatory</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 print:hidden mt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
          <Button onClick={handlePrint} className="flex-1">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function NewSale() {
  const [itemTypeFilter, setItemTypeFilter] = useState<ItemType>("product");
  const { data: products, isLoading: productsLoading } = useProducts();
  const createSale = useCreateSale();
  const { settings: shopSettings } = useShopSettings();
  
  const [customerName, setCustomerName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paidAmount, setPaidAmount] = useState<string>("");
  const [paymentMode, setPaymentMode] = useState<"Cash" | "UPI" | "Card">("Cash");
  const [productOpen, setProductOpen] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);
  const [billingMode, setBillingMode] = useState<BillingMode>("product");
  
  // Recharge state
  const [rechargePlan, setRechargePlan] = useState("");
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [validityOption, setValidityOption] = useState("28");
  const [customDays, setCustomDays] = useState("");
  
  // Insurance state
  const [insuranceName, setInsuranceName] = useState("");
  const [insuranceAmount, setInsuranceAmount] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [insuranceExpiryDate, setInsuranceExpiryDate] = useState("");
  
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

  const setQuantity = (id: string, qty: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const maxQty = item.item_type === "service" ? Infinity : item.available_stock;
        const newQty = Math.max(1, Math.min(maxQty, qty || 1));
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

  const addRechargeToCart = () => {
    if (!rechargePlan || !rechargeAmount) {
      toast.error("Please enter plan name and amount");
      return;
    }
    const amount = parseFloat(rechargeAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    const days = validityOption === "custom" 
      ? parseInt(customDays) || 28 
      : parseInt(validityOption);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    setCart([...cart, {
      id: crypto.randomUUID(),
      product_name: `Recharge - ${rechargePlan}`,
      quantity: 1,
      rate: amount,
      discount: 0,
      total: amount,
      available_stock: Infinity,
      item_type: "recharge",
      validity_days: days,
      expiry_date: expiryDate.toISOString().split("T")[0],
    }]);
    setRechargePlan("");
    setRechargeAmount("");
    setValidityOption("28");
    setCustomDays("");
  };

  const addInsuranceToCart = () => {
    if (!insuranceName || !insuranceAmount || !insuranceExpiryDate) {
      toast.error("Please enter all insurance details");
      return;
    }
    const amount = parseFloat(insuranceAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    const today = new Date();
    const expiry = new Date(insuranceExpiryDate);
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    setCart([...cart, {
      id: crypto.randomUUID(),
      product_name: `Insurance - ${insuranceName}`,
      quantity: 1,
      rate: amount,
      discount: 0,
      total: amount,
      available_stock: Infinity,
      item_type: "insurance",
      validity_days: diffDays > 0 ? diffDays : null,
      expiry_date: insuranceExpiryDate,
      policy_number: policyNumber || null,
    }]);
    setInsuranceName("");
    setInsuranceAmount("");
    setPolicyNumber("");
    setInsuranceExpiryDate("");
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
      validity_days: item.validity_days || null,
      expiry_date: item.expiry_date || null,
      policy_number: item.policy_number || null,
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
  const rechargeCount = cart.filter(i => i.item_type === "recharge").length;
  const insuranceCount = cart.filter(i => i.item_type === "insurance").length;

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

          {/* Billing Mode Selector */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Billing Type</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={billingMode} onValueChange={(v) => setBillingMode(v as BillingMode)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="product" className="text-xs gap-1">
                    <Package className="h-3 w-3" />
                    Product / Service
                  </TabsTrigger>
                  <TabsTrigger value="recharge" className="text-xs gap-1">
                    <Smartphone className="h-3 w-3" />
                    Recharge
                  </TabsTrigger>
                  <TabsTrigger value="insurance" className="text-xs gap-1">
                    <Shield className="h-3 w-3" />
                    Insurance
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Recharge Form */}
              {billingMode === "recharge" && (
                <div className="mt-4 space-y-4 p-4 rounded-lg border bg-muted/30">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Plan / Operator Name</Label>
                      <Input
                        placeholder="e.g. Jio 299, Airtel 239"
                        value={rechargePlan}
                        onChange={(e) => setRechargePlan(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Amount (₹)</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={rechargeAmount}
                        onChange={(e) => setRechargeAmount(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Validity</Label>
                      <Select value={validityOption} onValueChange={setValidityOption}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="28">28 Days</SelectItem>
                          <SelectItem value="56">56 Days</SelectItem>
                          <SelectItem value="84">84 Days</SelectItem>
                          <SelectItem value="30">1 Month (30 Days)</SelectItem>
                          <SelectItem value="365">1 Year (365 Days)</SelectItem>
                          <SelectItem value="custom">Custom / Manual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {validityOption === "custom" && (
                      <div className="space-y-2">
                        <Label>Custom Days</Label>
                        <Input
                          type="number"
                          placeholder="Enter days"
                          value={customDays}
                          onChange={(e) => setCustomDays(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                  <Button onClick={addRechargeToCart} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Recharge to Bill
                  </Button>
                </div>
              )}

              {/* Insurance Form */}
              {billingMode === "insurance" && (
                <div className="mt-4 space-y-4 p-4 rounded-lg border bg-muted/30">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Insurance / Policy Name</Label>
                      <Input
                        placeholder="e.g. Health Insurance, Vehicle Insurance"
                        value={insuranceName}
                        onChange={(e) => setInsuranceName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Amount (₹)</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={insuranceAmount}
                        onChange={(e) => setInsuranceAmount(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Policy Number (Optional)</Label>
                      <Input
                        placeholder="Policy number"
                        value={policyNumber}
                        onChange={(e) => setPolicyNumber(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Expiry Date</Label>
                      <Input
                        type="date"
                        value={insuranceExpiryDate}
                        onChange={(e) => setInsuranceExpiryDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </div>
                  <Button onClick={addInsuranceToCart} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Insurance to Bill
                  </Button>
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
                      <div className="p-2 border-b" onPointerDown={(e) => e.stopPropagation()}>
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
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => setQuantity(item.id, parseInt(e.target.value) || 1)}
                          className="h-8 w-16 text-center text-sm font-medium"
                          min={1}
                          max={item.available_stock}
                        />
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
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => setQuantity(item.id, parseInt(e.target.value) || 1)}
                          className="h-8 w-16 text-center text-sm font-medium"
                          min={1}
                        />
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

                  {/* Recharge Items */}
                  {rechargeCount > 0 && (
                    <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mt-4">
                      <Smartphone className="h-3 w-3" /> Recharges ({rechargeCount})
                    </p>
                  )}
                  {cart.filter(i => i.item_type === "recharge").map((item) => (
                    <div 
                      key={item.id}
                      className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Validity: {item.validity_days} days • Expires: {item.expiry_date}
                        </p>
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

                  {/* Insurance Items */}
                  {insuranceCount > 0 && (
                    <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mt-4">
                      <Shield className="h-3 w-3" /> Insurance ({insuranceCount})
                    </p>
                  )}
                  {cart.filter(i => i.item_type === "insurance").map((item) => (
                    <div 
                      key={item.id}
                      className="flex items-center gap-3 rounded-lg border border-accent/30 bg-accent/5 p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.policy_number && `Policy: ${item.policy_number} • `}
                          Expires: {item.expiry_date}
                        </p>
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
          shopSettings={shopSettings}
        />
      )}
    </div>
  );
}
