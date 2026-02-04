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
import { Supplier, useSupplierPurchaseHistory } from "@/hooks/useSuppliers";
import { formatCurrency } from "@/lib/format";
import { format } from "date-fns";

interface SupplierHistoryDialogProps {
  supplier: Supplier;
}

export function SupplierHistoryDialog({ supplier }: SupplierHistoryDialogProps) {
  const [open, setOpen] = useState(false);
  const { purchases, isLoading } = useSupplierPurchaseHistory(open ? supplier.name : null);

  const totalPurchases = purchases.reduce((sum, p) => sum + Number(p.total_amount), 0);
  const totalQuantity = purchases.reduce((sum, p) => sum + Number(p.quantity), 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <History className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Purchase History - {supplier.name}</DialogTitle>
          <DialogDescription>
            {supplier.contact_person && `Contact: ${supplier.contact_person}`}
            {supplier.mobile_number && ` | Mobile: ${supplier.mobile_number}`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-4 py-4">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Total Orders</p>
            <p className="text-lg font-bold">{purchases.length}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Total Items</p>
            <p className="text-lg font-bold">{totalQuantity}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Total Amount</p>
            <p className="text-lg font-bold text-primary">{formatCurrency(totalPurchases)}</p>
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
                No purchases recorded from this supplier yet
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Invoice No.</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(purchase.date), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell>{purchase.invoice_no || "—"}</TableCell>
                      <TableCell className="font-medium">{purchase.item_name}</TableCell>
                      <TableCell className="text-right">{purchase.quantity}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(purchase.cost)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(purchase.total_amount)}
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
