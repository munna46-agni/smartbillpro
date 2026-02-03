import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCashClosings, useTodaySystemCash, useAddCashClosing } from "@/hooks/useCashClosing";
import { formatCurrency, formatDate } from "@/lib/format";
import { Wallet, Save, Calculator, TrendingUp, TrendingDown, Equal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function CashClosing() {
  const { data: systemCash, isLoading: systemLoading } = useTodaySystemCash();
  const { data: closings, isLoading: closingsLoading } = useCashClosings();
  const addCashClosing = useAddCashClosing();
  
  const [openingCash, setOpeningCash] = useState("");
  const [physicalCash, setPhysicalCash] = useState("");
  
  const expectedCash = (parseFloat(openingCash) || 0) + (systemCash || 0);
  const difference = (parseFloat(physicalCash) || 0) - expectedCash;
  
  const handleSave = async () => {
    await addCashClosing.mutateAsync({
      date: new Date().toISOString().split('T')[0],
      opening_cash: parseFloat(openingCash) || 0,
      system_cash: systemCash || 0,
      physical_cash: parseFloat(physicalCash) || 0,
      difference: difference,
    });
    
    setOpeningCash("");
    setPhysicalCash("");
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cash Closing</h1>
        <p className="text-muted-foreground">Daily cash reconciliation</p>
      </div>
      
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Cash Closing Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Today's Closing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-success/10 border border-success/20">
              <p className="text-sm text-muted-foreground">System Cash (Today's Cash Sales)</p>
              {systemLoading ? (
                <Skeleton className="h-8 w-32 mt-1" />
              ) : (
                <p className="text-2xl font-bold text-success">{formatCurrency(systemCash || 0)}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="opening">Opening Cash</Label>
              <Input
                id="opening"
                type="number"
                value={openingCash}
                onChange={(e) => setOpeningCash(e.target.value)}
                placeholder="Cash in drawer at start"
                className="h-12 text-lg"
              />
            </div>
            
            <div className="p-3 rounded-lg bg-muted">
              <div className="flex justify-between items-center">
                <span className="text-sm">Expected Cash</span>
                <span className="text-lg font-bold">{formatCurrency(expectedCash)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Opening + System Cash
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="physical">Physical Cash (Actual Count)</Label>
              <Input
                id="physical"
                type="number"
                value={physicalCash}
                onChange={(e) => setPhysicalCash(e.target.value)}
                placeholder="Cash in drawer now"
                className="h-12 text-lg"
              />
            </div>
            
            <div className={cn(
              "p-4 rounded-lg border",
              difference === 0 
                ? "bg-muted border-border" 
                : difference > 0 
                  ? "bg-success/10 border-success/20" 
                  : "bg-danger/10 border-danger/20"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {difference === 0 ? (
                    <Equal className="h-5 w-5 text-muted-foreground" />
                  ) : difference > 0 ? (
                    <TrendingUp className="h-5 w-5 text-success" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-danger" />
                  )}
                  <span className="text-sm font-medium">Difference</span>
                </div>
                <span className={cn(
                  "text-xl font-bold",
                  difference === 0 
                    ? "text-muted-foreground" 
                    : difference > 0 
                      ? "text-success" 
                      : "text-danger"
                )}>
                  {difference > 0 ? "+" : ""}{formatCurrency(difference)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {difference === 0 
                  ? "Cash matches perfectly!" 
                  : difference > 0 
                    ? "Excess cash in drawer" 
                    : "Cash short in drawer"}
              </p>
            </div>
            
            <Button 
              onClick={handleSave}
              className="w-full h-12"
              disabled={addCashClosing.isPending || !physicalCash}
            >
              <Save className="h-4 w-4 mr-2" />
              {addCashClosing.isPending ? "Saving..." : "Save Cash Closing"}
            </Button>
          </CardContent>
        </Card>
        
        {/* History */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Closing History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {closingsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : closings && closings.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Opening</TableHead>
                      <TableHead className="text-right">System</TableHead>
                      <TableHead className="text-right">Physical</TableHead>
                      <TableHead className="text-right">Difference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {closings.map((closing) => (
                      <TableRow key={closing.id}>
                        <TableCell className="font-medium">
                          {formatDate(closing.date)}
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(closing.opening_cash)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(closing.system_cash)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(closing.physical_cash)}</TableCell>
                        <TableCell className={cn(
                          "text-right font-medium",
                          closing.difference === 0 
                            ? "" 
                            : closing.difference > 0 
                              ? "text-success" 
                              : "text-danger"
                        )}>
                          {closing.difference > 0 ? "+" : ""}{formatCurrency(closing.difference)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Wallet className="h-12 w-12 mb-3 opacity-50" />
                <p>No closing records yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
