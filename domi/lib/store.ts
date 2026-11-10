"use client";
/**
 * Guest progress, stored on the device until the guest signs up.
 * Later: mirror `collection` into Supabase `guest_collection` after login.
 */
import { useSyncExternalStore } from "react";
import type { CheckIn, CollectionEntry, Guest } from "./types";
import { now } from "./data";

// v2: everyone starts fresh as a first-time visitor (older saved demo data is ignored).
const KEY = "domi:v2";

export interface LocalState {
  guest: Guest;
  collection: CollectionEntry[];
  welcomed: boolean;
  savePromptSeen: boolean;
  hintsRevealed: Record<string, boolean>;
  visitTime?: 15 | 30 | 60 | null;
  /** "I explored this" check-ins (visit history). */
  checkins?: CheckIn[];
  /** First-visit walkthrough on My Domis has been seen. */
  coachSeen?: boolean;
  settings?: Settings;
}

/** Settings page (prototype: stored on the device; later mirrored to the account). */
export interface Settings {
  sound: boolean;
  reduceMotion: boolean;
  /** Favorite Domi shown as the profile picture. */
  avatar?: string;
}

export const DEFAULT_SETTINGS: Settings = { sound: true, reduceMotion: false };

export function getSettings(s: LocalState | null): Settings {
  return { ...DEFAULT_SETTINGS, ...(s?.settings ?? {}) };
}

export function setSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
  update((s) => ({ ...s, settings: { ...getSettings(s), [key]: value } }));
}

/** Sign out: the Domis stay in the account; this device goes back to a guest. */
export function signOut() {
  update((s) => ({ ...s, guest: { ...s.guest, provider: "device", nickname: "Guest" } }));
}

/** Delete account / reset: clears everything on this device. */
export function deleteEverything() {
  write(seed());
}

/** A first-time visitor: nothing collected, not signed in, walkthrough not seen yet. */
function seed(): LocalState {
  return {
    guest: { id: "device-guest", nickname: "Guest", provider: "device", created_at: now().toISOString() },
    collection: [],
    checkins: [],
    welcomed: false,
    savePromptSeen: false,
    coachSeen: false,
    visitTime: null,
    hintsRevealed: {},
  };
}

let cache: LocalState | null = null;
const listeners = new Set<() => void>();

function read(): LocalState {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    // Fill in anything missing so older or partial saves never crash the app.
    const saved = raw ? (JSON.parse(raw) as Partial<LocalState>) : {};
    const base = seed();
    cache = { ...base, ...saved, guest: { ...base.guest, ...(saved.guest ?? {}) }, collection: saved.collection ?? [] };
  } catch {
    cache = seed();
  }
  return cache;
}

function write(next: LocalState) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode: keep in memory */
  }
  listeners.forEach((l) => l());
}

export function update(fn: (s: LocalState) => LocalState) {
  write(fn(read()));
}

export function addToCollection(domi_id: string, location: string) {
  update((s) =>
    s.collection.some((c) => c.domi_id === domi_id)
      ? s
      : { ...s, collection: [...s.collection, { guest_id: s.guest.id, domi_id, found_at: now().toISOString(), location }] },
  );
}

export function checkIn(exhibit_id: string) {
  update((s) =>
    (s.checkins ?? []).some((c) => c.exhibit_id === exhibit_id)
      ? s
      : { ...s, checkins: [...(s.checkins ?? []), { exhibit_id, at: now().toISOString() }] },
  );
}

const SERVER: LocalState | null = null;

export function useLocal(): LocalState | null {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => read(),
    () => SERVER,
  );
}

export function isLoggedIn(s: LocalState) {
  return s.guest.provider !== "device";
}

export function getLocal() {
  return read();
}
