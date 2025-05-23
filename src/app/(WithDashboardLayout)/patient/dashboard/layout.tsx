'use client'
import { AppSidebar } from "@/components/ui/app-sidebar-dashboard";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full container mx-auto">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  )
}
