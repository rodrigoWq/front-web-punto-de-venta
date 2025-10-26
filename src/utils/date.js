// src/utils/date.js
// Utilidades simples para formatear fechas entre DD/MM/AAAA (vista) y YYYY-MM-DD (API).

function pad(value) {
  return String(value).padStart(2, '0');
}

export function toDisplayDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function toApiDate(displayValue) {
  if (!displayValue) return '';
  const parts = displayValue.split('/');
  if (parts.length !== 3) return '';
  const [day, month, year] = parts.map(p => parseInt(p, 10));
  if (!day || !month || !year) return '';
  const isoCandidate = new Date(year, month - 1, day);
  if (
    Number.isNaN(isoCandidate.getTime()) ||
    isoCandidate.getDate() !== day ||
    isoCandidate.getMonth() !== month - 1 ||
    isoCandidate.getFullYear() !== year
  ) {
    return '';
  }
  return `${isoCandidate.getFullYear()}-${pad(isoCandidate.getMonth() + 1)}-${pad(isoCandidate.getDate())}`;
}

export function todayDisplay() {
  const now = new Date();
  return `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
}
