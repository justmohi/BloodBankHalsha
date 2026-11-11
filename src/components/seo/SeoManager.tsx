import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://blood-bank-halsha.web.app';

const PAGE_META: Record<string, { title: string; description: string; indexable: boolean }> = {
  '/': {
    title: 'Blood Bank Halsha | Find Voluntary Blood Donors in Bangladesh',
    description: 'Find voluntary blood donors by blood group and location in Halsha, Mirpur, Kushtia and across Bangladesh.',
    indexable: true,
  },
  '/find-blood': {
    title: 'Find Blood Donors by Group and Location | Blood Bank Halsha',
    description: 'Search registered voluntary blood donors by blood group, division, district and upazila in Bangladesh.',
    indexable: true,
  },
  '/about': {
    title: 'About Blood Bank Halsha | Voluntary Blood Donor Network',
    description: 'Learn about Blood Bank Halsha, a voluntary initiative connecting blood donors and patients in Halsha, Kushtia and across Bangladesh.',
    indexable: true,
  },
  '/privacy': {
    title: 'Privacy Policy | Blood Bank Halsha',
    description: 'Read how Blood Bank Halsha protects donor information and uses data for voluntary blood donor coordination.',
    indexable: true,
  },
  '/terms': {
    title: 'Terms and Conditions | Blood Bank Halsha',
    description: 'Read the terms for using Blood Bank Halsha voluntary blood donor coordination platform.',
    indexable: true,
  },
};

function setMeta(selector: string, attribute: string, value: string) {
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    if (selector.startsWith('meta[name=')) {
      element.name = selector.match(/"([^"]+)"/)?.[1] || '';
    } else {
      element.setAttribute('property', selector.match(/"([^"]+)"/)?.[1] || '');
    }
    document.head.appendChild(element);
  }
  element.setAttribute(attribute, value);
}

export function SeoManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    const page = PAGE_META[pathname];
    const title = page?.title || 'Blood Bank Halsha';
    const description = page?.description || 'Blood Bank Halsha voluntary blood donor network in Bangladesh.';
    const canonicalUrl = SITE_URL + (page ? pathname : '/');

    document.title = title;
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[name="robots"]', 'content', page?.indexable
      ? 'index, follow, max-image-preview:large'
      : 'noindex, nofollow');
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', canonicalUrl);

    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }, [pathname]);

  return null;
}
