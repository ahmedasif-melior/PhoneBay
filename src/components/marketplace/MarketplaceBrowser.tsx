"use client";

import * as React from "react";
import { Search, SlidersHorizontal, PackageSearch } from "lucide-react";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PhoneCard } from "@/components/marketplace/PhoneCard";
import {
  FilterPanel,
  defaultFilters,
  type Filters,
} from "@/components/marketplace/FilterPanel";
import { MobileFilterDrawer } from "@/components/marketplace/MobileFilterDrawer";
import type { ListingRecord } from "@/server/types";

type SortKey =
  | "recommended"
  | "newest"
  | "price-asc"
  | "price-desc";

type MarketplaceBrowserProps = {
  initialListings: ListingRecord[];
};

export function MarketplaceBrowser({
  initialListings,
}: MarketplaceBrowserProps) {
  const [query, setQuery] = React.useState("");
  const [filters, setFilters] =
    React.useState<Filters>(defaultFilters);
  const [sort, setSort] =
    React.useState<SortKey>("recommended");
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // Always make sure the component works with an array.
  const listings = React.useMemo(
    () => (Array.isArray(initialListings) ? initialListings : []),
    [initialListings]
  );

  const results = React.useMemo(() => {
    let list = listings.filter((p) => {
      // Search
      if (
        query &&
        !`${p.brand} ${p.model}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ) {
        return false;
      }

      // Brand
      if (
        filters.brands.length &&
        !filters.brands.includes(p.brand)
      ) {
        return false;
      }

      // Condition
      if (
        filters.conditions.length &&
        !filters.conditions.includes(p.condition)
      ) {
        return false;
      }

      // Location
      if (
        filters.locations.length &&
        !filters.locations.includes(p.city)
      ) {
        return false;
      }

      // Verified
      if (filters.verifiedOnly && !p.verified) {
        return false;
      }

      // Seller type
      if (
        filters.sellerType &&
        filters.sellerType === "shop"
      ) {
        return false;
      }

      // Price
      if (
        p.price < filters.minPrice ||
        p.price > filters.maxPrice
      ) {
        return false;
      }

      return true;
    });

    switch (sort) {
      case "newest":
        list = [...list].sort(
          (a, b) =>
            +new Date(b.createdAt) -
            +new Date(a.createdAt)
        );
        break;

      case "price-asc":
        list = [...list].sort(
          (a, b) => a.price - b.price
        );
        break;

      case "price-desc":
        list = [...list].sort(
          (a, b) => b.price - a.price
        );
        break;

      case "recommended":
      default:
        list = [...list].sort(
          (a, b) =>
            (b.score ?? 0) - (a.score ?? 0)
        );
        break;
    }

    return list;
  }, [listings, query, filters, sort]);

  const clearFilters = () => {
    setFilters(defaultFilters);
    setQuery("");
  };

  return (
    <div>
      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Input
          leadingIcon={<Search className="h-4 w-4" />}
          placeholder="Search by model, brand or keyword"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search listings"
          className="flex-1"
        />

        <div className="flex gap-3">
          <Select
            value={sort}
            onChange={(e) =>
              setSort(e.target.value as SortKey)
            }
            aria-label="Sort by"
            className="w-auto min-w-[180px]"
          >
            <option value="recommended">
              Sort: Recommended
            </option>

            <option value="newest">
              Sort: Newest
            </option>

            <option value="price-asc">
              Sort: Price low to high
            </option>

            <option value="price-desc">
              Sort: Price high to low
            </option>
          </Select>

          <Button
            variant="outline"
            className="lg:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open filters"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* Marketplace */}
      <div className="grid lg:grid-cols-[240px_1fr] gap-8">
        {/* Desktop Filters */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <FilterPanel
              filters={filters}
              onChange={setFilters}
            />
          </div>
        </aside>

        {/* Results */}
        <div>
          <p className="text-sm text-ink-faint mb-4">
            {results.length}{" "}
            {results.length === 1 ? "phone" : "phones"} found
          </p>

          {results.length > 0 ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {results.map((phone) => (
                <PhoneCard
                  key={phone.id}
                  phone={phone}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-20 border border-dashed border-border rounded-[var(--pb-radius-md)]">
              <PackageSearch className="h-10 w-10 text-ink-faint mb-3" />

              <p className="font-medium text-ink">
                No phones match your filters
              </p>

              <p className="text-sm text-ink-faint mt-1">
                Try widening your search or clearing
                filters.
              </p>

              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={clearFilters}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters */}
      <MobileFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        onChange={setFilters}
        resultCount={results.length}
      />
    </div>
  );
}