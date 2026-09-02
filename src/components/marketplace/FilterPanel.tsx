"use client";

import { Checkbox, Label } from "@/components/ui/Input";
import { brands, conditions, locations } from "@/data/phones";

const MIN_PRICE = 20000;
const MAX_PRICE = 2000000;

export interface Filters {
  brands: string[];
  conditions: string[];
  locations: string[];
  verifiedOnly: boolean;
  sellerType: "" | "individual" | "shop";
  minPrice: number;
  maxPrice: number;
}

export const defaultFilters: Filters = {
  brands: [],
  conditions: [],
  locations: [],
  verifiedOnly: false,
  sellerType: "",
  minPrice: MIN_PRICE,
  maxPrice: MAX_PRICE,
};

export function FilterPanel({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
}) {
  const toggle = (key: "brands" | "conditions" | "locations", value: string) => {
    const set = new Set(filters[key]);
    set.has(value) ? set.delete(value) : set.add(value);
    onChange({ ...filters, [key]: Array.from(set) });
  };

  const updatePriceRange = (nextMin: number, nextMax: number) => {
    const clampedMin = Math.min(Math.max(nextMin, MIN_PRICE), MAX_PRICE);
    const clampedMax = Math.max(Math.min(nextMax, MAX_PRICE), clampedMin);
    onChange({ ...filters, minPrice: clampedMin, maxPrice: clampedMax });
  };

  return (
    <div className="flex flex-col gap-7">
      <FilterGroup title="Brand">
        {brands.map((b) => (
          <CheckRow key={b} label={b} checked={filters.brands.includes(b)} onChange={() => toggle("brands", b)} />
        ))}
      </FilterGroup>

      <FilterGroup title="Price range">
        <div className="space-y-3">
          <div className="relative h-8">
            <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/10" />
            <div
              className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#7567F8] to-[#16BFA0]"
              style={{
                left: `${((filters.minPrice - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100}%`,
                width: `${((filters.maxPrice - filters.minPrice) / (MAX_PRICE - MIN_PRICE)) * 100}%`,
              }}
            />

            <input
              id="min-price"
              type="range"
              min={MIN_PRICE}
              max={MAX_PRICE}
              step={5000}
              value={filters.minPrice}
              onChange={(e) => updatePriceRange(Number(e.target.value), filters.maxPrice)}
              className="pointer-events-none absolute inset-0 h-1.5 w-full appearance-none bg-transparent accent-[var(--pb-brand)] [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[2px] [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[#7567F8] [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(117,103,248,0.2)] [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[2px] [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-[#7567F8]"
            />
            <input
              id="max-price"
              type="range"
              min={MIN_PRICE}
              max={MAX_PRICE}
              step={5000}
              value={filters.maxPrice}
              onChange={(e) => updatePriceRange(filters.minPrice, Number(e.target.value))}
              className="pointer-events-none absolute inset-0 h-1.5 w-full appearance-none bg-transparent accent-[var(--pb-brand)] [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[2px] [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[#16BFA0] [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(22,191,160,0.2)] [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[2px] [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-[#16BFA0]"
            />
          </div>

          <p className="text-sm text-ink-soft">
            Rs. {filters.minPrice.toLocaleString()} — Rs. {filters.maxPrice.toLocaleString()}
          </p>
        </div>
      </FilterGroup>

      <FilterGroup title="Condition">
        {conditions.map((c) => (
          <CheckRow
            key={c}
            label={c}
            checked={filters.conditions.includes(c)}
            onChange={() => toggle("conditions", c)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Location">
        {locations.map((l) => (
          <CheckRow key={l} label={l} checked={filters.locations.includes(l)} onChange={() => toggle("locations", l)} />
        ))}
      </FilterGroup>

      <FilterGroup title="Verification">
        <CheckRow
          label="Professionally verified only"
          checked={filters.verifiedOnly}
          onChange={() => onChange({ ...filters, verifiedOnly: !filters.verifiedOnly })}
        />
      </FilterGroup>

      <FilterGroup title="Seller Type">
        {(["individual", "shop"] as const).map((t) => (
          <CheckRow
            key={t}
            label={t === "individual" ? "Individual sellers" : "Verified shops"}
            checked={filters.sellerType === t}
            onChange={() => onChange({ ...filters, sellerType: filters.sellerType === t ? "" : t })}
          />
        ))}
      </FilterGroup>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-ink mb-3">{title}</h3>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2.5 text-sm text-ink-soft cursor-pointer">
      <Checkbox checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}
