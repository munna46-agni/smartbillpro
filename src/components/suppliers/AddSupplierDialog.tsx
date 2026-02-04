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
import { Textarea } from "@/components/ui/textarea";
import { useSuppliers, SupplierInsert } from "@/hooks/useSuppliers";

export function AddSupplierDialog() {
  const [open, setOpen] = useState(false);
  const { addSupplier } = useSuppliers();
  
  const [formData, setFormData] = useState<SupplierInsert>({
    name: "",
    contact_person: "",
    mobile_number: "",
    email: "",
    address: "",
    gst_number: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    await addSupplier.mutateAsync(formData);
    setFormData({
      name: "",
      contact_person: "",
      mobile_number: "",
      email: "",
      address: "",
      gst_number: "",
      notes: "",
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Supplier
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Supplier</DialogTitle>
            <DialogDescription>
              Add a new supplier to track purchases and payments.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Supplier Name *</Label>
                <Input
                  id="name"
                  placeholder="Company/Business name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  maxLength={100}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="contact_person">Contact Person</Label>
                <Input
                  id="contact_person"
                  placeholder="Person name"
                  value={formData.contact_person || ""}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  maxLength={100}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="mobile_number">Mobile Number</Label>
                <Input
                  id="mobile_number"
                  placeholder="e.g., 9876543210"
                  value={formData.mobile_number || ""}
                  onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  maxLength={10}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="supplier@email.com"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  maxLength={100}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="gst_number">GST Number</Label>
              <Input
                id="gst_number"
                placeholder="e.g., 22AAAAA0000A1Z5"
                value={formData.gst_number || ""}
                onChange={(e) => setFormData({ ...formData, gst_number: e.target.value.toUpperCase() })}
                maxLength={15}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Supplier address"
                value={formData.address || ""}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                maxLength={500}
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                maxLength={500}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addSupplier.isPending}>
              {addSupplier.isPending ? "Adding..." : "Add Supplier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
