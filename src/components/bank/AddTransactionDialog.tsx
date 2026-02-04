import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBankTransactions, BankTransactionInsert } from "@/hooks/useBankTransactions";
import { BankAccount } from "@/hooks/useBankAccounts";

interface AddTransactionDialogProps {
  accounts: BankAccount[];
}

export function AddTransactionDialog({ accounts }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const { addTransaction } = useBankTransactions();
  
  const [formData, setFormData] = useState<BankTransactionInsert>({
    bank_account_id: "",
    transaction_type: "credit",
    amount: 0,
    description: "",
    reference_no: "",
    transaction_date: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bank_account_id || formData.amount <= 0) {
      return;
    }

    await addTransaction.mutateAsync({
      ...formData,
      transaction_date: new Date(formData.transaction_date || new Date()).toISOString(),
    });
    
    setFormData({
      bank_account_id: "",
      transaction_type: "credit",
      amount: 0,
      description: "",
      reference_no: "",
      transaction_date: new Date().toISOString().split("T")[0],
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <ArrowDownLeft className="h-4 w-4" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
            <DialogDescription>
              Record a money transfer in or out of an account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="bank_account">Account *</Label>
              <Select
                value={formData.bank_account_id}
                onValueChange={(value) => setFormData({ ...formData, bank_account_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.account_name} ({account.bank_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Transaction Type *</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.transaction_type === "credit" ? "default" : "outline"}
                  className="flex-1 gap-2"
                  onClick={() => setFormData({ ...formData, transaction_type: "credit" })}
                >
                  <ArrowDownLeft className="h-4 w-4" />
                  Money In
                </Button>
                <Button
                  type="button"
                  variant={formData.transaction_type === "debit" ? "default" : "outline"}
                  className="flex-1 gap-2"
                  onClick={() => setFormData({ ...formData, transaction_type: "debit" })}
                >
                  <ArrowUpRight className="h-4 w-4" />
                  Money Out
                </Button>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (₹) *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={formData.amount || ""}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                required
                min="0.01"
                step="0.01"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="e.g., Sales deposit, Rent payment"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                maxLength={200}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reference_no">Reference No.</Label>
              <Input
                id="reference_no"
                placeholder="e.g., UTR number, Cheque no."
                value={formData.reference_no || ""}
                onChange={(e) => setFormData({ ...formData, reference_no: e.target.value })}
                maxLength={50}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="transaction_date">Date</Label>
              <Input
                id="transaction_date"
                type="date"
                value={formData.transaction_date?.split("T")[0] || ""}
                onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addTransaction.isPending}>
              {addTransaction.isPending ? "Adding..." : "Add Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
