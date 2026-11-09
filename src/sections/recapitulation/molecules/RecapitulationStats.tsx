"use client";

import { Award, BarChart3, TrendingUp, Users } from "lucide-react";
import type { FC } from "react";
import type { ExamRecapitulationDTO } from "@/modules/recapitulation/domain/dto/RecapitulationDTO";

export interface RecapitulationStatsProps {
  data: ExamRecapitulationDTO;
}

export const RecapitulationStats: FC<RecapitulationStatsProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold text-slate-600">
            Total Peserta
          </span>
          <Users className="w-4 h-4 text-[#0d2b5c]" />
        </div>
        <span className="text-2xl sm:text-3xl font-black text-[#0d2b5c]">
          {data.totalParticipants}
        </span>
        <p className="text-[11px] text-slate-400 mt-1">
          {data.submittedCount} Mengumpulkan
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold text-slate-600">
            Rata-rata Nilai
          </span>
          <TrendingUp className="w-4 h-4 text-[#0097a7]" />
        </div>
        <span className="text-2xl sm:text-3xl font-black text-[#0097a7]">
          {data.averageScore}
        </span>
        <p className="text-[11px] text-teal-600 font-semibold mt-1">
          KKM: {data.passingGrade}
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold text-slate-600">
            Nilai Tertinggi / Terendah
          </span>
          <Award className="w-4 h-4 text-emerald-600" />
        </div>
        <span className="text-2xl sm:text-3xl font-black text-emerald-600">
          {data.highestScore}
        </span>
        <p className="text-[11px] text-slate-400 mt-1">
          Terendah: {data.lowestScore}
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold text-slate-600">
            Ketuntasan Klasikal
          </span>
          <BarChart3 className="w-4 h-4 text-amber-600" />
        </div>
        <span className="text-2xl sm:text-3xl font-black text-amber-600">
          {data.passPercentage}%
        </span>
        <p className="text-[11px] text-slate-400 mt-1">
          {data.passedCount} Tuntas / {data.failedCount} Remedial
        </p>
      </div>
    </div>
  );
};

export default RecapitulationStats;
