// File: utils/formatDate.ts
export const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('hu-HU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
