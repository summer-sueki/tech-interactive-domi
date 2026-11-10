# Domi: The Tech Interactive hide-and-seek PWA (prototype)

A clickable, animated prototype. Themed Domis hide around the museum; guests find them by tapping an NFC tag or scanning a QR code, and every Domi they find joins their living collection.

Built with Next.js (App Router) + TypeScript, Tailwind CSS v4, and Framer Motion. Colors and buttons follow the FQ26 Figma design system (Tangerine, Gold, Green, Cobalt, Purple, Pink, Grey; chunky 3D buttons; Nunito).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Open it at phone width (390px) in your browser's device toolbar, or on a phone on the same Wi-Fi.

The app opens as a first-time visitor: no Domis, not signed in, and the My Domis walkthrough shows on the first visit. To start over: Settings → Erase my Domis on this phone, or run `localStorage.removeItem("domi:v2")` in the browser console and reload.

To pin the date (so countdowns always read the same): `NEXT_PUBLIC_MOCK_TODAY=2026-11-04 npm run dev`.

## Showing the client

**Live app:** just open the app (the old `/demo` link redirects to it). It starts as a first-time visitor. On a deployed build, set `NEXT_PUBLIC_SHOW_DEV=1` so the "Simulate a tap / scan" buttons are available for collecting Domis without a real tag.

**Figma (clickable):** open the "v4 · … (live, clickable prototype)" section, press Play, and choose the flow *1 · First-time visitor* or *2 · Returning visitor*.

## Screens

Two main pages, matching the user flow:

- **Explore** (functional): find exhibits, your next stops, what's on now.
- **My Domis** (gamified): the living Domi field, a "Found a Domi?" card with **I found the Domi!**, your progress (when logged in), and more Domis to find.

| Route | Screen |
|---|---|
| `/` | Redirects to Explore (the app opens here) |
| `/explore` | Sticky search, **Your next stops** (3 suggestions, one short reason each), all exhibits with an Interest filter. Closed exhibits grey out |
| `/exhibit/[id]` | Exhibit detail: photo, quick-fact chips, description, a compact "Domi hiding here! · Found it!" callout, and **I explored this** (check-in) |
| `/found/[code]` | Reward unlocked · Domi collected (also opened directly by a Domi QR code or link), plus edge states |
| `/settings` | Gear in the header once signed in (replaces "Saved"): edit profile, sound, reduce motion, privacy (camera use, download my data), replay walkthrough, sign out, delete account |
| `/save` | Save your Domis, with **Already have an account? Sign in** for people whose account isn't on this phone. `?mode=login` is the Sign in button on every page |
| `/my-domis` | Living field, "Found a Domi in the museum?" (**I found the Domi!**), progress when logged in, "More Domis to find" (Hiding now / Limited-time tabs), grid sheet. First visit shows a 3-step walkthrough; "How does this work?" replays it |
| `/domi/[slug]` | Domi memory detail |

**Flow:** Explore → Exhibit detail → *I explored this* records the visit. When you spot a Domi (on an exhibit page or from My Domis) tap **I found the Domi!** → **Tap** (touch the top of the phone to the sign's NFC tag; the Domi squeezes in through a slot in the middle third of the top edge, springs back into shape, then floats in space) or **Scan** (the sign's QR code) → Reward (Domi collected) → signed in? yes → My Domis; no → Save your Domis (or Sign in) → My Domis. Returning visitors tap **Sign in** in any header → Domis back → back where they were.

Tag and QR links are `/found/<code>?via=nfc` and `?via=qr`, so the reveal starts from the sign. In-app, Android Chrome also reads the tag with Web NFC and decodes the QR with BarcodeDetector; iPhone opens the tag's link by itself.

Try these codes at `/found/<code>`:

- `DOMI-TOUCHDOWN`: shows the full reveal (same as tapping I explored this at Earthquake Lab)
- `DOMI-SOCCER`: already found
- `DOMI-TECH-OR-TREAT`: event ended (expired)
- `OLD-TAG-2025`: retired tag (expired)
- `DOMI-POLAR`: not out yet
- `ANYTHING-ELSE`: invalid code (Domi shrugs)
- add `?state=offline` to any `/found/...` URL to preview the no-connection state

