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
    if (!src || typeof Image === "undefined") {
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
 * Draws precision center cut lines separating the 6 cells of an A4 page (2 columns x 3 rows grid).
 */
function drawCutLines(doc: jsPDF, pageWidth: number, pageHeight: number) {
  doc.saveGraphicsState?.();
  doc.setDrawColor(160, 160, 160);
  doc.setLineWidth(0.25);
  doc.setLineDashPattern([2, 2], 0);

  // Vertical center cut line (at x = 105 mm)
  const cutX = pageWidth / 2; // 105 mm
  doc.line(cutX, 3, cutX, pageHeight - 3);

  // Horizontal cut lines for 3 rows (at y = 99 mm and y = 198 mm)
  const cutY1 = pageHeight / 3; // 99 mm
  const cutY2 = (pageHeight * 2) / 3; // 198 mm
  doc.line(3, cutY1, pageWidth - 3, cutY1);
  doc.line(3, cutY2, pageWidth - 3, cutY2);

  // Scissors cutting guide labels
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(130, 130, 130);
  doc.text("✂ Gunting di sini", cutX + 1.5, 5);
  doc.text("✂ Gunting di sini", 4, cutY1 - 1);
  doc.text("✂ Gunting di sini", 4, cutY2 - 1);

  doc.setLineDashPattern([], 0); // reset dash
  doc.restoreGraphicsState?.();
}

/**
 * Generates an official, print-ready PDF in 2 Columns x 3 Rows (6 cards per A4 page).
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

  // 2 Columns x 3 Rows Layout (6 cards per A4 page)
  const cols = 2;
  const rows = 3;
  const cardsPerPage = cols * rows; // 6 cards per page

  // Cell dimensions: 105 mm x 99 mm
  // Inside each cell, card is 95 mm x 90 mm with symmetrical 5 mm horizontal & 4.5 mm vertical padding
  const cardWidth = 95;
  const cardHeight = 90;
  const quadrantW = pageWidth / cols; // 105 mm
  const quadrantH = pageHeight / rows; // 99 mm

  // Schedule from settings or default blank rows
  const schedule =
    settings.schedule && settings.schedule.length > 0
      ? settings.schedule
      : DEFAULT_EXAM_CARD_SETTINGS.schedule;

  // Draw cut lines on the first page
  drawCutLines(doc, pageWidth, pageHeight);

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const indexOnPage = i % cardsPerPage;

    // Add new page after filling current page (every 6 cards)
    if (i > 0 && indexOnPage === 0) {
      doc.addPage();
      drawCutLines(doc, pageWidth, pageHeight);
    }

    const colIndex = indexOnPage % cols;
    const rowIndex = Math.floor(indexOnPage / cols);

    // Exact symmetrical offset: 5 mm from horizontal and 4.5 mm from vertical grid boundaries
    const x = colIndex * quadrantW + 5;
    const y = rowIndex * quadrantH + 4.5;

    // 1. Double Outer Frame (Rounded Corner)
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3);

    // Inner thin border
    doc.setLineWidth(0.2);
    doc.roundedRect(x + 1, y + 1, cardWidth - 2, cardHeight - 2, 2.5, 2.5);

    // 2. KOP SURAT (HEADER)
    const kopTop = y + 2;

    // Logo on Left
    const logoX = x + 2.5;
    const logoY = kopTop;
    const logoW = 9.5;
    const logoH = 11.5;

    if (logoImg) {
      try {
        doc.addImage(logoImg, "PNG", logoX, logoY, logoW, logoH);
      } catch (_e) {
        // Fallback without logo
      }
    } else {
      // Draw clean formal crest outline
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.25);
      doc.roundedRect(logoX + 0.5, logoY, 8.5, 10.5, 1, 1);
      doc.setFont("times", "bold");
      doc.setFontSize(3.8);
      doc.text("CBT", logoX + 4.75, logoY + 3.2, { align: "center" });
      doc.circle(logoX + 4.75, logoY + 6.2, 1.8);
      doc.setFontSize(3.0);
      const abbr = settings.institutionName
        ? settings.institutionName.slice(0, 6)
        : "AKSA";
      doc.text(abbr, logoX + 4.75, logoY + 9.5, { align: "center" });
    }

    // Kop Text Lines (Centered)
    const kopCenter = x + 2.5 + logoW + (cardWidth - 5 - logoW) / 2;

    doc.setTextColor(0, 0, 0);
    doc.setFont("times", "normal");
    doc.setFontSize(5.0);
    if (settings.governmentText) {
      doc.text(settings.governmentText, kopCenter, kopTop + 1.8, {
        align: "center",
      });
    }

    doc.setFont("times", "bold");
    doc.setFontSize(5.5);
    if (settings.departmentText) {
      doc.text(settings.departmentText, kopCenter, kopTop + 4.2, {
        align: "center",
      });
    }

    doc.setFontSize(6.2);
    doc.text(settings.institutionName, kopCenter, kopTop + 7.0, {
      align: "center",
    });

    doc.setFont("times", "normal");
    doc.setFontSize(4.6);
    if (settings.address) {
      doc.text(settings.address, kopCenter, kopTop + 9.4, {
        align: "center",
      });
    }

    doc.setFontSize(4.1);
    if (settings.contactText) {
      doc.text(settings.contactText, kopCenter, kopTop + 11.5, {
        align: "center",
      });
    }

    // Kode Pos (Centered)
    if (settings.postalCode) {
      doc.setFontSize(4.1);
      doc.text(`Kode Pos : ${settings.postalCode}`, kopCenter, kopTop + 13.5, {
        align: "center",
      });
    }

    // Divider: Thick top line + thin bottom line
    const dividerY = kopTop + (settings.postalCode ? 15.0 : 13.2);
    doc.setLineWidth(0.5);
    doc.line(x + 2, dividerY, x + cardWidth - 2, dividerY);
    doc.setLineWidth(0.2);
    doc.line(x + 2, dividerY + 0.4, x + cardWidth - 2, dividerY + 0.4);

    // 3. JUDUL KARTU (Centered)
    const cardCenter = x + cardWidth / 2;
    const titleY = dividerY + 2.6;

    doc.setFont("times", "bold");
    doc.setFontSize(6.8);
    doc.text(settings.cardHeaderTitle || "KARTU PESERTA", cardCenter, titleY, {
      align: "center",
    });

    doc.setFontSize(5.8);
    doc.text(settings.examTitle || card.examTitle, cardCenter, titleY + 2.8, {
      align: "center",
    });

    if (settings.academicYear) {
      doc.setFontSize(5.0);
      doc.text(
        `TAHUN PELAJARAN ${settings.academicYear}`,
        cardCenter,
        titleY + 5.2,
        {
          align: "center",
        },
      );
    }

    // 4. DATA SISWA
    const dataStartY = titleY + (settings.academicYear ? 7.2 : 5.2);
    const labelX = x + 3.5;
    const colonX = x + 23;
    const valX = x + 24.5;
    const lineSpacing = 2.15;

    const participantNo =
      card.seatNumber || (card.nisn ? `P${card.nisn}` : "-");
    const username = card.username || card.nisn || "-";
    const password =
      card.password ||
      (card.verificationCode?.length > 10
        ? card.verificationCode.slice(0, 8)
        : card.verificationCode || "-");

    doc.setFont("times", "normal");
    doc.setFontSize(5.3);

    // Row 1: Nomor Peserta
    doc.text("Nomor Peserta", labelX, dataStartY);
    doc.text(":", colonX, dataStartY);
    doc.setFont("times", "bold");
    doc.text(participantNo, valX, dataStartY);

    // Row 2: Username
    doc.setFont("times", "normal");
    doc.text("Username", labelX, dataStartY + lineSpacing);
    doc.text(":", colonX, dataStartY + lineSpacing);
    doc.setFont("times", "bold");
    doc.text(username, valX, dataStartY + lineSpacing);

    // Row 3: Password
    doc.setFont("times", "normal");
    doc.text("Password", labelX, dataStartY + lineSpacing * 2);
    doc.text(":", colonX, dataStartY + lineSpacing * 2);
    doc.text(password, valX, dataStartY + lineSpacing * 2);

    // Row 4: Nama Siswa
    doc.text("Nama Siswa", labelX, dataStartY + lineSpacing * 3);
    doc.text(":", colonX, dataStartY + lineSpacing * 3);
    doc.setFont("times", "bold");
    doc.text(card.fullName.toUpperCase(), valX, dataStartY + lineSpacing * 3, {
      maxWidth: cardWidth - (valX - x) - 3,
    });

    // Row 5: Kelas / Ruang
    doc.setFont("times", "normal");
    doc.text("Kelas / Ruang", labelX, dataStartY + lineSpacing * 4);
    doc.text(":", colonX, dataStartY + lineSpacing * 4);
    doc.text(
      `${card.className} / ${card.roomCode}`,
      valX,
      dataStartY + lineSpacing * 4,
    );

    // 5. TABEL JADWAL UJIAN
    const tableTitleY = dataStartY + lineSpacing * 4 + 2.4;
    doc.setFont("times", "bold");
    doc.setFontSize(5.4);
    doc.text(
      `JADWAL ${settings.examTitle || card.examTitle}`,
      cardCenter,
      tableTitleY,
      {
        align: "center",
      },
    );

    // Table Layout
    const tableX = x + 2.5;
    const tableW = cardWidth - 5; // 90 mm
    const tableTop = tableTitleY + 1.2;

    const colW1 = 20; // Hari/Tanggal
    const colW2 = 33; // Mata Pelajaran
    const colW3 = 23; // Waktu
    const colW4 = tableW - (colW1 + colW2 + colW3); // 14 mm TTD Pengawas

    const colX1 = tableX;
    const colX2 = colX1 + colW1;
    const colX3 = colX2 + colW2;
    const colX4 = colX3 + colW3;

    // Table Header Row
    const headerHeight = 3.2;
    doc.setFillColor(220, 225, 230);
    doc.rect(tableX, tableTop, tableW, headerHeight, "FD");

    doc.setFont("times", "bold");
    doc.setFontSize(4.8);
    doc.text("Hari/Tanggal", colX1 + colW1 / 2, tableTop + 2.2, {
      align: "center",
    });
    doc.text("Mata Pelajaran", colX2 + colW2 / 2, tableTop + 2.2, {
      align: "center",
    });
    doc.text("Waktu", colX3 + colW3 / 2, tableTop + 2.2, { align: "center" });
    doc.text("TTD", colX4 + colW4 / 2, tableTop + 2.2, { align: "center" });

    // Table Header Vertical Lines
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(colX2, tableTop, colX2, tableTop + headerHeight);
    doc.line(colX3, tableTop, colX3, tableTop + headerHeight);
    doc.line(colX4, tableTop, colX4, tableTop + headerHeight);

    // Table Data Rows (5 days, 2 subrows each)
    let currentY = tableTop + headerHeight;
    const subRowH = 2.15;
    const rowH = subRowH * 2; // 4.3 mm per day

    for (let r = 0; r < schedule.length; r++) {
      const item = schedule[r];
      const subj1 = item.subjects?.[0];
      const subj2 = item.subjects?.[1];

      // Row outer box
      doc.rect(tableX, currentY, tableW, rowH);

      // Vertical Dividers
      doc.line(colX2, currentY, colX2, currentY + rowH);
      doc.line(colX3, currentY, colX3, currentY + rowH);
      doc.line(colX4, currentY, colX4, currentY + rowH);

      // Horizontal Middle Divider for Subj1 and Subj2
      doc.line(colX2, currentY + subRowH, tableX + tableW, currentY + subRowH);

      // Col 1: Hari/Tanggal
      if (item.dayDate) {
        doc.setFont("times", "normal");
        doc.setFontSize(4.4);
        const lines = item.dayDate.split("\n");
        if (lines.length > 1) {
          doc.text(lines[0], colX1 + colW1 / 2, currentY + 1.8, {
            align: "center",
          });
          doc.text(lines[1], colX1 + colW1 / 2, currentY + 3.8, {
            align: "center",
          });
        } else {
          doc.text(item.dayDate, colX1 + colW1 / 2, currentY + 2.8, {
            align: "center",
          });
        }
      }

      // Col 2: Mata Pelajaran (Blank if empty)
      doc.setFont("times", "normal");
      doc.setFontSize(4.4);
      if (subj1?.name) {
        doc.text(subj1.name, colX2 + 1.5, currentY + 1.8, {
          maxWidth: colW2 - 2,
        });
      }
      if (subj2?.name) {
        doc.text(subj2.name, colX2 + 1.5, currentY + subRowH + 1.8, {
          maxWidth: colW2 - 2,
        });
      }

      // Col 3: Waktu (Blank if empty)
      if (subj1?.time) {
        doc.text(subj1.time, colX3 + colW3 / 2, currentY + 1.8, {
          align: "center",
        });
      }
      if (subj2?.time) {
        doc.text(subj2.time, colX3 + colW3 / 2, currentY + subRowH + 1.8, {
          align: "center",
        });
      }

      currentY += rowH;
    }

    // 6. TANDA TANGAN & PENGESAHAN (BOTTOM RIGHT)
    const sigX = x + cardWidth - 36;
    const sigY = currentY + 1.8;

    doc.setFont("times", "normal");
    doc.setFontSize(5.0);
    doc.text(settings.signerTitle, sigX, sigY);

    // Stempel jika ada gambar stempel yang diunggah
    if (settings.showStamp && stampImg) {
      const stampX = sigX - 4;
      const stampY = sigY - 1;
      try {
        doc.addImage(stampImg, "PNG", stampX, stampY, 10, 10);
      } catch (_e) {
        // Fallback
      }
    }

    // Signer Name
    doc.setTextColor(0, 0, 0);
    doc.setFont("times", "bold");
    doc.setFontSize(5.5);
    const signerNameY = sigY + 7.0;
    doc.text(settings.signerName, sigX, signerNameY);
    // Underline signer name
    const nameWidth = doc.getTextWidth(settings.signerName);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(sigX, signerNameY + 0.3, sigX + nameWidth, signerNameY + 0.3);

    // NIP
    if (settings.signerNip) {
      doc.setFont("times", "normal");
      doc.setFontSize(4.8);
      doc.text(`NIP. ${settings.signerNip}`, sigX, signerNameY + 2.3);
    }
  }

  // Save PDF
  const defaultFilename = `kartu_peserta_${settings.institutionName.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now()}.pdf`;
  doc.save(options?.filename || defaultFilename);
}
