"use client";
import { useEffect, useState } from "react";

/** True after the first client render (localStorage is only readable then). */
export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}
