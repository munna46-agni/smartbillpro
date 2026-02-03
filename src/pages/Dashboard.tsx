import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSalesSummary, useTodaySales, useSales } from "@/hooks/useSales";
import { useLowStockProducts } from "@/hooks/useProducts";
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
  ArrowRight,
  BarChart3
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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
            <p className="text-sm text-muted-foreground">Today's total sales</p>
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
            {cashPercent > 0 && <div className="h-full bg-emerald-500" style={{ width: `${cashPercent}%` }} />}
            {upiPercent > 0 && <div className="h-full bg-violet-500" style={{ width: `${upiPercent}%` }} />}
            {cardPercent > 0 && <div className="h-full bg-rose-500" style={{ width: `${cardPercent}%` }} />}
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

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Sales — last 7 days</CardTitle>
            <p className="text-sm text-muted-foreground">Daily totals</p>
          </div>
          <Link to="/sales-history">
            <Button variant="outline" size="sm">
              Open Report
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
                tickFormatter={(value) => `₹${value}`}
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

function RecentActivityCard() {
  const { data: sales } = useSales();
  const { data: purchases } = usePurchases();
  
  const recentSales = sales?.slice(0, 3) || [];
  const recentPurchases = purchases?.slice(0, 3) || [];

  return (
    <Card>
      <CardContent className="p-5">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Sales */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-primary" />
              Recent Sales
            </h3>
            {recentSales.length > 0 ? (
              <div className="space-y-2">
                {recentSales.map(sale => (
                  <div key={sale.id} className="flex justify-between items-center text-sm p-2 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-primary">
                        {sale.customer_name || `Invoice`}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(sale.invoice_date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(sale.total_amount)}</p>
                      <p className="text-xs text-muted-foreground">{sale.payment_mode}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent sales</p>
            )}
          </div>
          
          {/* Recent Purchases */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Truck className="h-4 w-4 text-accent" />
              Recent Purchases
            </h3>
            {recentPurchases.length > 0 ? (
              <div className="space-y-2">
                {recentPurchases.map(purchase => (
                  <div key={purchase.id} className="flex justify-between items-center text-sm p-2 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-accent">{purchase.item_name}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(purchase.date)}</p>
                    </div>
                    <p className="font-semibold">{formatCurrency(purchase.total_amount)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent purchases</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LowStockCard() {
  const { data: lowStockProducts } = useLowStockProducts(10);
  
  const recentAlerts = lowStockProducts?.slice(0, 5) || [];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Package className="h-4 w-4 text-warning" />
          Low Stock Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentAlerts.length > 0 ? (
          <div className="space-y-2">
            {recentAlerts.map(product => (
              <div key={product.id} className="flex justify-between items-center text-sm p-2 rounded-lg bg-warning/5 border border-warning/20">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.category}</p>
                </div>
                <span className="text-warning font-bold">{product.stock} left</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">All items well stocked! ✓</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: summary, isLoading: summaryLoading } = useSalesSummary();
  const { data: todaySales } = useTodaySales();
  
  const cashSales = todaySales?.filter(s => s.payment_mode === "Cash").reduce((sum, s) => sum + s.paid_amount, 0) || 0;
  const upiSales = todaySales?.filter(s => s.payment_mode === "UPI").reduce((sum, s) => sum + s.paid_amount, 0) || 0;
  const cardSales = todaySales?.filter(s => s.payment_mode === "Card").reduce((sum, s) => sum + s.paid_amount, 0) || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back — colorful view for quick action.</p>
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
              title="Total Sales"
              value={formatCurrency(summary?.totalSales || 0)}
              subtitle="All time"
              icon={TrendingUp}
              gradient="teal"
            />
            <GradientStatCard
              title="Cash Sales"
              value={formatCurrency(cashSales)}
              subtitle={`${((cashSales / (summary?.todayCollection || 1)) * 100).toFixed(0)}% of total`}
              icon={Banknote}
              gradient="blue"
            />
            <GradientStatCard
              title="UPI Sales"
              value={formatCurrency(upiSales)}
              subtitle="Fast digital payments"
              icon={Smartphone}
              gradient="purple"
            />
            <GradientStatCard
              title="Card Sales"
              value={formatCurrency(cardSales)}
              subtitle="POS / Terminal"
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
      
      {/* Recent Activity & Stock */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivityCard />
        </div>
        <LowStockCard />
      </div>
    </div>
  );
}
