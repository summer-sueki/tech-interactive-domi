import type { Exhibit } from "@/lib/types";

/**
 * Exhibits from "The Tech Interactive: Exhibits, Labs & Things to Explore Guide" (assets/list-of-exhibits.pdf).
 *
 * Names, groups and descriptions come from the guide. When an exhibit is down, set `closed: true`;
 * the app greys it out and stops recommending it (Joe: exhibits go down often).
 * Floors, minutes, ages and photos are PLACEHOLDERS until the museum confirms them.
 */
export const EXHIBITS: Exhibit[] = [
  // ── Featured exhibits ──
  {
    id: "innovation-in-bloom", name: "Innovation in Bloom", group: "Featured", topic: "Build & Play", type: "Hands-on",
    location: "Main level", minutes: 20, ages: "All ages", image: "/exhibits/innovation-in-bloom.jpg", domi_slug: "touchdown",
    blurb: "Launch balls through tubes, blooms and animals.",
    description: "A two-story interactive exhibit where you launch balls through winding tubes, blooming flowers and local animal figures. It all ends in a giant, collaborative ball-track finale.",
  },
  {
    id: "dream-garden", name: "Dream Garden", group: "Featured", topic: "Art & Light", type: "Immersive",
    location: "Upper level", minutes: 15, ages: "All ages", image: "/exhibits/dream-garden.jpg", domi_slug: "happy",
    blurb: "An AI garden that grows from your ideas and moves.",
    description: "An AI-powered immersive exhibit that turns your ideas and movements into a surreal ecosystem. Peek behind the scenes at the technology that makes it work.",
  },
  {
    id: "pixel-playground", name: "Pixel Playground", group: "Featured", topic: "AI & Digital", type: "Hands-on",
    location: "Main level", minutes: 25, ages: "6+", image: "/exhibits/pixel-playground.jpg", domi_slug: "skater",
    blurb: "Train AI with block animals, design roller coasters, paint digitally.",
    description: "Physical play meets digital innovation. Build block animals to train an AI, design your own roller coaster, and try digital painting.",
  },
  {
    id: "body-worlds", name: "Body Worlds Decoded", group: "Featured", topic: "Body & Health", type: "Gallery",
    location: "Upper level", minutes: 30, ages: "10+", image: "/exhibits/body-worlds.jpg", domi_slug: "body-worlds",
    blurb: "Real human anatomy, up close.",
    description: "Real human anatomy displays, including 8 full-body plastinates and over 60 individual specimens, plus live demos of the Anatomage 3D virtual dissection table and art by Lauren A. Toomer.",
  },
  {
    id: "solve-for-earth", name: "Solve for Earth", group: "Featured", topic: "Earth", type: "Gallery",
    location: "Lower level", minutes: 20, ages: "All ages", image: "/exhibits/solve-for-earth.jpg", domi_slug: "explorer",
    blurb: "Renewable energy, less waste, climate tech.",
    description: "An environmental innovation exhibit about renewable energy, reducing waste, and technology that tackles climate challenges.",
  },
  // ── Hands-on experiences & labs ──
  {
    id: "biotinkering-lab", name: "The BioTinkering Lab", group: "Hands-on labs", topic: "Biology", type: "Lab",
    location: "Lower level", minutes: 30, ages: "8+", image: null,
    blurb: "Experiment with biotech and living organisms.",
    description: "A hands-on bioengineering space to experiment with biotech and work together on ideas that use living organisms.",
  },
  {
    id: "biodesign-studio", name: "BioDesign Studio", group: "Hands-on labs", topic: "Biology", type: "Lab",
    location: "Lower level", minutes: 25, ages: "8+", image: null, domi_slug: "science",
    blurb: "Solve problems with biology.",
    description: "An interactive studio for exploring biological systems and solving problems with life science.",
  },
  {
    id: "tech-studio", name: "The Tech Studio", group: "Hands-on labs", topic: "Build & Play", type: "Lab",
    location: "Main level", minutes: 30, ages: "8+", image: "/exhibits/tech-studio.jpg", domi_slug: "field-trip",
    blurb: "Guided building and open design time.",
    description: "Guided innovation experiences plus open design time for building whatever you can imagine.",
  },
  // ── More to explore ──
  {
    id: "ai-sandbox", name: "AI Sandbox", group: "More to explore", topic: "AI & Digital", type: "Hands-on",
    location: "Upper level", minutes: 15, ages: "8+", image: "/exhibits/ai-sandbox.jpg", domi_slug: "band",
    blurb: "Real-world AI, AI art and motion tracking.",
    description: "See real-world AI in action, including IBM's work with NASA and ESA on sustainability, the Transformirror AI art experience, and motion-tracking software.",
  },
  {
    id: "cyber-detectives", name: "Cyber Detectives", group: "More to explore", topic: "AI & Digital", type: "Hands-on",
    location: "Upper level", minutes: 20, ages: "10+", image: "/exhibits/cyber-detectives.jpg", domi_slug: "coder",
    blurb: "Solve digital mysteries and crack codes.",
    description: "A digital investigation exhibit. Solve virtual mysteries, decode encrypted messages and learn how to stay safe online.",
  },
  {
    id: "health-care", name: "Innovations in Health Care", group: "More to explore", topic: "Body & Health", type: "Gallery",
    location: "Upper level", minutes: 15, ages: "All ages", image: "/exhibits/health-care.jpg",
    blurb: "Drones, biosensors, 3D bioprinting and more.",
    description: "Medical technology up close: delivery drones, wearable biosensors, 3D bioprinting, thermal imaging and early cancer detection.",
  },
  {
    id: "social-robots", name: "Social Robots", group: "More to explore", topic: "Robotics", type: "Hands-on", closed: true,
    location: "Main level", minutes: 20, ages: "8+", image: null, domi_slug: "cool",
    blurb: "Design and program a real robot.",
    description: "A hands-on station with real sensors and actuators where you design, customize and program working robots.",
  },
  {
    id: "global-good", name: "Tech for Global Good", group: "More to explore", topic: "Global Good", type: "Gallery",
    location: "Main level", minutes: 10, ages: "All ages", image: "/exhibits/global-good.jpg",
    blurb: "Innovators using tech for social change.",
    description: "Stories and work from innovators around the world using technology for social change, including the BCI Pioneers Coalition, Cognixion, NexStride and Sanmai Technologies.",
  },
];

export const GROUPS = ["Featured", "Hands-on labs", "More to explore"] as const;
export const TOPICS = [...new Set(EXHIBITS.map((x) => x.topic))];

export function getExhibit(id: string) {
  return EXHIBITS.find((x) => x.id === id);
}
