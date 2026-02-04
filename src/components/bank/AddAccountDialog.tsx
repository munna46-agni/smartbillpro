import { useState } from "react";
import { Plus } from "lucide-react";
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
import { useBankAccounts, BankAccountInsert } from "@/hooks/useBankAccounts";

export function AddAccountDialog() {
  const [open, setOpen] = useState(false);
  const { addAccount } = useBankAccounts();
  
  const [formData, setFormData] = useState<BankAccountInsert>({
    account_name: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    upi_id: "",
    account_type: "bank",
    current_balance: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.account_name.trim() || !formData.bank_name.trim()) {
      return;
    }

    await addAccount.mutateAsync(formData);
    setFormData({
      account_name: "",
      bank_name: "",
      account_number: "",
      ifsc_code: "",
      upi_id: "",
      account_type: "bank",
      current_balance: 0,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Bank Account</DialogTitle>
            <DialogDescription>
              Add a new bank account or UPI to track transactions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="account_type">Account Type</Label>
              <Select
                value={formData.account_type}
                onValueChange={(value) => setFormData({ ...formData, account_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank Account</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="wallet">Digital Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="account_name">Account Name *</Label>
              <Input
                id="account_name"
                placeholder="e.g., Main Business Account"
                value={formData.account_name}
                onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                required
                maxLength={100}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bank_name">Bank / Provider Name *</Label>
              <Input
                id="bank_name"
                placeholder="e.g., State Bank of India"
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                required
                maxLength={100}
              />
            </div>

            {formData.account_type === "bank" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="account_number">Account Number</Label>
                  <Input
                    id="account_number"
                    placeholder="e.g., 1234567890"
                    value={formData.account_number || ""}
                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                    maxLength={20}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ifsc_code">IFSC Code</Label>
                  <Input
                    id="ifsc_code"
                    placeholder="e.g., SBIN0001234"
                    value={formData.ifsc_code || ""}
                    onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value.toUpperCase() })}
                    maxLength={11}
                  />
                </div>
              </>
            )}

            {(formData.account_type === "upi" || formData.account_type === "bank") && (
              <div className="grid gap-2">
                <Label htmlFor="upi_id">UPI ID</Label>
                <Input
                  id="upi_id"
                  placeholder="e.g., business@upi"
                  value={formData.upi_id || ""}
                  onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                  maxLength={50}
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="current_balance">Opening Balance (₹)</Label>
              <Input
                id="current_balance"
                type="number"
                placeholder="0.00"
                value={formData.current_balance || ""}
                onChange={(e) => setFormData({ ...formData, current_balance: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addAccount.isPending}>
              {addAccount.isPending ? "Adding..." : "Add Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
