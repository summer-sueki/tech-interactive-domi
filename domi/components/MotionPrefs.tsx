"use client";
/** Applies the "Reduce motion" setting app-wide (on top of the phone's own accessibility setting). */
import { MotionConfig } from "framer-motion";
import { getSettings, useLocal } from "@/lib/store";

export default function MotionPrefs({ children }: { children: React.ReactNode }) {
  const local = useLocal();
  return <MotionConfig reducedMotion={getSettings(local).reduceMotion ? "always" : "user"}>{children}</MotionConfig>;
}
