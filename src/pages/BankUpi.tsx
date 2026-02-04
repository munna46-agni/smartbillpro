import { Landmark, CreditCard, Smartphone, Trash2, Loader2, ArrowLeftRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddAccountDialog } from "@/components/bank/AddAccountDialog";
import { EditAccountDialog } from "@/components/bank/EditAccountDialog";
import { AddTransactionDialog } from "@/components/bank/AddTransactionDialog";
import { TransactionsList } from "@/components/bank/TransactionsList";
import { useBankAccounts } from "@/hooks/useBankAccounts";
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
import { Badge } from "@/components/ui/badge";

export default function BankUpi() {
  const { accounts, isLoading, totalBalance, deleteAccount } = useBankAccounts();

  const bankAccounts = accounts.filter(a => a.account_type === "bank");
  const upiAccounts = accounts.filter(a => a.account_type === "upi");
  const walletAccounts = accounts.filter(a => a.account_type === "wallet");

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case "bank":
        return <Landmark className="h-4 w-4" />;
      case "upi":
        return <Smartphone className="h-4 w-4" />;
      case "wallet":
        return <CreditCard className="h-4 w-4" />;
      default:
        return <Landmark className="h-4 w-4" />;
    }
  };

  const getAccountTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      bank: "default",
      upi: "secondary",
      wallet: "outline",
    };
    return (
      <Badge variant={variants[type] || "default"} className="capitalize">
        {type}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bank & UPI</h1>
          <p className="text-muted-foreground">Manage bank accounts and UPI transactions</p>
        </div>
        <div className="flex gap-2">
          <AddTransactionDialog accounts={accounts} />
          <AddAccountDialog />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Landmark className="h-4 w-4 text-primary" />
              Total Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
            <p className="text-xs text-muted-foreground">Across all accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Landmark className="h-4 w-4 text-primary" />
              Bank Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bankAccounts.length}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(bankAccounts.reduce((sum, a) => sum + Number(a.current_balance), 0))} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Smartphone className="h-4 w-4 text-primary" />
              UPI Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upiAccounts.length}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(upiAccounts.reduce((sum, a) => sum + Number(a.current_balance), 0))} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4 text-primary" />
              Digital Wallets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{walletAccounts.length}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(walletAccounts.reduce((sum, a) => sum + Number(a.current_balance), 0))} total
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-primary" />
            Account List
          </CardTitle>
          <CardDescription>
            All your bank accounts, UPI, and digital wallets
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Landmark className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No accounts yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add bank accounts or UPI to track your finances
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Bank / Provider</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Account No. / UPI ID</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getAccountTypeIcon(account.account_type)}
                          {account.account_name}
                        </div>
                      </TableCell>
                      <TableCell>{account.bank_name}</TableCell>
                      <TableCell>{getAccountTypeBadge(account.account_type)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {account.account_number || account.upi_id || "—"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(account.current_balance)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <EditAccountDialog account={account} />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Account</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{account.account_name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteAccount.mutate(account.id)}
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-primary" />
            Transaction History
          </CardTitle>
          <CardDescription>
            Recent money in/out across all accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionsList accounts={accounts} />
        </CardContent>
      </Card>
    </div>
  );
}
