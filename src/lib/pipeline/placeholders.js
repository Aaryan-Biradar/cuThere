/**
 * Single source of truth for the shared value-shape vocabulary of the dedup, merge,
 * and insert paths: the "TBA / empty" placeholder strings (so an empty/placeholder
 * value is never treated as a real one, and a real value is never overwritten by a
 * placeholder) and the ISO date shape used to tell precise dates from vague ones.
 */

// A concrete, sortable YYYY-MM-DD date (as produced by normalizeEventDate).
export const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// Normalized (lowercased, trimmed) placeholder strings.
const PLACEHOLDERS = new Set(['', 'tba', 'date tba', 'time tba', 'location tba', 'untitled event', 'n/a']);

// True for null/undefined or any known placeholder string.
export function isPlaceholder(value) {
    if (value == null) return true;
    return PLACEHOLDERS.has(String(value).trim().toLowerCase());
}

// Convenience inverse: a genuine, non-placeholder value.
export function isReal(value) {
    return !isPlaceholder(value);
}

// Sentinel fallbacks written when the AI gives us nothing real for a field.
export const UNTITLED_EVENT = 'Untitled Event';
export const DATE_TBA = 'Date TBA';
export const TIME_TBA = 'Time TBA';
export const LOCATION_TBA = 'Location TBA';
