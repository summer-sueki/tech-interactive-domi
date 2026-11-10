# Build prompt: Domi, The Tech Interactive hide-and-seek web app

You are building a clickable, animated prototype of a mobile-first progressive web app (PWA) for The Tech Interactive, a STEM museum in San Jose. Read this whole file before writing code. Start by proposing a short plan and file structure, then build screen by screen.

---

## 1. Project context (from client meetings and the brief)

- **Client:** The Tech Interactive marketing team (point of contact: Joe). They have no IT or technical team for this project, so everything must be simple to maintain and hand off.
- **Team:** a student team from CodeLab Davis (developers + designers), working on an ~8-week timeline that started Oct 12.
- **Launch tie-in:** the app is timed with the public reveal of the physical Domi mascot costume in December.
- **Leadership's priority:** bring visitors back to the museum. The app must make a strong case for that.
- **Philosophy:** the museum is moving away from "too many touchscreens." The phone is a tool for collecting, not a screen to play on instead of the exhibits. The app is optional: it enhances a visit but is never required for one.
- **Audience:** middle and high school students (confirmed 10/29), plus families. Playful but not babyish.
- **What engages visitors:** immersive, exploratory, low-instruction experiences (for example, the museum's "Dream Garden" projection room and teamLab-style interaction). Avoid text-heavy, instructional UI.

## 2. Main goal

Bring guests back to the museum. The app turns the museum into a **hide-and-seek game**. Themed versions of the mascot, Domi, are hidden around the building, and guests find them by **tapping an NFC tag or scanning a QR code**. Every Domi they find joins their personal collection, a **memory capsule** of each visit. New and limited-time Domis are hidden for each event and exhibit, so there's always a reason to come back and search again.

**Joe's top priorities:**
1. The unlock / "you found me" moment
2. The collection as a living memory capsule
3. Domis that feel alive through playful animation

## 3. Domi, the mascot

- Domi has a **blue dome head** (the IMAX dome) with a white highlight and an **orange rectangular body** (the building exterior). He has big round black eyes with white sparkles and a small smile. He represents "the inner child in everyone."
- **Themed Domis** use the same base character with an outfit, prop, and background. About 18 exist and about 6 more are planned (Thanksgiving and winter). Examples include Soccer (jersey and ball), Explorer (backpack and walking stick), Science (goggles and flask), Cheer (pom-poms), Winter (Polar Play Days), and Tech or Treat.
- **Use the provided art. Do not redraw Domi.** All Domi images must be **transparent PNG or SVG**. Never render a white or boxed background behind a Domi. Each Domi sits directly on the scene with a soft oval shadow under its feet.
- Collecting **distinct themed Domis** is the chosen mechanic. Customizable accessories were considered and rejected as too complex for this release.

## 4. Assets (place these in the repo before building)

```
/public/domis/          transparent Domi PNGs/SVGs (base + themed), named like domi-soccer.png
/public/references/     UI and motion reference images from the design team
```

Reference images and what to take from each:
- **Language-learning app screens:** flat, chunky, colorful illustration and a game-path map
- **Woofz dog-training app:** a progress path with checkpoints and a "goal completed" bottom sheet
- **"Plopp" green mascot app:** big expressive mascot eyes as the hero of onboarding and login
- **Pink squirrel GIF:** the motion style. Bouncy, squash-and-stretch, with props that move
- **"Studio Run" game clip (Little Labs):** the reveal moment. Indigo starry sky, a swirl portal, a character launching out, glitchy game title text, and collection slots filling in
- **Pikmin Bloom:** exploring a world and finding characters, with a "You got a new ___ from ___!" card
- **Sago Mini World and Khan Academy Kids:** characters living freely in an illustrated 2D scene, with no cards or boxes
- **Current Figma Make draft (what NOT to do):** pale dashboard cards, Domis in white boxes, a stiff list layout, and content hidden under the Dynamic Island

If an asset is missing, use a clearly labeled placeholder and keep going.

## 5. Tech stack (agreed with the team)

- **Next.js (React) + TypeScript**, App Router
- **Tailwind CSS** for styling
- **Framer Motion** for character and UI animation (spring physics and drag)
- **Supabase** for the database and auth (Google, Apple, and email login). For this first prototype, use **local mock data behind a small data layer** so it can be swapped to Supabase later.
- **Vercel** for hosting. Use a separate domain from the museum's current site vendor (Adage), which is being replaced next year.
- **PWA:** manifest, icons, add-to-home-screen, mobile-first at 390px wide, responsive up to tablet and laptop

**Unlock mechanism:** encode both NFC tags and QR codes as the **same URL** (for example, `/found/[code]`). iPhones and Android phones open NFC tag URLs natively, and Web NFC only works on Android Chrome, so don't rely on it. The Find screen's "Tap NFC tag" button explains how to tap. In the prototype, include a dev-only "Simulate find" button.

**Data model (keep it simple):**
- `domis`: id, name, slug, image, description, theme, unlock_type (exhibit / event / special), location_hint, clue, active, start_date, end_date
- `unlock_codes`: code, domi_id, active
- `guests`: id, nickname, auth provider, created_at
- `guest_collection`: guest_id, domi_id, found_at, location

Admin dashboard: **out of scope for this prototype.** Still, keep all Domi content (names, images, clues, dates, on/off) in data rather than hardcoded in components, so the marketing team can manage it later.

**Accounts:** guests can find and see a Domi **before** any sign-up. A login wall right after scanning causes kids and parents to drop off. After the first find, prompt "Keep your Domis safe" (Google / Apple / email, or "Maybe later"). Until sign-up, store progress on the device. No social features and no messaging between users.

## 6. Visual design

**It must feel like a game where you're on a hunt, not a utility app.**

- **Safe areas:** nothing may sit under the Dynamic Island, status bar, or home indicator. Use `env(safe-area-inset-*)` padding.
- **Environments, not cards:** illustrated scenes with rolling hills, a museum-dome skyline, trees, clouds, and sparkles, all as flat, chunky, colorful shapes (SVG).
- **Game-style UI:** chunky buttons with a thick bottom edge for a 3D press effect (they push down on tap), rounded bold type, playful icons, and a counter at the top ("🔍 6/24 found").
- **Colors:**
  - Primary blue `#1E7FD0`
  - Orange `#E8692A`
  - Yellow accent `#FFD84D`
  - Navy text `#1B2A3A`
  - Off-white `#F4F7FB`
  - Reveal night sky: indigo `#2A2470` to `#3B3FA8`
  - These are estimates. Replace them with Joe's official palette when available.
- **Type:** a bold, chunky, rounded display font for headlines (for example, Nunito Black or Baloo 2 from Google Fonts) and a clean sans-serif for body text.
- **Accessibility:** large tap targets (at least 48px), readable contrast, minimal copy, and full `prefers-reduced-motion` support.

## 7. Motion (most important)

Domis must feel alive, with playful, bouncy character animation in the style of the squirrel reference. Build these as **one reusable `<Domi>` component** that works for every themed Domi. Do not animate each character by hand.

- **Squash and stretch** on every bounce: the body squishes down on landing and stretches up on the jump.
- **Idle loop:** a gentle bob, a blink every few seconds, and small wiggles. Props move too (the soccer ball bounces, the explorer stick sways). Fake this with subtle transforms on the whole image if the art isn't layered.
- **Tap:** a quick jump, a spin, or a surprised hop, picked at random.
- **Easing:** springy (spring physics, ease-out-back, or elastic). Nothing moves linearly.
- **Reduced motion:** static poses with simple fades.

## 8. Screens

Bottom tab bar: **Home**, **Find** (center, raised, emphasized), and **My Domis**.

### 1. Welcome (first visit)
- A Domi peeks out from behind the screen edge, then hops in and waves.
- Copy: "Domis are hiding all over the museum. Can you find them?"
- Buttons: "Start hunting" and "Log in."

### 2. Home → "The Hunt"
- **Today's hint is the hero:** a big treasure-map or scroll card at the top reading "TODAY'S CLUE: I'm hiding near something that shakes..." Show it next to a silhouette of the hidden Domi with a "?" and a wiggling magnifying glass.
- Below the hint, a big chunky "Start hunting" button.
- **Progress trail:** a game path of footprints or dots leading to the next hidden Domi, with found Domis standing along the path.
- **Recent finds:** the last 4 Domis standing together on a small grassy hill, bouncing slightly. No cards, no boxes. Include a "See all" link.
- **Limited-time hunt banner:** a countdown ("Polar Play Days: 3 days left") with the silhouette of the Domi you can find there.

### 3. Find
- The clue sits at the top in large type, with a "More hints" button that reveals one extra clue.
- Center: a radar or sonar pulse animation around a hiding Domi silhouette, captioned "Getting warmer..."
- Bottom: two big chunky buttons, "Tap NFC tag" and "Scan QR code" (camera viewfinder with a QR frame), plus an "Enter code" fallback.

### 4. Found! (the pop-out reveal, matching the Studio Run reference)
- **Background:** indigo starry night sky with twinkling stars and sparkles.
- **Sequence:**
  1. A glowing swirl portal opens with a ripple effect.
  2. Domi launches out with a big squash-and-stretch jump and a motion trail.
  3. He lands with an overshoot bounce, then does a happy wiggle and wave.
  4. Confetti and sparkles burst around him.
- **Title:** "YOU FOUND ME!" animates in with a glitch or pixel effect, in a blue-to-lavender gradient.
- **Collection slots:** a row at the top shows found and empty slots, and the new Domi's slot pops in.
- **Card:** slides up with the Domi's name, "#7 of 24," where and when it was found, and an "Add to My Domis" button.
- **Order:** this screen comes before any sign-up.

### 5. Save prompt (guests, after the first find)
- Copy: "Keep your Domis safe."
- Buttons: Continue with Google, Continue with Apple, email, and "Maybe later."
- A Domi peeks in from the edge.

### 6. My Domis → a living 2D world (full screen)
- The whole screen is an illustrated 2D field: grass, flowers, a small museum dome in the background, drifting clouds, and a path. **There is no list below it.**
- **Wandering:** every collected Domi wanders on its own. It walks with a little waddle, pauses, blinks, looks around, sits, and waves at nearby Domis.
- **Drag anywhere:** when picked up, a Domi stretches, dangles, and looks surprised. When dropped, it squashes on landing, bounces, and walks off.
- **Tap once:** the Domi jumps and shows a speech bubble with its name.
- **Tap again:** opens its memory detail.
- **Overlays:** only a small "7 / 24 found" counter and a small floating "Grid" button.
- **Grid view is optional:** it opens as a bottom sheet with filter chips (All / Events / Exhibits / Limited), and unfound Domis appear as silhouettes with hints like "Hiding near Body Worlds" or "Coming in spring."
- **Scrolling:** the field scrolls sideways when there are many Domis, so it never feels crowded.

### 7. Domi detail (memory)
- A large animated Domi on its themed background.
- Name and a short description.
- A "memory" card showing where it was found, the date, and the exhibit or event.

### 8. Discover
- Domis still in hiding, each with a hint.
- Limited-time hunts with clear dates.

### 9. Edge states (each with a Domi reaction)
- **Invalid or expired code:** Domi shrugs.
- **Already found:** Domi waves, "You already found me!"
- **No connection:** a Domi reaction.

**Badge states:** hidden (silhouette), just found (glow and "NEW" tag), found, limited-time (date ribbon), and missed (faded, "Missed this one").

## 9. Sample content for mock data

- **Events and exhibits to theme Domis around:**
  - Tech or Treat
  - Free Museum Day (presented by Micron)
  - Polar Play Days (opens early December, winter Domi)
  - Body Worlds Decoded (leaving this year, a good fit for a limited-time Domi)
  - Earthquakes exhibit (returning next year, "Coming in spring")
- **Clue ideas:** clues are answerable only by looking at exhibits (for example, "How many floors did the model building have?"). Place NFC tags and QR codes at the **end** of an activity, not the entrance, so you earn Domi by doing the exhibit.
- **Special unlock:** the costume Domi carries a tag at events, so meeting Domi in person unlocks a special one.
- **Mock data size:** about 24 total Domis, with 6–7 found in the demo state.

## 10. Definition of done for this prototype

- All 9 screens are navigable on a 390px phone viewport, with nothing hidden by safe areas.
- The reusable `<Domi>` component has idle, tap, drag, and reveal animations, plus a reduced-motion fallback.
- `/found/[code]` triggers the reveal for a valid mock code and shows the edge states for invalid or duplicate codes.
- The My Domis field supports wandering and dragging, with the optional grid sheet.
- All content comes from mock data files that match the data model above.
- A README explains how to run the app, how to add a new Domi (drop in an image and add a data entry), and where Supabase will plug in.
