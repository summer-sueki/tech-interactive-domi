import type { Domi } from "@/lib/types";

/**
 * All Domi content lives here so marketing can manage it later (Supabase `domis` table).
 * To add a Domi: drop a transparent PNG in /public/domis and add an entry below.
 * Mock "today" for the demo is early November 2026.
 */
export const DOMIS: Domi[] = [
  // ── Found in the demo state ─────────────────────────────
  {
    id: "d01", slug: "classic", name: "Classic Domi", image: "/domis/domi-classic.png",
    description: "The original! Blue dome on top, orange building below, and a big curious grin.",
    theme: "Meet Domi in person", unlock_type: "special",
    location_hint: "Meet the real Domi at an event", clue: "Find me in person. I'm the one waving at the door!",
    active: true, start_date: null, end_date: null, color: "#0088CE",
  },
  {
    id: "d02", slug: "explorer", name: "Explorer Domi", image: "/domis/domi-explorer.png",
    description: "Packed a backpack and a walking stick. Never met a trail it didn't like.",
    theme: "Solve for Earth", unlock_type: "exhibit",
    location_hint: "Hiding near the climate globe", clue: "I'm hiding where the whole planet spins.",
    active: true, start_date: null, end_date: null, color: "#1EB14B",
  },
  {
    id: "d03", slug: "science", name: "Science Domi", image: "/domis/domi-science.png",
    description: "Goggles on, flask bubbling. Every experiment is a little bit of magic.",
    theme: "BioDesign Studio", unlock_type: "exhibit",
    location_hint: "Hiding in the BioDesign Studio", clue: "I'm hiding where scientists grow colors.",
    active: true, start_date: null, end_date: null, color: "#7F3896",
  },
  {
    id: "d04", slug: "soccer", name: "Soccer Domi", image: "/domis/domi-soccer.png",
    description: "Can't stop bouncing the ball. Ask it about the physics of a perfect kick.",
    theme: "Free Museum Day", unlock_type: "event",
    location_hint: "Found on Free Museum Day", clue: "Goal! I'm near the ball that never stops rolling.",
    active: true, start_date: null, end_date: null, color: "#0088CE",
  },
  {
    id: "d05", slug: "cheer", name: "Cheer Domi", image: "/domis/domi-cheer.png",
    description: "Pom-poms ready. Cheers loudest for every visitor who finds a Domi.",
    theme: "Tech Challenge", unlock_type: "event",
    location_hint: "Found at the Tech Challenge", clue: "Give me a T! I'm where teams build and test.",
    active: true, start_date: null, end_date: null, color: "#ED0289",
  },
  {
    id: "d06", slug: "skater", name: "Skater Domi", image: "/domis/domi-skater.png",
    description: "Too cool for school, but secretly loves learning about friction.",
    theme: "Pixel Playground", unlock_type: "exhibit",
    location_hint: "Hiding by the roller coaster designer", clue: "I love a loop-de-loop. Design one with me!",
    active: true, start_date: null, end_date: null, color: "#F58932",
  },
  {
    id: "d07", slug: "band", name: "Band Domi", image: "/domis/domi-band.png",
    description: "Plays the clarinet. Wants to know how sound waves make music.",
    theme: "AI Sandbox", unlock_type: "exhibit",
    location_hint: "Hiding in the AI Sandbox", clue: "Strike a pose and a mirror makes art of you.",
    active: true, start_date: null, end_date: null, color: "#FED602",
  },

  // ── Still hiding ─────────────────────────────────────────
  {
    id: "d08", slug: "touchdown", name: "Touchdown Domi", image: "/domis/domi-touchdown.png",
    description: "Helmet on, ball tucked. Loves anything that rolls, bounces or cascades.",
    theme: "Innovation in Bloom", unlock_type: "exhibit",
    location_hint: "Hiding near the ball cascade",
    clue: "I'm hiding where balls race through blooming flowers...",
    extra_clue: "Follow the tubes all the way down to the big finale.",
    active: true, start_date: null, end_date: null, color: "#F58932",
  },
  {
    id: "d09", slug: "body-worlds", name: "X-Ray Domi", image: "/domis/domi-body-worlds.png",
    description: "Half Domi, half skeleton. Shows you what's going on inside!",
    theme: "Body Worlds Decoded", unlock_type: "event",
    location_hint: "Hiding near Body Worlds", clue: "I can show you my bones. Look closely!",
    extra_clue: "Count the bones in a hand. I'm at the end of the gallery.",
    active: true, start_date: "2026-01-15T00:00:00", end_date: "2026-11-07T23:59:00", color: "#0B2A6B",
  },
  {
    id: "d10", slug: "heart", name: "Big Heart Domi", image: "/domis/domi-heart.png",
    description: "Gives the biggest hugs. Shows up when the museum opens its doors to everyone.",
    theme: "Free Museum Day (presented by Micron)", unlock_type: "event",
    location_hint: "Free Museum Day, Nov 15", clue: "Come back on Free Museum Day. I'll be holding something red.",
    active: true, start_date: "2026-11-15T00:00:00", end_date: "2026-11-15T23:59:00", color: "#ED0289",
  },
  {
    id: "d11", slug: "field-trip", name: "Field Trip Domi", image: "/domis/domi-field-trip.png",
    description: "Backpack full of snacks and questions. First one on the bus.",
    theme: "The Tech Studio", unlock_type: "exhibit",
    location_hint: "Hiding in The Tech Studio", clue: "I'm where you design your own invention.",
    active: true, start_date: null, end_date: null, color: "#7F3896",
  },
  {
    id: "d12", slug: "happy", name: "Sunny Domi", image: "/domis/domi-happy.png",
    description: "Always blushing, always smiling. Loves the light shows.",
    theme: "Dream Garden", unlock_type: "exhibit",
    location_hint: "Hiding in the Dream Garden", clue: "Move your arms and the garden grows. So do I.",
    active: true, start_date: null, end_date: null, color: "#1EB14B",
  },
  {
    id: "d13", slug: "cool", name: "Side-Eye Domi", image: "/domis/domi-cool.png",
    description: "Suspicious of everything. Asks the best questions.",
    theme: "Social Robots", unlock_type: "exhibit",
    location_hint: "Hiding near the robots", clue: "A robot is watching you. So am I.",
    active: true, start_date: null, end_date: null, color: "#ABAFAE",
  },
  {
    id: "d14", slug: "tech-or-treat", name: "Tech or Treat Domi", image: null,
    description: "Dressed as a pumpkin circuit board. Only out for one spooky week.",
    theme: "Tech or Treat", unlock_type: "event",
    location_hint: "Tech or Treat, Oct 24–31", clue: "Trick or tech? I glow in the dark.",
    active: true, start_date: "2026-10-24T00:00:00", end_date: "2026-10-31T23:59:00", color: "#F58932",
  },
  {
    id: "d15", slug: "polar", name: "Polar Domi", image: null,
    description: "Scarf, mittens, rosy cheeks. Arrives with the first snow.",
    theme: "Polar Play Days", unlock_type: "event",
    location_hint: "Polar Play Days, from Dec 5", clue: "Brrr! Find me where it's coldest.",
    active: true, start_date: "2026-12-05T00:00:00", end_date: "2027-01-10T23:59:00", color: "#0088CE",
  },
  {
    id: "d16", slug: "snowflake", name: "Snowflake Domi", image: null,
    description: "No two are alike. Just like you.",
    theme: "Polar Play Days", unlock_type: "event",
    location_hint: "Polar Play Days, from Dec 5", clue: "Count my six points.",
    active: true, start_date: "2026-12-05T00:00:00", end_date: "2027-01-10T23:59:00", color: "#A6D8F0",
  },
  {
    id: "d17", slug: "harvest", name: "Harvest Domi", image: null,
    description: "Thankful for science, snacks, and you.",
    theme: "Thanksgiving weekend", unlock_type: "event",
    location_hint: "Thanksgiving weekend, Nov 27–29", clue: "Gobble gobble! I'm near the food science table.",
    active: true, start_date: "2026-11-27T00:00:00", end_date: "2026-11-29T23:59:00", color: "#F58932",
  },
  {
    id: "d18", slug: "quake", name: "Quake Domi", image: null,
    description: "Wobbly but never falls over.",
    theme: "Earthquakes", unlock_type: "exhibit",
    location_hint: "Coming in spring", clue: "The ground is about to move...",
    active: true, start_date: "2027-03-15T00:00:00", end_date: null, color: "#F58932",
  },
  {
    id: "d19", slug: "robot", name: "Robo Domi", image: null,
    description: "Beep boop. Learning to be human, one wave at a time.",
    theme: "Social Robots", unlock_type: "exhibit",
    location_hint: "Hiding near the robot arm", clue: "Program me to wave hello.",
    active: true, start_date: null, end_date: null, color: "#ABAFAE",
  },
  {
    id: "d20", slug: "astronaut", name: "Astro Domi", image: null,
    description: "The dome is a helmet now. Ready for launch.",
    theme: "Space Exploration", unlock_type: "exhibit",
    location_hint: "Hiding near the Mars rover", clue: "3, 2, 1... look up!",
    active: true, start_date: null, end_date: null, color: "#3B3FA8",
  },
  {
    id: "d21", slug: "coder", name: "Coder Domi", image: null,
    description: "Wrote its first program at age 0.",
    theme: "Cyber Detectives", unlock_type: "exhibit",
    location_hint: "Hiding with the Cyber Detectives", clue: "Crack the secret message to find me.",
    active: true, start_date: null, end_date: null, color: "#1EB14B",
  },
  {
    id: "d22", slug: "imax", name: "Dome Theater Domi", image: null,
    description: "Lives under the big dome. Loves the front row.",
    theme: "Hackworth IMAX Dome", unlock_type: "special",
    location_hint: "Hiding at the IMAX Dome", clue: "Look up! The biggest dome is my cousin.",
    active: true, start_date: null, end_date: null, color: "#0088CE",
  },
  {
    id: "d23", slug: "inventor", name: "Inventor Domi", image: null,
    description: "Has a toolbelt and a hundred ideas.",
    theme: "Innovation Playground", unlock_type: "exhibit",
    location_hint: "Hiding at the maker bench", clue: "I'm where broken things get fixed.",
    active: true, start_date: null, end_date: null, color: "#FED602",
  },
  {
    id: "d24", slug: "new-year", name: "New Year Domi", image: null,
    description: "Party hat and noisemaker. Counting down with you.",
    theme: "New Year's Eve", unlock_type: "event",
    location_hint: "Coming Dec 31", clue: "10, 9, 8...",
    active: true, start_date: "2026-12-31T00:00:00", end_date: "2027-01-01T23:59:00", color: "#7F3896",
  },
];

/** The Domi that today's clue points to. Swap daily from the admin side later. */
export const TODAYS_TARGET_SLUG = "touchdown";
