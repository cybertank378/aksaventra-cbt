"use client";

import clsx from "clsx";
import type React from "react";

export type TableProps = {
  children: React.ReactNode;
  className?: string;
  wrapperClassName?: string;
};

export const Table = ({
  children,
  className,
  wrapperClassName,
}: TableProps) => (
  <div
    className={clsx(
      "overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs",
      wrapperClassName,
    )}
  >
    <table
      className={clsx(
        "w-full border-collapse text-sm text-slate-700",
        className,
      )}
    >
      {children}
    </table>
  </div>
);

export const TableHead = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <thead
    className={clsx(
      "border-b border-slate-200 bg-slate-50 text-xs font-bold text-[#0d2b5c] uppercase tracking-wider",
      className,
    )}
  >
    {children}
  </thead>
);

export const TableBody = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <tbody className={clsx("divide-y divide-slate-100", className)}>
    {children}
  </tbody>
);

export const TableHeaderCell = ({
  children,
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement> & {
  children?: React.ReactNode;
}) => (
  <th
    className={clsx(
      "whitespace-nowrap px-4 py-3.5 text-left font-semibold",
      className,
    )}
    {...props}
  >
    {children}
  </th>
);

export const TableRow = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement> & {
  children: React.ReactNode;
}) => (
  <tr
    className={clsx(
      "border-b border-slate-100 last:border-b-0 transition-colors duration-150 hover:bg-[#0097a7]/5",
      className,
    )}
    {...props}
  >
    {children}
  </tr>
);

export const TableCell = ({
  children,
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement> & {
  children?: React.ReactNode;
}) => (
  <td
    className={clsx(
      "align-middle whitespace-nowrap px-4 py-3.5 text-sm text-slate-700",
      className,
    )}
    {...props}
  >
    {children}
  </td>
);

export default Table;
