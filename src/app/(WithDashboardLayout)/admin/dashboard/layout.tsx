'use client'
import { AppSidebar } from "@/components/ui/app-sidebar-dashboard";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Toaster } from "sonner";

export default function Layout({ children }: { children: React.ReactNode }) {

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <SidebarTrigger />
        {children}
      </main>
      <Toaster position="top-center" richColors />
    </SidebarProvider>
  )
}
