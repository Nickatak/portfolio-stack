import portfolioExample from '@/data/portfolio.example.json';
import socialExample from '@/data/social.example.json';

export interface PortfolioProject {
  id: number;
  slug?: string;
  title: string;
  description: string;
  tags: string[];
  link: string;
  github: string;
  body?: string;
  hasBody?: boolean;
  isFeatured?: boolean;
  category?: string;
  publishedDate?: string;
  readingTime?: number;
}

export interface PortfolioStat {
  number: string;
  label: string;
  icon: string;
}

export interface PortfolioContent {
  site: {
    name: string;
    displayName: string;
    contactEmail: string;
  };
  projects: PortfolioProject[];
  stats: PortfolioStat[];
  skills: string[];
  socialLinks: { name: string; url: string; icon: string }[];
  contactLinks: { icon: string; title: string; description: string; href: string }[];
}

const DEFAULT_BFF_BASE_URL = 'http://localhost:8001';

function isDemoMode(): boolean {
  return process.env.DEMO_MODE === 'true';
}

function getBffBaseUrl(): string {
  return (
    process.env.BFF_BASE_URL ||
    process.env.NEXT_PUBLIC_BFF_BASE_URL ||
    DEFAULT_BFF_BASE_URL
  );
}

async function loadOptionalJson<T>(filename: string, fallback: T): Promise<T> {
  if (typeof window !== 'undefined') {
    return fallback;
  }

  try {
    const { readFile } = await import('fs/promises');
    const { join } = await import('path');
    const filePath = join(process.cwd(), 'src', 'data', filename);
    const raw = await readFile(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function buildDemoContent(): Promise<PortfolioContent> {
  const displayName = process.env.NEXT_PUBLIC_DISPLAY_NAME || 'Your Name';
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hello@example.com';
  const [portfolioData, socialData] = await Promise.all([
    loadOptionalJson('portfolio.json', portfolioExample),
    loadOptionalJson('social.json', socialExample),
  ]);

  return {
    site: {
      name: displayName,
      displayName,
      contactEmail,
    },
    projects: portfolioData.projects ?? [],
    stats: portfolioData.stats ?? [],
    skills: portfolioData.skills ?? [],
    socialLinks: socialData.socialLinks ?? [],
    contactLinks: socialData.contactLinks ?? [],
  };
}

export async function getPortfolioContent(): Promise<PortfolioContent> {
  if (isDemoMode()) {
    return buildDemoContent();
  }

  const baseUrl = getBffBaseUrl();
  const response = await fetch(`${baseUrl}/api/portfolio-content`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch portfolio content: ${response.status}`);
  }

  return response.json();
}

export async function getPortfolioContentSafe(): Promise<{
  content: PortfolioContent | null;
  error?: string;
}> {
  try {
    const content = await getPortfolioContent();
    return { content };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { content: null, error: message };
  }
}

export async function getProject(project: string): Promise<PortfolioProject> {
  if (isDemoMode()) {
    const demo = await buildDemoContent();
    const normalized = project.toLowerCase();
    const match = demo.projects.find((item) => {
      if (item.slug && item.slug.toLowerCase() === normalized) {
        return true;
      }
      return String(item.id) === normalized;
    });

    if (!match) {
      throw new Error(`Failed to fetch project: not found`);
    }

    return match;
  }

  const baseUrl = getBffBaseUrl();
  const response = await fetch(`${baseUrl}/projects/${project}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch project: ${response.status}`);
  }

  return response.json();
}
