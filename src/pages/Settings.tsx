import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useShopSettings } from "@/hooks/useShopSettings";
import { Store, Printer, Database, Info, Upload, X, RotateCcw, Image, Type, PenTool } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const { settings, updateSettings, resetSettings } = useShopSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const watermarkInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) {
        toast.error("Logo must be smaller than 500KB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSettings({ logoUrl: reader.result as string });
        toast.success("Logo uploaded successfully");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWatermarkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) {
        toast.error("Watermark image must be smaller than 500KB");
        return;
      }
      if (!file.type.includes("png")) {
        toast.error("Please upload a PNG file for transparency support");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSettings({ watermarkImageUrl: reader.result as string });
        toast.success("Watermark image uploaded successfully");
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    updateSettings({ logoUrl: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("Logo removed");
  };

  const removeWatermarkImage = () => {
    updateSettings({ watermarkImageUrl: null });
    if (watermarkInputRef.current) {
      watermarkInputRef.current.value = "";
    }
    toast.success("Watermark image removed");
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) {
        toast.error("Signature/Seal image must be smaller than 500KB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSettings({ signatureImageUrl: reader.result as string });
        toast.success("Signature/Seal uploaded successfully");
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSignature = () => {
    updateSettings({ signatureImageUrl: null });
    if (signatureInputRef.current) {
      signatureInputRef.current.value = "";
    }
    toast.success("Signature/Seal removed");
  };

  const handleReset = () => {
    resetSettings();
    toast.success("Settings reset to defaults");
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure your POS system</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {/* Shop Details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Store className="h-5 w-5" />
              Shop Details
            </CardTitle>
            <CardDescription>Configure your shop information for invoices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="shopName">Shop Name</Label>
                <Input
                  id="shopName"
                  placeholder="Enter shop name"
                  value={settings.shopName}
                  onChange={(e) => updateSettings({ shopName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shopTagline">Tagline</Label>
                <Input
                  id="shopTagline"
                  placeholder="e.g., Stationery & CSC"
                  value={settings.shopTagline}
                  onChange={(e) => updateSettings({ shopTagline: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shopPhone">Phone Number</Label>
                <Input
                  id="shopPhone"
                  placeholder="Enter phone number"
                  value={settings.shopPhone}
                  onChange={(e) => updateSettings({ shopPhone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shopGST">GST Number (Optional)</Label>
                <Input
                  id="shopGST"
                  placeholder="Enter GST number"
                  value={settings.shopGST}
                  onChange={(e) => updateSettings({ shopGST: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proprietorName">Proprietor Name</Label>
                <Input
                  id="proprietorName"
                  placeholder="Enter proprietor name"
                  value={settings.proprietorName}
                  onChange={(e) => updateSettings({ proprietorName: e.target.value })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="shopAddress">Shop Address</Label>
                <Textarea
                  id="shopAddress"
                  placeholder="Enter full address"
                  value={settings.shopAddress}
                  onChange={(e) => updateSettings({ shopAddress: e.target.value })}
                  rows={2}
                />
              </div>
            </div>

            {/* Logo Upload */}
            <div className="space-y-3">
              <Label>Shop Logo</Label>
              <div className="flex items-center gap-4">
                {settings.logoUrl ? (
                  <div className="relative">
                    <img 
                      src={settings.logoUrl} 
                      alt="Shop Logo" 
                      className="h-20 w-20 object-contain rounded-lg border bg-white p-1"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={removeLogo}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="h-20 w-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                    <Store className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                )}
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Max 500KB. PNG or JPG recommended.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Watermark */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Invoice Watermark
            </CardTitle>
            <CardDescription>Add a watermark on invoices (text or image)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="showWatermark">Enable Watermark</Label>
              <Switch
                id="showWatermark"
                checked={settings.showWatermark}
                onCheckedChange={(checked) => updateSettings({ showWatermark: checked })}
              />
            </div>
            
            {settings.showWatermark && (
              <div className="space-y-4">
                {/* Watermark Type Selection */}
                <div className="space-y-3">
                  <Label>Watermark Type</Label>
                  <RadioGroup
                    value={settings.watermarkType}
                    onValueChange={(value: "text" | "image") => updateSettings({ watermarkType: value })}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="text" id="watermark-text" />
                      <Label htmlFor="watermark-text" className="flex items-center gap-1 cursor-pointer">
                        <Type className="h-4 w-4" />
                        Text
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="image" id="watermark-image" />
                      <Label htmlFor="watermark-image" className="flex items-center gap-1 cursor-pointer">
                        <Image className="h-4 w-4" />
                        Image (PNG)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Text Watermark */}
                {settings.watermarkType === "text" && (
                  <div className="space-y-2">
                    <Label htmlFor="watermarkText">Watermark Text</Label>
                    <Input
                      id="watermarkText"
                      placeholder="e.g., Thank You!"
                      value={settings.watermarkText}
                      onChange={(e) => updateSettings({ watermarkText: e.target.value })}
                    />
                  </div>
                )}

                {/* Image Watermark */}
                {settings.watermarkType === "image" && (
                  <div className="space-y-3">
                    <Label>Watermark Image</Label>
                    <div className="flex items-center gap-4">
                      {settings.watermarkImageUrl ? (
                        <div className="relative">
                          <img 
                            src={settings.watermarkImageUrl} 
                            alt="Watermark" 
                            className="h-20 w-auto max-w-32 object-contain rounded-lg border bg-muted/50 p-2"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                            onClick={removeWatermarkImage}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="h-20 w-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                          <Image className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                      )}
                      <div className="space-y-2">
                        <input
                          ref={watermarkInputRef}
                          type="file"
                          accept="image/png"
                          onChange={handleWatermarkUpload}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          onClick={() => watermarkInputRef.current?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload PNG
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          Max 500KB. PNG with transparency recommended.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Proprietor Signature/Seal */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PenTool className="h-5 w-5" />
              Proprietor Signature / Seal
            </CardTitle>
            <CardDescription>Upload a signature or seal image for invoices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              {settings.signatureImageUrl ? (
                <div className="relative">
                  <img 
                    src={settings.signatureImageUrl} 
                    alt="Signature/Seal" 
                    className="h-20 w-auto max-w-40 object-contain rounded-lg border bg-white p-2"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={removeSignature}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="h-20 w-32 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                  <PenTool className="h-8 w-8 text-muted-foreground/50" />
                </div>
              )}
              <div className="space-y-2">
                <input
                  ref={signatureInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleSignatureUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => signatureInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Signature/Seal
                </Button>
                <p className="text-xs text-muted-foreground">
                  Max 500KB. PNG with transparency recommended for best results.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>Backup and reset options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleReset}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
            <p className="text-xs text-muted-foreground">
              This will reset shop details and invoice settings to defaults.
            </p>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-5 w-5" />
              About
            </CardTitle>
            <CardDescription>System information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex justify-between text-sm sm:flex-col sm:gap-1">
                <span className="text-muted-foreground">Version</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between text-sm sm:flex-col sm:gap-1">
                <span className="text-muted-foreground">Platform</span>
                <span className="font-medium">Smart Bill POS</span>
              </div>
              <div className="flex justify-between text-sm sm:flex-col sm:gap-1">
                <span className="text-muted-foreground">Backend</span>
                <span className="font-medium">Lovable Cloud</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
