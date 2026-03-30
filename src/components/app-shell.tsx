"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { ThemeToggle } from "@/components/theme-toggle";

type Props = {
  title: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
    role?: string;
  };
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export function AppShell({ title, user, actions, children }: Props) {
  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <SiteHeader
          title={title}
          actions={
            <div className="flex items-center gap-2">
              {actions}
              <ThemeToggle />
            </div>
          }
        />
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
