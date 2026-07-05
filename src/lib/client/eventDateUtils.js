/**
 * Shared parsing + display for event dates and times (cards, detail page, home carousels).
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

  const cleaned = trimmed.replace(/\b(\d+)(st|nd|rd|th)\b/gi, '$1');

  // A non-ISO string that already names a 4-digit year ("October 10, 2026"): parse it
  // as-is — appending another year or applying the pivot below would corrupt it.
  if (/\b(19|20)\d{2}\b/.test(cleaned)) {
    const withYear = new Date(cleaned);
    return Number.isNaN(withYear.getTime()) ? null : withYear;
  }

  // Month/day only (no year in string): infer the year. Scraped dates are ISO-normalized
  // at ingest, so year-less rows are legacy data from the current ACADEMIC year. A
  // June-December month name therefore means the previous calendar year — but only while
  // "now" is in the January-May half; during June-December it names the semester
  // currently in progress, i.e. this calendar year.
  const currentYear = new Date().getFullYear();
  const date = new Date(`${cleaned}, ${currentYear}`);
  if (Number.isNaN(date.getTime())) return null;
  const nowMonth = new Date().getMonth();
  const eventMonth = date.getMonth();
  if (nowMonth <= 4 && eventMonth > 4) {
    date.setFullYear(currentYear - 1);
  }
  return date;
}

/**
 * Human-friendly label for an already-parsed date.
 * @param {{ omitYearIfCurrent?: boolean }} [options] — Event cards omit the year when it matches this calendar year.
 */
function formatParsed(parsed, { omitYearIfCurrent = false } = {}) {
  const opts = { month: 'long', day: 'numeric' };
  if (!(omitYearIfCurrent && parsed.getFullYear() === new Date().getFullYear())) {
    opts.year = 'numeric';
  }
  return parsed.toLocaleDateString('en-US', opts);
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
  const dateLabel = formatParsed(parsed, options);
  return timeIsPresent(time) ? `${dateLabel} · ${String(time).trim()}` : dateLabel;
}

/**
 * Converts a 12-hour time string (e.g. "6:00 PM", "11:30 AM") to
 * 24-hour HH:mm format (e.g. "18:00", "11:30").
 * Returns null if the string can't be parsed.
 */
export function to24Hour(timeStr) {
  if (!timeStr) return null;
  const match = String(timeStr).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    // Already in 24h format like "18:00"?
    const mil = String(timeStr).trim().match(/^(\d{1,2}):(\d{2})$/);
    if (mil) return `${mil[1].padStart(2, '0')}:${mil[2]}`;
    return null;
  }
  let [, hours, minutes, period] = match;
  hours = Number(hours);
  if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
  if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
  return `${String(hours).padStart(2, '0')}:${minutes}`;
}

/**
 * Given a start time in HH:mm, estimates an end time 90 minutes (1.5 hours) later.
 * Returns { time, wrapsPastMidnight } or null. Callers building calendar entries must
 * roll the end DATE to the next day when the estimate crosses midnight — otherwise the
 * entry would end before it starts.
 */
export function estimateEndTime(startTime24) {
  if (!startTime24) return null;
  const [h, m] = startTime24.split(':').map(Number);
  const total = h * 60 + m + 90;
  const end = total % (24 * 60);
  const endHour = Math.floor(end / 60);
  const endMin = end % 60;
  return {
    time: `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`,
    wrapsPastMidnight: total >= 24 * 60,
  };
}

/** Local-time YYYY-MM-DD for a Date. */
export function toIsoDateString(date) {
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${mo}-${d}`;
}

/**
 * Normalize any event date string to YYYY-MM-DD (for the calendar button), or '' when it
 * can't be. Already-ISO strings pass through untouched — routing them through
 * parseEventDate would reject placeholders (1970-01-01) or shift invalid dates.
 */
export function normalizeToIsoDate(dateString) {
  const raw = dateString == null ? '' : String(dateString).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const parsed = parseEventDate(raw);
  return parsed ? toIsoDateString(parsed) : '';
}

/** The ISO date one day after `isoDate` (UTC math — immune to DST edges). */
export function nextIsoDate(isoDate) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}
