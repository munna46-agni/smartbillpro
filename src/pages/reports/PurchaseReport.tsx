import { useState } from "react";
import { Truck, Download, Calendar, TrendingUp, Building2, Package, Loader2 } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "recharts";

type DateRange = "7days" | "30days" | "thisMonth" | "lastMonth";

export default function PurchaseReport() {
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

  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ["purchases_report", dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchases")
        .select("*")
        .gte("date", start.toISOString())
        .lte("date", end.toISOString())
        .order("date", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Calculate summary stats
  const totalPurchases = purchases.reduce((sum, p) => sum + Number(p.total_amount), 0);
  const totalOrders = purchases.length;
  const totalQuantity = purchases.reduce((sum, p) => sum + p.quantity, 0);

  // Supplier breakdown
  const supplierBreakdown = purchases.reduce((acc, p) => {
    const supplier = p.supplier_name;
    if (!acc[supplier]) {
      acc[supplier] = { name: supplier, amount: 0, orders: 0, items: 0 };
    }
    acc[supplier].amount += Number(p.total_amount);
    acc[supplier].orders += 1;
    acc[supplier].items += p.quantity;
    return acc;
  }, {} as Record<string, { name: string; amount: number; orders: number; items: number }>);

  const supplierData = Object.values(supplierBreakdown)
    .sort((a, b) => b.amount - a.amount);

  const topSupplier = supplierData[0]?.name || "—";

  // Daily purchase data for chart
  const dailyPurchaseData = eachDayOfInterval({ start, end }).map(date => {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    
    const dayPurchases = purchases.filter(p => {
      const purchaseDate = new Date(p.date);
      return purchaseDate >= dayStart && purchaseDate <= dayEnd;
    });
    
    return {
      date: format(date, "dd MMM"),
      amount: dayPurchases.reduce((sum, p) => sum + Number(p.total_amount), 0),
      orders: dayPurchases.length,
    };
  });

  // Item breakdown
  const itemBreakdown = purchases.reduce((acc, p) => {
    const item = p.item_name;
    if (!acc[item]) {
      acc[item] = { name: item, quantity: 0, amount: 0 };
    }
    acc[item].quantity += p.quantity;
    acc[item].amount += Number(p.total_amount);
    return acc;
  }, {} as Record<string, { name: string; quantity: number; amount: number }>);

  const topItems = Object.values(itemBreakdown)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const handleExport = () => {
    const csvContent = [
      ["Date", "Supplier", "Item", "Invoice No", "Quantity", "Cost", "Total"].join(","),
      ...purchases.map(p => [
        format(new Date(p.date), "yyyy-MM-dd"),
        `"${p.supplier_name}"`,
        `"${p.item_name}"`,
        p.invoice_no || "",
        p.quantity,
        p.cost,
        p.total_amount,
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `purchase-report-${format(start, "yyyy-MM-dd")}-to-${format(end, "yyyy-MM-dd")}.csv`;
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
          <h1 className="text-2xl font-bold tracking-tight">Purchase Report</h1>
          <p className="text-muted-foreground">Track purchase expenses and supplier payments</p>
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
            <CardDescription>Total Purchases</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(totalPurchases)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{totalQuantity} items purchased</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Purchase Orders</CardDescription>
            <CardTitle className="text-2xl">{totalOrders}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {supplierData.length} unique suppliers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Top Supplier</CardDescription>
            <CardTitle className="text-lg truncate">{topSupplier}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {supplierData[0] ? formatCurrency(supplierData[0].amount) : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg. Order Value</CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency(totalOrders > 0 ? totalPurchases / totalOrders : 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Per purchase order</p>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Purchase Trend
          </CardTitle>
          <CardDescription>
            Daily purchase expenses for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dailyPurchaseData.every(d => d.amount === 0) ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Truck className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No purchase data</h3>
              <p className="text-sm text-muted-foreground mt-1">
                No purchases recorded in this period
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyPurchaseData}>
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
                  dataKey="amount" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))" 
                  fillOpacity={0.2}
                  name="Amount"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Items Purchased */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Top Items Purchased
            </CardTitle>
            <CardDescription>
              Most purchased items by value
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Package className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">No items purchased</p>
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
                    dataKey="amount" 
                    fill="hsl(var(--primary))" 
                    radius={[0, 4, 4, 0]}
                    name="Amount"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Supplier Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Supplier Breakdown
            </CardTitle>
            <CardDescription>
              Purchase distribution by supplier
            </CardDescription>
          </CardHeader>
          <CardContent>
            {supplierData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Building2 className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">No supplier data</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[200px] overflow-auto">
                {supplierData.slice(0, 5).map((supplier, index) => (
                  <div key={supplier.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-muted-foreground w-4">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-sm">{supplier.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {supplier.orders} orders • {supplier.items} items
                        </p>
                      </div>
                    </div>
                    <span className="font-medium">{formatCurrency(supplier.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Purchases Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Recent Purchases
          </CardTitle>
          <CardDescription>
            Latest purchase orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          {purchases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Truck className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No purchase data yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Record purchases to see detailed reports here
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Invoice No.</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.slice(0, 10).map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(purchase.date), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell className="font-medium">{purchase.supplier_name}</TableCell>
                      <TableCell>{purchase.item_name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {purchase.invoice_no || "—"}
                      </TableCell>
                      <TableCell className="text-right">{purchase.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(purchase.cost)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(purchase.total_amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
