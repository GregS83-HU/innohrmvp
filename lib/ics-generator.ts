// lib/ics-generator.ts

/**
 * Generate an ICS (iCalendar) file for email attachments
 * Compatible with Google Calendar, Outlook, Apple Calendar, etc.
 */

interface ICSEvent {
  title: string
  description: string
  location: string
  startTime: Date
  endTime: Date
  organizerEmail: string
  organizerName: string
  attendeeEmail: string
  attendeeName: string
}

export function generateICS(event: ICSEvent): string {
  const formatDate = (date: Date): string => {
    return date
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '')
  }

  const now = new Date()
  const uid = `${now.getTime()}@hrinno.hu`

  // Escape special characters for ICS format
  const escape = (str: string): string => {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
  }

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//HRInno//Interview Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatDate(now)}`,
    `DTSTART:${formatDate(event.startTime)}`,
    `DTEND:${formatDate(event.endTime)}`,
    `SUMMARY:${escape(event.title)}`,
    `DESCRIPTION:${escape(event.description)}`,
    `LOCATION:${escape(event.location)}`,
    `ORGANIZER;CN=${escape(event.organizerName)}:mailto:${event.organizerEmail}`,
    `ATTENDEE;CN=${escape(event.attendeeName)};RSVP=TRUE:mailto:${event.attendeeEmail}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Interview reminder',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  return ics
}

/**
 * Detect if location is a URL (meeting link)
 */
export function isURL(str: string): boolean {
  try {
    const url = new URL(str)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Format location for display
 */
export function formatLocation(location: string): {
  isVirtual: boolean
  displayText: string
  link?: string
} {
  if (isURL(location)) {
    return {
      isVirtual: true,
      displayText: 'Virtual Meeting',
      link: location,
    }
  }
  return {
    isVirtual: false,
    displayText: location,
  }
}