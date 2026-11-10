/**
 * Utility functions for Excel-compatible CSV parsing and export.
 * Supports UTF-8 BOM (\uFEFF) and semicolon (;) delimiter for Microsoft Excel compatibility.
 */

export interface ParsedCsvResult {
  headers: string[];
  rows: Record<string, string>[];
  rawRows: string[][];
  totalRows: number;
}

/**
 * Strips UTF-8 BOM from string if present.
 */
export function stripBom(text: string): string {
  if (text.charCodeAt(0) === 0xfeff) {
    return text.slice(1);
  }
  return text;
}

/**
 * Detects delimiter (semicolon or comma).
 */
export function detectDelimiter(headerLine: string): ";" | "," {
  return headerLine.includes(";") ? ";" : ",";
}

/**
 * Parses CSV text into headers and structured row objects.
 */
export function parseCsvText(csvText: string): ParsedCsvResult {
  const cleanText = stripBom(csvText);
  const lines = cleanText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return { headers: [], rows: [], rawRows: [], totalRows: 0 };
  }

  const delimiter = detectDelimiter(lines[0]);

  // Helper to split a CSV line respecting quotes
  const splitLine = (line: string): string[] => {
    const regex = new RegExp(
      `(?:^|${delimiter})(?:"([^"]*(?:""[^"]*)*)"|([^"${delimiter}]*))`,
      "g",
    );
    const matches: string[] = [];
    let match: RegExpExecArray | null;

    while (true) {
      match = regex.exec(line);
      if (!match) break;
      let val =
        match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2];
      val = (val || "").trim();
      matches.push(val);
      if (regex.lastIndex >= line.length) break;
    }
    return matches;
  };

  const rawHeaders = splitLine(lines[0]);
  const cleanHeaders = rawHeaders.map((h) =>
    h
      .toLowerCase()
      .replace(/[^a-z0-9_]/gi, "_")
      .replace(/^_+|_+$/g, ""),
  );

  const rows: Record<string, string>[] = [];
  const rawRows: string[][] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitLine(lines[i]);
    if (values.length === 0 || (values.length === 1 && values[0] === "")) {
      continue;
    }

    const rowObj: Record<string, string> = {};
    for (let j = 0; j < cleanHeaders.length; j++) {
      const headerKey = cleanHeaders[j] || `col_${j}`;
      rowObj[headerKey] = values[j] || "";
    }
    rows.push(rowObj);
    rawRows.push(values);
  }

  return {
    headers: cleanHeaders,
    rows,
    rawRows,
    totalRows: rows.length,
  };
}

/**
 * Reads a File object as text and parses it into structured CSV rows.
 */
export async function parseCsvFile(file: File): Promise<ParsedCsvResult> {
  const text = await file.text();
  return parseCsvText(text);
}

/**
 * Generates an Excel-compatible CSV string with UTF-8 BOM (\uFEFF) and semicolon (;) delimiter.
 */
export function generateExcelCsv(
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][],
  delimiter = ";",
): string {
  const escapeCell = (
    val: string | number | boolean | null | undefined,
  ): string => {
    if (val === null || val === undefined) return "";
    const str = String(val);
    if (
      str.includes(delimiter) ||
      str.includes('"') ||
      str.includes("\n") ||
      str.includes("\r")
    ) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerRow = headers.map(escapeCell).join(delimiter);
  const dataRows = rows
    .map((r) => r.map(escapeCell).join(delimiter))
    .join("\r\n");

  return `\uFEFF${headerRow}\r\n${dataRows}\r\n`;
}

/**
 * Triggers a browser download of CSV content with proper UTF-8 BOM.
 */
export function downloadCsvBlob(csvContent: string, filename: string): void {
  const contentWithBom = csvContent.startsWith("\uFEFF")
    ? csvContent
    : `\uFEFF${csvContent}`;

  const blob = new Blob([contentWithBom], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
