"use client";
/**
 * Bottom sheet. Drag down to close.
 * `expandable`: also drag the handle up to fill the whole screen, with an X to close
 * (used for the collection grid, which scrolls its own content).
 */
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { CloseIcon } from "./Icons";

export default function Sheet({ open, onClose, children, title, tall, expandable }: { open: boolean; onClose: () => void; children: ReactNode; title?: string; tall?: boolean; expandable?: boolean }) {
  const controls = useDragControls();
  const [full, setFull] = useState(false);
  useEffect(() => { if (!open) setFull(false); }, [open]);
  const height = expandable ? (full ? "100%" : "82%") : tall ? "82%" : undefined;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="absolute inset-0 z-50 bg-navy/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            role="dialog"
            aria-label={title}
            className={`pb-safe absolute inset-x-0 bottom-0 z-50 mx-auto flex max-w-[640px] flex-col bg-white px-5 shadow-2xl ${full ? "pt-safe rounded-none" : "rounded-t-[32px] pt-3"}`}
            style={height ? { height } : undefined}
            initial={{ y: "100%" }}
            animate={{ y: 0, height }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            drag="y"
            dragListener={!expandable}
            dragControls={controls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: expandable ? 0.25 : 0, bottom: 0.6 }}
            onDragEnd={(_, i) => {
              if (expandable && i.offset.y < -50) setFull(true);
              else if (i.offset.y > 120) (expandable && full ? setFull(false) : onClose());
            }}
          >
            {expandable ? (
              // Grab area: drag up for full screen, down to shrink or close. Tap toggles too.
              <div className="-mx-5 cursor-grab touch-none px-5" onPointerDown={(e) => controls.start(e)}>
                <button onClick={() => setFull((f) => !f)} aria-label={full ? "Shrink" : "Expand to full screen"} className="mx-auto mb-2 block py-1">
                  <span className={`block h-1.5 w-12 rounded-full bg-navy/15 ${full ? "opacity-0" : ""}`} />
                </button>
                <div className="mb-3 flex items-center justify-between gap-3">
                  {title && <h2 className="display text-2xl">{title}</h2>}
                  <button onClick={onClose} aria-label="Close" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-offwhite text-navy/70">
                    <CloseIcon size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mx-auto mb-3 h-1.5 w-12 shrink-0 rounded-full bg-navy/15" />
                {title && <h2 className="display mb-3 text-2xl">{title}</h2>}
              </>
            )}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
