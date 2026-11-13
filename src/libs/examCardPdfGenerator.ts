import jsPDF from "jspdf";
import type {
  ExamCardItemDTO,
  ExamCardSettings,
} from "@/modules/exam-cards/domain/dto/ExamCardDTO";

/**
 * Loads an image from URL or data URI and returns an HTMLImageElement.
 */
function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * Generates an official, print-ready PDF for exam participant cards.
 */
export async function generateExamCardsPdf(
  cards: ExamCardItemDTO[],
  settings: ExamCardSettings,
  options?: { filename?: string },
): Promise<void> {
  if (!cards || cards.length === 0) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4", // 210 x 297 mm
  });

  // Pre-load logo if provided
  let logoImg: HTMLImageElement | null = null;
  if (settings.logoUrl) {
    logoImg = await loadImage(settings.logoUrl);
  }

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 8;
  const marginY = 8;

  // 4 cards per page layout (2 cols x 2 rows)
  const is4PerPage = settings.cardsPerPage === 4;
  const cols = is4PerPage ? 2 : 1;
  const rows = is4PerPage ? 2 : 2;
  const cardsPerPage = cols * rows;

  const cardWidth = is4PerPage
    ? (pageWidth - marginX * 2 - 6) / 2 // ~94mm
    : pageWidth - marginX * 2; // ~194mm
  const cardHeight = is4PerPage
    ? (pageHeight - marginY * 2 - 6) / 2 // ~137mm
    : (pageHeight - marginY * 2 - 8) / 2; // ~136mm

  const gapX = is4PerPage ? 6 : 0;
  const gapY = is4PerPage ? 6 : 8;

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const indexOnPage = i % cardsPerPage;

    // Add new page after filling current page
    if (i > 0 && indexOnPage === 0) {
      doc.addPage();
    }

    const colIndex = indexOnPage % cols;
    const rowIndex = Math.floor(indexOnPage / cols);

    const x = marginX + colIndex * (cardWidth + gapX);
    const y = marginY + rowIndex * (cardHeight + gapY);

    // 1. Draw Card Outer Border & Cut Line Guide
    doc.setDrawColor(203, 213, 225); // Slate 300
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, "S");

    // Dotted cutting guide corner marks
    doc.setLineDashPattern([1, 2], 0);
    doc.setDrawColor(148, 163, 184); // Slate 400
    doc.line(x - 2, y, x + 3, y);
    doc.line(x, y - 2, x, y + 3);
    doc.line(x + cardWidth - 3, y, x + cardWidth + 2, y);
    doc.line(x + cardWidth, y - 2, x + cardWidth, y + 3);
    doc.setLineDashPattern([], 0); // Reset dash

    // 2. Card Header (Kop Kartu Ujian)
    const headerHeight = 22;
    const headerPadding = 3;

    // Logo
    let textStartX = x + headerPadding;
    let maxTextWidth = cardWidth - headerPadding * 2;

    if (logoImg) {
      try {
        const logoSize = 15;
        doc.addImage(
          logoImg,
          "PNG",
          x + headerPadding,
          y + headerPadding + 1,
          logoSize,
          logoSize,
        );
        textStartX += logoSize + 3;
        maxTextWidth -= logoSize + 3;
      } catch (_e) {
        // Fallback without logo
      }
    }

    // Institution & Exam Title Text
    doc.setTextColor(13, 43, 92); // Aksaventra Deep Navy #0d2b5c
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text(
      settings.institutionName.toUpperCase(),
      textStartX,
      y + headerPadding + 4,
      { maxWidth: maxTextWidth },
    );

    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59); // Slate 800
    doc.text(settings.subHeader, textStartX, y + headerPadding + 8, {
      maxWidth: maxTextWidth,
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text(
      `Tahun Ajaran ${settings.academicYear} • ${settings.examTitle}`,
      textStartX,
      y + headerPadding + 11.5,
      { maxWidth: maxTextWidth },
    );
    doc.text(settings.address, textStartX, y + headerPadding + 14.5, {
      maxWidth: maxTextWidth,
    });

    // Double Divider Line
    doc.setDrawColor(13, 43, 92);
    doc.setLineWidth(0.6);
    doc.line(x + 2, y + headerHeight, x + cardWidth - 2, y + headerHeight);
    doc.setLineWidth(0.2);
    doc.line(
      x + 2,
      y + headerHeight + 0.8,
      x + cardWidth - 2,
      y + headerHeight + 0.8,
    );

    // 3. Card Title Banner
    doc.setFillColor(241, 245, 249); // Slate 100
    doc.rect(x + 2, y + headerHeight + 2, cardWidth - 4, 6.5, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(13, 43, 92);
    doc.text(
      "KARTU PESERTA UJIAN (CBT)",
      x + cardWidth / 2,
      y + headerHeight + 6.5,
      { align: "center" },
    );

    // 4. Student Data Table
    const dataY = y + headerHeight + 11;
    const labelX = x + 4;
    const colonX = x + 28;
    const valueX = x + 30;

    const rowHeight = 5.2;

    const printField = (
      label: string,
      val: string,
      rowIdx: number,
      isBold = false,
    ) => {
      const curY = dataY + rowIdx * rowHeight;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139); // Slate 500
      doc.text(label, labelX, curY);
      doc.text(":", colonX, curY);

      doc.setFont("helvetica", isBold ? "bold" : "normal");
      doc.setTextColor(isBold ? 13 : 30, isBold ? 43 : 41, isBold ? 92 : 59);
      doc.text(val, valueX, curY, { maxWidth: cardWidth - valueX - 25 });
    };

    printField("Nama Peserta", card.fullName, 0, true);
    printField("NISN / User", card.nisn, 1, true);
    printField("Kelas / Rombel", card.className, 2, false);
    printField("Ruang Ujian", card.roomCode, 3, false);
    printField("Nomor Meja", card.seatNumber, 4, true);
    printField("Sesi Ujian", card.sessionTime || "Sesi Utama", 5, false);

    // 5. Verification QR Code Simulation Box
    const qrSize = 18;
    const qrX = x + cardWidth - qrSize - 4;
    const qrY = dataY - 1;

    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(qrX, qrY, qrSize, qrSize, 2, 2, "FD");

    // QR Simulated Pixels
    doc.setFillColor(30, 41, 59);
    // 3 Corner Squares of QR code
    doc.rect(qrX + 2, qrY + 2, 4, 4, "F");
    doc.rect(qrX + qrSize - 6, qrY + 2, 4, 4, "F");
    doc.rect(qrX + 2, qrY + qrSize - 6, 4, 4, "F");
    // Center dots
    doc.rect(qrX + 7, qrY + 7, 4, 4, "F");
    doc.rect(qrX + 12, qrY + 9, 2, 2, "F");
    doc.rect(qrX + 9, qrY + 12, 2, 2, "F");

    doc.setFont("courier", "bold");
    doc.setFontSize(5.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      card.verificationCode.slice(0, 10),
      qrX + qrSize / 2,
      qrY + qrSize + 3,
      { align: "center" },
    );

    // 6. Signature & Validation Block (Bottom Right)
    const sigY = y + cardHeight - 32;
    const sigX = x + cardWidth - 42;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`${settings.city}, ${settings.dateStr}`, sigX, sigY);
    doc.text(settings.signerTitle, sigX, sigY + 3.5);

    // Signature Line
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text(settings.signerName, sigX, sigY + 15);
    doc.setLineWidth(0.2);
    doc.setDrawColor(51, 65, 85);
    const textWidth = doc.getTextWidth(settings.signerName);
    doc.line(sigX, sigY + 15.5, sigX + textWidth, sigY + 15.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.text(`NIP. ${settings.signerNip}`, sigX, sigY + 18.5);

    // 7. Student Signature & Photo Box (Bottom Left)
    const photoBoxWidth = 20;
    const photoBoxHeight = 25;
    const photoX = x + 4;
    const photoY = y + cardHeight - photoBoxHeight - 5;

    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.rect(photoX, photoY, photoBoxWidth, photoBoxHeight, "FD");

    doc.setFontSize(5.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Foto 2x3", photoX + photoBoxWidth / 2, photoY + 13, {
      align: "center",
    });

    // Instructions Footer
    doc.setFont("helvetica", "italic");
    doc.setFontSize(5.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      "*Kartu ini wajib dibawa saat pelaksanaan ujian & dilarang dipindahtangankan.",
      x + 4,
      y + cardHeight - 2,
    );
  }

  // Save PDF
  const defaultFilename = `kartu_ujian_${settings.institutionName.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now()}.pdf`;
  doc.save(options?.filename || defaultFilename);
}
