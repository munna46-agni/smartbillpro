import { useState } from "react";
import { History, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Customer, useCustomerPurchaseHistory } from "@/hooks/useCustomers";
import { formatCurrency } from "@/lib/format";
import { format } from "date-fns";

interface CustomerHistoryDialogProps {
  customer: Customer;
}

export function CustomerHistoryDialog({ customer }: CustomerHistoryDialogProps) {
  const [open, setOpen] = useState(false);
  const { purchases, isLoading } = useCustomerPurchaseHistory(open ? customer.mobile_number : null);

  const totalPurchases = purchases.reduce((sum, p) => sum + Number(p.total_amount), 0);
  const totalPaid = purchases.reduce((sum, p) => sum + Number(p.paid_amount), 0);
  const totalBalance = purchases.reduce((sum, p) => sum + Number(p.balance_amount), 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <History className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Purchase History - {customer.name}</DialogTitle>
          <DialogDescription>
            Mobile: {customer.mobile_number}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-4 py-4">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Total Purchases</p>
            <p className="text-lg font-bold">{formatCurrency(totalPurchases)}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Total Paid</p>
            <p className="text-lg font-bold text-primary">{formatCurrency(totalPaid)}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Balance Due</p>
            <p className="text-lg font-bold text-destructive">{formatCurrency(totalBalance)}</p>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : purchases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <History className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No purchase history</h3>
              <p className="text-sm text-muted-foreground mt-1">
                This customer hasn't made any purchases yet
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(sale.invoice_date), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge variant={sale.bill_type === "Invoice" ? "default" : "destructive"}>
                          {sale.bill_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{sale.payment_mode}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(sale.total_amount)}
                      </TableCell>
                      <TableCell className="text-right text-primary">
                        {formatCurrency(sale.paid_amount)}
                      </TableCell>
                      <TableCell className="text-right text-destructive">
                        {Number(sale.balance_amount) > 0 ? formatCurrency(sale.balance_amount) : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
