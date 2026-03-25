interface TocEntry {
  level: number;
  text: string;
  id: string;
}

function parseHeadings(html: string): TocEntry[] {
  const headings: TocEntry[] = [];
  const regex = /<h([23])[^>]*>(.*?)<\/h[23]>/gi;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1], 10);
    const text = match[2].replace(/<[^>]*>/g, '').trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    headings.push({ level, text, id });
  }

  return headings;
}

interface TableOfContentsProps {
  html: string;
}

export default function TableOfContents({ html }: TableOfContentsProps) {
  const headings = parseHeadings(html);

  if (headings.length < 3) return null;

  return (
    <nav className="mb-12 p-6 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/30 border border-zinc-200/50 dark:border-zinc-700/50">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-4">
        Table of Contents
      </h2>
      <ul className="space-y-2">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={heading.level === 3 ? 'ml-4' : ''}
          >
            <a
              href={`#${heading.id}`}
              className="text-sm text-zinc-600 dark:text-zinc-300 hover:text-accent-600 dark:hover:text-accent-400 transition-colors"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
