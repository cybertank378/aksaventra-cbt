"use client";

import { Eye, Megaphone, Plus, User } from "lucide-react";
import { type FC, useEffect, useState } from "react";
import type { AnnouncementItemDTO } from "@/modules/announcements/domain/dto/AnnouncementDTO";
import { useAnnouncementsApi } from "@/modules/announcements/presentation/useAnnouncementsApi";
import Button from "@/shared-ui/component/Button";
import PriorityBadge from "../atoms/PriorityBadge";
import CreateAnnouncementModal from "../molecules/CreateAnnouncementModal";
import ViewAnnouncementModal from "../molecules/ViewAnnouncementModal";

export const AnnouncementList: FC = () => {
  const {
    announcements,
    isLoading,
    error,
    fetchAnnouncements,
    createAnnouncement,
  } = useAnnouncementsApi();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<AnnouncementItemDTO | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  return (
    <div className="flex flex-col gap-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-[#0d2b5c]">
            Pengumuman & Tata Tertib CBT
          </h2>
          <p className="text-xs text-slate-500">
            Pusat siaran informasi, tata tertib, dan arahan ujian untuk peserta
            dan pengawas
          </p>
        </div>

        <Button
          type="button"
          variant="filled"
          color="primary"
          size="sm"
          leftIcon={Plus}
          onClick={() => setModalOpen(true)}
        >
          Buat Pengumuman
        </Button>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* Announcements Timeline List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-3xl bg-slate-100 animate-pulse border border-slate-200"
            />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center bg-white">
          <Megaphone className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-bold text-slate-700">
            Belum ada pengumuman yang disiarkan
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Klik tombol &quot;Buat Pengumuman&quot; untuk menyiarkan informasi
            baru
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedAnnouncement(item)}
              className="flex w-full cursor-pointer flex-col gap-2 rounded-3xl border border-slate-200/90 bg-white p-5 text-left shadow-xs transition-all hover:border-[#0097a7]/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0097a7]"
            >
              <div className="flex w-full items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={item.priority} />
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                    Target: {item.targetRole}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                  <User className="w-3.5 h-3.5" />
                  <span>{item.authorName}</span>
                </div>
              </div>

              <div className="flex w-full flex-wrap items-end justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-extrabold text-[#0d2b5c]">
                    {item.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 whitespace-pre-line text-xs leading-relaxed text-slate-600">
                    {item.content}
                  </p>
                </div>

                <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#0097a7]/30 bg-teal-50/70 px-3 py-1.5 text-xs font-semibold text-[#0097a7]">
                  <Eye className="h-3.5 w-3.5" />
                  Lihat Detail
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateAnnouncementModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={createAnnouncement}
        loading={isLoading}
      />

      <ViewAnnouncementModal
        announcement={selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
      />
    </div>
  );
};

export default AnnouncementList;
