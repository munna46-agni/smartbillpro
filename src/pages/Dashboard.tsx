import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSalesSummary, useTodaySales } from "@/hooks/useSales";
import { useLowStockProducts } from "@/hooks/useProducts";
import { formatCurrency } from "@/lib/format";
import { 
  TrendingUp, 
  Wallet, 
  AlertTriangle, 
  DollarSign,
  Package,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  variant = "default" 
}: { 
  title: string; 
  value: string; 
  icon: React.ElementType;
  trend?: { value: string; positive: boolean };
  variant?: "default" | "success" | "warning" | "danger";
}) {
  const variantStyles = {
    default: "bg-card",
    success: "bg-success/10 border-success/20",
    warning: "bg-warning/10 border-warning/20",
    danger: "bg-danger/10 border-danger/20",
  };
  
  const iconStyles = {
    default: "bg-primary/10 text-primary",
    success: "bg-success/20 text-success",
    warning: "bg-warning/20 text-warning",
    danger: "bg-danger/20 text-danger",
  };

  return (
    <Card className={`${variantStyles[variant]} transition-all hover:shadow-md`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {trend && (
              <div className={`flex items-center gap-1 text-xs font-medium ${trend.positive ? 'text-success' : 'text-danger'}`}>
                {trend.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {trend.value}
              </div>
            )}
          </div>
          <div className={`rounded-xl p-3 ${iconStyles[variant]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TodaySnapshot({ todayCollection, totalDues }: { todayCollection: number; totalDues: number }) {
  const collectionPercent = totalDues > 0 ? Math.min(100, (todayCollection / (todayCollection + totalDues)) * 100) : 100;
  
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          Today's Snapshot
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Cash Collected</p>
              <p className="text-2xl font-bold text-success">{formatCurrency(todayCollection)}</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-sm text-muted-foreground">Outstanding Dues</p>
              <p className="text-2xl font-bold text-danger">{formatCurrency(totalDues)}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Collection vs Dues</span>
              <span className="font-medium">{collectionPercent.toFixed(1)}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-success to-success/70 transition-all duration-500"
                style={{ width: `${collectionPercent}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LowStockAlerts() {
  const { data: lowStockProducts, isLoading } = useLowStockProducts(5);
  
  if (isLoading) {
    return (
      <Card className="col-span-full lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Low Stock Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="h-5 w-5 text-warning" />
          Low Stock Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {lowStockProducts && lowStockProducts.length > 0 ? (
          <div className="space-y-3">
            {lowStockProducts.slice(0, 5).map((product) => (
              <div 
                key={product.id} 
                className="flex items-center justify-between rounded-lg bg-warning/5 p-3 border border-warning/20"
              >
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-warning">{product.stock} left</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mb-2 opacity-50" />
            <p>All products are well stocked!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecentSales() {
  const { data: todaySales, isLoading } = useTodaySales();
  
  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="text-lg">Today's Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="h-5 w-5 text-success" />
          Today's Sales
        </CardTitle>
      </CardHeader>
      <CardContent>
        {todaySales && todaySales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Paid</th>
                  <th className="pb-3 font-medium">Due</th>
                  <th className="pb-3 font-medium">Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {todaySales.slice(0, 10).map((sale) => (
                  <tr key={sale.id} className="text-sm">
                    <td className="py-3">
                      <div>
                        <p className="font-medium">{sale.customer_name || "Walk-in"}</p>
                        <p className="text-xs text-muted-foreground">{sale.mobile_number || "-"}</p>
                      </div>
                    </td>
                    <td className="py-3 font-medium">{formatCurrency(sale.total_amount)}</td>
                    <td className="py-3 text-success">{formatCurrency(sale.paid_amount)}</td>
                    <td className={`py-3 ${sale.balance_amount > 0 ? 'text-danger font-medium' : 'text-muted-foreground'}`}>
                      {formatCurrency(sale.balance_amount)}
                    </td>
                    <td className="py-3">
                      <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium">
                        {sale.payment_mode}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <DollarSign className="h-12 w-12 mb-2 opacity-50" />
            <p>No sales yet today</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: summary, isLoading: summaryLoading } = useSalesSummary();
  const { data: lowStock } = useLowStockProducts(5);
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your business performance</p>
      </div>
      
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryLoading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <StatCard
              title="Total Sales"
              value={formatCurrency(summary?.totalSales || 0)}
              icon={TrendingUp}
              variant="success"
            />
            <StatCard
              title="Today's Collection"
              value={formatCurrency(summary?.todayCollection || 0)}
              icon={Wallet}
              variant="success"
            />
            <StatCard
              title="Total Dues"
              value={formatCurrency(summary?.totalDues || 0)}
              icon={DollarSign}
              variant="danger"
            />
            <StatCard
              title="Stock Alerts"
              value={String(lowStock?.length || 0)}
              icon={AlertTriangle}
              variant={lowStock && lowStock.length > 0 ? "warning" : "default"}
            />
          </>
        )}
      </div>
      
      {/* Snapshot & Alerts */}
      <div className="grid gap-4 lg:grid-cols-4">
        <TodaySnapshot 
          todayCollection={summary?.todayCollection || 0} 
          totalDues={summary?.totalDues || 0} 
        />
        <LowStockAlerts />
      </div>
      
      {/* Recent Sales */}
      <RecentSales />
    </div>
  );
}
