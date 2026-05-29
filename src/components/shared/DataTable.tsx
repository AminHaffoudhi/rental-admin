import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState, type ReactElement } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, Inbox, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { cn } from "@/lib/utils";

export function DataTable<TData, TValue>(props: {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  /** Filter rows by this accessor key (alias: searchKey) */
  filterKey?: string;
  searchKey?: string;
  searchPlaceholder?: string;
  pageSize?: number;
  /** Hide the search input */
  hideSearch?: boolean;
  /** Row id to highlight (e.g. from notification deep link) */
  highlightedRowId?: string | null;
  getRowId?: (row: TData) => string;
}): ReactElement {
  const {
    columns,
    data,
    isLoading,
    filterKey,
    searchKey,
    searchPlaceholder = "Search…",
    pageSize = 10,
    hideSearch = false,
    highlightedRowId = null,
    getRowId,
  } = props;
  const key = searchKey ?? filterKey;
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const filtered = useMemo(() => {
    const q = globalFilter.trim().toLowerCase();
    if (!q) return data;
    return data.filter((row) => {
      if (key && row !== null && typeof row === "object" && key in row) {
        const v = (row as Record<string, unknown>)[key];
        return String(v).toLowerCase().includes(q);
      }
      return JSON.stringify(row).toLowerCase().includes(q);
    });
  }, [data, globalFilter, key]);

  // TanStack Table: React Compiler skips memoization for this hook (safe).
  // eslint-disable-next-line react-hooks/incompatible-library -- useReactTable
  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  useEffect(() => {
    if (!highlightedRowId || !getRowId) {
      return;
    }
    const idx = filtered.findIndex((row) => getRowId(row) === highlightedRowId);
    if (idx >= 0) {
      table.setPageIndex(Math.floor(idx / pageSize));
    }
  }, [highlightedRowId, filtered, getRowId, pageSize, table]);

  return (
    <div className="space-y-3">
      {!hideSearch ? (
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className="input pl-8 text-xs"
          />
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-stone-100">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="border-stone-100 bg-stone-50 hover:bg-stone-50">
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-stone-500",
                      header.column.getCanSort() && "cursor-pointer select-none hover:text-stone-700"
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() ? (
                        header.column.getIsSorted() === "asc" ? (
                          <ChevronUp size={12} className="text-brand-500" />
                        ) : header.column.getIsSorted() === "desc" ? (
                          <ChevronDown size={12} className="text-brand-500" />
                        ) : (
                          <ChevronsUpDown size={12} className="text-stone-300" />
                        )
                      ) : null}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <LoadingSkeleton rows={6} cols={columns.length} />
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-40">
                  <EmptyState icon={Inbox} title="No rows" description="Try adjusting filters or search." />
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => {
                const rowKey = getRowId ? getRowId(row.original) : String(row.id);
                const isHighlighted = highlightedRowId != null && rowKey === highlightedRowId;
                return (
                <TableRow
                  key={row.id}
                  id={getRowId ? `highlight-${rowKey}` : undefined}
                  className={cn(
                    "bg-white hover:bg-stone-50/80 transition-colors duration-300",
                    isHighlighted && "bg-brand-50 ring-2 ring-inset ring-brand-500"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3 text-xs text-stone-700">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading && table.getPageCount() > 1 ? (
        <div className="flex items-center justify-between">
          <p className="text-xs text-stone-400">
            {table.getFilteredRowModel().rows.length} results · Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="btn btn-ghost btn-sm p-1.5 disabled:opacity-30"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(table.getPageCount(), 5) }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => table.setPageIndex(i)}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg text-xs font-semibold transition-all",
                  table.getState().pagination.pageIndex === i
                    ? "bg-brand-500 text-white"
                    : "text-stone-500 hover:bg-stone-100"
                )}
              >
                {i + 1}
              </button>
            ))}
            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="btn btn-ghost btn-sm p-1.5 disabled:opacity-30"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
