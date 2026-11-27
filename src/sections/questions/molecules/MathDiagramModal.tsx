"use client";

import { Check, Copy, Download, LineChart, Sparkles, X } from "lucide-react";
import { type FC, useMemo, useState } from "react";
import { escapeXml, sanitizeSvg } from "@/libs/svgSanitizer";
import Button from "@/shared-ui/component/Button";
import Modal from "@/shared-ui/component/Modal";
import SelectField from "@/shared-ui/component/SelectField";
import TextField from "@/shared-ui/component/TextField";

export type MathDiagramType =
  | "parabola"
  | "linear"
  | "sine"
  | "triangle"
  | "circle"
  | "venn";

interface MathDiagramModalProps {
  open: boolean;
  onClose: () => void;
  onInsertSvg: (svgCode: string) => void;
  onSetAsImageUrl?: (dataUrl: string) => void;
}

export const MathDiagramModal: FC<MathDiagramModalProps> = ({
  open,
  onClose,
  onInsertSvg,
  onSetAsImageUrl,
}) => {
  const [diagramType, setDiagramType] = useState<MathDiagramType>("parabola");

  // Parabola state: y = a*x^2 + b*x + c
  const [paramA, setParamA] = useState<number>(1);
  const [paramB, setParamB] = useState<number>(-4);
  const [paramC, setParamC] = useState<number>(3);
  const [parabolaTitle, setParabolaTitle] = useState<string>(
    "Grafik y = x² - 4x + 3",
  );

  // Linear state: y = m*x + c
  const [paramM, setParamM] = useState<number>(2);
  const [paramLinearC, setParamLinearC] = useState<number>(-2);
  const [linearTitle, setLinearTitle] = useState<string>("Garis y = 2x - 2");

  // Triangle state
  const [triangleA, setTriangleA] = useState<string>("A");
  const [triangleB, setTriangleB] = useState<string>("B");
  const [triangleC, setTriangleC] = useState<string>("C");
  const [sideA, setSideA] = useState<string>("3 cm");
  const [sideB, setSideB] = useState<string>("4 cm");
  const [sideC, setSideC] = useState<string>("5 cm");

  // Venn state
  const [setALabel, setSetALabel] = useState<string>("A: Matematika");
  const [setBLabel, setSetBLabel] = useState<string>("B: Fisika");
  const [vennUnionLabel, setVennUnionLabel] = useState<string>("A ∩ B");

  // Copied indicator
  const [copied, setCopied] = useState(false);

  // Generate SVG string based on selected diagram and parameters
  const svgContent = useMemo(() => {
    const safeParabolaTitle = escapeXml(parabolaTitle);
    const safeLinearTitle = escapeXml(linearTitle);
    const safeTriangleA = escapeXml(triangleA);
    const safeTriangleB = escapeXml(triangleB);
    const safeTriangleC = escapeXml(triangleC);
    const safeSideA = escapeXml(sideA);
    const safeSideB = escapeXml(sideB);
    const safeSideC = escapeXml(sideC);
    const safeSetALabel = escapeXml(setALabel);
    const safeSetBLabel = escapeXml(setBLabel);
    const safeVennUnionLabel = escapeXml(vennUnionLabel);

    const buildRawSvg = (): string => {
      if (diagramType === "parabola") {
        // 400x300 viewBox, center at (200, 180), scale 25px per unit
        const cx = 200;
        const cy = 180;
        const scale = 25;

        const points: string[] = [];
        for (let x = -5; x <= 6; x += 0.2) {
          const y = paramA * x * x + paramB * x + paramC;
          const px = cx + x * scale;
          const py = cy - y * scale;
          if (py >= 20 && py <= 280) {
            points.push(`${px.toFixed(1)},${py.toFixed(1)}`);
          }
        }
        const polyline = points.join(" ");

        // Vertex
        const vx = -paramB / (2 * (paramA || 0.001));
        const vy = paramA * vx * vx + paramB * vx + paramC;
        const vpx = cx + vx * scale;
        const vpy = cy - vy * scale;

        return `<svg viewBox="0 0 400 300" width="100%" height="240" xmlns="http://www.w3.org/2000/svg" class="math-curve-parabola mx-auto my-2 rounded-xl bg-white border border-slate-200">
  <!-- Grid -->
  <defs>
    <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
      <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#e2e8f0" stroke-width="0.8"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#grid)" />
  
  <!-- Axes -->
  <line x1="20" y1="${cy}" x2="380" y2="${cy}" stroke="#64748b" stroke-width="1.8" />
  <polygon points="380,${cy - 4} 390,${cy} 380,${cy + 4}" fill="#64748b" />
  <text x="385" y="${cy - 8}" font-size="12" font-family="sans-serif" font-weight="bold" fill="#334155">X</text>

  <line x1="${cx}" y1="280" x2="${cx}" y2="20" stroke="#64748b" stroke-width="1.8" />
  <polygon points="${cx - 4},20 ${cx},10 ${cx + 4},20" fill="#64748b" />
  <text x="${cx + 8}" y="20" font-size="12" font-family="sans-serif" font-weight="bold" fill="#334155">Y</text>
  <text x="${cx - 12}" y="${cy + 15}" font-size="11" fill="#64748b">O</text>

  <!-- Parabola Curve -->
  <polyline points="${polyline}" fill="none" stroke="#0097a7" stroke-width="2.6" stroke-linecap="round" />

  <!-- Vertex Point -->
  ${
    vpy >= 20 && vpy <= 280
      ? `
  <circle cx="${vpx}" cy="${vpy}" r="4.5" fill="#eab308" stroke="#0d2b5c" stroke-width="1.5" />
  <text x="${vpx + 8}" y="${vpy - 6}" font-size="11" font-weight="bold" fill="#0d2b5c">P(${vx.toFixed(1)}, ${vy.toFixed(1)})</text>
  `
      : ""
  }

  <!-- Label / Title -->
  <text x="20" y="28" font-size="12" font-weight="bold" font-family="sans-serif" fill="#0d2b5c">${safeParabolaTitle}</text>
</svg>`;
      }

      if (diagramType === "linear") {
        const cx = 200;
        const cy = 150;
        const scale = 25;

        const x1 = -6;
        const y1 = paramM * x1 + paramLinearC;
        const x2 = 6;
        const y2 = paramM * x2 + paramLinearC;

        const px1 = cx + x1 * scale;
        const py1 = cy - y1 * scale;
        const px2 = cx + x2 * scale;
        const py2 = cy - y2 * scale;

        return `<svg viewBox="0 0 400 300" width="100%" height="240" xmlns="http://www.w3.org/2000/svg" class="math-curve-linear mx-auto my-2 rounded-xl bg-white border border-slate-200">
  <defs>
    <pattern id="grid-lin" width="25" height="25" patternUnits="userSpaceOnUse">
      <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#e2e8f0" stroke-width="0.8"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#grid-lin)" />

  <!-- Axes -->
  <line x1="20" y1="${cy}" x2="380" y2="${cy}" stroke="#64748b" stroke-width="1.8" />
  <polygon points="380,${cy - 4} 390,${cy} 380,${cy + 4}" fill="#64748b" />
  <text x="385" y="${cy - 8}" font-size="12" font-weight="bold" fill="#334155">X</text>

  <line x1="${cx}" y1="280" x2="${cx}" y2="20" stroke="#64748b" stroke-width="1.8" />
  <polygon points="${cx - 4},20 ${cx},10 ${cx + 4},20" fill="#64748b" />
  <text x="${cx + 8}" y="20" font-size="12" font-weight="bold" fill="#334155">Y</text>
  <text x="${cx - 12}" y="${cy + 15}" font-size="11" fill="#64748b">O</text>

  <!-- Linear Line -->
  <line x1="${px1}" y1="${py1}" x2="${px2}" y2="${py2}" stroke="#0284c7" stroke-width="2.6" stroke-linecap="round" />
  
  <text x="20" y="28" font-size="12" font-weight="bold" font-family="sans-serif" fill="#0d2b5c">${safeLinearTitle}</text>
</svg>`;
      }

      if (diagramType === "sine") {
        const cx = 40;
        const cy = 150;
        const points: string[] = [];
        for (let px = 40; px <= 360; px += 4) {
          const rad = ((px - 40) / 160) * Math.PI;
          const py = cy - 70 * Math.sin(rad);
          points.push(`${px.toFixed(1)},${py.toFixed(1)}`);
        }

        return `<svg viewBox="0 0 400 300" width="100%" height="240" xmlns="http://www.w3.org/2000/svg" class="math-curve-sine mx-auto my-2 rounded-xl bg-white border border-slate-200">
  <line x1="20" y1="${cy}" x2="380" y2="${cy}" stroke="#64748b" stroke-width="1.8" />
  <polygon points="380,${cy - 4} 390,${cy} 380,${cy + 4}" fill="#64748b" />
  <text x="385" y="${cy - 8}" font-size="12" font-weight="bold" fill="#334155">x</text>

  <line x1="${cx}" y1="280" x2="${cx}" y2="20" stroke="#64748b" stroke-width="1.8" />
  <polygon points="${cx - 4},20 ${cx},10 ${cx + 4},20" fill="#64748b" />
  <text x="${cx + 8}" y="20" font-size="12" font-weight="bold" fill="#334155">y</text>

  <!-- Sine Wave -->
  <polyline points="${points.join(" ")}" fill="none" stroke="#0097a7" stroke-width="2.6" stroke-linecap="round" />

  <!-- Key Ticks -->
  <line x1="200" y1="${cy - 4}" x2="200" y2="${cy + 4}" stroke="#64748b" stroke-width="1.5" />
  <text x="195" y="${cy + 18}" font-size="11" fill="#475569">π</text>

  <line x1="360" y1="${cy - 4}" x2="360" y2="${cy + 4}" stroke="#64748b" stroke-width="1.5" />
  <text x="350" y="${cy + 18}" font-size="11" fill="#475569">2π</text>

  <text x="20" y="28" font-size="12" font-weight="bold" fill="#0d2b5c">Kurva y = sin(x)</text>
</svg>`;
      }

      if (diagramType === "triangle") {
        return `<svg viewBox="0 0 400 300" width="100%" height="240" xmlns="http://www.w3.org/2000/svg" class="math-diagram-triangle mx-auto my-2 rounded-xl bg-white border border-slate-200">
  <!-- Triangle Polygon -->
  <polygon points="80,240 320,240 80,60" fill="#f0fdf4" stroke="#16a34a" stroke-width="2.5" stroke-linejoin="round" />
  
  <!-- Right Angle Square -->
  <rect x="80" y="220" width="20" height="20" fill="none" stroke="#16a34a" stroke-width="1.5" />

  <!-- Vertices Labels -->
  <circle cx="80" cy="240" r="4" fill="#0d2b5c" />
  <text x="60" y="255" font-size="13" font-weight="bold" fill="#0d2b5c">${safeTriangleA}</text>

  <circle cx="320" cy="240" r="4" fill="#0d2b5c" />
  <text x="328" y="255" font-size="13" font-weight="bold" fill="#0d2b5c">${safeTriangleB}</text>

  <circle cx="80" cy="60" r="4" fill="#0d2b5c" />
  <text x="60" y="55" font-size="13" font-weight="bold" fill="#0d2b5c">${safeTriangleC}</text>

  <!-- Side Labels -->
  <text x="190" y="260" font-size="12" font-weight="bold" fill="#475569">${safeSideA}</text>
  <text x="45" y="155" font-size="12" font-weight="bold" fill="#475569">${safeSideB}</text>
  <text x="210" y="140" font-size="12" font-weight="bold" fill="#16a34a">${safeSideC}</text>

  <text x="20" y="28" font-size="12" font-weight="bold" fill="#0d2b5c">Segitiga Siku-Siku ABC</text>
</svg>`;
      }

      if (diagramType === "venn") {
        return `<svg viewBox="0 0 400 260" width="100%" height="220" xmlns="http://www.w3.org/2000/svg" class="math-diagram-venn mx-auto my-2 rounded-xl bg-white border border-slate-200">
  <!-- Universe Rect -->
  <rect x="30" y="25" width="340" height="210" rx="16" fill="#f8fafc" stroke="#64748b" stroke-width="1.5" />
  <text x="45" y="48" font-size="13" font-weight="bold" fill="#0d2b5c">S (Semesta)</text>

  <!-- Circle A -->
  <circle cx="160" cy="135" r="70" fill="#0097a7" fill-opacity="0.25" stroke="#0097a7" stroke-width="2.2" />
  <text x="120" y="140" font-size="12" font-weight="bold" fill="#0097a7">${safeSetALabel}</text>

  <!-- Circle B -->
  <circle cx="240" cy="135" r="70" fill="#eab308" fill-opacity="0.25" stroke="#ca8a04" stroke-width="2.2" />
  <text x="250" y="140" font-size="12" font-weight="bold" fill="#854d0e">${safeSetBLabel}</text>

  <!-- Intersection Label -->
  <text x="185" y="140" font-size="11" font-weight="bold" fill="#0d2b5c">${safeVennUnionLabel}</text>
</svg>`;
      }

      // Default Circle
      return `<svg viewBox="0 0 400 260" width="100%" height="220" xmlns="http://www.w3.org/2000/svg" class="math-diagram-circle mx-auto my-2 rounded-xl bg-white border border-slate-200">
  <circle cx="200" cy="130" r="80" fill="#f0f9ff" stroke="#0284c7" stroke-width="2.2" />
  <circle cx="200" cy="130" r="4" fill="#0d2b5c" />
  <text x="195" y="120" font-size="12" font-weight="bold" fill="#0d2b5c">O</text>
  <line x1="200" y1="130" x2="270" y2="90" stroke="#0284c7" stroke-width="1.8" stroke-dasharray="4" />
  <text x="235" y="105" font-size="12" font-weight="bold" fill="#0284c7">r</text>
  <text x="20" y="28" font-size="12" font-weight="bold" fill="#0d2b5c">Lingkaran dengan Pusat O</text>
</svg>`;
    };

    return sanitizeSvg(buildRawSvg());
  }, [
    diagramType,
    paramA,
    paramB,
    paramC,
    parabolaTitle,
    paramM,
    paramLinearC,
    linearTitle,
    triangleA,
    triangleB,
    triangleC,
    sideA,
    sideB,
    sideC,
    setALabel,
    setBLabel,
    vennUnionLabel,
  ]);

  const handleInsert = () => {
    onInsertSvg(svgContent);
    onClose();
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(svgContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_err) {
      // fallback
    }
  };

  const handleDownloadSvg = () => {
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `math-diagram-${diagramType}-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleUseAsImage = () => {
    if (!onSetAsImageUrl) return;
    const encoded = `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
    onSetAsImageUrl(encoded);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Generator Kurva & Diagram Matematika"
      subtitle="Buat kurva fungsi kartesius, geometri, trigonometri, dan diagram himpunan beresolusi tinggi (vektor SVG)"
      size="lg"
    >
      <div className="flex flex-col gap-5 py-2">
        {/* Type Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            id="diagram-type-select"
            label="Pilih Template Kurva / Diagram:"
            value={diagramType}
            onChange={(e) => setDiagramType(e.target.value as MathDiagramType)}
            size="sm"
          >
            <option value="parabola">
              Kurva Parabola (Fungsi Kuadrat y = ax² + bx + c)
            </option>
            <option value="linear">Garis Lurus / Linear (y = mx + c)</option>
            <option value="sine">Kurva Trigonometri Gelombang Sinus</option>
            <option value="triangle">
              Diagram Geometri Segitiga Siku-siku
            </option>
            <option value="circle">Diagram Lingkaran & Jari-jari</option>
            <option value="venn">Diagram Venn Himpunan Beririsan</option>
          </SelectField>

          {diagramType === "parabola" && (
            <TextField
              id="parabola-title-input"
              label="Judul / Label Kurva:"
              value={parabolaTitle}
              onChange={(e) => setParabolaTitle(e.target.value)}
              size="sm"
            />
          )}

          {diagramType === "linear" && (
            <TextField
              id="linear-title-input"
              label="Judul Garis:"
              value={linearTitle}
              onChange={(e) => setLinearTitle(e.target.value)}
              size="sm"
            />
          )}
        </div>

        {/* Dynamic Parameter Controls */}
        {diagramType === "parabola" && (
          <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <TextField
              id="param-a"
              label="Koefisien a:"
              type="number"
              step="0.5"
              value={paramA}
              onChange={(e) => setParamA(Number(e.target.value))}
              size="sm"
            />
            <TextField
              id="param-b"
              label="Koefisien b:"
              type="number"
              step="0.5"
              value={paramB}
              onChange={(e) => setParamB(Number(e.target.value))}
              size="sm"
            />
            <TextField
              id="param-c"
              label="Konstanta c:"
              type="number"
              step="0.5"
              value={paramC}
              onChange={(e) => setParamC(Number(e.target.value))}
              size="sm"
            />
          </div>
        )}

        {diagramType === "linear" && (
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <TextField
              id="param-m"
              label="Gradien m:"
              type="number"
              step="0.5"
              value={paramM}
              onChange={(e) => setParamM(Number(e.target.value))}
              size="sm"
            />
            <TextField
              id="param-lin-c"
              label="Konstanta c:"
              type="number"
              step="0.5"
              value={paramLinearC}
              onChange={(e) => setParamLinearC(Number(e.target.value))}
              size="sm"
            />
          </div>
        )}

        {diagramType === "triangle" && (
          <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <TextField
              id="tri-side-a"
              label="Alas Segitiga:"
              value={sideA}
              onChange={(e) => setSideA(e.target.value)}
              size="sm"
            />
            <TextField
              id="tri-side-b"
              label="Tinggi Segitiga:"
              value={sideB}
              onChange={(e) => setSideB(e.target.value)}
              size="sm"
            />
            <TextField
              id="tri-side-c"
              label="Sisi Miring (Hipotenusa):"
              value={sideC}
              onChange={(e) => setSideC(e.target.value)}
              size="sm"
            />
          </div>
        )}

        {diagramType === "venn" && (
          <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <TextField
              id="venn-set-a"
              label="Label Himpunan A:"
              value={setALabel}
              onChange={(e) => setSetALabel(e.target.value)}
              size="sm"
            />
            <TextField
              id="venn-set-b"
              label="Label Himpunan B:"
              value={setBLabel}
              onChange={(e) => setSetBLabel(e.target.value)}
              size="sm"
            />
            <TextField
              id="venn-union"
              label="Label Irisan A ∩ B:"
              value={vennUnionLabel}
              onChange={(e) => setVennUnionLabel(e.target.value)}
              size="sm"
            />
          </div>
        )}

        {/* Live Vector Preview */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <div className="flex items-center gap-1.5">
              <LineChart className="w-4 h-4 text-[#0097a7]" />
              <span>Pratinjau Hasil Kurva / Diagram Vektor:</span>
            </div>
            <span className="text-[11px] text-slate-400">
              Vektor SVG Responsif
            </span>
          </div>

          <div
            className="p-4 rounded-2xl bg-slate-100/60 border border-slate-200 flex items-center justify-center min-h-[220px]"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: internal generated SVG
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              color="secondary"
              size="sm"
              leftIcon={copied ? Check : Copy}
              onClick={handleCopyCode}
            >
              {copied ? "Tersalin!" : "Salin SVG"}
            </Button>
            <Button
              type="button"
              variant="outline"
              color="secondary"
              size="sm"
              leftIcon={Download}
              onClick={handleDownloadSvg}
            >
              Unduh .svg
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              color="secondary"
              size="sm"
              leftIcon={X}
              onClick={onClose}
            >
              Batal
            </Button>
            {onSetAsImageUrl && (
              <Button
                type="button"
                variant="outline"
                color="primary"
                size="sm"
                onClick={handleUseAsImage}
              >
                Gunakan sbg Gambar Soal
              </Button>
            )}
            <Button
              type="button"
              variant="filled"
              color="primary"
              size="sm"
              leftIcon={Sparkles}
              onClick={handleInsert}
            >
              Sisipkan ke Teks Soal
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default MathDiagramModal;
