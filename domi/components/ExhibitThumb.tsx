"use client";
/** Exhibit tile: the exhibit photo (or an illustrated tile), topic strip, and a Domi badge if one hides there. */
import Domi from "./Domi";
import { getDomiBySlug } from "@/lib/data";
import type { Exhibit, Topic } from "@/lib/types";

export const TOPIC_COLOR: Record<Topic, string> = {
  "Build & Play": "#F58932", "AI & Digital": "#0C70BA", "Art & Light": "#ED0289", Biology: "#7F3896",
  "Body & Health": "#0758AA", Earth: "#1EB14B", Robotics: "#6C797C", "Global Good": "#C08412",
};

export default function ExhibitThumb({ exhibit, hidden, w = 76, h = 84 }: { exhibit: Exhibit; hidden: boolean; w?: number; h?: number }) {
  const color = TOPIC_COLOR[exhibit.topic];
  const domi = hidden && exhibit.domi_slug ? getDomiBySlug(exhibit.domi_slug) : undefined;
  return (
    <div className="relative shrink-0 overflow-hidden rounded-[18px]" style={{ background: `${color}22`, width: w, height: h }}>
      {exhibit.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={exhibit.image} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      ) : (
        <span className="display absolute inset-x-0 top-2 text-center text-3xl" style={{ color }}>{exhibit.topic[0]}</span>
      )}
      {domi && (
        <span className="absolute right-1 top-1 rounded-full bg-white/95 p-0.5 shadow" title="A Domi is hiding here">
          <Domi domi={domi} size={22} silhouette tappable={false} shadow={false} pose="still" />
        </span>
      )}
      <span className="absolute inset-x-0 bottom-0 truncate px-1 py-0.5 text-center text-[10px] font-black text-white" style={{ background: color }}>{exhibit.topic}</span>
    </div>
  );
}
