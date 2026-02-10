import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { LogOut, Plus, Store, Users, RefreshCw } from "lucide-react";

interface PendingUser {
  id: string;
  email: string;
  created_at: string;
}

interface Shop {
  id: string;
  name: string;
  owner_id: string;
  is_active: boolean;
  created_at: string;
  owner_email?: string;
}

export default function AdminDashboard() {
  const { signOut, session } = useAuth();
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [shopName, setShopName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");

  const { data: pendingUsers = [], isLoading: loadingPending } = useQuery({
    queryKey: ["admin", "pending-users"],
    queryFn: async () => {
      const response = await supabase.functions.invoke("admin-manage-shops", {
        body: { action: "list_pending_users" },
      });
      if (response.error) throw new Error(response.error.message);
      return (response.data?.users ?? []) as PendingUser[];
    },
  });

  const { data: shops = [], isLoading: loadingShops } = useQuery({
    queryKey: ["admin", "shops"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shops")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Shop[];
    },
  });

  const createShopMutation = useMutation({
    mutationFn: async ({ shopName, ownerEmail }: { shopName: string; ownerEmail: string }) => {
      const response = await supabase.functions.invoke("admin-manage-shops", {
        body: { action: "create_shop", shop_name: shopName, owner_email: ownerEmail },
      });
      if (response.error) throw new Error(response.error.message);
      if (response.data?.error) throw new Error(response.data.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      toast.success("Shop created successfully!");
      setCreateDialogOpen(false);
      setShopName("");
      setOwnerEmail("");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const toggleShopMutation = useMutation({
    mutationFn: async ({ shopId, isActive }: { shopId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("shops")
        .update({ is_active: isActive })
        .eq("id", shopId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      toast.success("Shop status updated!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const assignShopToUser = (email: string) => {
    setOwnerEmail(email);
    setCreateDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage shops and users</p>
        </div>
        <Button variant="outline" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" /> Sign Out
        </Button>
      </header>

      <main className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Shops</CardDescription>
              <CardTitle className="text-3xl">{shops.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Shops</CardDescription>
              <CardTitle className="text-3xl">{shops.filter(s => s.is_active).length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending Users</CardDescription>
              <CardTitle className="text-3xl">{pendingUsers.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Pending Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Pending Users</CardTitle>
              <CardDescription>Users who signed up but don't have a shop yet</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => queryClient.invalidateQueries({ queryKey: ["admin"] })}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {loadingPending ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : pendingUsers.length === 0 ? (
              <p className="text-muted-foreground">No pending users.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Signed Up</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => assignShopToUser(user.email)}>
                          <Store className="mr-2 h-4 w-4" /> Create Shop
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Shops */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Store className="h-5 w-5" /> All Shops</CardTitle>
              <CardDescription>Manage shop accounts</CardDescription>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> Create Shop</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Shop</DialogTitle>
                  <DialogDescription>Enter the shop name and owner's email to create a shop account.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Owner Email</Label>
                    <Input value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} placeholder="user@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Shop Name</Label>
                    <Input value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="My Shop" />
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => createShopMutation.mutate({ shopName, ownerEmail })}
                    disabled={!shopName || !ownerEmail || createShopMutation.isPending}
                  >
                    {createShopMutation.isPending ? "Creating..." : "Create Shop"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {loadingShops ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : shops.length === 0 ? (
              <p className="text-muted-foreground">No shops yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shop Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shops.map((shop) => (
                    <TableRow key={shop.id}>
                      <TableCell className="font-medium">{shop.name}</TableCell>
                      <TableCell>
                        <Badge variant={shop.is_active ? "default" : "secondary"}>
                          {shop.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(shop.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant={shop.is_active ? "destructive" : "default"}
                          onClick={() => toggleShopMutation.mutate({ shopId: shop.id, isActive: !shop.is_active })}
                        >
                          {shop.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
