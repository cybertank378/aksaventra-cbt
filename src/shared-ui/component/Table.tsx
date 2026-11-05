// Files: src/shared-ui/component/Table.tsx

"use client";

import clsx from "clsx";
import type React from "react";

//////////////////////////////////////////////////////////////
// TABLE CONTAINER
//////////////////////////////////////////////////////////////

type TableProps = {
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
      "overflow-x-auto rounded-lg border border-gray-200 bg-white",
      wrapperClassName,
    )}
  >
    <table
      className={clsx(
        "w-full border-collapse text-sm text-gray-700",
        className,
      )}
    >
      {children}
    </table>
  </div>
);

//////////////////////////////////////////////////////////////
// TABLE HEAD
//////////////////////////////////////////////////////////////

export const TableHead = ({
  children,
  className,
}: {
  children: React.ReactNode;

  className?: string;
}) => (
  <thead
    className={clsx(
      "h-16 border-b border-gray-200 bg-gray-100 text-sm font-semibold text-gray-700",
      className,
    )}
  >
    {children}
  </thead>
);

//////////////////////////////////////////////////////////////
// TABLE BODY
//////////////////////////////////////////////////////////////

export const TableBody = ({
  children,
  className,
}: {
  children: React.ReactNode;

  className?: string;
}) => (
  <tbody className={clsx("divide-y divide-gray-200", className)}>
    {children}
  </tbody>
);

//////////////////////////////////////////////////////////////
// TABLE HEADER CELL
//////////////////////////////////////////////////////////////

export const TableHeaderCell = ({
  children,
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement> & {
  children?: React.ReactNode;
}) => (
  <th
    className={clsx(
      "whitespace-nowrap px-4 py-3 text-left font-medium tracking-wide",
      className,
    )}
    {...props}
  >
    {children}
  </th>
);

//////////////////////////////////////////////////////////////
// TABLE ROW
//////////////////////////////////////////////////////////////

export const TableRow = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement> & {
  children: React.ReactNode;
}) => (
  <tr
    className={clsx(
      "border-b border-gray-200 last:border-b-0",
      "even:bg-gray-50",
      "transition-colors duration-200 hover:bg-indigo-50/60",
      className,
    )}
    {...props}
  >
    {children}
  </tr>
);

//////////////////////////////////////////////////////////////
// TABLE CELL
//////////////////////////////////////////////////////////////

export const TableCell = ({
  children,
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement> & {
  children?: React.ReactNode;
}) => (
  <td
    className={clsx(
      "align-middle whitespace-nowrap px-4 py-3 text-sm text-gray-700",
      className,
    )}
    {...props}
  >
    {children}
  </td>
);
