"use client";

import * as React from "react";
import {
  Briefcase,
  Store,
  Building2,
  TrendingUp,
  Plus,
  ArrowRight,
  Eye,
  Edit3,
  MapPin,
  DollarSign,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { AdminDataGrid, type ColumnDef, type FilterConfig } from "@/components/dashboard/AdminDataGrid";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { formatPKR } from "@/lib/utils";
import type { AdminOpportunity } from "@/app/(dashboard)/admin/_data";

export function AdminOpportunitiesManager({
  initialOpportunities,
}: {
  initialOpportunities: AdminOpportunity[];
}) {
  const [opportunities, setOpportunities] = React.useState<AdminOpportunity[]>(initialOpportunities);
  const [editOpp, setEditOpp] = React.useState<AdminOpportunity | null>(null);
  const [newModalOpen, setNewModalOpen] = React.useState(false);
  const [toast, setToast] = React.useState<{ msg: string; type: "success" | "error" } | null>(null);

  // New Deal Form State
  const [newTitle, setNewTitle] = React.useState("");
  const [newType, setNewType] = React.useState<AdminOpportunity["type"]>("shop_onboarding");
  const [newContact, setNewContact] = React.useState("");
  const [newCompany, setNewCompany] = React.useState("");
  const [newCity, setNewCity] = React.useState("Lahore");
  const [newValue, setNewValue] = React.useState("1000000");
  const [newNotes, setNewNotes] = React.useState("");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleUpdateStage = (id: string, stage: AdminOpportunity["stage"]) => {
    setOpportunities((prev) =>
      prev.map((o) => (o.id === id ? { ...o, stage } : o))
    );
    showToast(`Opportunity updated to ${stage.toUpperCase()}`);
    if (editOpp?.id === id) {
      setEditOpp((prev) => (prev ? { ...prev, stage } : null));
    }
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: AdminOpportunity = {
      id: `OPP-${Date.now().toString().slice(-4)}`,
      title: newTitle,
      type: newType,
      contact_name: newContact,
      company_or_shop: newCompany,
      city: newCity,
      potential_value: Number(newValue) || 500000,
      stage: "inquiry",
      notes: newNotes,
      updated_at: new Date().toISOString().slice(0, 10),
    };

    setOpportunities((prev) => [newRecord, ...prev]);
    setNewModalOpen(false);
    showToast(`New opportunity created: ${newTitle}`);
    setNewTitle("");
    setNewContact("");
    setNewCompany("");
    setNewNotes("");
  };

  const stageTones: Record<AdminOpportunity["stage"], "neutral" | "brand" | "warn" | "verify" | "danger"> = {
    inquiry: "neutral",
    contacted: "brand",
    evaluation: "warn",
    negotiation: "warn",
    won: "verify",
    lost: "danger",
  };

  const columns: ColumnDef<AdminOpportunity>[] = [
    {
      id: "title",
      header: "Opportunity & Partner",
      sortable: true,
      accessor: (r) => r.title,
      cell: (r) => (
        <div>
          <p className="font-semibold text-ink text-xs">{r.title}</p>
          <p className="text-[11px] text-ink-faint">
            {r.company_or_shop} · Contact: {r.contact_name}
          </p>
        </div>
      ),
    },
    {
      id: "type",
      header: "Opportunity Category",
      sortable: true,
      accessor: (r) => r.type,
      cell: (r) => {
        const labels: Record<AdminOpportunity["type"], string> = {
          shop_onboarding: "Shop Onboarding",
          corporate_fleet: "Corporate Fleet Trade-in",
          bulk_trade_in: "Bulk Wholesale Lot",
          high_volume_seller: "VIP Merchant",
        };
        return <Badge tone="brand" className="text-xs">{labels[r.type]}</Badge>;
      },
    },
    {
      id: "city",
      header: "Market Location",
      sortable: true,
      accessor: (r) => r.city,
      cell: (r) => (
        <div className="flex items-center gap-1 text-xs text-ink-soft">
          <MapPin className="h-3 w-3 text-ink-faint" />
          <span>{r.city}</span>
        </div>
      ),
    },
    {
      id: "value",
      header: "Estimated GMV",
      sortable: true,
      accessor: (r) => r.potential_value,
      cell: (r) => (
        <span className="font-data font-bold text-ink text-xs">
          {formatPKR(r.potential_value)}
        </span>
      ),
    },
    {
      id: "stage",
      header: "Pipeline Stage",
      sortable: true,
      accessor: (r) => r.stage,
      cell: (r) => (
        <Badge tone={stageTones[r.stage]} className="capitalize text-xs">
          {r.stage}
        </Badge>
      ),
    },
  ];

  const filters: FilterConfig<AdminOpportunity>[] = [
    {
      id: "stage",
      label: "Stage",
      options: [
        { label: "Inquiry", value: "inquiry" },
        { label: "Contacted", value: "contacted" },
        { label: "Evaluation", value: "evaluation" },
        { label: "Negotiation", value: "negotiation" },
        { label: "Won", value: "won" },
        { label: "Lost", value: "lost" },
      ],
      predicate: (r, val) => r.stage === val,
    },
    {
      id: "type",
      label: "Category",
      options: [
        { label: "Shop Onboarding", value: "shop_onboarding" },
        { label: "Corporate Fleet", value: "corporate_fleet" },
        { label: "Bulk Lot", value: "bulk_trade_in" },
      ],
      predicate: (r, val) => r.type === val,
    },
  ];

  const totalPipelineValue = opportunities
    .filter((o) => o.stage !== "lost")
    .reduce((sum, o) => sum + o.potential_value, 0);

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 rounded-[var(--pb-radius-md)] px-4 py-2.5 text-sm font-medium shadow-lg border animate-in slide-in-from-top-2 duration-200 ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Header Metric Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
              Active Pipeline Potential
            </p>
            <p className="text-xl font-bold font-data text-ink mt-1">
              {formatPKR(totalPipelineValue)}
            </p>
          </div>
          <div className="h-9 w-9 rounded-[var(--pb-radius-sm)] bg-brand-tint text-brand flex items-center justify-center">
            <TrendingUp className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
              Deals in Negotiation
            </p>
            <p className="text-xl font-bold font-data text-ink mt-1">
              {opportunities.filter((o) => o.stage === "negotiation").length} Deals
            </p>
          </div>
          <div className="h-9 w-9 rounded-[var(--pb-radius-sm)] bg-amber-50 text-amber-700 flex items-center justify-center">
            <Briefcase className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
              Closed Won Deals
            </p>
            <p className="text-xl font-bold font-data text-emerald-700 mt-1">
              {opportunities.filter((o) => o.stage === "won").length} Completed
            </p>
          </div>
          <div className="h-9 w-9 rounded-[var(--pb-radius-sm)] bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </Card>
      </div>

      <AdminDataGrid
        title="Business Development & Opportunities Pipeline"
        description="Track commercial phone trade-in lots, certified shop networks, and corporate fleet liquidation deals."
        data={opportunities}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search deal, contact, shop, company..."
        searchFields={[(r) => r.title, (r) => r.contact_name, (r) => r.company_or_shop, (r) => r.city]}
        exportFilename="phonebay-opportunities.csv"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setNewModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Deal
          </Button>
        }
        rowActions={(row) => (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpp(row)}
              className="h-8 px-2.5 text-xs"
            >
              <Edit3 className="h-3.5 w-3.5 mr-1" />
              Manage
            </Button>
          </div>
        )}
      />

      {/* Edit Deal Modal */}
      {editOpp && (
        <Modal
          open={!!editOpp}
          onClose={() => setEditOpp(null)}
          title={`Manage Opportunity: ${editOpp.title}`}
          size="md"
        >
          <div className="space-y-4">
            <div className="rounded-[var(--pb-radius-sm)] bg-bg p-3 border border-border text-xs space-y-1">
              <p><strong>Contact:</strong> {editOpp.contact_name} ({editOpp.company_or_shop})</p>
              <p><strong>Location:</strong> {editOpp.city}</p>
              <p><strong>Value:</strong> {formatPKR(editOpp.potential_value)}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-ink-soft mb-1.5">
                Update Pipeline Stage
              </label>
              <select
                value={editOpp.stage}
                onChange={(e) => handleUpdateStage(editOpp.id, e.target.value as AdminOpportunity["stage"])}
                className="w-full h-10 px-3 rounded-[var(--pb-radius-sm)] border border-border bg-surface text-xs font-semibold text-ink focus:outline-none focus:border-brand"
              >
                <option value="inquiry">1. Initial Inquiry</option>
                <option value="contacted">2. Merchant Contacted</option>
                <option value="evaluation">3. Inventory Evaluation</option>
                <option value="negotiation">4. Commercial Terms Negotiation</option>
                <option value="won">5. Closed Won (Onboarded)</option>
                <option value="lost">6. Closed Lost</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-ink-soft mb-1.5">
                Notes & Progress History
              </label>
              <textarea
                rows={3}
                value={editOpp.notes}
                onChange={(e) => {
                  const val = e.target.value;
                  setEditOpp((prev) => (prev ? { ...prev, notes: val } : null));
                  setOpportunities((prev) =>
                    prev.map((o) => (o.id === editOpp.id ? { ...o, notes: val } : o))
                  );
                }}
                className="w-full p-2.5 rounded-[var(--pb-radius-sm)] border border-border bg-surface text-xs text-ink focus:outline-none focus:border-brand"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditOpp(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add New Deal Modal */}
      {newModalOpen && (
        <Modal
          open={newModalOpen}
          onClose={() => setNewModalOpen(false)}
          title="Create New Business Opportunity"
          size="md"
        >
          <form onSubmit={handleCreateNew} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-ink-soft mb-1">
                Opportunity Title
              </label>
              <input
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Islamabad Corporate Device Refresh (50 Units)"
                className="w-full h-9 px-3 rounded-[var(--pb-radius-sm)] border border-border bg-surface text-xs text-ink focus:outline-none focus:border-brand"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-ink-soft mb-1">
                  Opportunity Type
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as AdminOpportunity["type"])}
                  className="w-full h-9 px-2.5 rounded-[var(--pb-radius-sm)] border border-border bg-surface text-xs text-ink focus:outline-none focus:border-brand"
                >
                  <option value="shop_onboarding">Shop Onboarding</option>
                  <option value="corporate_fleet">Corporate Fleet</option>
                  <option value="bulk_trade_in">Bulk Trade-in</option>
                  <option value="high_volume_seller">VIP Seller</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-ink-soft mb-1">
                  City
                </label>
                <input
                  required
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="w-full h-9 px-3 rounded-[var(--pb-radius-sm)] border border-border bg-surface text-xs text-ink focus:outline-none focus:border-brand"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-ink-soft mb-1">
                  Key Contact Name
                </label>
                <input
                  required
                  value={newContact}
                  onChange={(e) => setNewContact(e.target.value)}
                  className="w-full h-9 px-3 rounded-[var(--pb-radius-sm)] border border-border bg-surface text-xs text-ink focus:outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-ink-soft mb-1">
                  Estimated Value (PKR)
                </label>
                <input
                  type="number"
                  required
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="w-full h-9 px-3 rounded-[var(--pb-radius-sm)] border border-border bg-surface text-xs text-ink focus:outline-none focus:border-brand"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-ink-soft mb-1">
                Company or Shop Name
              </label>
              <input
                required
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                className="w-full h-9 px-3 rounded-[var(--pb-radius-sm)] border border-border bg-surface text-xs text-ink focus:outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-ink-soft mb-1">
                Internal Notes
              </label>
              <textarea
                rows={2}
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full p-2.5 rounded-[var(--pb-radius-sm)] border border-border bg-surface text-xs text-ink focus:outline-none focus:border-brand"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setNewModalOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Create Lead
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
