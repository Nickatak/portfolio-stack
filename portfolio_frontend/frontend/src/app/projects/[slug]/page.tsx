import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import BffUnavailable from '@/components/BffUnavailable';
import TableOfContents from '@/components/TableOfContents';
import { getProject, getPortfolioContentSafe } from '@/lib/bff';
import { formatReadingTime } from '@/lib/reading-time';
import { injectHeadingIds } from '@/lib/inject-heading-ids';

type PageParams = { slug: string };

export async function generateMetadata({ params }: { params: Promise<PageParams> }) {
  const { slug } = await params;
  try {
    const project = await getProject(slug);
    return {
      title: `${project.title} | Nick Takemori`,
      description: project.description,
    };
  } catch {
    return { title: 'Project Not Found' };
  }
}

const CATEGORY_LABELS: Record<string, string> = {
  'case-study': 'Case Study',
  'open-source': 'Open Source',
  'client-work': 'Client Work',
  'tutorial': 'Tutorial',
  'hardware': 'Hardware',
};

function formatPublishedDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default async function ProjectDetail({ params }: { params: Promise<PageParams> }) {
  const { slug } = await params;
  const { content, error } = await getPortfolioContentSafe();
  if (!content) return <BffUnavailable error={error} />;

  let project;
  try {
    project = await getProject(slug);
  } catch {
    notFound();
  }

  const categoryLabel = project.category ? CATEGORY_LABELS[project.category] || project.category : null;
  const readingTime = project.body ? formatReadingTime(project.body) : null;
  const processedBody = project.body ? injectHeadingIds(project.body) : null;

  return (
    <>
      <Navigation displayName={content.site.displayName} />
      <main className="min-h-screen">
        <div className="max-w-3xl mx-auto px-6 pt-20 pb-12 md:pt-32 md:pb-20">
          {/* Header */}
          <section className="mb-12 animate-fade-in-up">
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors mb-8"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              All Projects
            </Link>

            {categoryLabel && (
              <span className="block text-xs font-semibold uppercase tracking-wider text-accent-400 mb-3">
                {categoryLabel}
              </span>
            )}

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{project.title}</h1>
            <div className="w-16 h-1 bg-accent-500 rounded-full mb-6" />

            {/* Meta line: published date + reading time */}
            {(project.publishedDate || readingTime) && (
              <div className="flex items-center gap-3 text-sm text-zinc-400 mb-6">
                {project.publishedDate && (
                  <span>{formatPublishedDate(project.publishedDate)}</span>
                )}
                {project.publishedDate && readingTime && (
                  <span className="text-zinc-600">·</span>
                )}
                {readingTime && <span>{readingTime}</span>}
              </div>
            )}

            <p className="text-lg text-zinc-200 leading-relaxed mb-6">
              {project.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 text-xs font-medium px-3 py-1.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Links */}
            <div className="flex gap-4">
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-all duration-200 text-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  View on GitHub
                </a>
              )}
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent-600 hover:bg-accent-700 text-white font-medium transition-all duration-200 text-sm"
                >
                  View Live
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7m10 0v10" />
                  </svg>
                </a>
              )}
              {!project.github && !project.link && (
                <span className="text-sm text-zinc-300 italic">
                  Source available on request - this project is in active development.
                </span>
              )}
            </div>
          </section>

          {/* Table of Contents */}
          {processedBody && <TableOfContents html={processedBody} />}

          {/* Body content */}
          {processedBody && (
            <section className="prose prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: processedBody }} />
            </section>
          )}

          {/* Back link */}
          <div className="mt-16 pt-8 border-t border-zinc-200/50 dark:border-zinc-800/50">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300 font-semibold group"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to all projects
            </Link>
          </div>
        </div>
      </main>
      <Footer
        displayName={content.site.displayName}
        contactEmail={content.site.contactEmail}
        socialLinks={content.socialLinks}
      />
    </>
  );
}
