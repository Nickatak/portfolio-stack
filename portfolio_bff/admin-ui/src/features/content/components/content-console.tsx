"use client";

import { useEffect, useState } from "react";
import {
  fetchAdminPages,
  fetchAdminProjects,
  fetchAdminSiteSettings,
  fetchAdminStats,
  fetchAdminSkills,
  fetchAdminSocialLinks,
  fetchAdminContactLinks,
  updateAdminPage,
  updateAdminProject,
  updateAdminStat,
  updateAdminSkill,
  updateAdminSocialLink,
  updateAdminContactLink,
  upsertAdminSiteSettings,
} from "@/lib/api";
import { type AllContent, type EditingKey, emptyContent, sectionMeta } from "../types";
import styles from "./content-console.module.css";

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

function parseTags(csv: string): string[] {
  return csv
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function ContentConsole() {
  const [content, setContent] = useState<AllContent>(emptyContent);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [editingKey, setEditingKey] = useState<EditingKey>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [settingsForm, setSettingsForm] = useState<{ key: string; value: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadContent = async () => {
    const [settings, pages, projects, stats, skills, socialLinks, contactLinks] =
      await Promise.all([
        fetchAdminSiteSettings(),
        fetchAdminPages(),
        fetchAdminProjects(),
        fetchAdminStats(),
        fetchAdminSkills(),
        fetchAdminSocialLinks(),
        fetchAdminContactLinks(),
      ]);

    const loaded: AllContent = {
      settings: settings.data?.settings ?? [],
      pages: pages.data?.pages ?? [],
      projects: projects.data?.projects ?? [],
      stats: stats.data?.stats ?? [],
      skills: skills.data?.skills ?? [],
      socialLinks: socialLinks.data?.socialLinks ?? [],
      contactLinks: contactLinks.data?.contactLinks ?? [],
    };
    setContent(loaded);
    setSettingsForm(loaded.settings.map((s) => ({ key: s.key, value: s.value })));
    setLoading(false);
  };

  useEffect(() => {
    loadContent();
  }, []);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const startEdit = (section: string, id: number, formData: Record<string, string>) => {
    setEditingKey({ section, id });
    setEditForm(formData);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditForm({});
  };

  const setField = (field: string, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const setCheck = (field: string, checked: boolean) => {
    setEditForm((prev) => ({ ...prev, [field]: checked ? "true" : "false" }));
  };

  /* ---- Save handlers ---- */

  const saveSettings = async () => {
    setSaving(true);
    setError(null);
    const res = await upsertAdminSiteSettings(settingsForm);
    setSaving(false);
    if (!res.ok) {
      setError(res.errors?.[0] ?? "Failed to save settings.");
      return;
    }
    await loadContent();
  };

  const savePage = async (id: number) => {
    setSaving(true);
    setError(null);
    const res = await updateAdminPage(id, {
      title: editForm.title,
      slug: editForm.slug || undefined,
      body: editForm.body,
      isPublished: editForm.isPublished === "true",
    });
    setSaving(false);
    if (!res.ok) {
      setError(res.errors?.[0] ?? "Failed to save page.");
      return;
    }
    cancelEdit();
    await loadContent();
  };

  const saveProject = async (id: number) => {
    setSaving(true);
    setError(null);
    const res = await updateAdminProject(id, {
      title: editForm.title,
      slug: editForm.slug || undefined,
      description: editForm.description,
      tags: parseTags(editForm.tags),
      link: editForm.link,
      github: editForm.github,
      order: Number(editForm.order || 0),
      isPublished: editForm.isPublished === "true",
    });
    setSaving(false);
    if (!res.ok) {
      setError(res.errors?.[0] ?? "Failed to save project.");
      return;
    }
    cancelEdit();
    await loadContent();
  };

  const saveStat = async (id: number) => {
    setSaving(true);
    setError(null);
    const res = await updateAdminStat(id, {
      number: editForm.number,
      label: editForm.label,
      icon: editForm.icon,
      order: Number(editForm.order || 0),
    });
    setSaving(false);
    if (!res.ok) {
      setError(res.errors?.[0] ?? "Failed to save stat.");
      return;
    }
    cancelEdit();
    await loadContent();
  };

  const saveSkill = async (id: number) => {
    setSaving(true);
    setError(null);
    const res = await updateAdminSkill(id, {
      name: editForm.name,
      order: Number(editForm.order || 0),
    });
    setSaving(false);
    if (!res.ok) {
      setError(res.errors?.[0] ?? "Failed to save skill.");
      return;
    }
    cancelEdit();
    await loadContent();
  };

  const saveSocialLink = async (id: number) => {
    setSaving(true);
    setError(null);
    const res = await updateAdminSocialLink(id, {
      name: editForm.name,
      url: editForm.url,
      icon: editForm.icon,
      order: Number(editForm.order || 0),
    });
    setSaving(false);
    if (!res.ok) {
      setError(res.errors?.[0] ?? "Failed to save social link.");
      return;
    }
    cancelEdit();
    await loadContent();
  };

  const saveContactLink = async (id: number) => {
    setSaving(true);
    setError(null);
    const res = await updateAdminContactLink(id, {
      title: editForm.title,
      href: editForm.href,
      icon: editForm.icon,
      description: editForm.description,
      order: Number(editForm.order || 0),
    });
    setSaving(false);
    if (!res.ok) {
      setError(res.errors?.[0] ?? "Failed to save contact link.");
      return;
    }
    cancelEdit();
    await loadContent();
  };

  /* ---- Render helpers ---- */

  const renderSectionHeader = (meta: (typeof sectionMeta)[number]) => {
    const isOpen = openSections.has(meta.key);
    const count = content[meta.key].length;
    return (
      <>
        <div className={styles.sectionHeader} onClick={() => toggleSection(meta.key)}>
          <span className={cx(styles.chevron, isOpen && styles.chevronOpen)} />
          <h2 className={styles.sectionTitle}>{meta.title}</h2>
          <span className={styles.badge}>
            {loading ? "..." : count} {count === 1 ? "item" : "items"}
          </span>
        </div>
        <div className={styles.sectionNote}>{meta.note}</div>
      </>
    );
  };

  const renderSettingsSection = () => {
    if (!openSections.has("settings")) return null;
    if (settingsForm.length === 0) return <div className={cx(styles.sectionBody, styles.empty)}>No settings.</div>;
    return (
      <div className={styles.sectionBody}>
        <div className={styles.list}>
          {settingsForm.map((s, i) => (
            <article key={s.key} className={cx(styles.item, styles.settingRow)}>
              <span className={styles.settingKey}>{s.key}</span>
              <input
                value={s.value}
                onChange={(e) => {
                  const next = [...settingsForm];
                  next[i] = { ...next[i], value: e.target.value };
                  setSettingsForm(next);
                }}
                placeholder="value"
              />
            </article>
          ))}
        </div>
        <div className={styles.actions} style={{ marginTop: 12 }}>
          <button type="button" className={styles.actionButton} onClick={saveSettings} disabled={saving}>
            {saving ? "Saving..." : "Save All Settings"}
          </button>
        </div>
      </div>
    );
  };

  const renderPagesSection = () => {
    if (!openSections.has("pages")) return null;
    const items = content.pages;
    if (items.length === 0) return <div className={cx(styles.sectionBody, styles.empty)}>No pages.</div>;
    return (
      <div className={styles.sectionBody}>
        <div className={styles.list}>
          {items.map((page) => {
            const editing = editingKey?.section === "pages" && editingKey.id === page.id;
            return (
              <article key={page.id} className={styles.item}>
                {editing ? (
                  <>
                    <label className={styles.fieldLabel}>Title<input value={editForm.title} onChange={(e) => setField("title", e.target.value)} /></label>
                    <label className={styles.fieldLabel}>Slug<input value={editForm.slug} onChange={(e) => setField("slug", e.target.value)} /></label>
                    <label className={styles.fieldLabel}>Body<textarea value={editForm.body} onChange={(e) => setField("body", e.target.value)} rows={4} /></label>
                    <label className={styles.check}>
                      <input type="checkbox" checked={editForm.isPublished === "true"} onChange={(e) => setCheck("isPublished", e.target.checked)} />
                      Published
                    </label>
                    <div className={styles.actions}>
                      <button type="button" className={styles.actionButton} onClick={() => savePage(page.id)} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                      <button type="button" className={cx(styles.actionButton, styles.ghost)} onClick={cancelEdit}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.itemHeader}>
                      <strong>{page.title}</strong>
                      <span className={cx(styles.pill, page.isPublished && styles.pillOn)}>{page.isPublished ? "Published" : "Draft"}</span>
                    </div>
                    <div className={styles.meta}>/{page.slug}</div>
                    <p className={styles.body}>{page.body || "No body content."}</p>
                    <div className={styles.actions}>
                      <button type="button" className={styles.actionButton} onClick={() => startEdit("pages", page.id, { title: page.title, slug: page.slug, body: page.body, isPublished: page.isPublished ? "true" : "false" })}>Edit</button>
                    </div>
                  </>
                )}
              </article>
            );
          })}
        </div>
      </div>
    );
  };

  const renderProjectsSection = () => {
    if (!openSections.has("projects")) return null;
    const items = content.projects;
    if (items.length === 0) return <div className={cx(styles.sectionBody, styles.empty)}>No projects.</div>;
    return (
      <div className={styles.sectionBody}>
        <div className={styles.list}>
          {items.map((project) => {
            const editing = editingKey?.section === "projects" && editingKey.id === project.id;
            return (
              <article key={project.id} className={styles.item}>
                {editing ? (
                  <>
                    <label className={styles.fieldLabel}>Title<input value={editForm.title} onChange={(e) => setField("title", e.target.value)} /></label>
                    <label className={styles.fieldLabel}>Slug<input value={editForm.slug} onChange={(e) => setField("slug", e.target.value)} /></label>
                    <label className={styles.fieldLabel}>Description<textarea value={editForm.description} onChange={(e) => setField("description", e.target.value)} rows={3} /></label>
                    <label className={styles.fieldLabel}>Tags (comma-separated)<input value={editForm.tags} onChange={(e) => setField("tags", e.target.value)} /></label>
                    <label className={styles.fieldLabel}>Public URL<input value={editForm.link} onChange={(e) => setField("link", e.target.value)} /></label>
                    <label className={styles.fieldLabel}>GitHub URL<input value={editForm.github} onChange={(e) => setField("github", e.target.value)} /></label>
                    <label className={styles.fieldLabel}>Order<input type="number" value={editForm.order} onChange={(e) => setField("order", e.target.value)} /></label>
                    <label className={styles.check}>
                      <input type="checkbox" checked={editForm.isPublished === "true"} onChange={(e) => setCheck("isPublished", e.target.checked)} />
                      Published
                    </label>
                    <div className={styles.actions}>
                      <button type="button" className={styles.actionButton} onClick={() => saveProject(project.id)} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                      <button type="button" className={cx(styles.actionButton, styles.ghost)} onClick={cancelEdit}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.itemHeader}>
                      <strong>{project.title}</strong>
                      <span className={cx(styles.pill, project.isPublished && styles.pillOn)}>{project.isPublished ? "Published" : "Draft"}</span>
                    </div>
                    <div className={styles.meta}>/{project.slug} &middot; order {project.order}</div>
                    <p className={styles.body}>{project.description || "No description."}</p>
                    <div className={styles.meta}>Tags: {project.tags.join(", ") || "\u2014"}</div>
                    <div className={styles.meta}>Link: {project.link || "\u2014"}</div>
                    <div className={styles.meta}>GitHub: {project.github || "\u2014"}</div>
                    <div className={styles.actions}>
                      <button type="button" className={styles.actionButton} onClick={() => startEdit("projects", project.id, { title: project.title, slug: project.slug, description: project.description, tags: project.tags.join(", "), link: project.link, github: project.github, order: String(project.order), isPublished: project.isPublished ? "true" : "false" })}>Edit</button>
                    </div>
                  </>
                )}
              </article>
            );
          })}
        </div>
      </div>
    );
  };

  const renderStatsSection = () => {
    if (!openSections.has("stats")) return null;
    const items = content.stats;
    if (items.length === 0) return <div className={cx(styles.sectionBody, styles.empty)}>No stats.</div>;
    return (
      <div className={styles.sectionBody}>
        <div className={styles.list}>
          {items.map((stat) => {
            const editing = editingKey?.section === "stats" && editingKey.id === stat.id;
            return (
              <article key={stat.id} className={styles.item}>
                {editing ? (
                  <>
                    <label className={styles.fieldLabel}>Number<input value={editForm.number} onChange={(e) => setField("number", e.target.value)} /></label>
                    <label className={styles.fieldLabel}>Label<input value={editForm.label} onChange={(e) => setField("label", e.target.value)} /></label>
                    <label className={styles.fieldLabel}>Icon<input value={editForm.icon} onChange={(e) => setField("icon", e.target.value)} /></label>
                    <label className={styles.fieldLabel}>Order<input type="number" value={editForm.order} onChange={(e) => setField("order", e.target.value)} /></label>
                    <div className={styles.actions}>
                      <button type="button" className={styles.actionButton} onClick={() => saveStat(stat.id)} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                      <button type="button" className={cx(styles.actionButton, styles.ghost)} onClick={cancelEdit}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.itemHeader}>
                      <strong>{stat.number}</strong>
                      <span className={styles.meta}>order {stat.order}</span>
                    </div>
                    <div>{stat.label}</div>
                    <div className={styles.meta}>Icon: {stat.icon || "\u2014"}</div>
                    <div className={styles.actions}>
                      <button type="button" className={styles.actionButton} onClick={() => startEdit("stats", stat.id, { number: stat.number, label: stat.label, icon: stat.icon, order: String(stat.order) })}>Edit</button>
                    </div>
                  </>
                )}
              </article>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSkillsSection = () => {
    if (!openSections.has("skills")) return null;
    const items = content.skills;
    if (items.length === 0) return <div className={cx(styles.sectionBody, styles.empty)}>No skills.</div>;
    return (
      <div className={styles.sectionBody}>
        <div className={styles.list}>
          {items.map((skill) => {
            const editing = editingKey?.section === "skills" && editingKey.id === skill.id;
            return (
              <article key={skill.id} className={styles.item}>
                {editing ? (
                  <>
                    <label className={styles.fieldLabel}>Name<input value={editForm.name} onChange={(e) => setField("name", e.target.value)} /></label>
                    <label className={styles.fieldLabel}>Order<input type="number" value={editForm.order} onChange={(e) => setField("order", e.target.value)} /></label>
                    <div className={styles.actions}>
                      <button type="button" className={styles.actionButton} onClick={() => saveSkill(skill.id)} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                      <button type="button" className={cx(styles.actionButton, styles.ghost)} onClick={cancelEdit}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.itemHeader}>
                      <strong>{skill.name}</strong>
                      <span className={styles.meta}>order {skill.order}</span>
                    </div>
                    <div className={styles.actions}>
                      <button type="button" className={styles.actionButton} onClick={() => startEdit("skills", skill.id, { name: skill.name, order: String(skill.order) })}>Edit</button>
                    </div>
                  </>
                )}
              </article>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSocialLinksSection = () => {
    if (!openSections.has("socialLinks")) return null;
    const items = content.socialLinks;
    if (items.length === 0) return <div className={cx(styles.sectionBody, styles.empty)}>No social links.</div>;
    return (
      <div className={styles.sectionBody}>
        <div className={styles.list}>
          {items.map((link) => {
            const editing = editingKey?.section === "socialLinks" && editingKey.id === link.id;
            return (
              <article key={link.id} className={styles.item}>
                {editing ? (
                  <>
                    <label className={styles.fieldLabel}>Name<input value={editForm.name} onChange={(e) => setField("name", e.target.value)} /></label>
                    <label className={styles.fieldLabel}>URL<input value={editForm.url} onChange={(e) => setField("url", e.target.value)} /></label>
                    <label className={styles.fieldLabel}>Icon<input value={editForm.icon} onChange={(e) => setField("icon", e.target.value)} /></label>
                    <label className={styles.fieldLabel}>Order<input type="number" value={editForm.order} onChange={(e) => setField("order", e.target.value)} /></label>
                    <div className={styles.actions}>
                      <button type="button" className={styles.actionButton} onClick={() => saveSocialLink(link.id)} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                      <button type="button" className={cx(styles.actionButton, styles.ghost)} onClick={cancelEdit}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.itemHeader}>
                      <strong>{link.name}</strong>
                      <span className={styles.meta}>order {link.order}</span>
                    </div>
                    <div className={styles.meta}>{link.url}</div>
                    <div className={styles.meta}>Icon: {link.icon || "\u2014"}</div>
                    <div className={styles.actions}>
                      <button type="button" className={styles.actionButton} onClick={() => startEdit("socialLinks", link.id, { name: link.name, url: link.url, icon: link.icon, order: String(link.order) })}>Edit</button>
                    </div>
                  </>
                )}
              </article>
            );
          })}
        </div>
      </div>
    );
  };

  const renderContactLinksSection = () => {
    if (!openSections.has("contactLinks")) return null;
    const items = content.contactLinks;
    if (items.length === 0) return <div className={cx(styles.sectionBody, styles.empty)}>No contact links.</div>;
    return (
      <div className={styles.sectionBody}>
        <div className={styles.list}>
          {items.map((link) => {
            const editing = editingKey?.section === "contactLinks" && editingKey.id === link.id;
            return (
              <article key={link.id} className={styles.item}>
                {editing ? (
                  <>
                    <label className={styles.fieldLabel}>Title<input value={editForm.title} onChange={(e) => setField("title", e.target.value)} /></label>
                    <label className={styles.fieldLabel}>Href<input value={editForm.href} onChange={(e) => setField("href", e.target.value)} /></label>
                    <label className={styles.fieldLabel}>Icon<input value={editForm.icon} onChange={(e) => setField("icon", e.target.value)} /></label>
                    <label className={styles.fieldLabel}>Description<textarea value={editForm.description} onChange={(e) => setField("description", e.target.value)} rows={2} /></label>
                    <label className={styles.fieldLabel}>Order<input type="number" value={editForm.order} onChange={(e) => setField("order", e.target.value)} /></label>
                    <div className={styles.actions}>
                      <button type="button" className={styles.actionButton} onClick={() => saveContactLink(link.id)} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                      <button type="button" className={cx(styles.actionButton, styles.ghost)} onClick={cancelEdit}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.itemHeader}>
                      <strong>{link.title}</strong>
                      <span className={styles.meta}>order {link.order}</span>
                    </div>
                    <div className={styles.meta}>{link.href}</div>
                    <div>{link.description || "\u2014"}</div>
                    <div className={styles.meta}>Icon: {link.icon || "\u2014"}</div>
                    <div className={styles.actions}>
                      <button type="button" className={styles.actionButton} onClick={() => startEdit("contactLinks", link.id, { title: link.title, href: link.href, icon: link.icon, description: link.description, order: String(link.order) })}>Edit</button>
                    </div>
                  </>
                )}
              </article>
            );
          })}
        </div>
      </div>
    );
  };

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    settings: renderSettingsSection,
    pages: renderPagesSection,
    projects: renderProjectsSection,
    stats: renderStatsSection,
    skills: renderSkillsSection,
    socialLinks: renderSocialLinksSection,
    contactLinks: renderContactLinksSection,
  };

  return (
    <>
      <h1 className={styles.title}>Content</h1>
      <p className={styles.subtitle}>Portfolio frontend content. Expand a section to view or edit.</p>
      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div className={styles.loading}>Loading content...</div>
      ) : (
        sectionMeta.map((meta) => (
          <section key={meta.key} className={styles.section}>
            {renderSectionHeader(meta)}
            {sectionRenderers[meta.key]()}
          </section>
        ))
      )}
    </>
  );
}
