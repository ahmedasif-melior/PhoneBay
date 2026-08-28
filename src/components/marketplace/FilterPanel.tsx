"use client";

import { Checkbox, Label } from "@/components/ui/Input";
import { brands, conditions, locations } from "@/data/phones";

export interface Filters {
  brands: string[];
  conditions: string[];
  locations: string[];
  verifiedOnly: boolean;
  sellerType: "" | "individual" | "shop";
  maxPrice: number;
}

export const defaultFilters: Filters = {
  brands: [],
  conditions: [],
  locations: [],
  verifiedOnly: false,
  sellerType: "",
  maxPrice: 200000,
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

  return (
    <div className="flex flex-col gap-7">
      <FilterGroup title="Brand">
        {brands.map((b) => (
          <CheckRow key={b} label={b} checked={filters.brands.includes(b)} onChange={() => toggle("brands", b)} />
        ))}
      </FilterGroup>

      <FilterGroup title="Price">
        <Label htmlFor="max-price" className="sr-only">
          Maximum price
        </Label>
        <input
          id="max-price"
          type="range"
          min={20000}
          max={200000}
          step={5000}
          value={filters.maxPrice}
          onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
          className="w-full accent-[var(--pb-brand)]"
        />
        <p className="text-sm text-ink-soft mt-1">Up to Rs. {filters.maxPrice.toLocaleString()}</p>
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
