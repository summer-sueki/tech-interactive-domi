"use client";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

/** Speech bubble that pops above a Domi. */
export default function Bubble({ show, children }: { show: boolean; children: ReactNode }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-2xl bg-white px-3 py-1.5 text-sm font-black text-navy shadow-[0_3px_0_rgba(0,0,0,.12)]"
          initial={{ opacity: 0, scale: 0.4, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 6 }}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
          style={{ originY: 1 }}
        >
          {children}
          <span className="absolute left-1/2 top-full -ml-1.5 h-0 w-0 border-x-[6px] border-t-[7px] border-x-transparent border-t-white" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
