import type { UnlockCode } from "@/lib/types";
import { DOMIS } from "./domis";

/**
 * Each NFC tag and QR code encodes the same URL: /found/<code>.
 * Supabase `unlock_codes` table later.
 */
export const UNLOCK_CODES: UnlockCode[] = [
  ...DOMIS.map((d) => ({ code: `DOMI-${d.slug.toUpperCase()}`, domi_id: d.id, active: true })),
  // A retired sticker, to demo the "expired" state.
  { code: "OLD-TAG-2025", domi_id: "d02", active: false },
];
