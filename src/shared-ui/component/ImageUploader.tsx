"use client";

import { ImageIcon, Loader2, Trash2, UploadCloud } from "lucide-react";
import Image from "next/image";
import { type ChangeEvent, type DragEvent, type FC, useRef, useState } from "react";
import Button from "./Button";
import { showErrorToast, showSuccessToast } from "./Toast";

export interface ImageUploaderProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  label?: string;
  className?: string;
}

export const ImageUploader: FC<ImageUploaderProps> = ({
  value,
  onChange,
  label = "Lampiran Gambar Soal (Opsional)",
  className = "",
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      showErrorToast("Format berkas harus berupa gambar (PNG, JPG, WebP, GIF, SVG).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showErrorToast("Ukuran gambar maksimal 5 MB.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.data?.url) {
        onChange(json.data.url);
        showSuccessToast("Gambar berhasil diunggah.");
      } else {
        showErrorToast(json.error?.message || "Gagal mengunggah gambar.");
      }
    } catch {
      showErrorToast("Terjadi gangguan jaringan saat mengunggah gambar.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
  };

  const handleRemove = () => {
    onChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTriggerClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-[#0097a7]" />
          {label}
        </span>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        <div className="relative group rounded-2xl border border-slate-200 bg-slate-50/70 p-3 overflow-hidden flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-40 h-28 rounded-xl overflow-hidden border border-slate-200 bg-white shrink-0">
            {/* biome-ignore lint/performance/noDelete: next/image requires absolute or relative URL */}
            <Image
              src={value}
              alt="Gambar Soal"
              fill
              className="object-contain p-1"
              unoptimized
            />
          </div>

          <div className="flex-1 flex flex-col justify-between self-stretch py-1">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-800 break-all">
                {value.split("/").pop()}
              </p>
              <p className="text-[11px] text-slate-400">
                Gambar terlampir akan ditampilkan bersama stem teks pertanyaan.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                color="secondary"
                size="sm"
                onClick={handleTriggerClick}
                disabled={isUploading}
              >
                Ganti Gambar
              </Button>
              <Button
                type="button"
                variant="ghost"
                color="error"
                size="sm"
                leftIcon={Trash2}
                onClick={handleRemove}
                disabled={isUploading}
              >
                Hapus
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // biome-ignore lint/a11y/noStaticElementInteractions: Click & drop image zone
        <div
          onClick={handleTriggerClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer select-none text-center ${
            isDragging
              ? "border-[#0097a7] bg-[#0097a7]/5"
              : "border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50"
          }`}
        >
          {isUploading ? (
            <div className="flex items-center gap-2 text-xs font-bold text-[#0097a7]">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Mengunggah gambar...</span>
            </div>
          ) : (
            <>
              <div className="p-2.5 rounded-2xl bg-teal-50 text-[#0097a7]">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-700">
                  Klik untuk unggah gambar atau seret berkas ke sini
                </p>
                <p className="text-[11px] text-slate-400">
                  Format didukung: PNG, JPG, WebP, GIF, SVG (Maks. 5 MB)
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
