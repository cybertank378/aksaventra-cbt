// File: src/shared-ui/component/ExpandableTable.tsx

"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import type React from "react";
import { Fragment, useCallback, useMemo, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared-ui/component/Table";

//////////////////////////////////////////////////////////////
// COLUMN
//////////////////////////////////////////////////////////////

export interface ExpandableTableColumn<T> {
  key: keyof T | string;

  title: string;

  className?: string;

  headerClassName?: string;

  render?: (row: T) => React.ReactNode;
}

//////////////////////////////////////////////////////////////
// PROPS
//////////////////////////////////////////////////////////////

interface Props<T> {
  ////////////////////////////////////////////////////////////
  // DATA
  ////////////////////////////////////////////////////////////

  data: T[];

  rowKey: (row: T) => string;

  columns: ExpandableTableColumn<T>[];

  ////////////////////////////////////////////////////////////
  // EXPANDED SLOT
  ////////////////////////////////////////////////////////////

  renderExpandedHeader?: (row: T) => React.ReactNode;

  renderExpandedContent: (row: T) => React.ReactNode;

  renderExpandedFooter?: (row: T) => React.ReactNode;

  ////////////////////////////////////////////////////////////
  // STATE
  ////////////////////////////////////////////////////////////

  loading?: boolean;

  loadingRows?: number;

  expandable?: boolean;

  defaultExpandedRow?: string | null;

  ////////////////////////////////////////////////////////////
  // DISPLAY
  ////////////////////////////////////////////////////////////

  emptyMessage?: string;
}

//////////////////////////////////////////////////////////////
// COMPONENT
//////////////////////////////////////////////////////////////

export default function ExpandableTable<T>({
  ////////////////////////////////////////////////////////////
  // DATA
  ////////////////////////////////////////////////////////////

  data,

  rowKey,

  columns,

  ////////////////////////////////////////////////////////////
  // SLOT
  ////////////////////////////////////////////////////////////

  renderExpandedHeader,

  renderExpandedContent,

  renderExpandedFooter,

  ////////////////////////////////////////////////////////////
  // STATE
  ////////////////////////////////////////////////////////////

  loading = false,

  loadingRows = 8,

  expandable = true,

  defaultExpandedRow = null,

  ////////////////////////////////////////////////////////////
  // DISPLAY
  ////////////////////////////////////////////////////////////

  emptyMessage = "Data tidak tersedia",
}: Props<T>) {
  ////////////////////////////////////////////////////////////
  // STATE
  ////////////////////////////////////////////////////////////

  const [expandedRow, setExpandedRow] = useState<string | null>(
    defaultExpandedRow,
  );

  ////////////////////////////////////////////////////////////
  // MEMO
  ////////////////////////////////////////////////////////////

  const totalColumns = useMemo(
    () => columns.length + (expandable ? 1 : 0),
    [columns.length, expandable],
  );

  const loadingKeys = useMemo(
    () =>
      Array.from(
        {
          length: loadingRows,
        },
        (_, index) => `loading-row-${index + 1}`,
      ),
    [loadingRows],
  );

  ////////////////////////////////////////////////////////////
  // TOGGLE
  ////////////////////////////////////////////////////////////

  const handleToggle = useCallback(
    (id: string) => {
      if (!expandable) {
        return;
      }

      setExpandedRow((previous) => (previous === id ? null : id));
    },
    [expandable],
  );

  ////////////////////////////////////////////////////////////
  // RENDER
  ////////////////////////////////////////////////////////////

  return (
    <Table wrapperClassName="rounded-xl">
      <TableHead>
        <TableRow className="hover:bg-transparent even:bg-transparent">
          {expandable && (
            <TableHeaderCell className="w-14 text-center">
              &nbsp;
            </TableHeaderCell>
          )}

          {columns.map((column) => (
            <TableHeaderCell
              key={String(column.key)}
              className={column.headerClassName}
            >
              {column.title}
            </TableHeaderCell>
          ))}
        </TableRow>
      </TableHead>

      <TableBody>
        {loading ? (
          loadingKeys.map((loadingKey) => (
            <TableRow key={loadingKey}>
              {expandable && (
                <TableCell className="w-14">
                  <div className="mx-auto h-5 w-5 animate-pulse rounded bg-slate-200" />
                </TableCell>
              )}

              {columns.map((column) => (
                <TableCell
                  key={`${loadingKey}-${String(column.key)}`}
                  className={column.className}
                >
                  <div className="h-5 w-full animate-pulse rounded-md bg-slate-200" />
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : data.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={totalColumns}
              className="py-8 text-center text-slate-500"
            >
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          data.map((row) => {
            const id = rowKey(row);

            const isExpanded = expandedRow === id;

            return (
              <Fragment key={id}>
                <TableRow
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  className="cursor-pointer transition-colors hover:bg-slate-50"
                  onClick={() => handleToggle(id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();

                      handleToggle(id);
                    }
                  }}
                >
                  {expandable && (
                    <TableCell className="w-14">
                      <div className="flex items-center justify-center">
                        {isExpanded ? (
                          <ChevronDown size={18} className="text-slate-500" />
                        ) : (
                          <ChevronRight size={18} className="text-slate-500" />
                        )}
                      </div>
                    </TableCell>
                  )}

                  {columns.map((column) => (
                    <TableCell
                      key={String(column.key)}
                      className={column.className}
                    >
                      {column.render
                        ? column.render(row)
                        : String(row[column.key as keyof T] ?? "-")}
                    </TableCell>
                  ))}
                </TableRow>

                {isExpanded && (
                  <TableRow className="bg-slate-50 hover:bg-slate-50 even:bg-slate-50">
                    <TableCell colSpan={totalColumns} className="p-0">
                      <div className="border-t border-slate-200 bg-slate-50">
                        <div className="space-y-6 p-6">
                          {renderExpandedHeader && (
                            <section className="rounded-xl">
                              {renderExpandedHeader(row)}
                            </section>
                          )}

                          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                            {renderExpandedContent(row)}
                          </section>

                          {renderExpandedFooter && (
                            <section className="rounded-xl">
                              {renderExpandedFooter(row)}
                            </section>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
