import { useState } from "react";
import { Building2, Search, Trash2, Loader2, Phone, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSuppliers } from "@/hooks/useSuppliers";
import { AddSupplierDialog } from "@/components/suppliers/AddSupplierDialog";
import { EditSupplierDialog } from "@/components/suppliers/EditSupplierDialog";
import { SupplierHistoryDialog } from "@/components/suppliers/SupplierHistoryDialog";
import { formatCurrency } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Suppliers() {
  const { suppliers, isLoading, deleteSupplier } = useSuppliers();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (supplier.contact_person && supplier.contact_person.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (supplier.mobile_number && supplier.mobile_number.includes(searchQuery))
  );

  const totalSuppliers = suppliers.length;
  const totalPurchases = suppliers.reduce((sum, s) => sum + Number(s.total_purchases), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground">Manage your supplier contacts</p>
        </div>
        <AddSupplierDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4 text-primary" />
              Total Suppliers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSuppliers}</div>
            <p className="text-xs text-muted-foreground">Registered suppliers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4 text-primary" />
              Total Purchases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPurchases)}</div>
            <p className="text-xs text-muted-foreground">From all suppliers</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search by name, contact or mobile..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Supplier Directory
          </CardTitle>
          <CardDescription>
            Manage supplier information and track purchase orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">
                {searchQuery ? "No suppliers found" : "No suppliers yet"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery 
                  ? "Try a different search term"
                  : "Add suppliers to organize your purchase records"
                }
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>GST Number</TableHead>
                    <TableHead className="text-right">Total Purchases</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{supplier.name}</p>
                          {supplier.contact_person && (
                            <p className="text-xs text-muted-foreground">{supplier.contact_person}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {supplier.mobile_number && (
                            <span className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              {supplier.mobile_number}
                            </span>
                          )}
                          {supplier.email && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {supplier.email}
                            </span>
                          )}
                          {!supplier.mobile_number && !supplier.email && (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {supplier.gst_number || "—"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(supplier.total_purchases)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <SupplierHistoryDialog supplier={supplier} />
                          <EditSupplierDialog supplier={supplier} />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{supplier.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteSupplier.mutate(supplier.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
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
