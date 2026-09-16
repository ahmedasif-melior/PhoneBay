"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Eye,
  MessageSquare,
  MoreVertical,
  Pencil,
  PauseCircle,
  Trash2,
  PlayCircle,
  Search,
  ArrowUpDown,
  X,
} from "lucide-react";

import { Tabs } from "@/components/ui/Tabs";
import {
  StatusBadge,
  VerificationBadge,
} from "@/components/ui/Badge";
import {
  Dropdown,
  DropdownItem,
} from "@/components/ui/Dropdown";
import { Button } from "@/components/ui/Button";
import { formatPKR } from "@/lib/utils";
import type { ListingRecord } from "@/server/types";

const tabs = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "pending", label: "Pending" },
  { id: "sold", label: "Sold" },
  { id: "draft", label: "Drafts" },
];

// function imageForListing(brand: string, model: string): string {
//   const key = `${brand} ${model}`.toLowerCase();

//   if (key.includes("iphone 15 pro")) {
//     return "/images/phones/iphone-15-pro.svg";
//   }

//   if (key.includes("iphone 14")) {
//     return "/images/phones/iphone-14.svg";
//   }

//   if (key.includes("s24")) {
//     return "/images/phones/galaxy-s24.svg";
//   }

//   if (key.includes("s23")) {
//     return "/images/phones/galaxy-s23.svg";
//   }

//   if (key.includes("pixel")) {
//     return "/images/phones/pixel-9.svg";
//   }

//   if (key.includes("oneplus")) {
//     return "/images/phones/oneplus-13.svg";
//   }

//   return "/images/phones/iphone-15.webp";
// }

