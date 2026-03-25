import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SkillBadge from '@/components/SkillBadge';
import { getPortfolioContentSafe } from '@/lib/bff';
import BffUnavailable from '@/components/BffUnavailable';

export const metadata = {
  title: 'About | Nick Takemori',
  description: 'Background, approach, and skills.',
};

export default async function About() {
  const { content, error } = await getPortfolioContentSafe();
  if (!content) {
    return <BffUnavailable error={error} />;
  }

  const frontendSkills = ['TypeScript', 'React', 'Next.js', 'Tailwind CSS', 'HTML / CSS'];
  const backendSkills = ['Python', 'Django / DRF', 'C# / .NET 8', 'REST APIs', 'SQL (MySQL)'];
  const systemsSkills = ['Kafka', 'Docker / Compose', 'Kubernetes', 'Git / GitHub', 'Make'];
  const practiceSkills = ['Domain Modeling', 'Event-Driven Architecture', 'Testing (pytest, Jest)', 'Technical Documentation'];

  return (
    <>
      <Navigation displayName={content.site.displayName} />
      <main className="min-h-screen">
        <div className="max-w-5xl mx-auto px-6 pt-20 pb-12 md:pt-32 md:pb-20">
          {/* Header */}
          <section className="mb-20 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">About me</h1>
            <div className="w-16 h-1 bg-accent-500 rounded-full mb-6" />
            <p className="text-lg md:text-xl text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-3xl">
              I approach software as a design problem. Before writing code, I want to understand the domain well enough that the architecture feels like an obvious consequence of the requirements. I&apos;m drawn to systems work: lifecycle modeling, event-driven pipelines, contracts between services - because getting the boundaries right is where most complexity either compounds or resolves.
            </p>
          </section>

          {/* Background */}
          <section className="mb-20">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">Background</h2>
            <div className="space-y-4 text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-3xl">
              <p>
                I started in physics at Cal Poly Pomona, where I picked up a comfort with abstraction and formal problem-solving that still shapes how I model software. I moved into development through a bootcamp and then spent three and a half years as a teaching assistant at CodingDojo, running live lectures, debugging students&apos; code in real-time, and learning how to explain complex ideas under pressure. Teaching sharpened my instincts for clarity in ways that still show up in how I write code and documentation.
              </p>
              <p>
                From there I worked as a software engineer at Gozynta, helping to build Flask and 11ty integrations for MSP tooling with QuickBooks Online. After that, I went deep on my own projects. <a href="/projects/bill-n-chill" className="text-accent-600 dark:text-accent-400 hover:underline">Bill n&apos; Chill</a>, a construction finance platform, is the most substantial: ~21,000 lines of production code with lifecycle state machines, immutable audit trails, and 19,000+ lines of tests, built in a focused 16-day sprint. <a href="/projects/portfolio-stack" className="text-accent-600 dark:text-accent-400 hover:underline">This portfolio site</a> is a polyglot microservices system I built to demonstrate event-driven architecture with real, working infrastructure.
              </p>
              <p>
                I have Tourette&apos;s, so I&apos;m looking for remote-first roles with async communication and a calm work environment. I&apos;m comfortable with that, and I do my best work when I can control my surroundings and focus deeply.
              </p>
            </div>
          </section>

          {/* Skills */}
          <section className="mb-20">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-8">Skills</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Frontend</h3>
                <div className="flex flex-wrap gap-2">
                  {frontendSkills.map((skill) => (
                    <SkillBadge key={skill} skill={skill} level="advanced" />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Backend</h3>
                <div className="flex flex-wrap gap-2">
                  {backendSkills.map((skill) => (
                    <SkillBadge key={skill} skill={skill} level="intermediate" />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Infrastructure</h3>
                <div className="flex flex-wrap gap-2">
                  {systemsSkills.map((skill) => (
                    <SkillBadge key={skill} skill={skill} level="expert" />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Practices</h3>
                <div className="flex flex-wrap gap-2">
                  {practiceSkills.map((skill) => (
                    <SkillBadge key={skill} skill={skill} level="beginner" />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="glass-effect rounded-2xl p-12 md:p-16 text-center bg-accent-600/5 dark:bg-accent-900/10 border border-accent-200/30 dark:border-accent-900/30">
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-4 tracking-tight">Let&apos;s work together</h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-6 max-w-2xl mx-auto">
              I&apos;m looking for teams that care about how software is built, not just that it ships. I&apos;d like to hear about what you&apos;re working on.
            </p>
            <a
              href="/contact"
              className="inline-block bg-accent-600 hover:bg-accent-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            >
              Get in Touch
            </a>
          </section>
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
