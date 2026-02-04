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
import { Textarea } from "@/components/ui/textarea";
import { useSuppliers, Supplier } from "@/hooks/useSuppliers";

interface EditSupplierDialogProps {
  supplier: Supplier;
}

export function EditSupplierDialog({ supplier }: EditSupplierDialogProps) {
  const [open, setOpen] = useState(false);
  const { updateSupplier } = useSuppliers();
  
  const [formData, setFormData] = useState({
    name: supplier.name,
    contact_person: supplier.contact_person || "",
    mobile_number: supplier.mobile_number || "",
    email: supplier.email || "",
    address: supplier.address || "",
    gst_number: supplier.gst_number || "",
    notes: supplier.notes || "",
  });

  useEffect(() => {
    if (open) {
      setFormData({
        name: supplier.name,
        contact_person: supplier.contact_person || "",
        mobile_number: supplier.mobile_number || "",
        email: supplier.email || "",
        address: supplier.address || "",
        gst_number: supplier.gst_number || "",
        notes: supplier.notes || "",
      });
    }
  }, [supplier, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    await updateSupplier.mutateAsync({
      id: supplier.id,
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
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
            <DialogDescription>
              Update supplier details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_name">Supplier Name *</Label>
                <Input
                  id="edit_name"
                  placeholder="Company/Business name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  maxLength={100}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit_contact_person">Contact Person</Label>
                <Input
                  id="edit_contact_person"
                  placeholder="Person name"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  maxLength={100}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_mobile_number">Mobile Number</Label>
                <Input
                  id="edit_mobile_number"
                  placeholder="e.g., 9876543210"
                  value={formData.mobile_number}
                  onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  maxLength={10}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit_email">Email</Label>
                <Input
                  id="edit_email"
                  type="email"
                  placeholder="supplier@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  maxLength={100}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_gst_number">GST Number</Label>
              <Input
                id="edit_gst_number"
                placeholder="e.g., 22AAAAA0000A1Z5"
                value={formData.gst_number}
                onChange={(e) => setFormData({ ...formData, gst_number: e.target.value.toUpperCase() })}
                maxLength={15}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_address">Address</Label>
              <Textarea
                id="edit_address"
                placeholder="Supplier address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                maxLength={500}
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_notes">Notes</Label>
              <Textarea
                id="edit_notes"
                placeholder="Any additional notes"
                value={formData.notes}
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
            <Button type="submit" disabled={updateSupplier.isPending}>
              {updateSupplier.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
