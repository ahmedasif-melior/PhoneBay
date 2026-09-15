import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Store,
  ShieldCheck,
  ShieldX,
  Clock,
  Package,
  TrendingUp,
  ClipboardCheck,
  Star,
  User as UserIcon,
  Globe,
  CheckCircle2,
} from "lucide-react";
import { requireAdmin } from "@/server/http";
import { shopsRepo } from "@/server/repositories/shops";
import { usersRepo } from "@/server/repositories/users";
import { listingsRepo } from "@/server/repositories/listings";
import { getAdminDb } from "@/server/db";
import { formatPKR } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Shop Detail — Admin" };

export default async function AdminShopDetailPage({
  params,
}: {
  params: Promise<{ shopId: string }>;
}) {
  await requireAdmin();
  const { shopId } = await params;

  const shop = await shopsRepo.findById(shopId);
  if (!shop) notFound();

  const db = getAdminDb();

  const [owner, listings, revenueResult, verificationJobsResult] = await Promise.all([
    shop.ownerId ? usersRepo.findById(shop.ownerId) : Promise.resolve(null),
    listingsRepo.list({ sellerId: shop.ownerId ?? undefined }, true),
    db
      .from("orders")
      .select("price")
      .eq("seller_id", shop.ownerId ?? ""),
    db
      .from("verification_requests")
      .select("id, status, requested_at, score, listing_id")
      .order("requested_at", { ascending: false })
      .limit(30),
  ]);

  const revenue = (revenueResult.data ?? []).reduce(
    (s: number, r: any) => s + Number(r.price ?? 0),
    0
  );

  // Enrich verification jobs with listing name
  const jobListingIds = (verificationJobsResult.data ?? [])
    .map((v: any) => v.listing_id)
    .filter(Boolean);

  const jobListingMap = new Map<string, string>();
  if (jobListingIds.length > 0) {
    const { data: jl } = await db
      .from("listings")
      .select("id, brand, model")
      .in("id", jobListingIds);
    for (const l of jl ?? []) jobListingMap.set(l.id, `${l.brand} ${l.model}`);
  }

  const statusColor: Record<string, string> = {
    active: "bg-verify-tint text-verify-dark border-verify/20",
    sold: "bg-brand-tint text-brand border-brand/20",
    pending: "bg-warn-tint text-warn-dark border-warn/20",
    draft: "bg-surface text-ink-soft border-border",
    paused: "bg-surface text-ink-soft border-border",
    approved: "bg-verify-tint text-verify-dark border-verify/20",
    rejected: "bg-danger-tint text-danger border-danger/20",
    completed: "bg-verify-tint text-verify-dark border-verify/20",
    in_progress: "bg-warn-tint text-warn-dark border-warn/20",
  };

  const verificationJobs = verificationJobsResult.data ?? [];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back */}
      <div>
        <Link
          href="/admin/shops"
          className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink transition w-fit"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Shops
        </Link>
      </div>

      {/* Shop Profile Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          <div className="h-16 w-16 rounded-[var(--pb-radius-md)] bg-brand-tint flex items-center justify-center text-brand shrink-0">
            <Store className="h-8 w-8" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold text-ink">{shop.shopName}</h1>
              <Badge
                tone={
                  shop.verificationStatus === "approved"
                    ? "verify"
                    : shop.verificationStatus === "rejected"
                    ? "danger"
                    : "warn"
                }
                icon={
                  shop.verificationStatus === "approved" ? (
                    <ShieldCheck className="h-3.5 w-3.5" />
                  ) : shop.verificationStatus === "rejected" ? (
                    <ShieldX className="h-3.5 w-3.5" />
                  ) : (
                    <Clock className="h-3.5 w-3.5" />
                  )
                }
              >
                {shop.verificationStatus === "approved"
                  ? "Verified Partner"
                  : shop.verificationStatus === "rejected"
                  ? "Rejected"
                  : "Pending Review"}
              </Badge>
              {!shop.isActive && (
                <Badge tone="danger">Inactive</Badge>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-sm text-ink-soft">
              {shop.shopEmail && (
                <span className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4" /> {shop.shopEmail}
                </span>
              )}
              {shop.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4" /> {shop.phone}
                </span>
              )}
              {shop.city && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {shop.city}
                  {shop.area ? `, ${shop.area}` : ""}
                </span>
              )}
              {shop.website && (
                <a
                  href={shop.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-brand hover:underline"
                >
                  <Globe className="h-4 w-4" /> {shop.website}
                </a>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                Registered {new Date(shop.createdAt).toLocaleDateString("en-PK", { dateStyle: "medium" })}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-0.5 rounded-full border border-border bg-surface text-ink-soft font-medium">
                {shop.shopType === "new_phones" ? "New Phones Store" : "General Store (New + Used)"}
              </span>
              {shop.rating !== null && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-tint text-brand font-medium">
                  <Star className="h-3.5 w-3.5" /> {shop.rating.toFixed(1)} rating
                  {shop.totalReviews > 0 && ` (${shop.totalReviews} reviews)`}
                </span>
              )}
            </div>

            {shop.services && (
              <p className="mt-2 text-xs text-ink-soft">
                <span className="font-medium text-ink">Services: </span>
                {shop.services}
              </p>
            )}
            {shop.description && (
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">{shop.description}</p>
            )}

            {shop.verificationStatus === "rejected" && shop.verificationNotes && (
              <div className="mt-3 rounded-[var(--pb-radius-sm)] bg-danger-tint border border-danger/20 px-3 py-2 text-xs text-danger-dark">
                <span className="font-semibold">Rejection reason:</span> {shop.verificationNotes}
              </div>
            )}
          </div>

          <div className="flex gap-2 sm:flex-col shrink-0">
            <Button href="/admin/shops" variant="outline" size="sm">
              ← All Shops
            </Button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-border">
          {[
            { label: "Total Listings", value: listings.length, icon: Package },
            { label: "Active", value: listings.filter((l) => l.status === "active").length, icon: CheckCircle2 },
            { label: "Revenue", value: formatPKR(revenue), icon: TrendingUp },
            { label: "Verification Jobs", value: verificationJobs.length, icon: ClipboardCheck },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-[var(--pb-radius-sm)] bg-bg flex items-center justify-center text-ink-soft shrink-0">
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="font-data text-lg font-semibold text-ink">{value}</p>
                <p className="text-xs text-ink-faint">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Owner Card */}
      {owner && (
        <Card className="p-5">
          <h2 className="font-semibold text-ink flex items-center gap-2 mb-4">
            <UserIcon className="h-4.5 w-4.5 text-ink-soft" /> Shop Owner
          </h2>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-semibold text-ink">{owner.fullName}</span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                    owner.role === "SHOP"
                      ? "bg-verify-tint border-verify/30 text-verify-dark"
                      : "bg-surface border-border text-ink-soft"
                  }`}
                >
                  {owner.role}
                </span>
                {owner.isBlocked && <Badge tone="danger">Blocked</Badge>}
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-ink-soft">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> {owner.email}
                </span>
                {owner.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> {owner.phone}
                  </span>
                )}
                {owner.city && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> {owner.city}
                  </span>
                )}
              </div>
              <div className="flex gap-2 flex-wrap text-xs">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${owner.emailVerified ? "bg-verify-tint text-verify-dark" : "bg-surface border border-border text-ink-faint"}`}>
                  {owner.emailVerified ? <ShieldCheck className="h-3 w-3" /> : <ShieldX className="h-3 w-3" />}
                  Email {owner.emailVerified ? "Verified" : "Unverified"}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-tint text-brand">
                  <Star className="h-3 w-3" /> Trust: {owner.trustScore.toFixed(1)}
                </span>
              </div>
            </div>
            <Button href={`/admin/users/${owner.id}`} variant="outline" size="sm">
              View Full Profile →
            </Button>
          </div>
        </Card>
      )}

      {/* Listings */}
      <Card className="p-0">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-ink flex items-center gap-2">
            <Package className="h-4.5 w-4.5 text-ink-soft" /> Listings ({listings.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-bg text-xs text-ink-faint uppercase tracking-wide">
              <tr>
                <th className="px-5 py-2.5 font-medium">Device</th>
                <th className="px-5 py-2.5 font-medium">Price</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
                <th className="px-5 py-2.5 font-medium">City</th>
                <th className="px-5 py-2.5 font-medium">Listed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {listings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-ink-faint">No listings yet.</td>
                </tr>
              )}
              {listings.map((l) => (
                <tr key={l.id} className="hover:bg-surface/50 transition">
                  <td className="px-5 py-3">
                    <p className="font-medium text-ink">{l.brand} {l.model}</p>
                    <p className="text-xs text-ink-faint">{l.condition}{l.verified ? " · ✓ Verified" : ""}</p>
                  </td>
                  <td className="px-5 py-3 font-data font-semibold text-ink">{formatPKR(l.price)}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${statusColor[l.status] ?? "bg-surface border-border text-ink-soft"}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-ink-soft">{l.city}</td>
                  <td className="px-5 py-3 text-xs text-ink-faint">
                    {new Date(l.createdAt).toLocaleDateString("en-PK", { dateStyle: "short" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Verification Jobs */}
      <Card className="p-0">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-ink flex items-center gap-2">
            <ClipboardCheck className="h-4.5 w-4.5 text-ink-soft" />
            Verification Jobs Handled ({verificationJobs.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-bg text-xs text-ink-faint uppercase tracking-wide">
              <tr>
                <th className="px-5 py-2.5 font-medium">Device</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
                <th className="px-5 py-2.5 font-medium">Score</th>
                <th className="px-5 py-2.5 font-medium">Requested</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {verificationJobs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-6 text-center text-ink-faint">No verification jobs handled yet.</td>
                </tr>
              )}
              {verificationJobs.map((v: any) => (
                <tr key={v.id} className="hover:bg-surface/50 transition">
                  <td className="px-5 py-3 text-ink">
                    {jobListingMap.get(v.listing_id) ?? "Device"}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${statusColor[v.status] ?? "bg-surface border-border text-ink-soft"}`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-data font-semibold text-ink">
                    {v.score != null ? `${v.score}/100` : "—"}
                  </td>
                  <td className="px-5 py-3 text-xs text-ink-faint">
                    {new Date(v.requested_at).toLocaleDateString("en-PK", { dateStyle: "short" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
