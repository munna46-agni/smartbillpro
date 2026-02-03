import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Truck, 
  Wallet, 
  FileText, 
  Settings,
  Receipt
} from "lucide-react";
import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "New Sale", url: "/new-sale", icon: ShoppingCart },
  { title: "Inventory", url: "/inventory", icon: Package },
  { title: "Purchases", url: "/purchases", icon: Truck },
  { title: "Cash Closing", url: "/cash-closing", icon: Wallet },
  { title: "Sales History", url: "/sales-history", icon: FileText },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
            <Receipt className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-accent-foreground">Smart Bill</h1>
            <p className="text-xs text-sidebar-foreground/70">POS System</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "h-11 gap-3 rounded-lg px-3 font-medium transition-all",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <RouterNavLink to={item.url}>
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </RouterNavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-sidebar-border px-6 py-4">
        <p className="text-xs text-sidebar-foreground/50">
          © 2024 Smart Bill POS
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
