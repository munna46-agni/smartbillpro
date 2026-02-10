import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

export default function PendingApproval() {
  const { signOut } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Pending Approval</CardTitle>
          <CardDescription>
            Your account has been created successfully. Please wait for an administrator to activate your shop.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={signOut} className="w-full">
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
