import type {
  AnnouncementItemDTO,
  CreateAnnouncementInputDTO,
} from "../../domain/dto/AnnouncementDTO";

const defaultAnnouncements: AnnouncementItemDTO[] = [
  {
    id: "ann-1",
    title: "Tata Tertib Pelaksanaan CBT & Larangan Perpindahan Tab",
    content:
      "Seluruh peserta ujian wajib menggunakan mode layar penuh (Full Screen). Sistem pengawas pintar akan secara otomatis memblokir sesi ujian jika terdeteksi berpindah tab atau aplikasi lain sebanyak 3 kali.",
    priority: "URGENT",
    targetRole: "STUDENTS",
    authorName: "Panitia CBT Pusat",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ann-2",
    title: "Prosedur Intervensi False Alarm oleh Pengawas Ruang",
    content:
      "Bagi pengawas ruang (proctor), fitur 'Buka Kunci (Unlock Strike)' pada ruang kendali pengawas dapat langsung digunakan untuk mengembalikan status peserta ke IN_PROGRESS jika terjadi kendala teknis atau mati lampu.",
    priority: "HIGH",
    targetRole: "PROCTORS",
    authorName: "Koordinator Pengawas",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ann-3",
    title: "Jadwal Sinkronisasi Nilai & Gradebook Moodle",
    content:
      "Rekapitulasi nilai dan analisis ketercapaian KKM siswa otomatis ter-cache di Universal Cache Moodle (MUC) dan dapat diekspor langsung ke CSV.",
    priority: "NORMAL",
    targetRole: "TEACHERS",
    authorName: "Admin IT",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export class ManageAnnouncementsUseCase {
  private announcements: AnnouncementItemDTO[] = [...defaultAnnouncements];

  async getAnnouncements(): Promise<AnnouncementItemDTO[]> {
    return [...this.announcements];
  }

  async createAnnouncement(
    input: CreateAnnouncementInputDTO,
    authorName = "Panitia CBT",
  ): Promise<AnnouncementItemDTO> {
    const newAnn: AnnouncementItemDTO = {
      id: `ann-${Date.now()}`,
      title: input.title,
      content: input.content,
      priority: input.priority,
      targetRole: input.targetRole,
      authorName,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.announcements.unshift(newAnn);
    return newAnn;
  }

  async deleteAnnouncement(id: string): Promise<boolean> {
    const before = this.announcements.length;
    this.announcements = this.announcements.filter((a) => a.id !== id);
    return this.announcements.length < before;
  }
}
