"use client";
import Link from "next/link";
import type { ReactNode, CSSProperties } from "react";

/** Colors from the FQ26 Button component (primary fill + darker bottom edge). */
const COLORS = {
  purple: ["#7F3896", "#5C2470", "#EBD3F2", "#6A2A80"],
  tangerine: ["#F58932", "#C4621A", "#FFD9B8", "#B4560F"],
  cobalt: ["#0088CE", "#00659A", "#BFE3F6", "#00669B"],
  green: ["#1EB14B", "#13853A", "#C2EBCD", "#127B35"],
  pink: ["#ED0289", "#B5006A", "#FBC5E3", "#B5006A"],
  grey: ["#3B4650", "#232B32", "#DCDFE2", "#3B4650"],
} as const;
export type ButtonColor = keyof typeof COLORS;

interface Props {
  children: ReactNode;
  color?: ButtonColor;
  variant?: "primary" | "secondary";
  size?: "L" | "M" | "S";
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
  full?: boolean;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}

export default function Button({
  children, color = "purple", variant = "primary", size = "L", href, onClick, icon,
  full = true, className = "", type = "button", disabled,
}: Props) {
  const [fill, edge, light, text] = COLORS[color];
  const style = {
    "--btn-edge": variant === "primary" ? edge : light,
    background: variant === "primary" ? fill : "#fff",
    color: variant === "primary" ? "#fff" : text,
    border: variant === "secondary" ? `2px solid ${light}` : undefined,
  } as CSSProperties;
  const h = size === "L" ? "h-[54px] text-[20px] px-6" : size === "M" ? "h-11 text-base px-5" : "h-9 text-sm px-4";
  const cls = `chunky inline-flex items-center justify-center gap-2 ${h} ${full ? "w-full" : ""} ${disabled ? "opacity-50" : ""} ${className}`;
  const inner = (
    <>
      {icon}
      <span>{children}</span>
    </>
  );
  if (href)
    return (
      <Link href={href} className={cls} style={style} onClick={onClick}>
        {inner}
      </Link>
    );
  return (
    <button type={type} className={cls} style={style} onClick={onClick} disabled={disabled}>
      {inner}
    </button>
  );
}
