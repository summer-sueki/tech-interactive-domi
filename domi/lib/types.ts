// Mirrors the planned Supabase tables. Keep these in sync with the schema in README.md.

export type UnlockType = "exhibit" | "event" | "special";

export interface Domi {
  id: string;
  name: string;
  slug: string;
  /** Path under /public. null = art not delivered yet (a labeled placeholder is shown). */
  image: string | null;
  description: string;
  /** Exhibit or event this Domi belongs to. */
  theme: string;
  unlock_type: UnlockType;
  /** Shown on silhouettes: "Hiding near Body Worlds". */
  location_hint: string;
  /** Today's-clue style riddle shown on Home and Find. */
  clue: string;
  /** Extra clue revealed by "More hints". */
  extra_clue?: string;
  active: boolean;
  /** ISO dates. null = no limit. */
  start_date: string | null;
  end_date: string | null;
  /** Background color for the detail scene. */
  color: string;
}

export interface UnlockCode {
  code: string;
  domi_id: string;
  active: boolean;
}

export interface Guest {
  id: string;
  nickname: string;
  provider: "google" | "apple" | "email" | "device";
  created_at: string;
}

export interface CollectionEntry {
  guest_id: string;
  domi_id: string;
  found_at: string;
  location: string;
}

/** Badge states from the brief. */
export type DomiStatus = "hidden" | "new" | "found" | "limited" | "missed" | "upcoming";

export type Topic = "Build & Play" | "AI & Digital" | "Art & Light" | "Biology" | "Body & Health" | "Earth" | "Robotics" | "Global Good";

/** An exhibit in the museum directory (sample data until the museum's list arrives). */
export interface Exhibit {
  id: string;
  name: string;
  topic: Topic;
  /** Section in the museum's guide. */
  group: "Featured" | "Hands-on labs" | "More to explore";
  /** Photo under /public (filler images for now). null → illustrated tile. */
  image: string | null;
  /** Floor, e.g. "Upper level". */
  location: string;
  /** Rough visit length, used by the "time left" filter. */
  minutes: number;
  ages?: string;
  /** Staff flip this when an exhibit is down. Closed exhibits are greyed out and never recommended. */
  closed?: boolean;
  /** Domi hidden at this exhibit, if any. Finding it counts as exploring the exhibit. */
  domi_slug?: string;
  /** One line on what you can do there (Explore cards). */
  blurb: string;
  /** 2–3 sentences for the detail page. */
  description: string;
  type: "Hands-on" | "Gallery" | "Lab" | "Immersive";
}

/** A guest's "I explored this" check-in (visit history). */
export interface CheckIn {
  exhibit_id: string;
  at: string;
}

export type VisitTime = 15 | 30 | 60;
