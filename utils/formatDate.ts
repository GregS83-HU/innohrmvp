// File: utils/formatDate.ts

/**
 * Format date string to Hungarian locale format
 * Handles both ISO date strings (YYYY-MM-DD) and ISO datetime strings
 * Uses UTC to avoid timezone conversion issues
 */
export const formatDate = (dateString: string) => {
  // Parse the date string
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.error('Invalid date string:', dateString);
    return dateString; // Return original string if invalid
  }

  // Extract year, month, day in UTC to avoid timezone issues
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  
  // Create a new date using UTC components
  const utcDate = new Date(Date.UTC(year, month, day));
  
  return utcDate.toLocaleDateString('hu-HU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC' // Force UTC interpretation
  });
};