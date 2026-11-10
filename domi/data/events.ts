/**
 * "Happening at The Tech" on Explore.
 *
 * Built to be low maintenance: copy an event from thetech.org and paste it in as one line.
 * Only `title` and `start` are required. Long titles wrap to two lines and old events hide
 * themselves the day after they end, so nothing needs cleaning up by hand.
 *
 *   { title: "Name of the event", start: "2026-12-05", end: "2027-01-10", domi: true },
 *
 * - start / end: dates as YYYY-MM-DD (leave `end` out for a one-day event)
 * - domi: true if a limited-time Domi can be collected at it
 * - note: optional one short line (otherwise we show the dates only)
 */
export interface MuseumEvent {
  title: string;
  start: string;
  end?: string;
  domi?: boolean;
  note?: string;
}

export const EVENTS: MuseumEvent[] = [
  { title: "Body Worlds Decoded", start: "2026-01-15", end: "2026-11-07", domi: true },
  { title: "Free Museum Day (presented by Micron)", start: "2026-11-15", domi: true },
  { title: "Thanksgiving weekend", start: "2026-11-27", end: "2026-11-29", note: "Extended hours" },
  { title: "Polar Play Days", start: "2026-12-05", end: "2027-01-10", domi: true },
];