export function MyListingsBrowser({
  initialListings,
}: {
  initialListings: ListingRecord[];
}) {
  /*
   * Always normalize the incoming value to an array.
   *
   * This protects the client component from a repository/query
   * accidentally returning an object instead of ListingRecord[].
   */
  const safeInitialListings = Array.isArray(initialListings)
    ? initialListings
    : [];

  const [active, setActive] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const [sortBy, setSortBy] = React.useState<"newest" | "views" | "price-desc" | "price-asc">("newest");

  const [listings, setListings] =
    React.useState<ListingRecord[]>(safeInitialListings);

  const filtered = React.useMemo(() => {
    return listings
      .filter((listing) => {
        if (active !== "all" && listing.status !== active) return false;
        if (search.trim()) {
          const q = search.toLowerCase().trim();
          const match =
            listing.model.toLowerCase().includes(q) ||
            listing.brand.toLowerCase().includes(q);
          if (!match) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === "views") {
          return (b.views ?? 0) - (a.views ?? 0);
        }
        if (sortBy === "price-desc") {
          return b.price - a.price;
        }
        if (sortBy === "price-asc") {
          return a.price - b.price;
        }
        return 0;
      });
  }, [listings, active, search, sortBy]);

  const togglePause = async (id: string) => {
    const listing = listings.find((item) => item.id === id);

    if (!listing || listing.status === "sold") {
      return;
    }

    const status =
      listing.status === "paused"
        ? "active"
        : "paused";

    try {
      const response = await fetch(`/api/listings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
        }),
      });

      if (!response.ok) {
        return;
      }

      setListings((prev) =>
        prev.map((listing) =>
          listing.id === id
            ? {
                ...listing,
                status,
              }
            : listing,
        ),
      );
    } catch (error) {
      console.error(
        "[LISTINGS] Failed to update listing:",
        error,
      );
    }
  };

  const remove = async (id: string) => {
    try {
      const response = await fetch(
        `/api/listings/${id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        return;
      }

      setListings((prev) =>
        prev.filter((listing) => listing.id !== id),
      );
    } catch (error) {
      console.error(
        "[LISTINGS] Failed to delete listing:",
        error,
      );
    }
  };

  return (
    <div>
      <Tabs
        tabs={tabs.map((tab) => ({
          ...tab,
          count:
            tab.id === "all"
              ? listings.length
              : listings.filter(
                  (listing) =>
                    listing.status === tab.id,
                ).length,
        }))}
        active={active}
        onChange={setActive}
      />

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your listings..."
            className="w-full h-9 pl-9 pr-8 rounded-[var(--pb-radius-sm)] border border-border bg-surface text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-ink-soft flex items-center gap-1">
            <ArrowUpDown className="h-3.5 w-3.5" /> Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-9 px-2.5 rounded-[var(--pb-radius-sm)] border border-border bg-surface text-xs font-medium text-ink focus:outline-none focus:border-brand cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="views">Most Views</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="price-asc">Price: Low to High</option>
          </select>
        </div>
      </div>

      <div className="mt-6 hidden lg:block border border-border rounded-[var(--pb-radius-md)] overflow-visible">
        <table className="w-full text-sm">
          <thead className="bg-bg text-ink-faint text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left font-medium px-4 py-3">
                Device
              </th>
              <th className="text-left font-medium px-4 py-3">
                Price
              </th>
              <th className="text-left font-medium px-4 py-3">
                Status
              </th>
              <th className="text-left font-medium px-4 py-3">
                Views
              </th>
              <th className="text-left font-medium px-4 py-3">
                Messages
              </th>
              <th className="text-left font-medium px-4 py-3">
                Verification
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {filtered.map((listing) => (
              <tr key={listing.id}>
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/listings/${listing.id}`}
                    className="flex items-center gap-3"
                  >
                    <div className="h-11 w-11 rounded-(--pb-radius-sm) bg-bg border border-border flex items-center justify-center shrink-0 overflow-hidden">
                      <Image
                        src={listing.imageUrls?.[0] || "/images/phones/iphone-15.webp"}
                        alt={listing.model}
                        width={36}
                        height={36}
                        className="object-cover h-full w-full"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="font-medium text-ink truncate">
                        {listing.model}
                      </p>

                      <p className="text-xs text-ink-faint">
                        {listing.storage}
                      </p>
                    </div>
                  </Link>
                </td>

                <td className="px-4 py-3 font-data text-ink">
                  {formatPKR(listing.price)}
                </td>

                <td className="px-4 py-3">
                  <StatusBadge status={listing.status} />
                </td>

                <td className="px-4 py-3 text-ink-soft">
                  <span className="inline-flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5" />
                    {listing.views}
                  </span>
                </td>

                <td className="px-4 py-3 text-ink-soft">
                  <span className="inline-flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5" />
                    0
                  </span>
                </td>

                <td className="px-4 py-3">
                  {listing.verified && (
                    <VerificationBadge size="sm" />
                  )}
                </td>

                <td className="px-4 py-3 text-right">
                  <Dropdown
                    align="right"
                    trigger={
                      <span className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-black/4">
                        <MoreVertical className="h-4 w-4 text-ink-soft" />
                      </span>
                    }
                  >
                    <DropdownItem
                      href={`/dashboard/listings/${listing.id}`}
                      icon={
                        <Pencil className="h-4 w-4" />
                      }
                    >
                      Edit
                    </DropdownItem>

                    <DropdownItem
                      href={`/marketplace/${listing.id}`}
                      icon={
                        <Eye className="h-4 w-4" />
                      }
                    >
                      Preview
                    </DropdownItem>

                    {listing.status !== "sold" ? (
                      <DropdownItem
                        onClick={() =>
                          togglePause(listing.id)
                        }
                        icon={
                          listing.status === "paused" ? (
                            <PlayCircle className="h-4 w-4" />
                          ) : (
                            <PauseCircle className="h-4 w-4" />
                          )
                        }
                      >
                        {listing.status === "paused"
                          ? "Resume"
                          : "Pause"}
                      </DropdownItem>
                    ) : null}

                    <DropdownItem
                      onClick={() =>
                        remove(listing.id)
                      }
                      danger
                      icon={
                        <Trash2 className="h-4 w-4" />
                      }
                    >
                      Delete
                    </DropdownItem>
                  </Dropdown>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-col gap-4 lg:hidden">
        {filtered.map((listing) => (
          <div
            key={listing.id}
            className="border border-border rounded-(--pb-radius-md) p-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-(--pb-radius-sm) bg-bg border border-border flex items-center justify-center shrink-0 overflow-hidden">
                <Image
                  src={listing.imageUrls?.[0] || "/images/phones/iphone-15.webp"}
                  alt=""
                  width={44}
                  height={44}
                  className="object-cover h-full w-full"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-ink truncate">
                  {listing.model}
                </p>

                <p className="font-data text-sm text-ink-soft">
                  {formatPKR(listing.price)}
                </p>
              </div>

              <StatusBadge status={listing.status} />
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-sm text-ink-faint">
              <span className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                {listing.views}
              </span>

              <span className="flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                0
              </span>

              {listing.status !== "sold" ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    togglePause(listing.id)
                  }
                >
                  {listing.status === "paused"
                    ? "Resume"
                    : "Pause"}
                </Button>
              ) : (
                <span className="text-xs text-ink-faint">
                  Sold — locked
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {listings.length === 0 && (
        <div className="mt-8 text-center text-sm text-ink-faint">
          No listings found.
        </div>
      )}
    </div>
  );
}