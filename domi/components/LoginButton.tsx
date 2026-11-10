"use client";
/** Header account control: "Sign in" when signed out, a settings gear when signed in. The Sign in button that sits on every page (user flow: returning visitor, any time). */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GearIcon } from "./Icons";
import { isLoggedIn, useLocal } from "@/lib/store";

/** `quiet`: smaller and lighter, for a pinned header after scrolling. */
export default function LoginButton({ dark, quiet }: { dark?: boolean; quiet?: boolean }) {
  const local = useLocal();
  const path = usePathname();
  if (local && isLoggedIn(local)) {
    return (
      <Link
        href={`/settings?back=${encodeURIComponent(path)}`}
        aria-label="Settings"
        className={`grid place-items-center transition-all duration-300 ${quiet ? "h-9 w-9 rounded-xl bg-white/25 text-white" : `chunky h-12 w-12 ${dark ? "bg-white/15 text-white" : "bg-white text-purple"}`}`}
        style={quiet ? { borderRadius: 12 } : { ["--btn-edge" as string]: "#EBD3F2", borderRadius: 16 }}
      >
        <GearIcon size={quiet ? 20 : 24} />
      </Link>
    );
  }
  return (
    <Link
      href={`/save?mode=login&next=${encodeURIComponent(path)}`}
      className={`inline-flex items-center rounded-full font-black transition-all duration-300 ${quiet ? "h-8 bg-white/25 px-3 text-[13px] text-white" : "chunky h-10 bg-white px-4 text-sm text-purple"}`}
      style={quiet ? { borderRadius: 999 } : { ["--btn-edge" as string]: "#EBD3F2", borderRadius: 999 }}
    >
      Sign in
    </Link>
  );
}
