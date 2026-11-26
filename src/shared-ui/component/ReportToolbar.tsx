"use client";

import Button from "@/shared-ui/component/Button";

export interface ReportToolbarProps {
  reportId: string;
  onDownloadPdf?: (reportId: string) => void;
  onDownloadExcel?: (reportId: string) => void;
  loadingPdf?: boolean;
  loadingExcel?: boolean;
}

export default function ReportToolbar({
  reportId,
  onDownloadPdf,
  onDownloadExcel,
  loadingPdf = false,
  loadingExcel = false,
}: ReportToolbarProps) {
  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant="filled"
        color="primary"
        size="sm"
        loading={loadingPdf}
        disabled={!onDownloadPdf}
        onClick={() => onDownloadPdf?.(reportId)}
      >
        Download PDF
      </Button>

      <Button
        type="button"
        variant="outline"
        color="teal"
        size="sm"
        loading={loadingExcel}
        disabled={!onDownloadExcel}
        onClick={() => onDownloadExcel?.(reportId)}
      >
        Download Excel
      </Button>
    </div>
  );
}
