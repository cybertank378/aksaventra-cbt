import jsPDF from "jspdf";
import type {
  ExamCardItemDTO,
  ExamCardSettings,
} from "@/modules/exam-cards/domain/dto/ExamCardDTO";
import { DEFAULT_EXAM_CARD_SETTINGS } from "@/modules/exam-cards/domain/dto/ExamCardDTO";

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
 * Generates an official, print-ready PDF matching the official Indonesian school card design.
 */
export async function generateExamCardsPdf(
  cards: ExamCardItemDTO[],
  settings: ExamCardSettings = DEFAULT_EXAM_CARD_SETTINGS,
  options?: { filename?: string },
): Promise<void> {
  if (!cards || cards.length === 0) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4", // 210 x 297 mm
  });

  // Pre-load logo and stamp if provided
  let logoImg: HTMLImageElement | null = null;
  if (settings.logoUrl) {
    logoImg = await loadImage(settings.logoUrl);
  }

  let stampImg: HTMLImageElement | null = null;
  if (settings.stampUrl) {
    stampImg = await loadImage(settings.stampUrl);
  }

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 12;
  const marginY = 10;

  // 2 cards per page (top and bottom) - standard Indonesian school card size
  const cardWidth = pageWidth - marginX * 2; // 186 mm
  const cardHeight = 132; // 132 mm
  const gapY = 8;
  const cardsPerPage = settings.cardsPerPage || 2;

  const schedule = settings.schedule || DEFAULT_EXAM_CARD_SETTINGS.schedule;

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const indexOnPage = i % cardsPerPage;

    // Add new page after filling current page
    if (i > 0 && indexOnPage === 0) {
      doc.addPage();
    }

    const x = marginX;
    const y = marginY + indexOnPage * (cardHeight + gapY);

    // 1. Double Outer Frame (Authentic official card border)
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.6);
    doc.rect(x, y, cardWidth, cardHeight);

    // Inner thin border
    doc.setLineWidth(0.25);
    doc.rect(x + 1.2, y + 1.2, cardWidth - 2.4, cardHeight - 2.4);

    // 2. KOP SURAT (HEADER)
    const kopCenter = x + cardWidth / 2;
    const kopTop = y + 4;

    // Logo on Left
    const logoX = x + 4;
    const logoY = kopTop;
    const logoW = 15;
    const logoH = 18;

    if (logoImg) {
      try {
        doc.addImage(logoImg, "PNG", logoX, logoY, logoW, logoH);
      } catch (_e) {
        // Fallback without logo
      }
    } else {
      // Draw official shield placeholder matching DKI Jakarta / Jaya Raya
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.roundedRect(logoX + 1, logoY, 13, 16, 1, 1);
      doc.setFont("times", "bold");
      doc.setFontSize(5);
      doc.text("JAYA RAYA", logoX + 7.5, logoY + 3.5, { align: "center" });
      doc.circle(logoX + 7.5, logoY + 8.5, 3.5);
      doc.setFontSize(4.5);
      doc.text("DKI", logoX + 7.5, logoY + 14, { align: "center" });
    }

    // Kop Text Lines
    doc.setTextColor(0, 0, 0);
    doc.setFont("times", "normal");
    doc.setFontSize(8.5);
    doc.text(settings.governmentText, kopCenter + 5, kopTop + 2.5, {
      align: "center",
    });

    doc.setFont("times", "bold");
    doc.setFontSize(9.5);
    doc.text(settings.departmentText, kopCenter + 5, kopTop + 6.5, {
      align: "center",
    });

    doc.setFontSize(10.5);
    doc.text(settings.institutionName, kopCenter + 5, kopTop + 10.5, {
      align: "center",
    });

    doc.setFont("times", "normal");
    doc.setFontSize(7.5);
    doc.text(settings.address, kopCenter + 5, kopTop + 14, {
      align: "center",
    });

    doc.setFontSize(7);
    doc.text(settings.contactText, kopCenter + 5, kopTop + 17, {
      align: "center",
    });

    // Kode Pos (Right aligned)
    doc.setFontSize(7);
    doc.text(`Kode Pos : ${settings.postalCode}`, x + cardWidth - 5, kopTop + 18.5, {
      align: "right",
    });

    // Divider: Thick top line + thin bottom line
    const dividerY = kopTop + 20;
    doc.setLineWidth(0.6);
    doc.line(x + 2, dividerY, x + cardWidth - 2, dividerY);
    doc.setLineWidth(0.2);
    doc.line(x + 2, dividerY + 0.7, x + cardWidth - 2, dividerY + 0.7);

    // 3. JUDUL KARTU
    const titleY = dividerY + 4.5;
    doc.setFont("times", "bold");
    doc.setFontSize(10.5);
    doc.text(settings.cardHeaderTitle, kopCenter, titleY, { align: "center" });

    doc.setFontSize(9.5);
    doc.text(settings.examTitle, kopCenter, titleY + 4, { align: "center" });

    doc.setFontSize(8.5);
    doc.text(`TAHUN PELAJARAN ${settings.academicYear}`, kopCenter, titleY + 7.5, {
      align: "center",
    });

    // 4. DATA SISWA
    const dataStartY = titleY + 11.5;
    const labelX = x + 5;
    const colonX = x + 34;
    const valX = x + 36;
    const lineSpacing = 3.6;

    const participantNo = card.seatNumber?.startsWith("P")
      ? card.seatNumber
      : card.nisn
        ? `P${card.nisn}`
        : card.seatNumber || "P72324001";
    const password = card.password || card.verificationCode?.slice(0, 8) || "-";

    doc.setFont("times", "normal");
    doc.setFontSize(8.5);

    // Row 1: Nomor Peserta
    doc.text("Nomor Peserta", labelX, dataStartY);
    doc.text(":", colonX, dataStartY);
    doc.setFont("times", "bold");
    doc.text(participantNo, valX, dataStartY);

    // Row 2: Password
    doc.setFont("times", "normal");
    doc.text("Password", labelX, dataStartY + lineSpacing);
    doc.text(":", colonX, dataStartY + lineSpacing);
    doc.text(password, valX, dataStartY + lineSpacing);

    // Row 3: Nama Siswa
    doc.text("Nama Siswa", labelX, dataStartY + lineSpacing * 2);
    doc.text(":", colonX, dataStartY + lineSpacing * 2);
    doc.setFont("times", "bold");
    doc.text(card.fullName.toUpperCase(), valX, dataStartY + lineSpacing * 2);

    // Row 4: Kelas / Ruang
    doc.setFont("times", "normal");
    doc.text("Kelas / Ruang", labelX, dataStartY + lineSpacing * 3);
    doc.text(":", colonX, dataStartY + lineSpacing * 3);
    doc.text(`${card.className} / ${card.roomCode}`, valX, dataStartY + lineSpacing * 3);

    // 5. TABEL JADWAL UJIAN
    const tableTitleY = dataStartY + lineSpacing * 4 + 1.5;
    doc.setFont("times", "bold");
    doc.setFontSize(8.5);
    doc.text(`JADWAL ${settings.examTitle}`, kopCenter, tableTitleY, {
      align: "center",
    });

    // Table Layout
    const tableX = x + 4;
    const tableW = cardWidth - 8; // 178 mm
    const tableTop = tableTitleY + 1.8;

    const colW1 = 38; // Hari/Tanggal
    const colW2 = 62; // Mata Pelajaran
    const colW3 = 46; // Waktu
    const colW4 = tableW - (colW1 + colW2 + colW3); // 32 mm TTD Pengawas

    const colX1 = tableX;
    const colX2 = colX1 + colW1;
    const colX3 = colX2 + colW2;
    const colX4 = colX3 + colW3;

    // Table Header Row
    const headerHeight = 5.2;
    doc.setFillColor(220, 225, 230);
    doc.rect(tableX, tableTop, tableW, headerHeight, "FD");

    doc.setFont("times", "bold");
    doc.setFontSize(7.5);
    doc.text("Hari/Tanggal", colX1 + colW1 / 2, tableTop + 3.5, { align: "center" });
    doc.text("Mata Pelajaran", colX2 + colW2 / 2, tableTop + 3.5, { align: "center" });
    doc.text("Waktu", colX3 + colW3 / 2, tableTop + 3.5, { align: "center" });
    doc.text("TTD Pengawas", colX4 + colW4 / 2, tableTop + 3.5, { align: "center" });

    // Table Header Vertical Lines
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(colX2, tableTop, colX2, tableTop + headerHeight);
    doc.line(colX3, tableTop, colX3, tableTop + headerHeight);
    doc.line(colX4, tableTop, colX4, tableTop + headerHeight);

    // Table Data Rows
    let currentY = tableTop + headerHeight;
    const subRowH = 4.4;
    const rowH = subRowH * 2; // 8.8 mm per day (2 subjects)

    for (let r = 0; r < schedule.length; r++) {
      const item = schedule[r];
      const subj1 = item.subjects[0];
      const subj2 = item.subjects[1];

      // Row outer box
      doc.rect(tableX, currentY, tableW, rowH);

      // Vertical Dividers
      doc.line(colX2, currentY, colX2, currentY + rowH);
      doc.line(colX3, currentY, colX3, currentY + rowH);
      doc.line(colX4, currentY, colX4, currentY + rowH);

      // Horizontal Middle Divider for Subj1 and Subj2
      doc.line(colX2, currentY + subRowH, tableX + tableW, currentY + subRowH);

      // Col 1: Hari/Tanggal (Centered across both sub-rows)
      doc.setFont("times", "normal");
      doc.setFontSize(7);
      const lines = item.dayDate.split("\n");
      if (lines.length > 1) {
        doc.text(lines[0], colX1 + colW1 / 2, currentY + 3.5, { align: "center" });
        doc.text(lines[1], colX1 + colW1 / 2, currentY + 6.8, { align: "center" });
      } else {
        doc.text(item.dayDate, colX1 + colW1 / 2, currentY + 5.2, { align: "center" });
      }

      // Col 2: Mata Pelajaran
      doc.text(subj1?.name || "-", colX2 + 3, currentY + 3.2);
      doc.text(subj2?.name || "-", colX2 + 3, currentY + subRowH + 3.2);

      // Col 3: Waktu (Centered)
      doc.text(subj1?.time || "-", colX3 + colW3 / 2, currentY + 3.2, { align: "center" });
      doc.text(subj2?.time || "-", colX3 + colW3 / 2, currentY + subRowH + 3.2, { align: "center" });

      currentY += rowH;
    }

    // 6. TANDA TANGAN & STEMPEL (BOTTOM RIGHT)
    const sigX = x + cardWidth - 62;
    const sigY = currentY + 2.5;

    doc.setFont("times", "normal");
    doc.setFontSize(7.5);
    doc.text(settings.signerTitle, sigX, sigY);

    // Signature Area (~11 mm)
    // Render circular official stamp if requested
    if (settings.showStamp) {
      const stampX = sigX - 7;
      const stampY = sigY - 2;

      if (stampImg) {
        try {
          doc.addImage(stampImg, "PNG", stampX, stampY, 18, 18);
        } catch (_e) {
          // Fallback
        }
      } else {
        // Vector Circular School Stamp in official purple/blue
        doc.saveGraphicsState?.();
        doc.setDrawColor(67, 56, 202); // Indigo/Purple #4338ca
        doc.setTextColor(67, 56, 202);
        doc.setLineWidth(0.35);
        doc.circle(stampX + 9, stampY + 9, 8.5);
        doc.setLineWidth(0.15);
        doc.circle(stampX + 9, stampY + 9, 8.0);
        doc.circle(stampX + 9, stampY + 9, 5.8);

        doc.setFont("times", "bold");
        doc.setFontSize(3.6);
        doc.text("PEMERINTAH PROVINSI", stampX + 9, stampY + 3.2, { align: "center" });
        doc.text("DINAS PENDIDIKAN", stampX + 9, stampY + 15.5, { align: "center" });
        doc.setFontSize(4.2);
        doc.text("SMPN 29", stampX + 9, stampY + 8.5, { align: "center" });
        doc.setFontSize(3.4);
        doc.text("JAKARTA", stampX + 9, stampY + 10.5, { align: "center" });
        doc.restoreGraphicsState?.();
      }
    }

    // Hand Signature simulation stroke
    doc.setDrawColor(30, 58, 138); // Dark blue
    doc.setLineWidth(0.35);
    doc.line(sigX + 10, sigY + 6, sigX + 22, sigY + 3);
    doc.line(sigX + 22, sigY + 3, sigX + 32, sigY + 7);
    doc.line(sigX + 32, sigY + 7, sigX + 44, sigY + 4);

    // Signer Name
    doc.setTextColor(0, 0, 0);
    doc.setFont("times", "bold");
    doc.setFontSize(8);
    const signerNameY = sigY + 11.5;
    doc.text(settings.signerName, sigX, signerNameY);
    // Underline signer name
    const nameWidth = doc.getTextWidth(settings.signerName);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(sigX, signerNameY + 0.4, sigX + nameWidth, signerNameY + 0.4);

    // NIP
    doc.setFont("times", "normal");
    doc.setFontSize(7);
    doc.text(`NIP. ${settings.signerNip}`, sigX, signerNameY + 3.2);

    // Dotted cutting guide line between Card 1 and Card 2
    if (cardsPerPage > 1 && indexOnPage === 0 && i + 1 < cards.length) {
      const cutY = y + cardHeight + gapY / 2;
      doc.setDrawColor(150, 150, 150);
      doc.setLineDashPattern([2, 2], 0);
      doc.line(marginX - 4, cutY, pageWidth - marginX + 4, cutY);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(6);
      doc.setTextColor(130, 130, 130);
      doc.text("✂ Gunting di sini", marginX + 4, cutY - 1);
      doc.setLineDashPattern([], 0); // reset dash
    }
  }

  // Save PDF
  const defaultFilename = `kartu_peserta_${settings.institutionName.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now()}.pdf`;
  doc.save(options?.filename || defaultFilename);
}
