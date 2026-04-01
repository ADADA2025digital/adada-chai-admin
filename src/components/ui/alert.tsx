import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const alertVariants = cva(
  [
    "relative flex items-center gap-3",
    "rounded-[6px] border px-4 py-3",
    "text-left transition-all duration-200",
    "bg-white text-zinc-900",
    "dark:bg-[oklch(0.12_0.01_260)] dark:text-white",
    "[&>svg]:h-5 [&>svg]:w-5 [&>svg]:shrink-0 [&>svg]:text-current", 
  ].join(" "),
  {
    variants: {
      variant: {
        success: "border-emerald-500/50 dark:border-emerald-400/35",
        error: "border-red-500/50 dark:border-red-400/35",
        warning: "border-amber-500/50 dark:border-amber-400/35",
        info: "border-blue-500/50 dark:border-blue-400/35",
        muted: "border-zinc-300 dark:border-white/10",
      },
    },
    defaultVariants: {
      variant: "success",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("text-[16px] font-semibold leading-none", className)}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mt-1 text-[14px] leading-[1.35] text-current/75", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }