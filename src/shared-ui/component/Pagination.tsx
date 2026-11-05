//Files: src/shared-ui/component/Pagination.tsx
"use client";

import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/shared-ui/component/Button";

type Props = {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChangeAction: (page: number) => void;
};

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChangeAction,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const start = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  const isPrevDisabled = currentPage <= 1;
  const isNextDisabled = currentPage >= totalPages;

  /**
   * ============================================================
   * BUILD PAGINATION WINDOW
   * ============================================================
   */

  const getPages = () => {
    const delta = 2; // how many pages around current page
    const pages: (number | "...")[] = [];

    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    pages.push(1);

    if (start > 2) pages.push("...");

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) pages.push("...");

    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  const pages = getPages();

  return (
    <div className="w-full flex items-center justify-between py-2">
      {/* INFO */}
      <p className="text-sm text-gray-500">
        {totalItems === 0
          ? "Tidak ada data"
          : `Menampilkan ${start} hingga ${end} dari total ${totalItems} data`}
      </p>

      {/* CONTROLS */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* PREV */}
        <Button
          shape="circle"
          size="sm"
          variant="outline"
          color="primary"
          iconOnly
          disabled={isPrevDisabled}
          onClick={() => !isPrevDisabled && onPageChangeAction(currentPage - 1)}
          className={clsx(
            "w-9 h-9 border",
            isPrevDisabled &&
              "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed",
          )}
          leftIcon={ChevronLeft}
        />

        {/* PAGE NUMBERS */}
        {pages.map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index === 1 ? "left" : "right"}`}
              className="px-2 text-gray-400"
            >
              ...
            </span>
          ) : (
            <Button
              key={page}
              shape="circle"
              size="sm"
              variant={currentPage === page ? "filled" : "outline"}
              color="primary"
              onClick={() => onPageChangeAction(page)}
              className={clsx(
                "w-9 h-9 border text-sm font-medium",
                currentPage === page && "shadow-md",
              )}
            >
              {page}
            </Button>
          ),
        )}

        {/* NEXT */}
        <Button
          shape="circle"
          size="sm"
          variant="outline"
          color="primary"
          iconOnly
          disabled={isNextDisabled}
          onClick={() => !isNextDisabled && onPageChangeAction(currentPage + 1)}
          className={clsx(
            "w-9 h-9 border",
            isNextDisabled &&
              "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed",
          )}
          rightIcon={ChevronRight}
        />
      </div>
    </div>
  );
}
