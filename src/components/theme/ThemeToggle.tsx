import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative border border-zinc-200 bg-white/90 shadow-sm hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)] dark:hover:bg-white/[0.06]"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 text-zinc-700 transition-all dark:-rotate-90 dark:scale-0 dark:text-zinc-200" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 text-zinc-700 transition-all dark:rotate-0 dark:scale-100 dark:text-zinc-200" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={12}
        className="w-[260px] rounded-[22px] border border-zinc-200 bg-white/95 p-2 text-zinc-900 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0b0b0d]/95 dark:text-white dark:shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
      >
        <div className="mb-2 rounded-2xl px-3 py-3">
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">
            Theme Settings
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Choose how the interface looks
          </p>
        </div>

        <DropdownMenuSeparator className="my-2 bg-zinc-200 dark:bg-white/10" />

        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="flex h-12 cursor-pointer items-center gap-3 rounded-xl px-3 text-sm font-medium text-zinc-900 outline-none data-[highlighted]:bg-zinc-100 data-[highlighted]:text-zinc-900 dark:text-white dark:data-[highlighted]:bg-white/10 dark:data-[highlighted]:text-white"
        >
          <Sun className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
          <span className="flex-1">Light</span>
          {theme === "light" && (
            <Check className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="flex h-12 cursor-pointer items-center gap-3 rounded-xl px-3 text-sm font-medium text-zinc-900 outline-none data-[highlighted]:bg-zinc-100 data-[highlighted]:text-zinc-900 dark:text-white dark:data-[highlighted]:bg-white/10 dark:data-[highlighted]:text-white"
        >
          <Moon className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
          <span className="flex-1">Dark</span>
          {theme === "dark" && (
            <Check className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="flex h-12 cursor-pointer items-center gap-3 rounded-xl px-3 text-sm font-medium text-zinc-900 outline-none data-[highlighted]:bg-zinc-100 data-[highlighted]:text-zinc-900 dark:text-white dark:data-[highlighted]:bg-white/10 dark:data-[highlighted]:text-white"
        >
          <Laptop className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
          <span className="flex-1">System</span>
          {theme === "system" && (
            <Check className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}