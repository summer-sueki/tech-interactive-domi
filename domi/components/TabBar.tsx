"use client";
/**
 * Bottom navigation: Home (Explore) · FIND (collect a Domi, from anywhere) · My Domis.
 * FIND is the raised orange button in the middle, so collecting is always one tap away.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import CollectSheet from "./CollectSheet";
import { CollectionIcon, HomeIcon, SearchIcon } from "./Icons";
import { getDomis, isAvailable } from "@/lib/data";
import { useLocal } from "@/lib/store";

export default function TabBar() {
  const path = usePathname();
  const local = useLocal();
  const [collect, setCollect] = useState(false);
  const homeOn = path.startsWith("/explore") || path.startsWith("/exhibit");
  const domisOn = path.startsWith("/my-domis");
  const count = local?.collection.length;
  // For the dev "simulate" buttons: the next Domi you could collect right now.
  const owned = new Set((local?.collection ?? []).map((c) => c.domi_id));
  const next = getDomis().find((d) => isAvailable(d) && !owned.has(d.id) && d.image);

  const tab = (href: string, label: string, Icon: typeof HomeIcon, on: boolean, badge?: number) => (
    <Link
      href={href}
      aria-current={on ? "page" : undefined}
      className={`relative flex h-[60px] flex-1 flex-col items-center justify-center gap-0.5 text-[13px] font-black transition-colors ${on ? "text-purple" : "text-navy/50"}`}
    >
      <span className="relative">
        <Icon size={24} />
        {!!badge && (
          <span className="absolute -right-3 -top-1.5 min-w-[18px] rounded-full bg-gold px-1 text-center text-[10px] leading-[18px] text-navy">{badge}</span>
        )}
      </span>
      {label}
    </Link>
  );

  return (
    <>
      <nav className="pb-safe absolute inset-x-0 bottom-0 z-40 rounded-t-[28px] border-t-2 border-black/5 bg-white/95 backdrop-blur" aria-label="Main">
        <div className="mx-auto flex max-w-[560px] items-end px-6">
          {tab("/explore", "Home", HomeIcon, homeOn)}
          <div className="flex w-[96px] shrink-0 justify-center">
            <button
              onClick={() => setCollect(true)}
              aria-label="Find a Domi: tap or scan its sign"
              className="chunky -mt-9 grid h-[78px] w-[78px] place-items-center rounded-full border-[4px] border-white bg-tangerine text-white"
              style={{ ["--btn-edge" as string]: "#C4621A", borderRadius: 999 }}
            >
              <span className="flex flex-col items-center leading-none">
                <SearchIcon size={26} />
                <span className="mt-1 text-[12px] font-black tracking-wider">FIND</span>
              </span>
            </button>
          </div>
          {tab("/my-domis", "My Domis", CollectionIcon, domisOn, count)}
        </div>
      </nav>
      <CollectSheet open={collect} onClose={() => setCollect(false)} domi={next} />
    </>
  );
}
