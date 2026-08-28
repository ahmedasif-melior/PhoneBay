"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FilterPanel, type Filters } from "@/components/marketplace/FilterPanel";

export function MobileFilterDrawer({
  open,
  onClose,
  filters,
  onChange,
  resultCount,
}: {
  open: boolean;
  onClose: () => void;
  filters: Filters;
  onChange: (f: Filters) => void;
  resultCount: number;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", duration: 0.24, ease: "easeOut" }}
            className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-surface rounded-t-[var(--pb-radius-lg)] max-h-[85vh] flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <h2 className="font-semibold text-lg">Filters</h2>
              <button onClick={onClose} aria-label="Close filters" className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-black/5">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-5 flex-1">
              <FilterPanel filters={filters} onChange={onChange} />
            </div>
            <div className="p-5 border-t border-border shrink-0">
              <Button fullWidth onClick={onClose}>
                Show {resultCount} results
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
