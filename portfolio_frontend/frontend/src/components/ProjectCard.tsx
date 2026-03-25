import Link from 'next/link';

const CATEGORY_LABELS: Record<string, string> = {
  'case-study': 'Case Study',
  'open-source': 'Open Source',
  'client-work': 'Client Work',
  'tutorial': 'Tutorial',
  'hardware': 'Hardware',
};

interface ProjectCardProps {
  title: string;
  description: string;
  tags: string[];
  slug?: string;
  link?: string;
  github?: string;
  hasBody?: boolean;
  isFeatured?: boolean;
  category?: string;
  readingTime?: string;
}

export default function ProjectCard({ title, description, tags, slug, link, github, hasBody, isFeatured, category, readingTime }: ProjectCardProps) {
  const cardClasses = [
    'group glass-effect rounded-xl p-6 transition-all duration-300 hover:shadow-lg',
    isFeatured
      ? 'border border-accent-200/50 dark:border-accent-800/50 hover:bg-accent-50/30 dark:hover:bg-accent-900/10'
      : 'border border-zinc-100/50 dark:border-zinc-800/50 hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60',
  ].join(' ');

  const categoryLabel = category ? CATEGORY_LABELS[category] || category : null;

  return (
    <div className={cardClasses}>
      <div className="mb-4 flex items-start justify-between">
        <div>
          {categoryLabel && (
            <span className="block text-xs font-semibold uppercase tracking-wider text-accent-600 dark:text-accent-400 mb-1.5">
              {categoryLabel}
            </span>
          )}
          {hasBody && slug ? (
            <Link href={`/projects/${slug}`} className="group/title">
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white group-hover/title:text-accent-500 dark:group-hover/title:text-accent-400 transition-all duration-300">
                {title}
              </h3>
            </Link>
          ) : (
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white group-hover:text-accent-500 dark:group-hover:text-accent-400 transition-all duration-300">
              {title}
            </h3>
          )}
        </div>
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
          >
            <svg className="w-5 h-5 text-accent-600 dark:text-accent-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1 group-hover:-translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10v10M7 17L17 7" />
            </svg>
          </a>
        )}
      </div>

      <p className="text-zinc-700 dark:text-zinc-300 mb-5 leading-relaxed text-sm md:text-base">
        {description}
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-block bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 text-xs font-medium px-3 py-1.5 rounded-full hover:bg-accent-200 dark:hover:bg-accent-900/50 transition-colors duration-200"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-zinc-200/50 dark:border-zinc-800/50">
        {hasBody && slug && (
          <Link
            href={`/projects/${slug}`}
            className="text-sm font-semibold text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 transition-colors duration-200 flex items-center gap-2 group/link"
          >
            Read more
            <svg className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 transition-colors duration-200 flex items-center gap-2 group/link"
          >
            View Project
            <svg className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        )}
        {github && (
          <a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors duration-200 flex items-center gap-2 group/github"
          >
            Code
            <svg className="w-3.5 h-3.5 group-hover/github:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        )}
        {readingTime && (
          <span className="ml-auto text-xs text-zinc-500 dark:text-zinc-400">
            {readingTime}
          </span>
        )}
      </div>
    </div>
  );
}
