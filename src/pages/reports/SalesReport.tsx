import { useState } from "react";
import { BarChart3, Download, Calendar, TrendingUp, Receipt, Wallet, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/format";
import { format, subDays, startOfDay, endOfDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type DateRange = "7days" | "30days" | "thisMonth" | "lastMonth";

export default function SalesReport() {
  const [dateRange, setDateRange] = useState<DateRange>("30days");

  const getDateRange = (range: DateRange) => {
    const now = new Date();
    switch (range) {
      case "7days":
        return { start: startOfDay(subDays(now, 6)), end: endOfDay(now) };
      case "30days":
        return { start: startOfDay(subDays(now, 29)), end: endOfDay(now) };
      case "thisMonth":
        return { start: startOfMonth(now), end: endOfDay(now) };
      case "lastMonth":
        const lastMonth = subDays(startOfMonth(now), 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      default:
        return { start: startOfDay(subDays(now, 29)), end: endOfDay(now) };
    }
  };

  const { start, end } = getDateRange(dateRange);

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ["sales_report", dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .gte("invoice_date", start.toISOString())
        .lte("invoice_date", end.toISOString())
        .order("invoice_date", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: saleItems = [] } = useQuery({
    queryKey: ["sale_items_report", dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sale_items")
        .select("*, sales!inner(invoice_date)")
        .gte("sales.invoice_date", start.toISOString())
        .lte("sales.invoice_date", end.toISOString());
      
      if (error) throw error;
      return data;
    },
  });

  // Calculate summary stats
  const invoices = sales.filter(s => s.bill_type === "Invoice");
  const returns = sales.filter(s => s.bill_type === "Return");
  
  const totalSales = invoices.reduce((sum, s) => sum + Number(s.total_amount), 0);
  const totalReturns = returns.reduce((sum, s) => sum + Number(s.total_amount), 0);
  const netSales = totalSales - totalReturns;
  const totalCollected = sales.reduce((sum, s) => sum + Number(s.paid_amount), 0);
  const totalBalance = sales.reduce((sum, s) => sum + Number(s.balance_amount), 0);
  const averageSale = invoices.length > 0 ? totalSales / invoices.length : 0;

  // Payment mode breakdown
  const paymentBreakdown = sales.reduce((acc, sale) => {
    const mode = sale.payment_mode;
    acc[mode] = (acc[mode] || 0) + Number(sale.paid_amount);
    return acc;
  }, {} as Record<string, number>);

  const paymentChartData = Object.entries(paymentBreakdown).map(([name, value]) => ({
    name,
    value,
  }));

  // Daily sales data for chart
  const dailySalesData = eachDayOfInterval({ start, end }).map(date => {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    
    const daySales = sales.filter(s => {
      const saleDate = new Date(s.invoice_date);
      return saleDate >= dayStart && saleDate <= dayEnd && s.bill_type === "Invoice";
    });
    
    const dayReturns = sales.filter(s => {
      const saleDate = new Date(s.invoice_date);
      return saleDate >= dayStart && saleDate <= dayEnd && s.bill_type === "Return";
    });
    
    return {
      date: format(date, "dd MMM"),
      sales: daySales.reduce((sum, s) => sum + Number(s.total_amount), 0),
      returns: dayReturns.reduce((sum, s) => sum + Number(s.total_amount), 0),
      invoices: daySales.length,
    };
  });

  // Top selling items
  const itemSales = saleItems.reduce((acc, item) => {
    const name = item.product_name;
    if (!acc[name]) {
      acc[name] = { name, quantity: 0, revenue: 0 };
    }
    acc[name].quantity += item.quantity;
    acc[name].revenue += Number(item.total);
    return acc;
  }, {} as Record<string, { name: string; quantity: number; revenue: number }>);

  const topItems = Object.values(itemSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted))"];

  const handleExport = () => {
    const csvContent = [
      ["Date", "Invoice Type", "Customer", "Payment Mode", "Total", "Paid", "Balance"].join(","),
      ...sales.map(s => [
        format(new Date(s.invoice_date), "yyyy-MM-dd"),
        s.bill_type,
        `"${s.customer_name || 'Walk-in'}"`,
        s.payment_mode,
        s.total_amount,
        s.paid_amount,
        s.balance_amount,
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-report-${format(start, "yyyy-MM-dd")}-to-${format(end, "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales Report</h1>
          <p className="text-muted-foreground">Analyze your sales performance</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
            <SelectTrigger className="w-[160px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Net Sales</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(netSales)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(totalSales)} sales - {formatCurrency(totalReturns)} returns
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Invoices</CardDescription>
            <CardTitle className="text-2xl">{invoices.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{returns.length} returns</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Sale</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(averageSale)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Per invoice</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Outstanding</CardDescription>
            <CardTitle className="text-2xl text-destructive">{formatCurrency(totalBalance)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{formatCurrency(totalCollected)} collected</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Sales Trend
          </CardTitle>
          <CardDescription>
            Daily sales and returns for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dailySalesData.every(d => d.sales === 0 && d.returns === 0) ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No sales data</h3>
              <p className="text-sm text-muted-foreground mt-1">
                No sales recorded in this period
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailySalesData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))" 
                  fillOpacity={0.2}
                  name="Sales"
                />
                <Area 
                  type="monotone" 
                  dataKey="returns" 
                  stroke="hsl(var(--destructive))" 
                  fill="hsl(var(--destructive))" 
                  fillOpacity={0.2}
                  name="Returns"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Payment Mode Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Payment Mode
            </CardTitle>
            <CardDescription>
              Collection breakdown by payment method
            </CardDescription>
          </CardHeader>
          <CardContent>
            {paymentChartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Wallet className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">No payment data</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={paymentChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {paymentChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Selling Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Top Selling Items
            </CardTitle>
            <CardDescription>
              Best performing products by revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Receipt className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">No items sold</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={topItems} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                  <XAxis 
                    type="number" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fontSize: 11 }}
                    width={100}
                    tickLine={false}
                  />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar 
                    dataKey="revenue" 
                    fill="hsl(var(--primary))" 
                    radius={[0, 4, 4, 0]}
                    name="Revenue"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
