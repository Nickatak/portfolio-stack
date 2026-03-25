import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ContactClient from '@/components/ContactClient';
import { getPortfolioContentSafe } from '@/lib/bff';
import BffUnavailable from '@/components/BffUnavailable';

export default async function Contact() {
  const { content, error } = await getPortfolioContentSafe();
  if (!content) {
    return <BffUnavailable error={error} />;
  }

  return (
    <>
      <Navigation displayName={content.site.displayName} />
      <ContactClient contactLinks={content.contactLinks} />
      <Footer
        displayName={content.site.displayName}
        contactEmail={content.site.contactEmail}
        socialLinks={content.socialLinks}
      />
    </>
  );
}
