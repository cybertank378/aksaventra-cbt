"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FC } from "react";
import type { UserRole } from "@/libs/enums";
import { useExamManagementApi } from "@/modules/exams/presentation/useExamManagementApi";
import Button from "@/shared-ui/component/Button";
import CreateExamForm, {
  type CreateExamFormPayload,
} from "../organisms/CreateExamForm";

export interface CreateExamSectionProps {
  userRole?: UserRole;
}

export const CreateExamSection: FC<CreateExamSectionProps> = ({
  userRole: _userRole,
}) => {
  const router = useRouter();
  const { createSchedule, isLoading, error } = useExamManagementApi();

  const handleSubmit = async (payload: CreateExamFormPayload) => {
    const newExamId = await createSchedule(payload);
    if (newExamId) {
      router.replace(`/dashboard/exams/${newExamId}/assign-groups`);
    }
  };

  const handleBack = () => {
    router.replace("/dashboard/exams");
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          color="secondary"
          size="sm"
          leftIcon={ArrowLeft}
          onClick={handleBack}
        >
          Kembali
        </Button>
      </div>

      <CreateExamForm
        isLoading={isLoading}
        error={error}
        onSubmit={handleSubmit}
        onCancel={handleBack}
      />
    </div>
  );
};

export default CreateExamSection;
