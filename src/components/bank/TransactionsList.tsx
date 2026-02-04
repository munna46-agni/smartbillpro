import { ArrowDownLeft, ArrowUpRight, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useBankTransactions } from "@/hooks/useBankTransactions";
import { BankAccount } from "@/hooks/useBankAccounts";
import { formatCurrency } from "@/lib/format";
import { format } from "date-fns";

interface TransactionsListProps {
  accounts: BankAccount[];
}

export function TransactionsList({ accounts }: TransactionsListProps) {
  const { transactions, isLoading, deleteTransaction } = useBankTransactions();

  const getAccountName = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    return account ? account.account_name : "Unknown";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ArrowDownLeft className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium">No transactions yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Add transactions to track money movement
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Account</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((txn) => (
            <TableRow key={txn.id}>
              <TableCell className="text-muted-foreground">
                {format(new Date(txn.transaction_date), "dd MMM yyyy")}
              </TableCell>
              <TableCell className="font-medium">
                {getAccountName(txn.bank_account_id)}
              </TableCell>
              <TableCell>{txn.description || "—"}</TableCell>
              <TableCell className="text-muted-foreground">
                {txn.reference_no || "—"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {txn.transaction_type === "credit" ? (
                    <Badge variant="default" className="bg-primary hover:bg-primary/90">
                      <ArrowDownLeft className="h-3 w-3 mr-1" />
                      +{formatCurrency(txn.amount)}
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      -{formatCurrency(txn.amount)}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this transaction? The account balance will be adjusted accordingly.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteTransaction.mutate({
                          id: txn.id,
                          bank_account_id: txn.bank_account_id,
                          transaction_type: txn.transaction_type,
                          amount: txn.amount,
                        })}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
