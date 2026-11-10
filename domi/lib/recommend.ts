/**
 * "Find your next stop": transparent, rules-based recommendations (no AI or training data).
 * Each rule adds points and a short reason (one line on the card); the top 3 open exhibits are shown.
 */
import { EXHIBITS } from "@/data/exhibits";
import { getDomiBySlug, daysLeft, isAvailable } from "./data";
import type { CheckIn, CollectionEntry, Exhibit, VisitTime } from "./types";

export interface Recommendation {
  exhibit: Exhibit;
  score: number;
  reason: string;
  hidesDomi: boolean;
}

type Scored = Omit<Recommendation, "reason"> & { reasons: [number, string][] };

/** Visit history: exhibits checked in with "I explored this", plus exhibits where you found the Domi. */
export function getVisits(collection: CollectionEntry[], checkins: CheckIn[] = []) {
  const visits = new Map<string, string>();
  for (const c of checkins) visits.set(c.exhibit_id, c.at);
  for (const x of EXHIBITS) {
    const id = x.domi_slug ? getDomiBySlug(x.domi_slug)?.id : undefined;
    const entry = id ? collection.find((c) => c.domi_id === id) : undefined;
    if (entry && !visits.has(x.id)) visits.set(x.id, entry.found_at);
  }
  return [...visits.entries()]
    .map(([id, at]) => ({ exhibit: EXHIBITS.find((x) => x.id === id)!, at }))
    .filter((v) => v.exhibit)
    .sort((a, b) => +new Date(b.at) - +new Date(a.at));
}

export function getExplored(collection: CollectionEntry[], checkins: CheckIn[] = []) {
  return getVisits(collection, checkins).map((v) => v.exhibit);
}

export function recommend(collection: CollectionEntry[], time: VisitTime | null, limit = 3, checkins: CheckIn[] = []): Recommendation[] {
  const visits = getVisits(collection, checkins);
  const explored = visits.map((v) => v.exhibit);
  const exploredIds = new Set(explored.map((x) => x.id));
  const found = new Set(collection.map((c) => c.domi_id));
  const lastExhibit = visits[0]?.exhibit;

  const recs = EXHIBITS.filter((x) => !exploredIds.has(x.id) && !x.closed)
    .filter((x) => !time || time === 60 || x.minutes <= time)
    .map((x) => {
      const reasons: [number, string][] = [];
      const domi = x.domi_slug ? getDomiBySlug(x.domi_slug) : undefined;
      if (domi && !isAvailable(domi)) return null; // e.g. exhibit not open yet
      const sameTopic = explored.find((e) => e.topic === x.topic);
      if (sameTopic) reasons.push([3, `More ${x.topic}`]);
      const left = domi ? daysLeft(domi) : null;
      if (left !== null && left <= 7) reasons.push([3, `Leaving in ${left} day${left === 1 ? "" : "s"}`]);
      if (domi && !found.has(domi.id)) reasons.push([2, "A Domi is hiding here"]);
      if (lastExhibit && lastExhibit.location === x.location) reasons.push([1, "Near your last stop"]);
      if (time && x.minutes <= time) reasons.push([1, `Fits your ${time === 60 ? "hour" : `${time} min`}`]);
      reasons.sort((a, b) => b[0] - a[0]);
      return {
        exhibit: x,
        score: reasons.reduce((s, [p]) => s + p, 0),
        reasons,
        hidesDomi: !!domi && !found.has(domi.id),
      };
    })
    .filter(Boolean) as Scored[];

  // One short reason per card, never repeating the card above it.
  const used = new Set<string>();
  return recs
    .sort((a, b) => b.score - a.score || a.exhibit.minutes - b.exhibit.minutes)
    .slice(0, limit)
    .map(({ reasons, ...r }) => {
      const reason = reasons.map(([, t]) => t).find((t) => !used.has(t)) ?? r.exhibit.blurb;
      used.add(reason);
      return { ...r, reason };
    });
}
