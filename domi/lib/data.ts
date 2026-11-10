/**
 * Data layer. Every screen reads content through these functions, never from /data directly.
 * When Supabase is ready, replace the bodies here (see README "Plugging in Supabase").
 */
import { DOMIS, TODAYS_TARGET_SLUG } from "@/data/domis";
import { UNLOCK_CODES } from "@/data/codes";
import type { Domi, DomiStatus, CollectionEntry } from "./types";

/** Lets the demo pin "today" (e.g. NEXT_PUBLIC_MOCK_TODAY=2026-11-04). */
export function now(): Date {
  const mock = process.env.NEXT_PUBLIC_MOCK_TODAY;
  if (mock) {
    const d = new Date(mock);
    const real = new Date();
    d.setHours(real.getHours(), real.getMinutes(), real.getSeconds());
    return d;
  }
  return new Date();
}

export const NEW_WINDOW_MS = 72 * 60 * 60 * 1000;

export function getDomis(): Domi[] {
  return DOMIS.filter((d) => d.active);
}

export function getDomiBySlug(slug: string): Domi | undefined {
  return DOMIS.find((d) => d.slug === slug);
}

export function getDomiById(id: string): Domi | undefined {
  return DOMIS.find((d) => d.id === id);
}

export function getTodaysTarget(): Domi {
  return getDomiBySlug(TODAYS_TARGET_SLUG)!;
}

export function isLimited(d: Domi) {
  return d.end_date !== null;
}

export function isAvailable(d: Domi, at = now()) {
  if (!d.active) return false;
  if (d.start_date && at < new Date(d.start_date)) return false;
  if (d.end_date && at > new Date(d.end_date)) return false;
  return true;
}

export function daysLeft(d: Domi, at = now()) {
  if (!d.end_date) return null;
  return Math.max(0, Math.floor((new Date(d.end_date).getTime() - at.getTime()) / 86_400_000));
}

export function daysUntil(d: Domi, at = now()) {
  if (!d.start_date) return 0;
  return Math.max(0, Math.ceil((new Date(d.start_date).getTime() - at.getTime()) / 86_400_000));
}

export function statusOf(d: Domi, collection: CollectionEntry[], at = now()): DomiStatus {
  const entry = collection.find((c) => c.domi_id === d.id);
  if (entry) {
    return at.getTime() - new Date(entry.found_at).getTime() < NEW_WINDOW_MS ? "new" : "found";
  }
  if (d.end_date && at > new Date(d.end_date)) return "missed";
  if (d.start_date && at < new Date(d.start_date)) return "upcoming";
  if (isLimited(d)) return "limited";
  return "hidden";
}

/** Limited hunts running right now, soonest-ending first. */
export function getActiveLimitedHunts(at = now()) {
  return getDomis()
    .filter((d) => isLimited(d) && isAvailable(d, at))
    .sort((a, b) => +new Date(a.end_date!) - +new Date(b.end_date!));
}

export function getUpcomingHunts(at = now()) {
  return getDomis()
    .filter((d) => d.start_date && at < new Date(d.start_date))
    .sort((a, b) => +new Date(a.start_date!) - +new Date(b.start_date!));
}

export type CodeResult =
  | { kind: "ok"; domi: Domi }
  | { kind: "invalid" }
  | { kind: "expired"; domi?: Domi }
  | { kind: "not-yet"; domi: Domi };

export function resolveCode(raw: string, at = now()): CodeResult {
  const code = decodeURIComponent(raw).trim().toUpperCase();
  const match = UNLOCK_CODES.find((c) => c.code === code);
  if (!match) return { kind: "invalid" };
  const domi = getDomiById(match.domi_id);
  if (!domi) return { kind: "invalid" };
  if (!match.active || !domi.active) return { kind: "expired", domi };
  if (domi.start_date && at < new Date(domi.start_date)) return { kind: "not-yet", domi };
  if (domi.end_date && at > new Date(domi.end_date)) return { kind: "expired", domi };
  return { kind: "ok", domi };
}

export function codeFor(d: Domi) {
  return UNLOCK_CODES.find((c) => c.domi_id === d.id && c.active)?.code ?? "";
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
export function formatShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
