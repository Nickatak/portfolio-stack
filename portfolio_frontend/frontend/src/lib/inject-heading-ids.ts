/** Inject id attributes into h2/h3 tags so TOC anchor links work */
export function injectHeadingIds(html: string): string {
  return html.replace(/<h([23])([^>]*)>(.*?)<\/h[23]>/gi, (match, level, attrs, content) => {
    if (/id\s*=/.test(attrs)) return match;
    const text = content.replace(/<[^>]*>/g, '').trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    return `<h${level}${attrs} id="${id}">${content}</h${level}>`;
  });
}
