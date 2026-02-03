import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MainLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-card px-4 shadow-sm lg:px-6">
            <SidebarTrigger className="lg:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SidebarTrigger>
            <div className="flex-1" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="hidden sm:inline">Today:</span>
              <span className="font-medium text-foreground">
                {new Date().toLocaleDateString('en-IN', { 
                  weekday: 'short', 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </span>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 lg:p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
