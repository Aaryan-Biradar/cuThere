/**
 * Shared parsing + display for event dates (cards, detail page, home carousels).
 */

function isTbaLike(s) {
  const t = String(s).trim();
  if (!t) return true;
  return /^date\s*tba$/i.test(t) || /^time\s*tba$/i.test(t) || /^tba$/i.test(t) || /^n\/?a$/i.test(t);
}

/**
 * @returns {Date | null}
 */
export function parseEventDate(dateString) {
  if (dateString == null) return null;
  const trimmed = String(dateString).trim();
  if (!trimmed || isTbaLike(trimmed)) return null;

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const y = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    const d = new Date(y, month - 1, day);
    if (Number.isNaN(d.getTime())) return null;
    // Common DB / export placeholders for “no real date”
    if (y === 1970 && month === 1 && day === 1) return null;
    if (y === 1 && month === 1 && day === 1) return null;
    if (y === 0) return null;
    return d;
  }

  // Month/day only (no year in string): infer year — current calendar year, with
  // academic-year pivot (June+ → previous year) so fall/winter aren’t mapped to next calendar year.
  const cleaned = trimmed.replace(/\b(\d+)(st|nd|rd|th)\b/gi, '$1');
  const currentYear = new Date().getFullYear();
  let date = new Date(`${cleaned}, ${currentYear}`);
  if (Number.isNaN(date.getTime())) return null;
  const eventMonth = date.getMonth();
  if (eventMonth > 4) {
    date.setFullYear(currentYear - 1);
  }
  return date;
}

/**
 * Human-friendly date; empty if unparseable (caller may show “Date Unknown”).
 * @param {{ omitYearIfCurrent?: boolean }} [options] — Event cards omit the year when it matches this calendar year.
 */
export function formatDisplayDate(dateString, options = {}) {
  const { omitYearIfCurrent = false } = options;
  if (!dateString) return '';
  const trimmed = String(dateString).trim();
  const thisYear = new Date().getFullYear();

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, yearStr, month, day] = isoMatch;
    const y = Number(yearStr);
    const m = Number(month);
    const d = Number(day);
    if (m < 1 || m > 12 || d < 1 || d > 31) return '';
    const date = new Date(y, m - 1, d, 12);
    if (omitYearIfCurrent && y === thisYear) {
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  const parsed = parseEventDate(trimmed);
  if (parsed) {
    if (omitYearIfCurrent && parsed.getFullYear() === thisYear) {
      return parsed.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    }
    return parsed.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return trimmed.replace(/\b(\d+)(st|nd|rd|th)\b/gi, '$1');
}

function timeIsPresent(time) {
  if (time == null) return false;
  const t = String(time).trim();
  if (!t || isTbaLike(t)) return false;
  return true;
}

/**
 * Card + detail line: “Date Unknown” when date missing/placeholder; optional time suffix.
 * @param {{ omitYearIfCurrent?: boolean }} [options] — pass `{ omitYearIfCurrent: true }` from EventCard only.
 */
export function formatEventDateTime(date, time, options = {}) {
  const raw = date == null ? '' : String(date).trim();
  const parsed = parseEventDate(raw);
  if (!parsed) {
    return timeIsPresent(time) ? `Date Unknown · ${String(time).trim()}` : 'Date Unknown';
  }
  const displayDate = formatDisplayDate(raw, options);
  const thisYear = new Date().getFullYear();
  const dateLabel =
    displayDate ||
    (options.omitYearIfCurrent && parsed.getFullYear() === thisYear
      ? parsed.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
      : parsed.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
  return timeIsPresent(time) ? `${dateLabel} · ${String(time).trim()}` : dateLabel;
}
