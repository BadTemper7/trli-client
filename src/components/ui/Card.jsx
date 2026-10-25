// src/components/ui/Card.jsx
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

export default function Card({ children, className, ...props }) {
  return (
    <div
      className={twMerge(
        "bg-surface border border-white/5 rounded-2xl p-4 shadow-lg",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
