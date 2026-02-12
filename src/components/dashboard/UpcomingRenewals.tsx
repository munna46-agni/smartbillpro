import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { CalendarClock, Phone, Smartphone, Shield } from "lucide-react";

export function useUpcomingRenewals() {
  return useQuery({
    queryKey: ["upcoming-renewals"],
    queryFn: async () => {
      const today = new Date();
      const next7Days = new Date();
      next7Days.setDate(today.getDate() + 7);

      const { data, error } = await supabase
        .from("sale_items")
        .select(`
          id,
          product_name,
          item_type,
          expiry_date,
          validity_days,
          policy_number,
          sale_id,
          sales!inner (
            customer_name,
            mobile_number
          )
        `)
        .in("item_type", ["recharge", "insurance"])
        .not("expiry_date", "is", null)
        .gte("expiry_date", today.toISOString().split("T")[0])
        .lte("expiry_date", next7Days.toISOString().split("T")[0])
        .order("expiry_date", { ascending: true });

      if (error) throw error;
      return data as any[];
    },
  });
}

export default function UpcomingRenewals() {
  const { data: renewals = [], isLoading } = useUpcomingRenewals();

  if (isLoading) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" />
            Upcoming Renewals (7 days)
          </CardTitle>
          {renewals.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {renewals.length} upcoming
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {renewals.length === 0 ? (
          <div className="text-center py-6">
            <CalendarClock className="h-10 w-10 text-primary/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No renewals in next 7 days ✓</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-auto">
            {renewals.map((item) => {
              const expiryDate = new Date(item.expiry_date);
              expiryDate.setHours(0, 0, 0, 0);
              const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              const isExpiredToday = daysLeft === 0;
              const sale = item.sales;

              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isExpiredToday
                      ? "border-destructive/30 bg-destructive/5"
                      : daysLeft <= 2
                      ? "border-yellow-500/30 bg-yellow-500/5"
                      : "border-border bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg ${
                      item.item_type === "recharge" ? "bg-primary/10" : "bg-accent/10"
                    }`}>
                      {item.item_type === "recharge" ? (
                        <Smartphone className="h-4 w-4 text-primary" />
                      ) : (
                        <Shield className="h-4 w-4 text-accent-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {sale?.customer_name || "Walk-in"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sale?.mobile_number || "No number"} • {item.product_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {formatDate(item.expiry_date)}
                      </p>
                      <Badge
                        variant={isExpiredToday ? "destructive" : daysLeft <= 2 ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {isExpiredToday ? "Today!" : `${daysLeft}d left`}
                      </Badge>
                    </div>
                    {sale?.mobile_number && (
                      <a href={`tel:${sale.mobile_number}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
