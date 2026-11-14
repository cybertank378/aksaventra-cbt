"use client";

import type { FC } from "react";
import Badge from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import ExamQuestionTypeBadge from "../atoms/ExamQuestionTypeBadge";

export interface ExamQuestionItemView {
  id: string;
  slot: number;
  type: string;
  stem: string;
  points: number;
  optionsSummary?: string;
}

interface ExamQuestionCardProps {
  question: ExamQuestionItemView;
  onEdit: (questionId: string) => void;
}

export const ExamQuestionCard: FC<ExamQuestionCardProps> = ({
  question,
  onEdit,
}) => {
  return (
    <Card
      className="hover:border-slate-300 transition-all"
      bodyClassName="flex items-start justify-between gap-4 p-5"
    >
      <div className="flex items-start gap-4">
        <Badge
          color="neutral"
          size="sm"
          className="w-8 h-8 rounded-xl font-black text-xs shrink-0 flex items-center justify-center"
        >
          #{question.slot}
        </Badge>
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <ExamQuestionTypeBadge type={question.type} />
            <Badge color="teal" size="sm">
              {question.points} Poin
            </Badge>
          </div>
          <p className="text-xs font-semibold text-slate-900 leading-relaxed">
            {question.stem}
          </p>
          {question.optionsSummary && (
            <p className="text-[11px] text-slate-500 mt-1.5">
              {question.optionsSummary}
            </p>
          )}
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        color="secondary"
        size="sm"
        onClick={() => onEdit(question.id)}
      >
        Edit
      </Button>
    </Card>
  );
};

export default ExamQuestionCard;
