import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  Search,
  PanelLeft,
  Maximize2,
  Minimize2,
  ChevronDown,
  User2,
  CircleHelp,
  LogOut,
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import { useSidebar } from "@/context/SidebarContext";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { NotificationToggle } from "@/components/notifications/NotificationSheet";
import { useFullscreen } from "@/hooks/useFullscreen";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function Header() {
  const { isExpanded, toggleSidebar } = useSidebar();
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleProfileClick = () => {
    navigate("/admin/profile");
  };

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  const handleHelpClick = () => {
    navigate("/help");
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";

    return name
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const displayName =
    user?.name || user?.full_name || user?.username || "Admin User";
  const displayEmail = user?.email || "No email available";
  const avatarSrc = user?.avatar || user?.profile_picture_url || "";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background/95 px-4 text-foreground backdrop-blur supports-[backdrop-filter]:bg-background/80 dark:bg-accent sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="hidden text-foreground hover:bg-zinc-100 md:inline-flex dark:hover:bg-accent"
        title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        <PanelLeft
          className={`h-5 w-5 transition-transform duration-200 ${
            !isExpanded ? "rotate-180" : ""
          }`}
        />
      </Button>

      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-foreground hover:bg-zinc-100 md:hidden dark:hover:bg-accent"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-64 p-0">
          <Sidebar onMobileNavigate={() => setMobileSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="relative ml-auto flex-1 md:grow-0 md:flex-initial">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search..."
            className="h-9 w-full rounded-md border border-border bg-muted/60 pl-8 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:w-[200px] lg:w-[300px]"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFullscreen}
          className="relative border border-zinc-200 bg-white/90 shadow-sm hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)] dark:hover:bg-white/[0.06]"
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? (
            <Minimize2 className="h-5 w-5 text-zinc-700 dark:text-foreground" />
          ) : (
            <Maximize2 className="h-5 w-5 text-zinc-700 dark:text-foreground" />
          )}
        </Button>

        <NotificationToggle />
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="
                h-12 rounded-[10px] px-2 transition-all duration-300
                border-0 bg-transparent shadow-none
                sm:border sm:border-white/60 sm:bg-white/90 sm:shadow-sm sm:backdrop-blur-xl
                sm:hover:border-white sm:hover:bg-zinc-50 sm:hover:shadow-md
                dark:sm:border-white/20 dark:sm:bg-[#1f2329]/95
                dark:sm:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_8px_24px_rgba(0,0,0,0.45)]
                dark:sm:hover:border-white/40 dark:sm:hover:bg-[#22272e]
                dark:sm:hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_10px_28px_rgba(0,0,0,0.52)]
              "
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 ring-2 ring-blue-200 dark:ring-blue-400/30">
                  <AvatarImage
                    src={avatarSrc}
                    alt={displayName}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = "";
                    }}
                  />
                  <AvatarFallback className="bg-blue-100 text-base font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>

                <div className="hidden text-left lg:block">
                  <p className="max-w-[90px] truncate text-sm font-semibold text-zinc-900 dark:text-foreground">
                    {displayName}
                  </p>
                </div>

                <ChevronDown className="hidden h-4 w-4 text-zinc-500 lg:block dark:text-muted-foreground" />
              </div>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={12}
            className="w-[280px] rounded-[22px] border border-zinc-200 bg-white/95 p-2 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0b0b0d]/95 dark:shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
          >
            <div className="mb-2 flex items-center gap-3 rounded-2xl px-3 py-3">
              <Avatar className="h-12 w-12 ring-2 ring-zinc-200 dark:ring-white/10">
                <AvatarImage
                  src={avatarSrc}
                  alt={displayName}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = "";
                  }}
                />
                <AvatarFallback className="bg-zinc-100 text-base font-semibold text-cyan-700 dark:bg-zinc-800 dark:text-cyan-200">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-zinc-900 dark:text-foreground">
                  {displayName}
                </p>
                <p className="truncate text-xs text-zinc-500 dark:text-muted-foreground">
                  {displayEmail}
                </p>
              </div>
            </div>

            <DropdownMenuSeparator className="my-2 bg-zinc-200 dark:bg-white/10" />

            <DropdownMenuItem
              onClick={handleProfileClick}
              className="flex h-12 cursor-pointer items-center gap-3 rounded-xl px-3 text-sm font-medium text-zinc-900 outline-none data-[highlighted]:bg-zinc-100 data-[highlighted]:text-zinc-900 dark:text-foreground dark:data-[highlighted]:bg-white/10 dark:data-[highlighted]:text-foreground"
            >
              <User2 className="h-4 w-4 text-zinc-600 dark:text-muted-foreground" />
              <span>My Profile</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={handleSettingsClick}
              className="flex h-12 cursor-pointer items-center gap-3 rounded-xl px-3 text-sm font-medium text-zinc-900 outline-none data-[highlighted]:bg-zinc-100 data-[highlighted]:text-zinc-900 dark:text-foreground dark:data-[highlighted]:bg-white/10 dark:data-[highlighted]:text-foreground"
            >
              <span className="flex h-4 w-4 items-center justify-center text-zinc-600 dark:text-muted-foreground">
                ⚙
              </span>
              <span>Settings</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={handleHelpClick}
              className="flex h-12 cursor-pointer items-center gap-3 rounded-xl px-3 text-sm font-medium text-zinc-900 outline-none data-[highlighted]:bg-zinc-100 data-[highlighted]:text-zinc-900 dark:text-foreground dark:data-[highlighted]:bg-white/10 dark:data-[highlighted]:text-foreground"
            >
              <CircleHelp className="h-4 w-4 text-zinc-600 dark:text-muted-foreground" />
              <span>Help Center</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-2 bg-zinc-200 dark:bg-white/10" />

            <DropdownMenuItem
              onClick={handleLogout}
              className="flex h-14 cursor-pointer items-center gap-3 rounded-xl border border-red-200/70 bg-red-50 px-3 text-[15px] font-medium text-red-600 outline-none data-[highlighted]:bg-red-100 data-[highlighted]:text-red-600 dark:border-red-900/30 dark:bg-red-950/30 dark:text-red-400 dark:data-[highlighted]:bg-red-950/30 dark:data-[highlighted]:text-red-400"
            >
              <LogOut className="h-5 w-5 text-red-500 dark:text-red-400" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}