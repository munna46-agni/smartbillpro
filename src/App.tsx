import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import Dashboard from "@/pages/Dashboard";
import NewSale from "@/pages/NewSale";
import Inventory from "@/pages/Inventory";
import Purchases from "@/pages/Purchases";
import CashClosing from "@/pages/CashClosing";
import SalesHistory from "@/pages/SalesHistory";
import Settings from "@/pages/Settings";
import Customers from "@/pages/Customers";
import Suppliers from "@/pages/Suppliers";
import BankUpi from "@/pages/BankUpi";
import SalesReport from "@/pages/reports/SalesReport";
import StockReport from "@/pages/reports/StockReport";
import PurchaseReport from "@/pages/reports/PurchaseReport";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new-sale" element={<NewSale />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/cash-closing" element={<CashClosing />} />
            <Route path="/sales-history" element={<SalesHistory />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/bank-upi" element={<BankUpi />} />
            <Route path="/reports/sales" element={<SalesReport />} />
            <Route path="/reports/stock" element={<StockReport />} />
            <Route path="/reports/purchases" element={<PurchaseReport />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
