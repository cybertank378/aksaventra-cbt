//Files: src/shared-ui/component/ReportToolbar.tsx

import Button from "@/shared-ui/component/Button";

type Props = {
  reportId: string;
};

export default function ReportToolbar({ reportId }: Props) {
  return (
    <div className="flex gap-2">
      <Button
        onClick={() =>
          window.open(`/api/v1/reports/${reportId}/pdf-download`, "_blank")
        }
      >
        Download PDF
      </Button>

      <Button
        onClick={() =>
          window.open(`/api/v1/reports/${reportId}/excel`, "_blank")
        }
      >
        Download Excel
      </Button>
    </div>
  );
}
