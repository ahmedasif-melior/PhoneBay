"use client";

import * as React from "react";
import { Search, SlidersHorizontal, PackageSearch } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PhoneCard } from "@/components/marketplace/PhoneCard";
import { FilterPanel, defaultFilters, type Filters } from "@/components/marketplace/FilterPanel";
import { MobileFilterDrawer } from "@/components/marketplace/MobileFilterDrawer";
import { phones } from "@/data/phones";

type SortKey = "recommended" | "newest" | "price-asc" | "price-desc";

export function MarketplaceBrowser() {
  const [query, setQuery] = React.useState("");
  const [filters, setFilters] = React.useState<Filters>(defaultFilters);
  const [sort, setSort] = React.useState<SortKey>("recommended");
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const results = React.useMemo(() => {
    let list = phones.filter((p) => {
      if (query && !`${p.brand} ${p.model}`.toLowerCase().includes(query.toLowerCase())) return false;
      if (filters.brands.length && !filters.brands.includes(p.brand)) return false;
      if (filters.conditions.length && !filters.conditions.includes(p.condition)) return false;
      if (filters.locations.length && !filters.locations.includes(p.location)) return false;
      if (filters.verifiedOnly && !p.verified) return false;
      if (filters.sellerType && p.sellerType !== filters.sellerType) return false;
      if (p.price > filters.maxPrice) return false;
      return true;
    });

    switch (sort) {
      case "newest":
        list = [...list].sort((a, b) => +new Date(b.postedDate) - +new Date(a.postedDate));
        break;
      case "price-asc":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      default:
        list = [...list].sort((a, b) => b.score - a.score);
    }
    return list;
  }, [query, filters, sort]);

  return (
    <div>
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
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="Sort by"
            className="w-auto min-w-[180px]"
          >
            <option value="recommended">Sort: Recommended</option>
            <option value="newest">Sort: Newest</option>
            <option value="price-asc">Sort: Price low to high</option>
            <option value="price-desc">Sort: Price high to low</option>
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

      <div className="grid lg:grid-cols-[240px_1fr] gap-8">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <FilterPanel filters={filters} onChange={setFilters} />
          </div>
        </aside>

        <div>
          <p className="text-sm text-ink-faint mb-4">{results.length} phones found</p>
          {results.length > 0 ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {results.map((phone) => (
                <PhoneCard key={phone.id} phone={phone} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-20 border border-dashed border-border rounded-[var(--pb-radius-md)]">
              <PackageSearch className="h-10 w-10 text-ink-faint mb-3" />
              <p className="font-medium text-ink">No phones match your filters</p>
              <p className="text-sm text-ink-faint mt-1">Try widening your search or clearing filters.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setFilters(defaultFilters);
                  setQuery("");
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </div>

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
