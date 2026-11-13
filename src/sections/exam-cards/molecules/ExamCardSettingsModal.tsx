"use client";

import {
  Building2,
  FileCheck2,
  Image as ImageIcon,
  RotateCcw,
  Stamp,
  Trash2,
  Upload,
} from "lucide-react";
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
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingStamp, setIsUploadingStamp] = useState(false);

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
        showSuccessToast("Stempel / cap instansi berhasil dimuat.");
      }
      setIsUploadingStamp(false);
    };
    reader.onerror = () => {
      showErrorToast("Gagal membaca berkas stempel.");
      setIsUploadingStamp(false);
    };
    reader.readAsDataURL(file);
  };

  const handleResetToDefault = () => {
    setFormData({ ...DEFAULT_EXAM_CARD_SETTINGS });
    showSuccessToast("Pengaturan dikembalikan ke template standar resmi.");
  };

  const handleSubmit = () => {
    if (!formData.institutionName.trim()) {
      showErrorToast("Nama sekolah / instansi wajib diisi.");
      return;
    }
    onSave(formData);
    showSuccessToast("Format kartu ujian berhasil disimpan.");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Pengaturan Format Kartu Ujian Resmi"
      subtitle="Sesuaikan kop surat dinas, nama sekolah, logo, stempel, dan penandatangan kartu ujian"
      size="lg"
      onSubmit={handleSubmit}
      submitText="Simpan Pengaturan"
      cancelText="Batal"
    >
      <div className="space-y-5 py-2 max-h-[70vh] overflow-y-auto pr-1">
        {/* Section 1: Upload Logo & Stempel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Logo Instansi */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
              <Building2 className="w-4 h-4 text-[#0097a7]" />
              Logo Instansi / Daerah
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
                      Logo Standar
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
              Stempel / Cap Resmi
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
                      Cap Standar
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
                      onClick={() => handleChange("stampUrl", undefined)}
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

        {/* Section 2: KOP SURAT RESMI */}
        <div className="space-y-3 border-t border-slate-200 pt-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            1. Kop Surat Resmi Instansi
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextField
              label="Pemerintah Provinsi / Yayasan (Baris 1)"
              value={formData.governmentText}
              onChange={(e) => handleChange("governmentText", e.target.value)}
              placeholder="Contoh: PEMERINTAH PROVINSI DAERAH KHUSUS IBUKOTA JAKARTA"
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
            label="Nama Sekolah / Madrasah (Baris 3 - Huruf Besar)"
            value={formData.institutionName}
            onChange={(e) => handleChange("institutionName", e.target.value)}
            placeholder="Contoh: SEKOLAH MENENGAH PERTAMA NEGERI 29"
            size="sm"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <TextField
                label="Alamat Sekolah (Baris 4)"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Contoh: Jl. Bumi Blok E Kebayoran Baru Jakarta Selatan"
                size="sm"
              />
            </div>
            <div>
              <TextField
                label="Kode Pos"
                value={formData.postalCode}
                onChange={(e) => handleChange("postalCode", e.target.value)}
                placeholder="12120"
                size="sm"
              />
            </div>
          </div>

          <TextField
            label="Kontak Telepon, Fax & Email (Baris 5)"
            value={formData.contactText}
            onChange={(e) => handleChange("contactText", e.target.value)}
            placeholder="Telepon (021) 7247493 Fax. (021) 7206336 E-mail : smpn29jkt@yahoo.com"
            size="sm"
          />
        </div>

        {/* Section 3: Judul Asesmen / Ujian */}
        <div className="space-y-3 border-t border-slate-200 pt-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <FileCheck2 className="w-4 h-4 text-slate-500" />
            2. Judul Asesmen & Tahun Pelajaran
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
              label="Nama Asesmen / Ujian"
              value={formData.examTitle}
              onChange={(e) => handleChange("examTitle", e.target.value)}
              placeholder="ASESMEN SUMATIF AKHIR TAHUN"
              size="sm"
            />
            <TextField
              label="Tahun Pelajaran"
              value={formData.academicYear}
              onChange={(e) => handleChange("academicYear", e.target.value)}
              placeholder="2023/2024"
              size="sm"
            />
          </div>
        </div>

        {/* Section 4: Penandatangan & Pengesahan */}
        <div className="space-y-3 border-t border-slate-200 pt-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            3. Penandatangan & Pengesahan
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <TextField
              label="Jabatan & Sekolah"
              value={formData.signerTitle}
              onChange={(e) => handleChange("signerTitle", e.target.value)}
              placeholder="Kepala SMP Negeri 29 Jakarta,"
              size="sm"
            />
            <TextField
              label="Nama Lengkap & Gelar"
              value={formData.signerName}
              onChange={(e) => handleChange("signerName", e.target.value)}
              placeholder="Abdul Malik, M.Si"
              size="sm"
            />
            <TextField
              label="NIP"
              value={formData.signerNip}
              onChange={(e) => handleChange("signerNip", e.target.value)}
              placeholder="196505141989032005"
              size="sm"
            />
          </div>
        </div>

        {/* Section 5: Opsi Cetak PDF */}
        <div className="space-y-3 border-t border-slate-200 pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <SelectField
              label="Format Cetak per Lembar A4"
              value={formData.cardsPerPage}
              onChange={(e) =>
                handleChange("cardsPerPage", Number(e.target.value) as 1 | 2)
              }
              size="sm"
            >
              <option value={2}>2 Kartu per Halaman (Standar Resmi Atas-Bawah)</option>
              <option value={1}>1 Kartu per Halaman (Ukuran Penuh)</option>
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
                Reset ke Format Standar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ExamCardSettingsModal;
