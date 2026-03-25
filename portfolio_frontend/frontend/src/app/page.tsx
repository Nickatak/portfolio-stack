import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ProjectCard from '@/components/ProjectCard';
import SkillsPreview from '@/components/SkillsPreview';
import { getPortfolioContentSafe } from '@/lib/bff';
import BffUnavailable from '@/components/BffUnavailable';

export const metadata = {
  title: 'Nick Takemori | Full Stack Developer',
  description: 'Full-stack developer focused on domain modeling, event-driven systems, and clean architecture.',
};

export default async function Home() {
  const { content, error } = await getPortfolioContentSafe();

  if (!content) {
    return <BffUnavailable error={error} />;
  }

  const featuredProjects = content.projects.filter((p) => p.isFeatured);

  return (
    <>
      <Navigation displayName={content.site.displayName} />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="max-w-5xl mx-auto px-6 pt-32 pb-20 md:pt-40 md:pb-32">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 tracking-tight">
              I design systems that
              <br />
              <span className="text-accent-500 dark:text-accent-400">explain themselves</span>
            </h1>

            <p className="text-lg md:text-xl text-zinc-700 dark:text-zinc-300 max-w-2xl leading-relaxed mb-8">
              I&apos;m {content.site.displayName}, a full-stack developer. I build applications with clear boundaries, explicit contracts, and architecture that communicates intent. In doing so, I utilize strong domain modeling and event-driven pipelines to create systems that other engineers can pick up and trust.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/projects"
                className="px-8 py-3 rounded-lg bg-accent-600 hover:bg-accent-700 text-white font-semibold transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 inline-flex items-center justify-center gap-2"
              >
                See My Work
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7m10 0v10" />
                </svg>
              </a>
              <a
                href="/contact"
                className="px-8 py-3 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-all duration-200 inline-flex items-center justify-center gap-2"
              >
                Get in Touch
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* Featured Projects */}
        <section className="max-w-5xl mx-auto px-6 py-16 md:py-24">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Featured Work</h2>
            <div className="w-16 h-1 bg-accent-500 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {featuredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                slug={project.slug}
                title={project.title}
                description={project.description}
                tags={project.tags}
                link={project.link}
                github={project.github}
                hasBody={project.hasBody}
                isFeatured={project.isFeatured}
                category={project.category}
                readingTime={project.readingTime ? `${project.readingTime} min read` : undefined}
              />
            ))}
          </div>

          <div className="text-center">
            <a
              href="/projects"
              className="inline-flex items-center gap-2 text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300 font-semibold group"
            >
              View all projects
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </section>

        {/* How This Site Works teaser */}
        <section className="max-w-5xl mx-auto px-6 py-16 md:py-24">
          <Link href="/projects/portfolio-stack" className="block group">
            <div className="glass-effect rounded-2xl p-10 md:p-14 bg-accent-600/5 dark:bg-accent-900/10 border border-accent-200/30 dark:border-accent-900/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              <span className="inline-block text-xs font-semibold uppercase tracking-wider text-accent-600 dark:text-accent-400 mb-3">
                Architecture
              </span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3 text-zinc-900 dark:text-white">
                How This Site Works
              </h2>
              <p className="text-zinc-700 dark:text-zinc-300 max-w-2xl leading-relaxed mb-4">
                This portfolio runs on four services across three languages, connected by a Kafka event bus. Book an appointment and it flows through a C# API, into Kafka, and out as an email notification. This architecture is overkill for a portfolio by design. It&apos;s a working system where I can talk through real architectural trade-offs, not just describe them in the abstract.
              </p>
              <span className="inline-flex items-center gap-2 text-accent-600 dark:text-accent-400 font-semibold group-hover:gap-3 transition-all">
                Read the architecture breakdown
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>
        </section>

        {/* Skills Preview */}
        <SkillsPreview skills={content.skills} />

        {/* CTA Section */}
        <section className="max-w-5xl mx-auto px-6 py-16 md:py-24 mb-12">
          <div className="glass-effect rounded-2xl p-12 md:p-16 text-center bg-accent-600/5 dark:bg-accent-900/10 border border-accent-200/30 dark:border-accent-900/30">
            <p className="text-lg text-zinc-700 dark:text-zinc-300 mb-8 max-w-2xl mx-auto">
              I&apos;m primarily interested in roles where architecture, code quality, and ergonomics aren&apos;t afterthoughts. I&apos;d like to hear about what you&apos;re building.
            </p>
            <a
              href="/contact"
              className="inline-block px-8 py-3 rounded-lg bg-accent-600 hover:bg-accent-700 text-white font-semibold transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            >
              Let&apos;s Talk
            </a>
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              Open to remote, full-time, and contract roles.
            </p>
          </div>
        </section>
      </main>
      <Footer
        displayName={content.site.displayName}
        contactEmail={content.site.contactEmail}
        socialLinks={content.socialLinks}
      />
    </>
  );
}
