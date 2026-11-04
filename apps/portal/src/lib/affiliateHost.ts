/** Truest or AIfluxx, from the host first, then a white-label program name. */
function affiliateProduct(hostname?: string, programName?: string | null): 'truest' | 'aifluxx' | null {
  const host = (hostname ?? (typeof window !== 'undefined' ? window.location.hostname : '')).toLowerCase();
  if (host.includes('truest')) return 'truest';
  if (host.includes('aifluxx')) return 'aifluxx';
  const program = (programName ?? '').trim().toLowerCase();
  if (program === 'truest') return 'truest';
  if (program === 'aifluxx') return 'aifluxx';
  return null;
}

/** Product name for the Truest and AIfluxx affiliate hosts. Other hosts stay on the platform name. */
export function affiliateTitle(hostname?: string, programName?: string | null): string | null {
  const product = affiliateProduct(hostname, programName);
  if (product === 'truest') return 'Truest Affiliate';
  if (product === 'aifluxx') return 'AIfluxx Affiliate';
  return null;
}

export function affiliateMark(hostname?: string, programName?: string | null): string | null {
  const product = affiliateProduct(hostname, programName);
  if (product === 'truest') return '/brand/truest-icon-dark.svg';
  if (product === 'aifluxx') return '/brand/aifluxx-icon-dark.svg';
  return null;
}

/** First path segment under the tenant prefix. Empty string is the dashboard. */
export function portalSection(pathname: string, tenantBase: string): string {
  const rest = (pathname.slice(tenantBase.length) || '/').replace(/\/$/, '') || '/';
  return rest.split('/').filter(Boolean)[0] ?? '';
}

const APP_SECTIONS = new Set([
  '',
  'links',
  'commissions',
  'payouts',
  'payout-details',
  'connect',
  'coupons',
  'bounties',
  'postbacks',
  'account',
  'admin',
  'network',
  'referrals',
  'recruit',
]);

export function isPortalSection(pathname: string, tenantBase: string): boolean {
  return APP_SECTIONS.has(portalSection(pathname, tenantBase));
}
