import type React from "react";
import { useRef, useState } from "react";
import Button from "@/shared-ui/component/Button";

interface SingleUploadProps {
  hasImage?: boolean; // 🔥 tambahkan ini
  onUpload: (
    file: File,
    onProgress: (percent: number) => void,
  ) => Promise<void>;
}

export function UploadButton({
  onUpload,
  hasImage = false,
}: SingleUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const file = e.target.files[0];

    try {
      setUploading(true);
      setProgress(0);

      await onUpload(file, setProgress);
    } finally {
      setUploading(false);
      e.target.value = "";
      setTimeout(() => setProgress(0), 800);
    }
  };

  const label = uploading
    ? `Uploading ${progress}%`
    : hasImage
      ? "Ubah Foto"
      : "Ambil Foto";

  return (
    <div className="space-y-3 w-full max-w-sm">
      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept="image/*"
        onChange={handleFileChange}
      />

      <Button
        variant="outline"
        fullWidth
        loading={uploading}
        onClick={() => fileInputRef.current?.click()}
      >
        {label}
      </Button>

      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
