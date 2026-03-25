'use client';

import ScheduleCallSection from '@/components/ScheduleCallSection';

interface ContactLink {
  icon: string;
  title: string;
  description: string;
  href: string;
}

interface ContactClientProps {
  contactLinks: ContactLink[];
}

export default function ContactClient({ contactLinks }: ContactClientProps) {
  return (
    <main className="min-h-screen">
        <div className="max-w-5xl mx-auto px-6 pt-20 pb-12 md:pt-32 md:pb-20">
          <section className="mb-16 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Let's Talk</h1>
            <div className="w-16 h-1 bg-accent-500 rounded-full mb-6" />
            <p className="text-lg md:text-xl text-white leading-relaxed max-w-3xl">
              I'm always open to new opportunities and collaborations. Whether you already have a specific project in mind or just want to discuss web development, I'm easy to reach.
            </p>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Scheduler — primary CTA */}
            <div className="lg:col-span-2">
              <ScheduleCallSection onBooking={() => {}} />
            </div>

            {/* Contact links — sidebar */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 space-y-4">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Reach out directly</h2>
                {contactLinks.map((contact, index) => (
                  <a
                    key={index}
                    href={contact.href}
                    target={contact.href.startsWith('mailto') ? undefined : '_blank'}
                    rel={contact.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                    className="block glass-effect rounded-lg p-5 border border-zinc-100/50 dark:border-zinc-800/50 hover:border-zinc-200/80 dark:hover:border-zinc-700/80 hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{contact.icon}</div>
                      <div>
                        <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">{contact.title}</h3>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">
                          {contact.description}
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
  );
}
