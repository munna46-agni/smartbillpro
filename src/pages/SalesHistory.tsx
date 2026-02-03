import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSales } from "@/hooks/useSales";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { FileText, Search, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function SalesHistory() {
  const { data: sales, isLoading } = useSales();
  
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [dueFilter, setDueFilter] = useState<string>("all");
  
  const filteredSales = sales?.filter(sale => {
    const matchesSearch = 
      sale.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      sale.mobile_number?.includes(search);
    
    const matchesPayment = paymentFilter === "all" || sale.payment_mode === paymentFilter;
    
    const matchesDue = dueFilter === "all" || 
      (dueFilter === "due" && sale.balance_amount > 0) ||
      (dueFilter === "paid" && sale.balance_amount === 0);
    
    return matchesSearch && matchesPayment && matchesDue;
  });
  
  const totalAmount = filteredSales?.reduce((sum, s) => sum + s.total_amount, 0) || 0;
  const totalPaid = filteredSales?.reduce((sum, s) => sum + s.paid_amount, 0) || 0;
  const totalDue = filteredSales?.reduce((sum, s) => sum + s.balance_amount, 0) || 0;

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sales History</h1>
        <p className="text-muted-foreground">View and filter all sales transactions</p>
      </div>
      
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Sales</p>
            <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
          </CardContent>
        </Card>
        <Card className="bg-success/5 border-success/20">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Collected</p>
            <p className="text-2xl font-bold text-success">{formatCurrency(totalPaid)}</p>
          </CardContent>
        </Card>
        <Card className="bg-danger/5 border-danger/20">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Outstanding</p>
            <p className="text-2xl font-bold text-danger">{formatCurrency(totalDue)}</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters & Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5" />
              All Sales ({filteredSales?.length || 0})
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or mobile..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dueFilter} onValueChange={setDueFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Fully Paid</SelectItem>
                  <SelectItem value="due">Has Due</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredSales && filteredSales.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Due</TableHead>
                    <TableHead className="text-center">Mode</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="text-sm">
                        {formatDateTime(sale.invoice_date)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{sale.customer_name || "Walk-in"}</p>
                          <p className="text-xs text-muted-foreground">{sale.mobile_number || "-"}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(sale.total_amount)}
                      </TableCell>
                      <TableCell className="text-right text-success">
                        {formatCurrency(sale.paid_amount)}
                      </TableCell>
                      <TableCell className={cn(
                        "text-right font-medium",
                        sale.balance_amount > 0 ? "text-danger" : "text-muted-foreground"
                      )}>
                        {formatCurrency(sale.balance_amount)}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                          {sale.payment_mode}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mb-3 opacity-50" />
              <p>No sales found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
