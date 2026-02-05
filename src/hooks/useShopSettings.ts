import { useState } from "react";

export interface ShopSettings {
  shopName: string;
  shopTagline: string;
  shopAddress: string;
  shopPhone: string;
  shopGST: string;
  logoUrl: string | null;
  watermarkText: string;
  watermarkImageUrl: string | null;
  watermarkType: "text" | "image";
  showWatermark: boolean;
  proprietorName: string;
}

const DEFAULT_SETTINGS: ShopSettings = {
  shopName: "Smart Bill POS",
  shopTagline: "Stationery & Common Service Center",
  shopAddress: "",
  shopPhone: "",
  shopGST: "",
  logoUrl: null,
  watermarkText: "Thank You!",
  watermarkImageUrl: null,
  watermarkType: "text",
  showWatermark: true,
  proprietorName: "",
};

const STORAGE_KEY = "shop-settings";

export function useShopSettings() {
  const [settings, setSettings] = useState<ShopSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error("Failed to load shop settings:", e);
    }
    return DEFAULT_SETTINGS;
  });

  const updateSettings = (updates: Partial<ShopSettings>) => {
    setSettings((prev) => {
      const newSettings = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      } catch (e) {
        console.error("Failed to save shop settings:", e);
      }
      return newSettings;
    });
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { settings, updateSettings, resetSettings };
}
