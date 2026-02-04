import { useState } from "react";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Truck, 
  Wallet, 
  FileText, 
  Settings,
  ChevronDown,
  ChevronRight,
  Users,
  Building2,
  Landmark,
  BarChart3,
  ClipboardList,
  Boxes,
  Receipt,
  CreditCard
} from "lucide-react";
import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import smartbillLogo from "@/assets/smartbill-logo.jpg";

interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MenuGroup {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: MenuItem[];
}

// Standalone menu items
const standaloneItems: MenuItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
];

// Grouped menu items
const menuGroups: MenuGroup[] = [
  {
    title: "Sales & Purchase",
    icon: ShoppingCart,
    items: [
      { title: "New Sale", url: "/new-sale", icon: Receipt },
      { title: "Sales History", url: "/sales-history", icon: FileText },
      { title: "Purchases", url: "/purchases", icon: Truck },
    ],
  },
  {
    title: "Cash & Bank",
    icon: Wallet,
    items: [
      { title: "Cash Closing", url: "/cash-closing", icon: Wallet },
      { title: "Bank & UPI", url: "/bank-upi", icon: Landmark },
    ],
  },
  {
    title: "Masters",
    icon: Boxes,
    items: [
      { title: "Customers", url: "/customers", icon: Users },
      { title: "Inventory", url: "/inventory", icon: Package },
      { title: "Suppliers", url: "/suppliers", icon: Building2 },
    ],
  },
  {
    title: "Reports",
    icon: BarChart3,
    items: [
      { title: "Sales Report", url: "/reports/sales", icon: ClipboardList },
      { title: "Stock Report", url: "/reports/stock", icon: Package },
      { title: "Purchase Report", url: "/reports/purchases", icon: Truck },
    ],
  },
];

// Bottom menu items
const bottomItems: MenuItem[] = [
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  
  // Determine which groups should be open based on current route
  const getInitialOpenGroups = () => {
    const openGroups: Record<string, boolean> = {};
    menuGroups.forEach((group) => {
      const isGroupActive = group.items.some(item => 
        location.pathname === item.url || location.pathname.startsWith(item.url + '/')
      );
      openGroups[group.title] = isGroupActive;
    });
    return openGroups;
  };

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(getInitialOpenGroups);

  const toggleGroup = (groupTitle: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupTitle]: !prev[groupTitle]
    }));
  };

  const isActive = (url: string) => location.pathname === url;

  const renderMenuItem = (item: MenuItem, isSubItem = false) => {
    const active = isActive(item.url);
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          asChild
          className={cn(
            "h-9 gap-3 rounded-lg font-medium transition-all",
            isSubItem ? "pl-10" : "px-3",
            active
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <RouterNavLink to={item.url} className="flex items-center w-full">
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="text-sm ml-3">{item.title}</span>
          </RouterNavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  const renderMenuGroup = (group: MenuGroup) => {
    const isOpen = openGroups[group.title] ?? false;
    const hasActiveItem = group.items.some(item => 
      location.pathname === item.url || location.pathname.startsWith(item.url + '/')
    );

    return (
      <Collapsible
        key={group.title}
        open={isOpen}
        onOpenChange={() => toggleGroup(group.title)}
      >
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              className={cn(
                "h-9 gap-3 rounded-lg px-3 font-medium transition-all w-full justify-between cursor-pointer",
                hasActiveItem
                  ? "text-sidebar-accent-foreground bg-sidebar-accent/50"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <div className="flex items-center">
                <group.icon className="h-4 w-4 shrink-0" />
                <span className="text-sm ml-3">{group.title}</span>
              </div>
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform duration-200",
                isOpen ? "rotate-0" : "-rotate-90"
              )} />
            </SidebarMenuButton>
          </CollapsibleTrigger>
        </SidebarMenuItem>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          {group.items.map(item => renderMenuItem(item, true))}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border px-5 py-4">
        <div className="flex items-center gap-3">
          <img 
            src={smartbillLogo} 
            alt="SmartBill Logo" 
            className="h-10 w-10 rounded-lg object-cover"
          />
          <div>
            <h1 className="text-base font-bold text-sidebar-accent-foreground">SmartBill</h1>
            <p className="text-[10px] text-sidebar-foreground/60 uppercase tracking-wider">Stationery & CSC</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Dashboard */}
              {standaloneItems.map(item => renderMenuItem(item))}
              
              {/* Menu Groups */}
              {menuGroups.map(group => renderMenuGroup(group))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings at bottom */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomItems.map(item => renderMenuItem(item))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-sidebar-border px-5 py-3">
        <p className="text-[10px] text-sidebar-foreground/40">
          © 2024 SmartBill POS
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
