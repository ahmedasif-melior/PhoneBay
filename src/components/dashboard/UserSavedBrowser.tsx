"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Bookmark,
  BookmarkX,
  SlidersHorizontal,
  ArrowUpDown,
  ShoppingBag,
  X,
} from "lucide-react";
import { PhoneCard } from "@/components/marketplace/PhoneCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { ListingRecord } from "@/server/types";

export function UserSavedBrowser({ initialSaved }: { initialSaved: ListingRecord[] }) {
  const [saved, setSaved] = React.useState<ListingRecord[]>(initialSaved);
  const [search, setSearch] = React.useState("");
  const [selectedBrand, setSelectedBrand] = React.useState("all");
  const [sortBy, setSortBy] = React.useState<"newest" | "price-desc" | "price-asc">("newest");
  const [toast, setToast] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleUnsave = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await fetch(`/api/listings/${id}/save`, { method: "POST" });
      setSaved((prev) => prev.filter((p) => p.id !== id));
      showToast("Removed device from your saved list");
    } catch {
      showToast("Failed to remove item");
    }
  };

  const filteredSaved = React.useMemo(() => {
    return saved
      .filter((phone) => {
        if (selectedBrand !== "all" && phone.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
          return false;
        }
        if (search.trim()) {
          const q = search.toLowerCase().trim();
          const match =
            phone.model.toLowerCase().includes(q) ||
            phone.brand.toLowerCase().includes(q) ||
            phone.city.toLowerCase().includes(q);
          if (!match) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === "price-desc") {
          return b.price - a.price;
        }
        if (sortBy === "price-asc") {
          return a.price - b.price;
        }
        return 0;
      });
  }, [saved, search, selectedBrand, sortBy]);

  const brands = Array.from(new Set(saved.map((p) => p.brand)));

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 rounded-[var(--pb-radius-md)] px-4 py-2.5 text-sm font-medium shadow-lg border bg-surface text-ink border-border animate-in slide-in-from-top-2 duration-200">
          {toast}
        </div>
      )}

      {/* Control Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your saved phones by model or brand..."
              className="w-full h-10 pl-9 pr-8 rounded-[var(--pb-radius-sm)] border border-border bg-surface text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <span className="text-xs text-ink-soft flex items-center gap-1">
              <ArrowUpDown className="h-3.5 w-3.5" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-9 px-3 rounded-[var(--pb-radius-sm)] border border-border bg-surface text-xs font-medium text-ink focus:outline-none focus:border-brand cursor-pointer"
            >
              <option value="newest">Recently Saved</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="price-asc">Price: Low to High</option>
            </select>
          </div>
        </div>

        {/* Brand Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border">
          <button
            onClick={() => setSelectedBrand("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedBrand === "all"
                ? "bg-brand text-white shadow-xs"
                : "bg-bg text-ink-soft hover:bg-black/[0.04] hover:text-ink"
            }`}
          >
            All Brands ({saved.length})
          </button>
          {brands.map((b) => (
            <button
              key={b}
              onClick={() => setSelectedBrand(b)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedBrand === b
                  ? "bg-brand text-white shadow-xs"
                  : "bg-bg text-ink-soft hover:bg-black/[0.04] hover:text-ink"
              }`}
            >
              {b} ({saved.filter((p) => p.brand === b).length})
            </button>
          ))}
        </div>
      </Card>

      {/* Grid of Saved Phones */}
      {filteredSaved.length === 0 ? (
        <Card className="py-16 text-center">
          <div className="h-12 w-12 rounded-full bg-brand-tint/60 text-brand mx-auto flex items-center justify-center mb-3">
            <Bookmark className="h-6 w-6" />
          </div>
          <p className="font-semibold text-ink">No saved phones found</p>
          <p className="mt-1 text-xs text-ink-soft">
            Explore verified devices on PhoneBay and save phones you want to follow.
          </p>
          <div className="mt-5">
            <Button variant="primary" size="sm" href="/marketplace">
              <ShoppingBag className="h-4 w-4 mr-1.5" />
              Browse Marketplace
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredSaved.map((phone) => (
            <div key={phone.id} className="relative group">
              <PhoneCard phone={phone} />
              <button
                onClick={(e) => handleUnsave(phone.id, e)}
                title="Remove from saved"
                className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-surface/90 backdrop-blur-xs border border-border flex items-center justify-center text-ink-soft hover:text-danger hover:bg-white transition-all shadow-xs"
              >
                <BookmarkX className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
