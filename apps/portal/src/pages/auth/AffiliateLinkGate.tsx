import { Link } from 'react-router';
import { useTenantBase } from '../../tenant-base.js';
import { theme } from '../../theme.js';
import { AuthFrame } from './Shared.js';

/** Root and /links are the pages where an affiliate gets their share link.
 *  Signed-out visitors stay on those pages. Sign-in is a link, not the landing. */
export function isAffiliateLinkEntry(pathname: string, tenantBase: string): boolean {
  const rest = (pathname.slice(tenantBase.length) || '/').replace(/\/$/, '') || '/';
  return rest === '/' || rest === '/links';
}

export function AffiliateLinkGate() {
  const tenantBase = useTenantBase();
  return (
    <AuthFrame title="Your link" subtitle="This is the page where you get the link you share.">
      <p style={{ color: theme.textMuted, fontSize: 14, lineHeight: 1.6, margin: '0 0 16px' }}>
        After you sign in, this page shows your personal link. Copy it and share it. Clicks, signups, and commission stay with that link.
      </p>
      <Link
        to={`${tenantBase}/login`}
        style={{
          display: 'block',
          width: '100%',
          padding: '10px 14px',
          background: theme.accent,
          color: theme.accentInk,
          borderRadius: theme.radiusSm,
          fontSize: 14,
          fontWeight: 600,
          textAlign: 'center',
          textDecoration: 'none',
        }}
      >
        Sign in
      </Link>
    </AuthFrame>
  );
}
