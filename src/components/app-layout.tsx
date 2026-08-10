import { ChevronLeft } from "lucide-react"
import { Outlet, useNavigate } from "react-router-dom"

import { AppBreadcrumb } from "@/components/app-breadcrumb"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function AppLayout() {
  const navigate = useNavigate()

  return (
    <SidebarProvider>
      <AppSidebar />
      {/* Lock the inset to the viewport height so the page body never scrolls;
          the content region below the header scrolls internally instead. */}
      <SidebarInset className="h-svh overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex w-full items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <AppBreadcrumb />
            <div className="ml-auto">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate(-1)}
                aria-label="Volver"
              >
                <ChevronLeft />
              </Button>
            </div>
          </div>
        </header>
        <div className="flex-1 min-h-0 overflow-y-auto">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
