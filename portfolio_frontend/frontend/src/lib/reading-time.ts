const WORDS_PER_MINUTE = 200;

/** Strip HTML tags and return plain text */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Estimate reading time in minutes from an HTML string */
export function getReadingTime(html: string): number {
  const text = stripHtml(html);
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

/** Format reading time as a display string */
export function formatReadingTime(html: string): string {
  const minutes = getReadingTime(html);
  return `${minutes} min read`;
}
