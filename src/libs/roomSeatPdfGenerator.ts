import jsPDF from "jspdf";

export interface DeskLayoutPdfItem {
  row: number;
  col: number;
  seatNumber: string;
  studentName?: string | null;
  username?: string | null;
  className?: string | null;
}

export interface RoomLayoutPdfConfig {
  roomCode: string;
  roomName: string;
  rows: number;
  cols: number;
  schoolName?: string;
  examTitle?: string;
  desks: DeskLayoutPdfItem[];
}

/**
 * Generates a print-ready A4 Landscape PDF containing:
 * - Page 1: Visual 2D Classroom Desk Layout Map (Denah Tata Letak Meja Ruang Ujian)
 * - Page 2: Printable Room Attendance & Desk Roster Table (Daftar Nomor Meja & Absensi Ruang)
 */
export function generateRoomLayoutPdf(
  config: RoomLayoutPdfConfig,
  options?: { filename?: string },
): void {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4", // 297 x 210 mm
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const marginX = 12;
  const schoolName =
    config.schoolName || "AKSAVENTRA COMPUTER BASED TEST (CBT)";
  const examTitle =
    config.examTitle || "DENAH TATA LETAK MEJA & PENEMPATAN RUANG UJIAN";
  const occupiedCount = config.desks.filter((d) =>
    Boolean(d.studentName),
  ).length;
  const totalCapacity = config.rows * config.cols;

  // 1. Header Banner
  doc.setFillColor(13, 43, 92); // #0d2b5c
  doc.roundedRect(marginX, 10, pageWidth - marginX * 2, 20, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(examTitle.toUpperCase(), marginX + 5, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(200, 230, 240);
  doc.text(
    `${schoolName}  •  Ruang: ${config.roomCode} (${config.roomName})  •  Dimensi: ${config.rows} Baris × ${config.cols} Kolom (${occupiedCount}/${totalCapacity} Meja Terisi)`,
    marginX + 5,
    25,
  );

  // 2. Proctor Desk / Front of Classroom Box
  const proctorBoxW = 110;
  const proctorBoxX = (pageWidth - proctorBoxW) / 2;
  doc.setDrawColor(13, 43, 92);
  doc.setFillColor(241, 245, 249);
  doc.setLineWidth(0.4);
  doc.roundedRect(proctorBoxX, 34, proctorBoxW, 9, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(13, 43, 92);
  doc.text(
    `MEJA PENGAWAS & PAPAN TULIS (DEPAN RUANGAN ${config.roomCode})`,
    pageWidth / 2,
    39.8,
    { align: "center" },
  );

  // 3. 2D Desk Grid Area
  const gridTop = 47;
  const gridBottom = pageHeight - 14;
  const availW = pageWidth - marginX * 2;
  const availH = gridBottom - gridTop;

  const cols = Math.max(1, config.cols);
  const rows = Math.max(1, config.rows);
  const gapX = 2.5;
  const gapY = 2.5;

  const cellW = (availW - gapX * (cols - 1)) / cols;
  const cellH = Math.min(26, (availH - gapY * (rows - 1)) / rows);

  for (const desk of config.desks) {
    const cIdx = desk.col - 1;
    const rIdx = desk.row - 1;
    if (cIdx < 0 || cIdx >= cols || rIdx < 0 || rIdx >= rows) continue;

    const x = marginX + cIdx * (cellW + gapX);
    const y = gridTop + rIdx * (cellH + gapY);
    const hasStudent = Boolean(desk.studentName);

    // Desk Card Border & Background
    if (hasStudent) {
      doc.setDrawColor(0, 151, 167); // #0097a7
      doc.setFillColor(240, 253, 250);
    } else {
      doc.setDrawColor(203, 213, 225);
      doc.setFillColor(248, 250, 252);
    }
    doc.setLineWidth(0.35);
    doc.roundedRect(x, y, cellW, cellH, 1.5, 1.5, "FD");

    // Desk Header Strip (Seat Number + Coordinate)
    if (hasStudent) {
      doc.setFillColor(13, 43, 92);
    } else {
      doc.setFillColor(203, 213, 225);
    }
    doc.roundedRect(x, y, cellW, 5.5, 1.5, 1.5, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(
      hasStudent ? 255 : 71,
      hasStudent ? 255 : 85,
      hasStudent ? 255 : 105,
    );
    doc.text(desk.seatNumber, x + 2, y + 3.9);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.text(`B${desk.row}•K${desk.col}`, x + cellW - 2, y + 3.8, {
      align: "right",
    });

    if (hasStudent && desk.studentName) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.8);
      doc.setTextColor(15, 23, 42);
      const maxChars = Math.max(12, Math.floor(cellW / 1.65));
      const cleanName =
        desk.studentName.length > maxChars
          ? `${desk.studentName.slice(0, maxChars - 1)}…`
          : desk.studentName;
      doc.text(cleanName, x + 2, y + 10.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      doc.setTextColor(71, 85, 105);
      doc.text(desk.username || "-", x + 2, y + 14.5);

      if (desk.className) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6);
        doc.setTextColor(0, 151, 167);
        doc.text(`Kelas: ${desk.className}`, x + 2, y + 18.5);
      }
    } else {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(6.5);
      doc.setTextColor(148, 163, 184);
      doc.text("Meja Kosong", x + cellW / 2, y + cellH / 2 + 2, {
        align: "center",
      });
    }
  }

  // Footer Timestamp
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Dicetak otomatis oleh Aksaventra CBT pada ${new Date().toLocaleString("id-ID")}`,
    marginX,
    pageHeight - 5,
  );

  // Page 2: Printable Attendance & Desk Roster Table (Portrait or Landscape list)
  const occupiedDesks = [...config.desks]
    .filter((d) => Boolean(d.studentName))
    .sort((a, b) => a.seatNumber.localeCompare(b.seatNumber));

  if (occupiedDesks.length > 0) {
    doc.addPage("a4", "landscape");

    doc.setFillColor(13, 43, 92);
    doc.roundedRect(marginX, 10, pageWidth - marginX * 2, 16, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(
      `DAFTAR NOMOR MEJA & HADIR PESERTA - RUANG ${config.roomCode} (${config.roomName})`,
      marginX + 5,
      19.5,
    );

    const tableTop = 31;
    const rowH = 7;
    const colWidths = [25, 28, 45, 95, 35, 45]; // No Meja, Posisi, Username, Nama Siswa, Kelas, Paraf
    const headers = [
      "No. Meja",
      "Baris/Kolom",
      "NIS / Username",
      "Nama Lengkap Peserta",
      "Kelas",
      "Tanda Tangan",
    ];

    let curY = tableTop;
    const drawTableHeader = (yPos: number) => {
      doc.setFillColor(226, 232, 240);
      doc.rect(marginX, yPos, pageWidth - marginX * 2, rowH, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      let curX = marginX;
      headers.forEach((h, idx) => {
        doc.text(h, curX + 2, yPos + 4.8);
        curX += colWidths[idx];
      });
    };

    drawTableHeader(curY);
    curY += rowH;

    occupiedDesks.forEach((item, index) => {
      if (curY + rowH > pageHeight - 12) {
        doc.addPage("a4", "landscape");
        curY = 15;
        drawTableHeader(curY);
        curY += rowH;
      }

      if (index % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(marginX, curY, pageWidth - marginX * 2, rowH, "F");
      }

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.rect(marginX, curY, pageWidth - marginX * 2, rowH, "S");

      let curX = marginX;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(13, 43, 92);
      doc.text(item.seatNumber, curX + 2, curY + 4.8);
      curX += colWidths[0];

      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text(`B${item.row} • K${item.col}`, curX + 2, curY + 4.8);
      curX += colWidths[1];

      doc.text(item.username || "-", curX + 2, curY + 4.8);
      curX += colWidths[2];

      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(item.studentName || "-", curX + 2, curY + 4.8);
      curX += colWidths[3];

      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 151, 167);
      doc.text(item.className || "-", curX + 2, curY + 4.8);
      curX += colWidths[4];

      doc.setTextColor(148, 163, 184);
      doc.text(`${index + 1}. ..............`, curX + 2, curY + 4.8);

      curY += rowH;
    });
  }

  const filename =
    options?.filename ||
    `Denah_Meja_Ujian_${config.roomCode.replace(/\s+/g, "_")}.pdf`;
  doc.save(filename);
}

/**
 * Generates an A4 Portrait PDF of large Desk Number Stickers (2 columns x 4 rows = 8 stickers per page)
 * ready to be cut and pasted onto computer desks in the exam room.
 */
export function generateDeskNumberStickersPdf(
  config: RoomLayoutPdfConfig,
  options?: { filename?: string },
): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4", // 210 x 297 mm
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const cols = 2;
  const rows = 4;
  const perPage = cols * rows; // 8 stickers per page
  const cellW = pageWidth / cols; // 105 mm
  const cellH = pageHeight / rows; // 74.25 mm
  const boxW = 93;
  const boxH = 64;

  const desksToPrint = config.desks;

  for (let i = 0; i < desksToPrint.length; i++) {
    const desk = desksToPrint[i];
    const indexOnPage = i % perPage;

    if (i > 0 && indexOnPage === 0) {
      doc.addPage("a4", "portrait");
    }

    const cIdx = indexOnPage % cols;
    const rIdx = Math.floor(indexOnPage / cols);
    const x = cIdx * cellW + (cellW - boxW) / 2;
    const y = rIdx * cellH + (cellH - boxH) / 2;

    // Outer border
    doc.setDrawColor(13, 43, 92);
    doc.setLineWidth(0.7);
    doc.roundedRect(x, y, boxW, boxH, 3, 3, "S");

    // Top Navy Header
    doc.setFillColor(13, 43, 92);
    doc.roundedRect(x, y, boxW, 13, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text(
      `NOMOR MEJA UJIAN CBT  •  ${config.roomCode}`,
      x + boxW / 2,
      y + 8.2,
      { align: "center" },
    );

    // Giant Seat Number in the Center
    doc.setFont("helvetica", "bold");
    doc.setFontSize(32);
    doc.setTextColor(13, 43, 92);
    doc.text(desk.seatNumber, x + boxW / 2, y + 33, { align: "center" });

    // Student & Class Info at the Bottom
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(x + 6, y + 41, x + boxW - 6, y + 41);

    if (desk.studentName) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      const maxLen = 34;
      const displayName =
        desk.studentName.length > maxLen
          ? `${desk.studentName.slice(0, maxLen - 1)}…`
          : desk.studentName;
      doc.text(displayName, x + boxW / 2, y + 48.5, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(
        `NIS/User: ${desk.username || "-"}   |   Kelas: ${desk.className || "-"}`,
        x + boxW / 2,
        y + 55.5,
        { align: "center" },
      );
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Baris ${desk.row} • Kolom ${desk.col} (${config.roomName})`,
        x + boxW / 2,
        y + 51,
        { align: "center" },
      );
    }
  }

  const filename =
    options?.filename ||
    `Stiker_Nomor_Meja_${config.roomCode.replace(/\s+/g, "_")}.pdf`;
  doc.save(filename);
}
