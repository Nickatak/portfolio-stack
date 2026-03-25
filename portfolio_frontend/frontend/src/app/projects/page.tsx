import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ProjectCard from '@/components/ProjectCard';
import { getPortfolioContentSafe } from '@/lib/bff';
import BffUnavailable from '@/components/BffUnavailable';

export const metadata = {
  title: 'Projects | Nick Takemori',
  description: 'Featured projects and case studies.',
};

export default async function Projects() {
  const { content, error } = await getPortfolioContentSafe();
  if (!content) {
    return <BffUnavailable error={error} />;
  }

  const featured = content.projects.filter((p) => p.isFeatured);
  const other = content.projects.filter((p) => !p.isFeatured);

  return (
    <>
      <Navigation displayName={content.site.displayName} />
      <main className="min-h-screen">
        <div className="max-w-5xl mx-auto px-6 pt-20 pb-12 md:pt-32 md:pb-20">
          <section className="mb-16 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Projects</h1>
            <div className="w-16 h-1 bg-accent-500 rounded-full mb-6" />
            <p className="text-lg md:text-xl text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-3xl">
              Each project is built to explore a specific set of problems and in doing so provides ample opportunities for case studies to dive deeper into the architecture and decisions behind the work.
            </p>
          </section>

          {featured.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {featured.map((project) => (
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
          )}

          {other.length > 0 && (
            <>
              {featured.length > 0 && (
                <h2 className="text-2xl font-bold tracking-tight mb-6 mt-8">Other Projects</h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {other.map((project) => (
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
            </>
          )}
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
