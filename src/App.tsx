import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
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
import Auth from "@/pages/Auth";
import AdminDashboard from "@/pages/AdminDashboard";
import PendingApproval from "@/pages/PendingApproval";

const queryClient = new QueryClient();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function RoleRouter() {
  const { role, shopId, loading } = useUserRole();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (role === "super_admin") {
    return <AdminDashboard />;
  }

  if (!shopId) {
    return <PendingApproval />;
  }

  // Shop owner with active shop - show main app
  return <MainLayout />;
}

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route
        path="/admin"
        element={
          <AuthGuard>
            <AdminDashboard />
          </AuthGuard>
        }
      />
      <Route
        path="/pending"
        element={
          <AuthGuard>
            <PendingApproval />
          </AuthGuard>
        }
      />
      <Route
        element={
          <AuthGuard>
            <RoleRouter />
          </AuthGuard>
        }
      >
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
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppRoutes />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
