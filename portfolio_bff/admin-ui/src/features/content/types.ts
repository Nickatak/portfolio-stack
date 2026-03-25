import type {
  AdminPage,
  AdminProject,
  AdminSiteSetting,
  AdminStat,
  AdminSkill,
  AdminSocialLink,
  AdminContactLink,
} from "@/lib/api";

export type AllContent = {
  settings: AdminSiteSetting[];
  pages: AdminPage[];
  projects: AdminProject[];
  stats: AdminStat[];
  skills: AdminSkill[];
  socialLinks: AdminSocialLink[];
  contactLinks: AdminContactLink[];
};

export const emptyContent: AllContent = {
  settings: [],
  pages: [],
  projects: [],
  stats: [],
  skills: [],
  socialLinks: [],
  contactLinks: [],
};

export type EditingKey = { section: string; id: number } | null;

export const sectionMeta: {
  key: keyof AllContent;
  title: string;
  note: string;
}[] = [
  {
    key: "settings",
    title: "Site Settings",
    note: "Global key-value pairs used across the portfolio site (site title, display name, contact email).",
  },
  {
    key: "pages",
    title: "Pages",
    note: "Static pages rendered at their slug URL on the portfolio site (e.g. /about, /contact).",
  },
  {
    key: "projects",
    title: "Projects",
    note: "Project cards on the portfolio landing page and individual project detail pages.",
  },
  {
    key: "stats",
    title: "Stats",
    note: "Headline metrics displayed in the stats section of the landing page.",
  },
  {
    key: "skills",
    title: "Skills",
    note: "Skills list shown in the about/skills section of the portfolio site.",
  },
  {
    key: "socialLinks",
    title: "Social Links",
    note: "Social profile icons in the site footer and contact page.",
  },
  {
    key: "contactLinks",
    title: "Contact Links",
    note: "Contact method cards displayed on the contact page.",
  },
];
