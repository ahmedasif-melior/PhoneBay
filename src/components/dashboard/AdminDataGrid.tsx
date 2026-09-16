"use client";

import * as React from "react";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type ColumnDef<T> = {
  id: string;
  header: string;
  accessor?: (row: T) => any;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
};

export type FilterOption = {
  label: string;
  value: string;
  count?: number;
};

export type FilterConfig<T> = {
  id: string;
  label: string;
  options: FilterOption[];
  predicate: (row: T, selectedValue: string) => boolean;
};

export interface AdminDataGridProps<T extends { id: string }> {
  title: string;
  description?: string;
  data: T[];
  columns: ColumnDef<T>[];
  searchPlaceholder?: string;
  searchFields?: ((row: T) => string | undefined | null)[];
  filters?: FilterConfig<T>[];
  initialSort?: { columnId: string; direction: "asc" | "desc" };
  actions?: React.ReactNode;
  rowActions?: (row: T) => React.ReactNode;
  enableSelection?: boolean;
  batchActions?: (selectedIds: string[], clearSelection: () => void) => React.ReactNode;
  exportFilename?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function AdminDataGrid<T extends { id: string }>({
  title,
  description,
  data,
  columns,
  searchPlaceholder = "Search records...",
  searchFields,
  filters = [],
  initialSort,
  actions,
  rowActions,
  enableSelection = false,
  batchActions,
  exportFilename = "export.csv",
  onRefresh,
  isLoading = false,
}: AdminDataGridProps<T>) {
  const [search, setSearch] = React.useState("");
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string>>({});
  const [sort, setSort] = React.useState<{ columnId: string; direction: "asc" | "desc" } | null>(
    initialSort ?? null
  );
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  // Reset page on search or filter change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, activeFilters]);

  // Filtering & Search
  const filteredData = React.useMemo(() => {
    return data.filter((row) => {
      // 1. Search filter
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const matchesSearch = searchFields
          ? searchFields.some((getField) => {
              const val = getField(row);
              return val ? String(val).toLowerCase().includes(query) : false;
            })
          : Object.values(row).some((val) =>
              val ? String(val).toLowerCase().includes(query) : false
            );
        if (!matchesSearch) return false;
      }

      // 2. Custom Filter configs
      for (const filter of filters) {
        const activeVal = activeFilters[filter.id];
        if (activeVal && activeVal !== "all") {
          if (!filter.predicate(row, activeVal)) {
            return false;
          }
        }
      }

      return true;
    });
  }, [data, search, activeFilters, searchFields, filters]);

