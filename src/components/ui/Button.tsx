"use client";

import * as React from "react";
import { cn } from "@/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "gold" | "ocean";
type ButtonSize = "sm" | "md" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium tracking-tight transition " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-40";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-slate-900 text-white shadow-sm hover:bg-slate-800 active:bg-slate-950",
  gold: "bg-amber-500 text-white shadow-sm hover:bg-amber-400 active:bg-amber-600",
  ocean: "bg-sky-500 text-white shadow-sm hover:bg-sky-400 active:bg-sky-600",
  secondary:
    "border border-stone-200 bg-white text-slate-700 shadow-sm hover:bg-stone-50 active:bg-stone-100",
  ghost: "text-slate-500 hover:bg-stone-100 hover:text-slate-900",
  danger:
    "border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 active:bg-rose-200",
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
