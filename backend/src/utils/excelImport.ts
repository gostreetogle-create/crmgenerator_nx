// Eve-BE: API-IMPORT-EXCEL-003 — чтение .xlsx/.xls из multipart (memory) для импортов справочников
import type { Express } from 'express';
import * as XLSX from 'xlsx';
import { HttpError } from '../errors/HttpError';

type ExcelRow = Record<string, unknown>;

const normalizeKey = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[_-]/g, '');

export const readExcelRows = (
  file: Express.Multer.File | undefined,
  preferredSheetNames: string[],
): ExcelRow[] => {
  if (!file) {
    throw new HttpError(400, 'Excel file is required in form-data field "file"');
  }

  if (!file.originalname.match(/\.(xlsx|xls)$/i)) {
    throw new HttpError(400, 'Only .xlsx/.xls files are supported');
  }

  const workbook = XLSX.read(file.buffer, { type: 'buffer' });
  const normalizedPreferred = new Set(preferredSheetNames.map(normalizeKey));
  const selectedSheetName =
    workbook.SheetNames.find((name) => normalizedPreferred.has(normalizeKey(name))) ??
    workbook.SheetNames[0];

  if (!selectedSheetName) {
    throw new HttpError(400, 'Excel file has no sheets');
  }

  const sheet = workbook.Sheets[selectedSheetName];
  const rows = XLSX.utils.sheet_to_json<ExcelRow>(sheet, {
    defval: '',
    raw: false,
  });

  return rows;
};

export const pickCellValue = (row: ExcelRow, aliases: string[]): unknown => {
  const byNormalizedKey = new Map<string, unknown>();
  for (const [key, value] of Object.entries(row)) {
    byNormalizedKey.set(normalizeKey(key), value);
  }

  for (const alias of aliases) {
    const found = byNormalizedKey.get(normalizeKey(alias));
    if (found !== undefined && found !== null && String(found).trim() !== '') {
      return found;
    }
  }

  return undefined;
};

export const asOptionalString = (value: unknown): string | undefined => {
  if (value === undefined || value === null) return undefined;
  const v = String(value).trim();
  return v.length ? v : undefined;
};

export const asOptionalBoolean = (value: unknown): boolean | undefined => {
  if (value === undefined || value === null || String(value).trim() === '') return undefined;
  const v = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'y', 'да', 'активен'].includes(v)) return true;
  if (['0', 'false', 'no', 'n', 'нет', 'неактивен'].includes(v)) return false;
  return undefined;
};

export const asOptionalInt = (value: unknown): number | undefined => {
  if (value === undefined || value === null || String(value).trim() === '') return undefined;
  const n = Number(String(value).replace(',', '.'));
  if (!Number.isFinite(n)) return undefined;
  return Math.trunc(n);
};
