"use client";

import { Building2, Image as ImageIcon, RotateCcw, Trash2, Upload } from "lucide-react";
import React, { type ChangeEvent, type FC, useState } from "react";
import type { ExamCardSettings } from "@/modules/exam-cards/domain/dto/ExamCardDTO";
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
  const [isUploading, setIsUploading] = useState(false);

  // Sync state whenever modal is opened
  React.useEffect(() => {
    if (open) {
      setFormData({ ...settings });
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
      showErrorToast("Berkas harus berupa gambar (PNG, JPG, atau WebP).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showErrorToast("Ukuran logo maksimal 2 MB.");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        handleChange("logoUrl", reader.result);
        showSuccessToast("Logo instansi berhasil dimuat.");
      }
      setIsUploading(false);
    };
    reader.onerror = () => {
      showErrorToast("Gagal membaca berkas logo.");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    handleChange("logoUrl", undefined);
    showSuccessToast("Logo instansi dihapus.");
  };

  const handleResetToDefault = () => {
    setFormData({ ...DEFAULT_EXAM_CARD_SETTINGS });
    showSuccessToast("Pengaturan dikembalikan ke konfigurasi standar.");
  };

  const handleSubmit = () => {
    if (!formData.institutionName.trim()) {
      showErrorToast("Nama instansi pendidikan wajib diisi.");
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
      title="Pengaturan Kartu Ujian & Kop Dokumen"
      subtitle="Kustomisasi logo instansi, identitas sekolah, dan penandatangan kartu ujian untuk cetak PDF"
      size="lg"
      onSubmit={handleSubmit}
      submitText="Simpan Pengaturan"
      cancelText="Batal"
    >
      <div className="space-y-6 py-2">
        {/* Section 1: Logo Instansi */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
            <Building2 className="w-4 h-4 text-[#0097a7]" />
            Logo Instansi Pendidikan
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white overflow-hidden p-1 shadow-xs">
              {formData.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={formData.logoUrl}
                  alt="Logo Preview"
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 text-center p-2">
                  <ImageIcon className="h-6 w-6 mb-1 text-slate-300" />
                  <span className="text-[9px] font-medium leading-tight">
                    Belum ada logo
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <p className="text-xs text-slate-600">
                Format yang didukung: <strong>PNG, JPG, SVG, WebP</strong>.
                Disarankan logo berlatar transparan (rasio 1:1, maksimal 2 MB).
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#0d2b5c] text-white hover:bg-[#163b78] transition shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    {isUploading ? "Mengunggah..." : "Unggah Logo"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>

                {formData.logoUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    color="secondary"
                    size="sm"
                    leftIcon={Trash2}
                    onClick={handleRemoveLogo}
                  >
                    Hapus Logo
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Identitas Instansi & Judul Ujian */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Identitas Sekolah / Lembaga
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextField
              label="Nama Instansi Pendidikan"
              value={formData.institutionName}
              onChange={(e) => handleChange("institutionName", e.target.value)}
              placeholder="Contoh: SMA NEGERI 1 AKSAVENTRA"
              size="sm"
            />
            <TextField
              label="Kop Dokumen / Subheader"
              value={formData.subHeader}
              onChange={(e) => handleChange("subHeader", e.target.value)}
              placeholder="Contoh: ASESMEN SUMATIF AKHIR SEMESTER (ASAS)"
              size="sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextField
              label="Tahun Ajaran"
              value={formData.academicYear}
              onChange={(e) => handleChange("academicYear", e.target.value)}
              placeholder="Contoh: 2026/2027"
              size="sm"
            />
            <TextField
              label="Judul Ujian Default"
              value={formData.examTitle}
              onChange={(e) => handleChange("examTitle", e.target.value)}
              placeholder="Contoh: Ujian CBT Berbasis Komputer"
              size="sm"
            />
          </div>

          <TextField
            label="Alamat & Kontak Instansi"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            placeholder="Contoh: Jl. Pendidikan Nasional No. 45, Telp: (021) 7890123"
            size="sm"
          />
        </div>

        {/* Section 3: Pengesahan & Tanda Tangan */}
        <div className="space-y-3 border-t border-slate-200 pt-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Pengesahan & Tanda Tangan Kartu
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextField
              label="Kota Pengesahan"
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
              placeholder="Contoh: Jakarta"
              size="sm"
            />
            <TextField
              label="Tanggal Pengesahan"
              value={formData.dateStr}
              onChange={(e) => handleChange("dateStr", e.target.value)}
              placeholder="Contoh: 13 November 2026"
              size="sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <TextField
              label="Jabatan Pengesah"
              value={formData.signerTitle}
              onChange={(e) => handleChange("signerTitle", e.target.value)}
              placeholder="Contoh: Kepala Sekolah"
              size="sm"
            />
            <TextField
              label="Nama Pengesah"
              value={formData.signerName}
              onChange={(e) => handleChange("signerName", e.target.value)}
              placeholder="Contoh: Drs. H. Mulyadi, M.Pd"
              size="sm"
            />
            <TextField
              label="NIP Pengesah (Opsional)"
              value={formData.signerNip}
              onChange={(e) => handleChange("signerNip", e.target.value)}
              placeholder="Contoh: 19750812 200003 1 002"
              size="sm"
            />
          </div>
        </div>

        {/* Section 4: Format PDF Layout */}
        <div className="space-y-3 border-t border-slate-200 pt-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Pengaturan Tata Letak Cetak PDF
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <SelectField
              label="Tata Letak per Halaman A4"
              value={formData.cardsPerPage}
              onChange={(e) =>
                handleChange("cardsPerPage", Number(e.target.value) as 2 | 4)
              }
              size="sm"
            >
              <option value={4}>4 Kartu per Halaman (Grid 2x2 - Hemat Kertas)</option>
              <option value={2}>2 Kartu per Halaman (Besar / Format Renggang)</option>
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
                Reset Standar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ExamCardSettingsModal;
