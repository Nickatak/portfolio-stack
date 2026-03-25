const rawDisplayName = process.env.NEXT_PUBLIC_DISPLAY_NAME || 'Your Name';
const rawContactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hello@example.com';

export const siteConfig = {
  displayName: rawDisplayName,
  contactEmail: rawContactEmail.replace(/^mailto:/i, ''),
};

export const siteContactMailto = `mailto:${siteConfig.contactEmail}`;
