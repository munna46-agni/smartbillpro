import { useState, useEffect } from "react";
import { Pencil } from "lucide-react";
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
import { useBankAccounts, BankAccount } from "@/hooks/useBankAccounts";

interface EditAccountDialogProps {
  account: BankAccount;
}

export function EditAccountDialog({ account }: EditAccountDialogProps) {
  const [open, setOpen] = useState(false);
  const { updateAccount } = useBankAccounts();
  
  const [formData, setFormData] = useState({
    account_name: account.account_name,
    bank_name: account.bank_name,
    account_number: account.account_number || "",
    ifsc_code: account.ifsc_code || "",
    upi_id: account.upi_id || "",
    account_type: account.account_type,
    current_balance: account.current_balance,
  });

  // Reset form when account changes or dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        account_name: account.account_name,
        bank_name: account.bank_name,
        account_number: account.account_number || "",
        ifsc_code: account.ifsc_code || "",
        upi_id: account.upi_id || "",
        account_type: account.account_type,
        current_balance: account.current_balance,
      });
    }
  }, [account, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.account_name.trim() || !formData.bank_name.trim()) {
      return;
    }

    await updateAccount.mutateAsync({
      id: account.id,
      ...formData,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Bank Account</DialogTitle>
            <DialogDescription>
              Update the details of your bank account or UPI.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit_account_type">Account Type</Label>
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
              <Label htmlFor="edit_account_name">Account Name *</Label>
              <Input
                id="edit_account_name"
                placeholder="e.g., Main Business Account"
                value={formData.account_name}
                onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                required
                maxLength={100}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_bank_name">Bank / Provider Name *</Label>
              <Input
                id="edit_bank_name"
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
                  <Label htmlFor="edit_account_number">Account Number</Label>
                  <Input
                    id="edit_account_number"
                    placeholder="e.g., 1234567890"
                    value={formData.account_number}
                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                    maxLength={20}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit_ifsc_code">IFSC Code</Label>
                  <Input
                    id="edit_ifsc_code"
                    placeholder="e.g., SBIN0001234"
                    value={formData.ifsc_code}
                    onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value.toUpperCase() })}
                    maxLength={11}
                  />
                </div>
              </>
            )}

            {(formData.account_type === "upi" || formData.account_type === "bank") && (
              <div className="grid gap-2">
                <Label htmlFor="edit_upi_id">UPI ID</Label>
                <Input
                  id="edit_upi_id"
                  placeholder="e.g., business@upi"
                  value={formData.upi_id}
                  onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                  maxLength={50}
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="edit_current_balance">Current Balance (₹)</Label>
              <Input
                id="edit_current_balance"
                type="number"
                placeholder="0.00"
                value={formData.current_balance}
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
            <Button type="submit" disabled={updateAccount.isPending}>
              {updateAccount.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
