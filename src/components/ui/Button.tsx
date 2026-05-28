"use client";

import * as React from "react";
import { cn } from "@/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "gold";
type ButtonSize = "sm" | "md" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium tracking-tight transition " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/40 focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-zinc-950 disabled:pointer-events-none disabled:opacity-40";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-zinc-100 text-zinc-950 hover:bg-white active:bg-zinc-200",
  gold: "bg-amber-700/90 text-zinc-50 hover:bg-amber-600/90 active:bg-amber-800",
  secondary:
    "border border-zinc-800 bg-zinc-900/80 text-zinc-100 hover:bg-zinc-800/80 backdrop-blur-sm",
  ghost: "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100",
  danger: "bg-red-950/80 text-red-200 border border-red-900/50 hover:bg-red-900/40",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-xs",
  md: "h-11 px-4 text-sm",
  icon: "h-10 w-10",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";
