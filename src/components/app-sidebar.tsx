"use client"

import * as React from "react"
import {
  ArrowUpCircleIcon,
  ClipboardListIcon,
  LayoutDashboardIcon,
  ListIcon,
  FolderIcon,
  SettingsIcon,
  type LucideIcon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

type NavItem = { title: string; url: string; icon: LucideIcon }
type UserInfo = { name: string; email: string; avatar?: string; role?: string }

export function AppSidebar({
  user,
  brand = "Fixapp",
  navMain = [
    { title: "Dashboard", url: "/", icon: LayoutDashboardIcon },
    { title: "Tickets", url: "/tickets", icon: ClipboardListIcon },
    { title: "RCAs", url: "/rca", icon: ListIcon },
    { title: "Assets", url: "/assets", icon: FolderIcon },
  ],
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: UserInfo
  brand?: string
  navMain?: NavItem[]
}) {
  const resolvedNav = [
    ...navMain,
    ...(user.role === "admin"
      ? [{ title: "Settings", url: "/settings", icon: SettingsIcon }]
      : []),
  ]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">{brand}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={resolvedNav} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user.name,
            email: user.email,
            avatar: user.avatar || "/avatars/shadcn.jpg",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
