import Link from 'next/link';
interface FooterProps {
  displayName: string;
  contactEmail: string;
  socialLinks: { name: string; url: string; icon: string }[];
}

export default function Footer({ displayName, contactEmail, socialLinks }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const contactMailto = `mailto:${contactEmail.replace(/^mailto:/i, '')}`;

  return (
    <footer className="border-t border-zinc-200/50 dark:border-zinc-800/50 py-12 md:py-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="font-bold text-lg mb-4 text-accent-500 dark:text-accent-400">{displayName}</h3>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              Full-stack developer focused on domain modeling, event-driven systems, and clean architecture.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-white mb-4 text-sm uppercase tracking-wide">Navigation</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors duration-200">Home</Link></li>
              <li><Link href="/projects" className="text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors duration-200">Work</Link></li>
              <li><Link href="/about" className="text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors duration-200">About</Link></li>
              <li><Link href="/contact" className="text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors duration-200">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-white mb-4 text-sm uppercase tracking-wide">Social</h4>
            <ul className="space-y-2">
              {socialLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors duration-200">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-white mb-4 text-sm uppercase tracking-wide">Contact</h4>
            <a href={contactMailto} className="inline-block bg-accent-600 hover:bg-accent-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg">
              Get in Touch
            </a>
          </div>
        </div>
        
        <div className="border-t border-zinc-200/50 dark:border-zinc-800/50 pt-8 text-center text-sm text-zinc-700 dark:text-zinc-300">
          <p>
            © {currentYear} {displayName}'s Portfolio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
