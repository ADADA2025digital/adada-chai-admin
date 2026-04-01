import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isExpanded } = useSidebar();

  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar - hidden on mobile */}
      <aside className={cn(
        "hidden border-r bg-background transition-all duration-300 md:block",
        isExpanded ? "w-64" : "w-16"
      )}>
        <Sidebar />
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        <Header />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-muted/10 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}