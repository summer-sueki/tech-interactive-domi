"use client";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

export default function Sheet({ open, onClose, children, title, tall }: { open: boolean; onClose: () => void; children: ReactNode; title?: string; tall?: boolean }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="absolute inset-0 z-50 bg-navy/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            role="dialog"
            aria-label={title}
            className={`pb-safe absolute inset-x-0 bottom-0 z-50 flex flex-col rounded-t-[32px] bg-white px-5 pt-3 shadow-2xl ${tall ? "h-[82%]" : ""}`}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, i) => { if (i.offset.y > 120) onClose(); }}
          >
            <div className="mx-auto mb-3 h-1.5 w-12 shrink-0 rounded-full bg-navy/15" />
            {title && <h2 className="display mb-3 text-2xl">{title}</h2>}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
