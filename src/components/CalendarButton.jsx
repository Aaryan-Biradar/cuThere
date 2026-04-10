'use client';

import { AddToCalendarButton } from 'add-to-calendar-button-react';

/**
 * Thin wrapper so we can dynamically import this component
 * with { ssr: false } from Next.js pages.
 */
export default function CalendarButton(props) {
  return <AddToCalendarButton {...props} />;
}
