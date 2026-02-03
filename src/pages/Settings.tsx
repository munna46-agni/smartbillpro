import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, Store, Printer, Database, Info } from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure your POS system</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Store className="h-5 w-5" />
              Shop Details
            </CardTitle>
            <CardDescription>Configure your shop information</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Shop details configuration coming soon. This will include shop name, address, 
              GST number, and contact information for invoices.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Print Settings
            </CardTitle>
            <CardDescription>Configure thermal printer</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Printer configuration coming soon. This will include paper size, 
              print format, and auto-print options.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>Backup and export options</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Data export and backup features coming soon. Export sales reports, 
              inventory lists, and customer data.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-5 w-5" />
              About
            </CardTitle>
            <CardDescription>System information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Version</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Platform</span>
              <span className="font-medium">Smart Bill POS</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Backend</span>
              <span className="font-medium">Lovable Cloud</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
