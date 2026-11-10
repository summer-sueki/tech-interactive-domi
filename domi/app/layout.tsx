import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import MotionPrefs from "@/components/MotionPrefs";

const nunito = Nunito({ subsets: ["latin"], weight: ["500", "600", "700", "800", "900"], variable: "--font-nunito" });

export const metadata: Metadata = {
  title: "Domi: The Tech Interactive",
  description: "Domis are hiding all over the museum. Can you find them?",
  appleWebApp: { capable: true, title: "Domi", statusBarStyle: "black-translucent" },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/icon-192.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0088CE",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={nunito.variable}>
      <body>
        <MotionPrefs><div className="app-column">{children}</div></MotionPrefs>
      </body>
    </html>
  );
}
