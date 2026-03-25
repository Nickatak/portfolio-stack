const RAW_API_BASE = process.env.NEXT_PUBLIC_BFF_BASE_URL ?? '';
const API_BASE = RAW_API_BASE.trim().replace(/\/+$/, '');

type JsonValue = Record<string, unknown>;

export type AdminUser = {
  id: number;
  username: string;
  email: string;
  isStaff: boolean;
  isSuperuser: boolean;
};

export type AdminSessionResponse = {
  authenticated: boolean;
  user?: AdminUser;
};

export type AdminListResponse<T> = {
  [key: string]: T[];
};

export type ApiResponse<T = JsonValue> = {
  ok: boolean;
  status: number;
  data?: T;
  errors?: string[];
};

export type AdminPage = {
  id: number;
  slug: string;
  title: string;
  body: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminProject = {
  id: number;
  slug: string;
  title: string;
  description: string;
  tags: string[];
  link: string;
  github: string;
  isPublished: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminSiteSetting = {
  id: number;
  key: string;
  value: string;
};

export type AdminStat = {
  id: number;
  number: string;
  label: string;
  icon: string;
  order: number;
};

export type AdminSkill = {
  id: number;
  name: string;
  order: number;
};

export type AdminSocialLink = {
  id: number;
  name: string;
  url: string;
  icon: string;
  order: number;
};

export type AdminContactLink = {
  id: number;
  icon: string;
  title: string;
  description: string;
  href: string;
  order: number;
};

function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }
  const match = document.cookie
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`));
  if (!match) {
    return null;
  }
  return decodeURIComponent(match.split('=')[1] ?? '');
}

function buildApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  return API_BASE ? `${API_BASE}${path}` : path;
}

export async function getCsrfToken(): Promise<string | null> {
  try {
    const response = await fetch(buildApiUrl('/api/admin/csrf'), {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as { csrfToken?: string };
    return data.csrfToken ?? null;
  } catch {
    return null;
  }
}

async function apiFetch<T = JsonValue>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers || {});
  const method = (options.method || 'GET').toUpperCase();
  if (method !== 'GET' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (method !== 'GET') {
    const csrfToken = getCookieValue('csrftoken');
    if (csrfToken) {
      headers.set('X-CSRFToken', csrfToken);
    }
  }

  let response: Response;
  try {
    response = await fetch(buildApiUrl(path), {
      ...options,
      headers,
      credentials: 'include',
    });
  } catch {
    return {
      ok: false,
      status: 0,
      errors: [
        API_BASE
          ? `Network error: could not reach ${API_BASE}. Check NEXT_PUBLIC_BFF_BASE_URL and ensure the BFF API is running.`
          : "Network error: could not reach /api. Check BFF_BASE_URL rewrite target and ensure the BFF API is running.",
      ],
    };
  }

  let data: T | undefined;
  let errors: string[] | undefined;
  try {
    const body = (await response.json()) as JsonValue;
    if (Array.isArray(body.errors)) {
      errors = body.errors.map(String);
    } else {
      data = body as T;
    }
  } catch {
    // ignore JSON parse errors
  }

  return { ok: response.ok, status: response.status, data, errors };
}

export async function loginAdmin(username: string, password: string) {
  return apiFetch('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function logoutAdmin() {
  return apiFetch('/api/admin/logout', { method: 'POST' });
}

export async function fetchSession() {
  return apiFetch<AdminSessionResponse>('/api/admin/session');
}

export async function fetchAdminContent() {
  const [settings, pages, projects, stats, skills, socialLinks, contactLinks] = await Promise.all([
    apiFetch<AdminListResponse<JsonValue>>('/api/admin/site-settings'),
    apiFetch<AdminListResponse<JsonValue>>('/api/admin/pages'),
    apiFetch<AdminListResponse<JsonValue>>('/api/admin/projects'),
    apiFetch<AdminListResponse<JsonValue>>('/api/admin/stats'),
    apiFetch<AdminListResponse<JsonValue>>('/api/admin/skills'),
    apiFetch<AdminListResponse<JsonValue>>('/api/admin/social-links'),
    apiFetch<AdminListResponse<JsonValue>>('/api/admin/contact-links'),
  ]);

  return {
    settings,
    pages,
    projects,
    stats,
    skills,
    socialLinks,
    contactLinks,
  };
}

export async function fetchAppointments() {
  return apiFetch<AdminListResponse<JsonValue>>('/api/admin/appointments');
}

export async function fetchAdminPages() {
  return apiFetch<{ pages: AdminPage[] }>('/api/admin/pages');
}

export async function createAdminPage(payload: {
  title: string;
  slug?: string;
  body?: string;
  isPublished?: boolean;
}) {
  return apiFetch<{ page: AdminPage }>('/api/admin/pages', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAdminPage(
  pageId: number,
  payload: Partial<{
    title: string;
    slug: string;
    body: string;
    isPublished: boolean;
  }>
) {
  return apiFetch<{ page: AdminPage }>(`/api/admin/pages/${pageId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminPage(pageId: number) {
  return apiFetch<{ ok: boolean }>(`/api/admin/pages/${pageId}`, {
    method: 'DELETE',
  });
}

export async function fetchAdminProjects() {
  return apiFetch<{ projects: AdminProject[] }>('/api/admin/projects');
}

export async function createAdminProject(payload: {
  title: string;
  slug?: string;
  description?: string;
  tags?: string[] | string;
  link?: string;
  github?: string;
  isPublished?: boolean;
  order?: number;
}) {
  return apiFetch<{ project: AdminProject }>('/api/admin/projects', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAdminProject(
  projectId: number,
  payload: Partial<{
    title: string;
    slug: string;
    description: string;
    tags: string[] | string;
    link: string;
    github: string;
    isPublished: boolean;
    order: number;
  }>
) {
  return apiFetch<{ project: AdminProject }>(`/api/admin/projects/${projectId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminProject(projectId: number) {
  return apiFetch<{ ok: boolean }>(`/api/admin/projects/${projectId}`, {
    method: 'DELETE',
  });
}

export async function fetchAdminSiteSettings() {
  return apiFetch<{ settings: AdminSiteSetting[] }>('/api/admin/site-settings');
}

export async function upsertAdminSiteSettings(settings: Array<{ key: string; value: string }>) {
  return apiFetch<{ settings: AdminSiteSetting[] }>('/api/admin/site-settings', {
    method: 'POST',
    body: JSON.stringify({ settings }),
  });
}

export async function fetchAdminStats() {
  return apiFetch<{ stats: AdminStat[] }>('/api/admin/stats');
}

export async function createAdminStat(payload: {
  number: string;
  label: string;
  icon?: string;
  order?: number;
}) {
  return apiFetch<{ stat: AdminStat }>('/api/admin/stats', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAdminStat(
  statId: number,
  payload: Partial<{ number: string; label: string; icon: string; order: number }>
) {
  return apiFetch<{ stat: AdminStat }>(`/api/admin/stats/${statId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminStat(statId: number) {
  return apiFetch<{ ok: boolean }>(`/api/admin/stats/${statId}`, {
    method: 'DELETE',
  });
}

export async function fetchAdminSkills() {
  return apiFetch<{ skills: AdminSkill[] }>('/api/admin/skills');
}

export async function createAdminSkill(payload: { name: string; order?: number }) {
  return apiFetch<{ skill: AdminSkill }>('/api/admin/skills', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAdminSkill(
  skillId: number,
  payload: Partial<{ name: string; order: number }>
) {
  return apiFetch<{ skill: AdminSkill }>(`/api/admin/skills/${skillId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminSkill(skillId: number) {
  return apiFetch<{ ok: boolean }>(`/api/admin/skills/${skillId}`, {
    method: 'DELETE',
  });
}

export async function fetchAdminSocialLinks() {
  return apiFetch<{ socialLinks: AdminSocialLink[] }>('/api/admin/social-links');
}

export async function createAdminSocialLink(payload: {
  name: string;
  url: string;
  icon?: string;
  order?: number;
}) {
  return apiFetch<{ socialLink: AdminSocialLink }>('/api/admin/social-links', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAdminSocialLink(
  socialLinkId: number,
  payload: Partial<{ name: string; url: string; icon: string; order: number }>
) {
  return apiFetch<{ socialLink: AdminSocialLink }>(`/api/admin/social-links/${socialLinkId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminSocialLink(socialLinkId: number) {
  return apiFetch<{ ok: boolean }>(`/api/admin/social-links/${socialLinkId}`, {
    method: 'DELETE',
  });
}

export async function fetchAdminContactLinks() {
  return apiFetch<{ contactLinks: AdminContactLink[] }>('/api/admin/contact-links');
}

export async function createAdminContactLink(payload: {
  icon?: string;
  title: string;
  description?: string;
  href: string;
  order?: number;
}) {
  return apiFetch<{ contactLink: AdminContactLink }>('/api/admin/contact-links', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAdminContactLink(
  contactLinkId: number,
  payload: Partial<{ icon: string; title: string; description: string; href: string; order: number }>
) {
  return apiFetch<{ contactLink: AdminContactLink }>(`/api/admin/contact-links/${contactLinkId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminContactLink(contactLinkId: number) {
  return apiFetch<{ ok: boolean }>(`/api/admin/contact-links/${contactLinkId}`, {
    method: 'DELETE',
  });
}
