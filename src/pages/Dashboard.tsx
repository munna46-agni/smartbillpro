import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSalesSummary, useTodaySales, useSales } from "@/hooks/useSales";
import { useProducts, useLowStockProducts } from "@/hooks/useProducts";
import { usePurchases } from "@/hooks/usePurchases";
import { formatCurrency, formatDate } from "@/lib/format";
import { 
  TrendingUp, 
  Wallet, 
  CreditCard, 
  Smartphone,
  Banknote,
  Package,
  ShoppingCart,
  Truck,
  AlertTriangle,
  IndianRupee
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Badge } from "@/components/ui/badge";

// Summary Cards with Gradients
function GradientStatCard({ 
  title, 
  value, 
  subtitle,
  icon: Icon, 
  gradient 
}: { 
  title: string; 
  value: string; 
  subtitle?: string;
  icon: React.ElementType;
  gradient: "teal" | "blue" | "purple" | "pink" | "cyan";
}) {
  const gradientClass = {
    teal: "gradient-card-teal",
    blue: "gradient-card-blue",
    purple: "gradient-card-purple",
    pink: "gradient-card-pink",
    cyan: "gradient-card-cyan",
  }[gradient];

  return (
    <div className={`${gradientClass} relative overflow-hidden transition-transform hover:scale-[1.02]`}>
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-sm font-medium text-white/80">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && <p className="text-xs text-white/70">{subtitle}</p>}
        </div>
        <div className="p-2 rounded-lg bg-white/20">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {/* Decorative circle */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
    </div>
  );
}

function TodaySalesCard() {
  const { data: todaySales, isLoading } = useTodaySales();
  
  const cashTotal = todaySales?.filter(s => s.payment_mode === "Cash").reduce((sum, s) => sum + s.paid_amount, 0) || 0;
  const upiTotal = todaySales?.filter(s => s.payment_mode === "UPI").reduce((sum, s) => sum + s.paid_amount, 0) || 0;
  const cardTotal = todaySales?.filter(s => s.payment_mode === "Card").reduce((sum, s) => sum + s.paid_amount, 0) || 0;
  const creditTotal = todaySales?.reduce((sum, s) => sum + s.balance_amount, 0) || 0;
  const totalToday = todaySales?.reduce((sum, s) => sum + s.total_amount, 0) || 0;
  const invoiceCount = todaySales?.filter(s => s.bill_type === "Invoice").length || 0;
  
  const total = cashTotal + upiTotal + cardTotal;
  const cashPercent = total > 0 ? (cashTotal / total) * 100 : 0;
  const upiPercent = total > 0 ? (upiTotal / total) * 100 : 0;
  const cardPercent = total > 0 ? (cardTotal / total) * 100 : 0;

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Today — {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(totalToday)}</p>
            <p className="text-sm text-muted-foreground">{invoiceCount} invoices today</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="badge-cash">Cash {formatCurrency(cashTotal)}</span>
            <span className="badge-upi">UPI {formatCurrency(upiTotal)}</span>
            <span className="badge-card">Card {formatCurrency(cardTotal)}</span>
            {creditTotal > 0 && <span className="badge-credit">Credit {formatCurrency(creditTotal)}</span>}
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Payment Share</p>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden flex">
            {cashPercent > 0 && <div className="h-full bg-primary" style={{ width: `${cashPercent}%` }} />}
            {upiPercent > 0 && <div className="h-full bg-secondary" style={{ width: `${upiPercent}%` }} />}
            {cardPercent > 0 && <div className="h-full bg-accent" style={{ width: `${cardPercent}%` }} />}
          </div>
          <p className="text-xs text-muted-foreground">
            {cashPercent.toFixed(0)}% Cash • {upiPercent.toFixed(0)}% UPI • {cardPercent.toFixed(0)}% Card
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function SalesChartCard() {
  const { data: allSales } = useSales();
  
  // Get last 7 days data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);
    return date;
  });
  
  const chartData = last7Days.map(date => {
    const dayStart = new Date(date);
    const dayEnd = new Date(date);
    dayEnd.setDate(dayEnd.getDate() + 1);
    
    const daySales = allSales?.filter(s => {
      const saleDate = new Date(s.invoice_date);
      return saleDate >= dayStart && saleDate < dayEnd;
    }) || [];
    
    const total = daySales.reduce((sum, s) => sum + s.total_amount, 0);
    
    return {
      date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      sales: total,
      count: daySales.length,
    };
  });

  const totalWeekSales = chartData.reduce((sum, d) => sum + d.sales, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Sales — last 7 days</CardTitle>
            <p className="text-sm text-muted-foreground">{formatCurrency(totalWeekSales)} total</p>
          </div>
          <Link to="/reports/sales">
            <Button variant="outline" size="sm">
              View Report
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11 }} 
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis 
                tick={{ fontSize: 11 }} 
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [formatCurrency(value), 'Sales']}
              />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickStatsCard() {
  const { data: allProducts = [] } = useProducts();
  const { data: purchases = [] } = usePurchases();
  const { data: summary } = useSalesSummary();

  const products = allProducts.filter(p => p.item_type === "product");
  const stockValue = products.reduce((sum, p) => sum + (p.stock * p.cost_price), 0);
  const totalPurchases = purchases.reduce((sum, p) => sum + Number(p.total_amount), 0);

  const stats = [
    { label: "Stock Value", value: formatCurrency(stockValue), icon: Package, color: "text-primary" },
    { label: "Outstanding Dues", value: formatCurrency(summary?.totalDues || 0), icon: IndianRupee, color: "text-destructive" },
    { label: "Total Purchases", value: formatCurrency(totalPurchases), icon: Truck, color: "text-secondary-foreground" },
    { label: "Total Products", value: products.length.toString(), icon: ShoppingCart, color: "text-primary" },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" />
          Quick Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-lg font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RecentActivityCard() {
  const { data: sales } = useSales();
  const { data: purchases } = usePurchases();
  
  const recentSales = sales?.slice(0, 4) || [];
  const recentPurchases = purchases?.slice(0, 4) || [];

  return (
    <Card>
      <CardContent className="p-5">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Sales */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-primary" />
                Recent Sales
              </h3>
              <Link to="/sales-history">
                <Button variant="ghost" size="sm" className="h-7 text-xs">View All</Button>
              </Link>
            </div>
            {recentSales.length > 0 ? (
              <div className="space-y-2">
                {recentSales.map(sale => (
                  <div key={sale.id} className="flex justify-between items-center text-sm p-2 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">
                        {sale.customer_name || `Walk-in`}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(sale.invoice_date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(sale.total_amount)}</p>
                      <Badge variant="outline" className="text-xs">{sale.payment_mode}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">No recent sales</p>
            )}
          </div>
          
          {/* Recent Purchases */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Truck className="h-4 w-4 text-secondary-foreground" />
                Recent Purchases
              </h3>
              <Link to="/purchases">
                <Button variant="ghost" size="sm" className="h-7 text-xs">View All</Button>
              </Link>
            </div>
            {recentPurchases.length > 0 ? (
              <div className="space-y-2">
                {recentPurchases.map(purchase => (
                  <div key={purchase.id} className="flex justify-between items-center text-sm p-2 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{purchase.item_name}</p>
                      <p className="text-xs text-muted-foreground">{purchase.supplier_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(purchase.total_amount)}</p>
                      <p className="text-xs text-muted-foreground">{purchase.quantity} qty</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">No recent purchases</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LowStockCard() {
  const { data: lowStockProducts } = useLowStockProducts(10);
  
  const outOfStock = lowStockProducts?.filter(p => p.stock === 0) || [];
  const lowStock = lowStockProducts?.filter(p => p.stock > 0) || [];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Stock Alerts
          </CardTitle>
          <Link to="/reports/stock">
            <Button variant="ghost" size="sm" className="h-7 text-xs">View Report</Button>
          </Link>
        </div>
        {(outOfStock.length > 0 || lowStock.length > 0) && (
          <div className="flex gap-2 mt-1">
            {outOfStock.length > 0 && (
              <Badge variant="destructive" className="text-xs">{outOfStock.length} out of stock</Badge>
            )}
            {lowStock.length > 0 && (
              <Badge variant="secondary" className="text-xs">{lowStock.length} low stock</Badge>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {lowStockProducts && lowStockProducts.length > 0 ? (
          <div className="space-y-2 max-h-[200px] overflow-auto">
            {lowStockProducts.slice(0, 6).map(product => (
              <div key={product.id} className="flex justify-between items-center text-sm p-2 rounded-lg border border-destructive/20 bg-destructive/5">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.category || "Uncategorized"}</p>
                </div>
                <span className={`font-bold ${product.stock === 0 ? 'text-destructive' : 'text-secondary-foreground'}`}>
                  {product.stock === 0 ? "Out!" : `${product.stock} left`}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Package className="h-10 w-10 text-primary/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">All items well stocked! ✓</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: summary, isLoading: summaryLoading } = useSalesSummary();
  const { data: todaySales } = useTodaySales();
  
  const totalTodaySales = todaySales?.reduce((sum, s) => sum + s.total_amount, 0) || 0;
  const todayCollected = todaySales?.reduce((sum, s) => sum + s.paid_amount, 0) || 0;
  const cashSales = todaySales?.filter(s => s.payment_mode === "Cash").reduce((sum, s) => sum + s.paid_amount, 0) || 0;
  const upiSales = todaySales?.filter(s => s.payment_mode === "UPI").reduce((sum, s) => sum + s.paid_amount, 0) || 0;
  const cardSales = todaySales?.filter(s => s.payment_mode === "Card").reduce((sum, s) => sum + s.paid_amount, 0) || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Real-time overview of your business</p>
        </div>
        <div className="flex gap-2">
          <Link to="/new-sale">
            <Button className="bg-primary hover:bg-primary/90">
              <ShoppingCart className="h-4 w-4 mr-2" />
              New Sale
            </Button>
          </Link>
          <Link to="/purchases">
            <Button variant="outline">
              <Truck className="h-4 w-4 mr-2" />
              New Purchase
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Gradient Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {summaryLoading ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : (
          <>
            <GradientStatCard
              title="Today's Sales"
              value={formatCurrency(totalTodaySales)}
              subtitle={`${todaySales?.length || 0} invoices`}
              icon={TrendingUp}
              gradient="teal"
            />
            <GradientStatCard
              title="Cash Collection"
              value={formatCurrency(cashSales)}
              subtitle={todayCollected > 0 ? `${((cashSales / todayCollected) * 100).toFixed(0)}% of collected` : "Today"}
              icon={Banknote}
              gradient="blue"
            />
            <GradientStatCard
              title="UPI Collection"
              value={formatCurrency(upiSales)}
              subtitle={todayCollected > 0 ? `${((upiSales / todayCollected) * 100).toFixed(0)}% of collected` : "Today"}
              icon={Smartphone}
              gradient="purple"
            />
            <GradientStatCard
              title="Card Collection"
              value={formatCurrency(cardSales)}
              subtitle={todayCollected > 0 ? `${((cardSales / todayCollected) * 100).toFixed(0)}% of collected` : "Today"}
              icon={CreditCard}
              gradient="pink"
            />
          </>
        )}
      </div>
      
      {/* Today's Sales & Chart */}
      <div className="grid gap-4 lg:grid-cols-2">
        <TodaySalesCard />
        <SalesChartCard />
      </div>
      
      {/* Quick Stats & Stock Alerts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <QuickStatsCard />
        <div className="lg:col-span-2">
          <LowStockCard />
        </div>
      </div>
      
      {/* Recent Activity */}
      <RecentActivityCard />
    </div>
  );
}