## Find your next stop

Explore suggests 3 open exhibits, each with one short reason (per the project brief). It's rules-based, no AI: see `lib/recommend.ts`.

| Rule | Points | Reason shown |
|---|---|---|
| Same topic as an exhibit you explored | +3 | "More Build & Play" |
| Limited-time and leaving within 7 days | +3 | "Leaving in 3 days" |
| A Domi is still hiding there | +2 | "A Domi is hiding here" |
| Same floor as your last stop | +1 | "Near your last stop" |
| Fits the time you picked (15 / 30 / 60 min) | +1 | "Fits your 15 min" |

Visit history (`getVisits` in `lib/recommend.ts`) is every exhibit you checked in with "I explored this", plus every exhibit where you found its Domi. Explored exhibits are skipped, and so are exhibits longer than the time you picked. Closed exhibits are skipped too. Each card shows one short reason and never repeats the reason on the card above it. Exhibits live in `data/exhibits.ts`: the 13 exhibits from the museum's guide (`assets/list-of-exhibits.pdf`), with `closed: true` when an exhibit is down. Floors, minutes, ages and the photos in `public/exhibits/` are placeholders.

## NFC and QR

NFC tags and QR codes both encode the same URL: `https://<domain>/found/<CODE>`. iPhones and Android phones open NFC tag URLs natively, so no Web NFC is needed. Put tags at the **end** of an activity so guests earn the Domi by doing the exhibit.

## Add a new Domi

1. Export the art as a **transparent PNG** (no white box) and drop it in `public/domis/`, e.g. `domi-robot.png`.
2. Add an entry in `data/domis.ts` (name, slug, image path, description, theme, unlock type, location hint, clue, dates, color).
3. A code `DOMI-<SLUG>` is created automatically in `data/codes.ts`. Write that URL to the tag or QR code.

A Domi with `image: null` shows a labeled "Art coming soon" placeholder, so you can add the data before the art is ready.

## Animation

Every Domi uses one component, `components/Domi.tsx`. The art is a single flat image, so life is faked with transforms: idle bob with squash and stretch, blink, tap reactions (jump, spin, surprised hop), walk waddle, drag dangle, landing squash, wave, sit, shrug. All of it switches to static poses under `prefers-reduced-motion`.

## Data model and Supabase

All screens read through `lib/data.ts` (content) and `lib/store.ts` (the guest's progress). Nothing reads `data/` directly, so swapping in Supabase only touches those two files.

```sql
create table domis (
  id text primary key, name text, slug text unique, image text, description text,
  theme text, unlock_type text check (unlock_type in ('exhibit','event','special')),
  location_hint text, clue text, extra_clue text, active boolean default true,
  start_date timestamptz, end_date timestamptz, color text
);
create table unlock_codes (code text primary key, domi_id text references domis(id), active boolean default true);
create table guests (id uuid primary key references auth.users(id), nickname text, provider text, created_at timestamptz default now());
create table guest_collection (guest_id uuid references guests(id), domi_id text references domis(id), found_at timestamptz default now(), location text, primary key (guest_id, domi_id));
```

Plugging in Supabase:

- `lib/data.ts`: replace `getDomis`, `getDomiBySlug`, `resolveCode` with queries to `domis` and `unlock_codes`. Validate codes on the server (a route handler) so codes aren't shipped to the browser.
- `lib/store.ts`: keep localStorage for guests who skip sign-up. After login, upload the local collection to `guest_collection` and read from there.
- `app/save/page.tsx`: `signIn()` is where `supabase.auth.signInWithOAuth({ provider: "google" | "apple" })` and `signInWithOtp({ email })` go.

## Hosting

Deploy to Vercel on a domain separate from the current museum site. `app/manifest.ts` plus the icons in `public/icons` make it installable (Add to Home Screen).

## Not in this prototype

- Admin dashboard (content already lives in data, ready for one)
- Real auth, real QR decoding in the in-app scanner (the phone's camera app opens QR URLs directly), service worker / offline caching
