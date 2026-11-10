import { redirect } from "next/navigation";

// The app opens on Explore (user flow: "Opens the app from a link or QR code" → Explore).
export default function Index() {
  redirect("/explore");
}