  // Sorting
  const sortedData = React.useMemo(() => {
    if (!sort) return filteredData;
    const col = columns.find((c) => c.id === sort.columnId);
    if (!col) return filteredData;

    return [...filteredData].sort((a, b) => {
      const valA = col.accessor ? col.accessor(a) : (a as any)[col.id];
      const valB = col.accessor ? col.accessor(b) : (b as any)[col.id];

      if (valA === valB) return 0;
      if (valA == null) return 1;
      if (valB == null) return -1;

      if (typeof valA === "number" && typeof valB === "number") {
        return sort.direction === "asc" ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return sort.direction === "asc" ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [filteredData, sort, columns]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAllPage = () => {
    const pageIds = paginatedData.map((r) => r.id);
    const allSelected = pageIds.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleSort = (columnId: string, sortable?: boolean) => {
    if (!sortable) return;
    setSort((prev) => {
      if (prev?.columnId === columnId) {
        if (prev.direction === "asc") return { columnId, direction: "desc" };
        return null;
      }
      return { columnId, direction: "asc" };
    });
  };

  const exportToCsv = () => {
    if (!sortedData.length) return;
    const exportCols = columns.filter((c) => c.accessor || c.id);
    const headers = exportCols.map((c) => `"${c.header.replace(/"/g, '""')}"`).join(",");
    const rows = sortedData.map((row) =>
      exportCols
        .map((c) => {
          const val = c.accessor ? c.accessor(row) : (row as any)[c.id];
          return `"${String(val ?? "").replace(/"/g, '""')}"`;
        })
        .join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", exportFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearSelection = () => setSelectedIds(new Set());

  const hasActiveFilters =
    search.trim().length > 0 ||
    Object.values(activeFilters).some((v) => v && v !== "all");

  const resetAllFilters = () => {
    setSearch("");
    setActiveFilters({});
    setSort(initialSort ?? null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
          {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              loading={isLoading}
              title="Refresh data"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCsv}
            disabled={sortedData.length === 0}
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
          {actions}
        </div>
      </div>

      {/* Control bar: Search + Filters */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full h-10 pl-9 pr-9 rounded-[var(--pb-radius-sm)] border border-border bg-surface text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter Pills / Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((filter) => (
              <div key={filter.id} className="relative">
                <select
                  value={activeFilters[filter.id] || "all"}
                  onChange={(e) =>
                    setActiveFilters((prev) => ({ ...prev, [filter.id]: e.target.value }))
                  }
                  className="h-9 px-3 pr-8 rounded-[var(--pb-radius-sm)] border border-border bg-surface text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand cursor-pointer appearance-none"
                >
                  <option value="all">{filter.label}: All</option>
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} {opt.count != null ? `(${opt.count})` : ""}
                    </option>
                  ))}
                </select>
                <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-faint pointer-events-none" />
              </div>
            ))}

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetAllFilters}
                className="text-xs text-brand hover:text-brand-dark"
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Batch action notification bar */}
        {enableSelection && selectedIds.size > 0 && (
          <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-[var(--pb-radius-sm)] bg-brand-tint/50 border border-brand/20 text-xs font-medium text-brand-dark animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-brand" />
              <span>
                <strong>{selectedIds.size}</strong> item{selectedIds.size === 1 ? "" : "s"} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              {batchActions?.(Array.from(selectedIds), clearSelection)}
              <button
                type="button"
                onClick={clearSelection}
                className="text-ink-soft hover:text-ink underline ml-2"
              >
                Deselect all
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Table Card */}
      <Card className="overflow-hidden p-0 border border-border shadow-xs">
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg/70 border-b border-border text-ink-faint font-medium">
              <tr>
                {enableSelection && (
                  <th className="w-12 px-4 py-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={
                        paginatedData.length > 0 &&
                        paginatedData.every((r) => selectedIds.has(r.id))
                      }
                      onChange={toggleSelectAllPage}
                      className="rounded border-border text-brand focus:ring-brand h-4 w-4 cursor-pointer"
                    />
                  </th>
                )}
                {columns.map((col) => {
                  const isSorted = sort?.columnId === col.id;
                  return (
                    <th
                      key={col.id}
                      onClick={() => handleSort(col.id, col.sortable)}
                      className={cn(
                        "px-4 py-3.5 select-none",
                        col.sortable && "cursor-pointer hover:text-ink transition-colors",
                        col.className
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{col.header}</span>
                        {col.sortable && (
                          <span className="text-ink-faint">
                            {isSorted ? (
                              sort?.direction === "asc" ? (
                                <ArrowUp className="h-3.5 w-3.5 text-brand" />
                              ) : (
                                <ArrowDown className="h-3.5 w-3.5 text-brand" />
                              )
                            ) : (
                              <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
                {rowActions && <th className="px-4 py-3.5 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (enableSelection ? 1 : 0) + (rowActions ? 1 : 0)}
                    className="py-12 text-center"
                  >
                    <div className="mx-auto max-w-sm text-center">
                      <div className="h-12 w-12 rounded-full bg-brand-tint/60 text-brand mx-auto flex items-center justify-center mb-3">
                        <SlidersHorizontal className="h-6 w-6" />
                      </div>
                      <p className="font-semibold text-ink">No records found</p>
                      <p className="mt-1 text-xs text-ink-soft">
                        {hasActiveFilters
                          ? "Try adjusting your search terms or clearing selected filters."
                          : "There are currently no items in this section."}
                      </p>
                      {hasActiveFilters && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetAllFilters}
                          className="mt-4"
                        >
                          Clear all filters
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => {
                  const isSelected = selectedIds.has(row.id);
                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        "transition-colors hover:bg-black/[0.015]",
                        isSelected && "bg-brand-tint/20"
                      )}
                    >
                      {enableSelection && (
                        <td className="w-12 px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectRow(row.id)}
                            className="rounded border-border text-brand focus:ring-brand h-4 w-4 cursor-pointer"
                          />
                        </td>
                      )}
                      {columns.map((col) => (
                        <td key={col.id} className={cn("px-4 py-3 text-ink", col.className)}>
                          {col.cell ? col.cell(row) : col.accessor ? col.accessor(row) : (row as any)[col.id]}
                        </td>
                      ))}
                      {rowActions && (
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {rowActions(row)}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 py-3 border-t border-border bg-surface text-xs text-ink-soft">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-7 px-2 rounded-[var(--pb-radius-sm)] border border-border bg-bg text-ink text-xs focus:outline-none focus:border-brand cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="ml-2">
              Showing{" "}
              <strong>
                {sortedData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
              </strong>{" "}
              to{" "}
              <strong>
                {Math.min(currentPage * pageSize, sortedData.length)}
              </strong>{" "}
              of <strong>{sortedData.length}</strong> items
            </span>
          </div>

          <div className="flex items-center gap-1 self-end sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 px-2.5"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            <span className="px-3 text-ink font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="h-8 px-2.5"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
