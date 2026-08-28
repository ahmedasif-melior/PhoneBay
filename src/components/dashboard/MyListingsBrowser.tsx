"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, MessageSquare, MoreVertical, Pencil, PauseCircle, Trash2, PlayCircle } from "lucide-react";
import { Tabs } from "@/components/ui/Tabs";
import { StatusBadge } from "@/components/ui/Badge";
import { VerificationBadge } from "@/components/ui/Badge";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { Button } from "@/components/ui/Button";
import { formatPKR } from "@/lib/utils";
import { phones as allPhones, type Phone } from "@/data/phones";

const tabs = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "pending", label: "Pending" },
  { id: "sold", label: "Sold" },
  { id: "draft", label: "Drafts" },
];

export function MyListingsBrowser() {
  const [active, setActive] = React.useState("all");
  const [listings, setListings] = React.useState<Phone[]>(allPhones.slice(0, 5));

  const filtered = active === "all" ? listings : listings.filter((p) => p.status === active);

  const togglePause = (id: string) => {
    setListings((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: p.status === "paused" ? "active" : "paused" } : p))
    );
  };

  const remove = (id: string) => {
    setListings((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div>
      <Tabs
        tabs={tabs.map((t) => ({
          ...t,
          count: t.id === "all" ? listings.length : listings.filter((p) => p.status === t.id).length,
        }))}
        active={active}
        onChange={setActive}
      />

      <div className="mt-6 hidden lg:block border border-border rounded-[var(--pb-radius-md)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg text-ink-faint text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left font-medium px-4 py-3">Device</th>
              <th className="text-left font-medium px-4 py-3">Price</th>
              <th className="text-left font-medium px-4 py-3">Status</th>
              <th className="text-left font-medium px-4 py-3">Views</th>
              <th className="text-left font-medium px-4 py-3">Messages</th>
              <th className="text-left font-medium px-4 py-3">Verification</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((phone) => (
              <tr key={phone.id}>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/listings/${phone.id}`} className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-[var(--pb-radius-sm)] bg-bg border border-border flex items-center justify-center shrink-0">
                      <Image src={phone.image} alt="" width={36} height={36} className="object-contain h-4/5 w-4/5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-ink truncate">{phone.model}</p>
                      <p className="text-xs text-ink-faint">{phone.storage}</p>
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3 font-data text-ink">{formatPKR(phone.price)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={phone.status} />
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  <span className="inline-flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5" /> {phone.views}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  <span className="inline-flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5" /> {phone.messages}
                  </span>
                </td>
                <td className="px-4 py-3">{phone.verified && <VerificationBadge size="sm" />}</td>
                <td className="px-4 py-3 text-right">
                  <Dropdown
                    align="right"
                    trigger={
                      <span className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-black/[0.04]">
                        <MoreVertical className="h-4 w-4 text-ink-soft" />
                      </span>
                    }
                  >
                    <DropdownItem href={`/dashboard/listings/${phone.id}`} icon={<Pencil className="h-4 w-4" />}>
                      Edit
                    </DropdownItem>
                    <DropdownItem href={`/marketplace/${phone.id}`} icon={<Eye className="h-4 w-4" />}>
                      Preview
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => togglePause(phone.id)}
                      icon={
                        phone.status === "paused" ? (
                          <PlayCircle className="h-4 w-4" />
                        ) : (
                          <PauseCircle className="h-4 w-4" />
                        )
                      }
                    >
                      {phone.status === "paused" ? "Resume" : "Pause"}
                    </DropdownItem>
                    <DropdownItem onClick={() => remove(phone.id)} danger icon={<Trash2 className="h-4 w-4" />}>
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
        {filtered.map((phone) => (
          <div key={phone.id} className="border border-border rounded-[var(--pb-radius-md)] p-4">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-[var(--pb-radius-sm)] bg-bg border border-border flex items-center justify-center shrink-0">
                <Image src={phone.image} alt="" width={44} height={44} className="object-contain h-4/5 w-4/5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-ink truncate">{phone.model}</p>
                <p className="font-data text-sm text-ink-soft">{formatPKR(phone.price)}</p>
              </div>
              <StatusBadge status={phone.status} />
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-sm text-ink-faint">
              <span className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" /> {phone.views}
              </span>
              <span className="flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" /> {phone.messages}
              </span>
              <Button size="sm" variant="ghost" onClick={() => togglePause(phone.id)}>
                {phone.status === "paused" ? "Resume" : "Pause"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
