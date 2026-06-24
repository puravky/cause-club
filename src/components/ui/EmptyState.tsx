import React from "react";
import { Button } from "./button";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon | string | React.ReactNode;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-border bg-white rounded-2xl shadow-sm w-full max-w-lg mx-auto">
      {/* Icon / Visual representation */}
        {typeof icon === "string" ? (
          <span className="font-heading text-7xl font-bold text-ink/15 tracking-tighter select-none">
            {icon}
          </span>
        ) : typeof icon === "function" || (icon && typeof icon === "object" && "render" in icon) ? (
          (() => {
            const Icon = icon as LucideIcon;
            return (
              <div className="p-4 bg-coral/5 rounded-full text-coral">
                <Icon className="w-8 h-8" />
              </div>
            );
          })()
        ) : (
          icon as React.ReactNode
        )}

      <h3 className="font-heading text-xl font-bold text-ink mb-2">{title}</h3>
      <p className="text-sm text-[#6B7280] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {action && (
        <>
          {action.href ? (
            <Button asChild className="bg-coral hover:bg-coral/95 text-white rounded-xl px-6 py-5">
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : (
            <Button
              onClick={action.onClick}
              className="bg-coral hover:bg-coral/95 text-white rounded-xl px-6 py-5"
            >
              {action.label}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
