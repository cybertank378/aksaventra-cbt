"use client";

import {
  Building2,
  CalendarDays,
  FileCheck2,
  Image as ImageIcon,
  Plus,
  RotateCcw,
  Stamp,
  Trash2,
  Upload,
} from "lucide-react";
import React, { type ChangeEvent, type FC, useState } from "react";
import type {
  ExamCardSettings,
  ExamScheduleItem,
} from "@/modules/exam-cards/domain/dto/ExamCardDTO";
import { DEFAULT_EXAM_CARD_SETTINGS } from "@/modules/exam-cards/domain/dto/ExamCardDTO";
import Button from "@/shared-ui/component/Button";
import { Modal } from "@/shared-ui/component/Modal";
import SelectField from "@/shared-ui/component/SelectField";
import TextField from "@/shared-ui/component/TextField";
import { showErrorToast, showSuccessToast } from "@/shared-ui/component/Toast";

interface Props {
  open: boolean;
  onClose: () => void;
  settings: ExamCardSettings;
  onSave: (updated: ExamCardSettings) => void;
}

export const ExamCardSettingsModal: FC<Props> = ({
  open,
  onClose,
  settings,
  onSave,
}) => {
  const [formData, setFormData] = useState<ExamCardSettings>({ ...settings });
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingStamp, setIsUploadingStamp] = useState(false);

  // Sync state whenever modal is opened
  React.useEffect(() => {
    if (open) {
      setFormData({
        ...settings,
        schedule:
          settings.schedule && settings.schedule.length > 0
            ? settings.schedule
            : [
                { dayDate: "", subjects: [{ name: "", time: "" }, { name: "", time: "" }] },
                { dayDate: "", subjects: [{ name: "", time: "" }, { name: "", time: "" }] },
                { dayDate: "", subjects: [{ name: "", time: "" }, { name: "", time: "" }] },
                { dayDate: "", subjects: [{ name: "", time: "" }, { name: "", time: "" }] },
                { dayDate: "", subjects: [{ name: "", time: "" }, { name: "", time: "" }] },
              ],
      });
    }
  }, [open, settings]);

  const handleChange = (field: keyof ExamCardSettings, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showErrorToast("Berkas harus berupa gambar (PNG, JPG, SVG, WebP).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showErrorToast("Ukuran berkas logo maksimal 2 MB.");
      return;
    }

    setIsUploadingLogo(true);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        handleChange("logoUrl", reader.result);
        showSuccessToast("Logo instansi berhasil dimuat.");
      }
      setIsUploadingLogo(false);
    };
    reader.onerror = () => {
      showErrorToast("Gagal membaca berkas logo.");
      setIsUploadingLogo(false);
    };
    reader.readAsDataURL(file);
  };

  const handleStampUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showErrorToast("Berkas harus berupa gambar (PNG, JPG, SVG, WebP).");
      return;
    }

    setIsUploadingStamp(true);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        handleChange("stampUrl", reader.result);
        handleChange("showStamp", true);
        showSuccessToast("Stempel instansi berhasil dimuat.");
      }
      setIsUploadingStamp(false);
    };
    reader.onerror = () => {
      showErrorToast("Gagal membaca berkas stempel.");
      setIsUploadingStamp(false);
    };
    reader.readAsDataURL(file);
  };

  const handleScheduleChange = (
    index: number,
    field: "dayDate" | "sub1Name" | "sub1Time" | "sub2Name" | "sub2Time",
    value: string,
  ) => {
    setFormData((prev) => {
      const currentList: ExamScheduleItem[] = [...(prev.schedule || [])];
      while (currentList.length <= index) {
        currentList.push({
          dayDate: "",
          subjects: [
            { name: "", time: "" },
            { name: "", time: "" },
          ],
        });
      }

      const row = { ...currentList[index] };
      const subjects = [...(row.subjects || [{ name: "", time: "" }, { name: "", time: "" }])];

      if (field === "dayDate") {
        row.dayDate = value;
      } else if (field === "sub1Name") {
        subjects[0] = { ...subjects[0], name: value };
      } else if (field === "sub1Time") {
        subjects[0] = { ...subjects[0], time: value };
      } else if (field === "sub2Name") {
        subjects[1] = { ...subjects[1], name: value };
      } else if (field === "sub2Time") {
        subjects[1] = { ...subjects[1], time: value };
      }

      row.subjects = subjects;
      currentList[index] = row;
      return { ...prev, schedule: currentList };
    });
  };

  const handleAddScheduleRow = () => {
    setFormData((prev) => ({
      ...prev,
      schedule: [
        ...(prev.schedule || []),
        {
          dayDate: "",
          subjects: [
            { name: "", time: "" },
            { name: "", time: "" },
          ],
        },
      ],
    }));
  };

  const handleRemoveScheduleRow = (index: number) => {
    setFormData((prev) => {
      const updated = [...(prev.schedule || [])];
      updated.splice(index, 1);
      return { ...prev, schedule: updated };
    });
  };

  const handleClearSchedule = () => {
    const blankSchedule: ExamScheduleItem[] = [
      { dayDate: "", subjects: [{ name: "", time: "" }, { name: "", time: "" }] },
      { dayDate: "", subjects: [{ name: "", time: "" }, { name: "", time: "" }] },
      { dayDate: "", subjects: [{ name: "", time: "" }, { name: "", time: "" }] },
      { dayDate: "", subjects: [{ name: "", time: "" }, { name: "", time: "" }] },
      { dayDate: "", subjects: [{ name: "", time: "" }, { name: "", time: "" }] },
    ];
    handleChange("schedule", blankSchedule);
    showSuccessToast("Data jadwal mapel dan waktu berhasil dikosongkan.");
  };

  const handleResetToDefault = () => {
    setFormData({ ...DEFAULT_EXAM_CARD_SETTINGS });
    showSuccessToast("Pengaturan dikembalikan ke konfigurasi standar.");
  };

  const handleSubmit = () => {
    if (!formData.institutionName.trim()) {
      showErrorToast("Nama sekolah / instansi wajib diisi.");
      return;
    }
    onSave(formData);
    showSuccessToast("Pengaturan kartu ujian berhasil disimpan.");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Pengaturan Format Kartu Ujian"
      subtitle="Kustomisasi kop surat, logo, jadwal ujian, dan penandatangan kartu ujian"
      size="lg"
      onSubmit={handleSubmit}
      submitText="Simpan Pengaturan"
      cancelText="Batal"
    >
      <div className="space-y-5 py-2 max-h-[72vh] overflow-y-auto pr-1">
        {/* Section 1: Upload Logo & Stempel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Logo Instansi */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
              <Building2 className="w-4 h-4 text-[#0097a7]" />
              Logo Instansi / Sekolah
            </label>
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white overflow-hidden p-1 shadow-xs">
                {formData.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={formData.logoUrl}
                    alt="Logo Preview"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 text-center">
                    <ImageIcon className="h-5 w-5 mb-0.5 text-slate-300" />
                    <span className="text-[8px] font-medium leading-none">
                      Belum Ada
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1.5">
                <label className="cursor-pointer inline-block">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#0d2b5c] text-white hover:bg-[#163b78] transition shadow-xs">
                    <Upload className="w-3 h-3" />
                    {isUploadingLogo ? "Mengunggah..." : "Unggah Logo"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={isUploadingLogo}
                    className="hidden"
                  />
                </label>
                {formData.logoUrl && (
                  <div>
                    <button
                      type="button"
                      onClick={() => handleChange("logoUrl", undefined)}
                      className="text-[11px] font-medium text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus Logo
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stempel / Cap Instansi */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
              <Stamp className="w-4 h-4 text-indigo-600" />
              Stempel / Cap Resmi (Opsional)
            </label>
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white overflow-hidden p-1 shadow-xs">
                {formData.stampUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={formData.stampUrl}
                    alt="Stamp Preview"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-indigo-400 text-center">
                    <Stamp className="h-5 w-5 mb-0.5 opacity-60" />
                    <span className="text-[8px] font-medium leading-none">
                      Cap Manual
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1.5">
                <label className="cursor-pointer inline-block">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-700 text-white hover:bg-indigo-800 transition shadow-xs">
                    <Upload className="w-3 h-3" />
                    {isUploadingStamp ? "Mengunggah..." : "Unggah Cap"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleStampUpload}
                    disabled={isUploadingStamp}
                    className="hidden"
                  />
                </label>
                {formData.stampUrl && (
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        handleChange("stampUrl", undefined);
                        handleChange("showStamp", false);
                      }}
                      className="text-[11px] font-medium text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus Cap
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: KOP SURAT INSTANSI */}
        <div className="space-y-3 border-t border-slate-200 pt-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            1. Kop Surat & Identitas Instansi
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextField
              label="Pemerintah Daerah / Yayasan (Baris 1)"
              value={formData.governmentText}
              onChange={(e) => handleChange("governmentText", e.target.value)}
              placeholder="Contoh: PEMERINTAH DAERAH PROVINSI"
              size="sm"
            />
            <TextField
              label="Dinas Pendidikan / Instansi (Baris 2)"
              value={formData.departmentText}
              onChange={(e) => handleChange("departmentText", e.target.value)}
              placeholder="Contoh: DINAS PENDIDIKAN"
              size="sm"
            />
          </div>

          <TextField
            label="Nama Sekolah / Lembaga (Baris 3 - Huruf Besar)"
            value={formData.institutionName}
            onChange={(e) => handleChange("institutionName", e.target.value)}
            placeholder="Contoh: SMA NEGERI 1 AKSAVENTRA"
            size="sm"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <TextField
                label="Alamat Sekolah (Baris 4)"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Contoh: Jl. Pendidikan Nasional No. 45"
                size="sm"
              />
            </div>
            <div>
              <TextField
                label="Kode Pos"
                value={formData.postalCode}
                onChange={(e) => handleChange("postalCode", e.target.value)}
                placeholder="Contoh: 12345"
                size="sm"
              />
            </div>
          </div>

          <TextField
            label="Kontak Telepon, Fax & Email (Baris 5)"
            value={formData.contactText}
            onChange={(e) => handleChange("contactText", e.target.value)}
            placeholder="Contoh: Telepon (021) 7890123 • E-mail : info@aksaventra.sch.id"
            size="sm"
          />
        </div>

        {/* Section 3: Judul Ujian & Tahun Pelajaran */}
        <div className="space-y-3 border-t border-slate-200 pt-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <FileCheck2 className="w-4 h-4 text-slate-500" />
            2. Judul Ujian & Tahun Pelajaran
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <TextField
              label="Header Kartu"
              value={formData.cardHeaderTitle}
              onChange={(e) => handleChange("cardHeaderTitle", e.target.value)}
              placeholder="KARTU PESERTA"
              size="sm"
            />
            <TextField
              label="Nama Ujian / Asesmen"
              value={formData.examTitle}
              onChange={(e) => handleChange("examTitle", e.target.value)}
              placeholder="ASESMEN SUMATIF AKHIR SEMESTER (ASAS)"
              size="sm"
            />
            <TextField
              label="Tahun Pelajaran"
              value={formData.academicYear}
              onChange={(e) => handleChange("academicYear", e.target.value)}
              placeholder="2026/2027"
              size="sm"
            />
          </div>
        </div>

        {/* Section 4: Penandatangan (Kepala Sekolah) */}
        <div className="space-y-3 border-t border-slate-200 pt-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            3. Penandatangan & Pengesahan
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <TextField
              label="Jabatan Pengesah"
              value={formData.signerTitle}
              onChange={(e) => handleChange("signerTitle", e.target.value)}
              placeholder="Contoh: Kepala Sekolah,"
              size="sm"
            />
            <TextField
              label="Nama Kepala Sekolah / Pengesah"
              value={formData.signerName}
              onChange={(e) => handleChange("signerName", e.target.value)}
              placeholder="Contoh: Drs. H. Mulyadi, M.Pd"
              size="sm"
            />
            <TextField
              label="NIP (Opsional)"
              value={formData.signerNip}
              onChange={(e) => handleChange("signerNip", e.target.value)}
              placeholder="Contoh: 19750812 200003 1 002"
              size="sm"
            />
          </div>
        </div>

        {/* Section 5: Pengaturan Jadwal Ujian (Langsung dari Pengaturan Kartu) */}
        <div className="space-y-3 border-t border-slate-200 pt-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-slate-500" />
                4. Jadwal Mata Pelajaran & Waktu Ujian
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Isi jadwal di bawah ini sesuai jadwal sekolah. Jika dikosongkan, tabel jadwal pada kartu ujian akan dicetak dengan sel kosong.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                color="secondary"
                size="sm"
                leftIcon={Trash2}
                onClick={handleClearSchedule}
              >
                Kosongkan
              </Button>
              <Button
                type="button"
                variant="filled"
                color="primary"
                size="sm"
                leftIcon={Plus}
                onClick={handleAddScheduleRow}
              >
                Tambah Hari
              </Button>
            </div>
          </div>

          <div className="space-y-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            {(formData.schedule || []).map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 text-xs shadow-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="font-bold text-slate-800">
                    Hari ke-{idx + 1}
                  </span>
                  {(formData.schedule || []).length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveScheduleRow(idx)}
                      className="text-[11px] text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus Hari
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <TextField
                    label="Hari, Tanggal"
                    placeholder="Contoh: Senin, 4 Maret 2026"
                    value={item.dayDate || ""}
                    onChange={(e) =>
                      handleScheduleChange(idx, "dayDate", e.target.value)
                    }
                    size="sm"
                  />
                  <TextField
                    label="Mapel Sesi 1"
                    placeholder="Contoh: PEND. PANCASILA"
                    value={item.subjects?.[0]?.name || ""}
                    onChange={(e) =>
                      handleScheduleChange(idx, "sub1Name", e.target.value)
                    }
                    size="sm"
                  />
                  <TextField
                    label="Waktu Sesi 1"
                    placeholder="Contoh: 07.30 – 09.30"
                    value={item.subjects?.[0]?.time || ""}
                    onChange={(e) =>
                      handleScheduleChange(idx, "sub1Time", e.target.value)
                    }
                    size="sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-50">
                  <div className="hidden sm:block" />
                  <TextField
                    label="Mapel Sesi 2 (Opsional)"
                    placeholder="Contoh: INFORMATIKA"
                    value={item.subjects?.[1]?.name || ""}
                    onChange={(e) =>
                      handleScheduleChange(idx, "sub2Name", e.target.value)
                    }
                    size="sm"
                  />
                  <TextField
                    label="Waktu Sesi 2 (Opsional)"
                    placeholder="Contoh: 09.30 – 11.30"
                    value={item.subjects?.[1]?.time || ""}
                    onChange={(e) =>
                      handleScheduleChange(idx, "sub2Time", e.target.value)
                    }
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 6: Format Cetak PDF */}
        <div className="space-y-3 border-t border-slate-200 pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <SelectField
              label="Format Cetak per Lembar A4"
              value={formData.cardsPerPage}
              onChange={(e) =>
                handleChange("cardsPerPage", Number(e.target.value) as 2 | 4)
              }
              size="sm"
            >
              <option value={4}>4 Kartu per Halaman (2 Kolom x 2 Baris - Standar)</option>
              <option value={2}>2 Kartu per Halaman (Atas-Bawah)</option>
            </SelectField>

            <div className="flex justify-end pt-5">
              <Button
                type="button"
                variant="ghost"
                color="secondary"
                size="sm"
                leftIcon={RotateCcw}
                onClick={handleResetToDefault}
              >
                Reset ke Pengaturan Awal
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ExamCardSettingsModal;
