const DEFAULT_BFF_REPO_URL = 'https://github.com/Nickatak/portfolio-bff';

interface BffUnavailableProps {
  error?: string;
}

export default function BffUnavailable({ error }: BffUnavailableProps) {
  const repoUrl = process.env.NEXT_PUBLIC_BFF_REPO_URL || DEFAULT_BFF_REPO_URL;

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-xl text-center rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-900/60 px-8 py-10 shadow-lg shadow-zinc-200/40 dark:shadow-black/30">
        <div className="text-5xl mb-5">⚠️</div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-3">
          Portfolio backend is not running
        </h1>
        <p className="text-base md:text-lg text-zinc-700 dark:text-zinc-300 mb-6">
          This page loads content from the BFF service. Start the{' '}
          <span className="font-semibold text-zinc-900 dark:text-white">
            portfolio-bff
          </span>{' '}
          backend and refresh.
        </p>
        <div className="flex flex-col items-center justify-center gap-3">
          <a
            href={repoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-w-[240px] items-center justify-center px-5 py-2 rounded-lg bg-accent-600 hover:bg-accent-700 text-white font-semibold transition-all duration-200"
          >
            Open portfolio-bff repo
          </a>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Once running, reload this page.
          </span>
        </div>
        {error && (
          <p className="mt-6 text-xs md:text-sm text-zinc-500 dark:text-zinc-400">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
