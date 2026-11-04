import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { theme } from '../theme.js';
import { AuthFrame } from './auth/Shared.js';
import { affiliateTitle } from '../lib/affiliateHost.js';
import { usePublicBrand } from '../lib/useBrand.js';
import { useTenantBase } from '../tenant-base.js';

export interface ProgramTerms {
  currency: string | null;
  minimumPayout: number | null;
  payoutSchedule: string | null;
  nextRun: string | null;
  programs: Array<{
    name: string;
    commission: string | null;
    attributionWindowDays: number | null;
    holdDays: number | null;
  }>;
}

export function useProgramTerms() {
  return useQuery({
    queryKey: ['program-terms'],
    queryFn: async () => {
      const r = await fetch('/api/program-terms', { credentials: 'include' });
      if (!r.ok) throw new Error('Could not load program terms');
      return (await r.json()) as ProgramTerms;
    },
  });
}

/** Shown in place of any term the program has not configured yet. Never a
 *  guessed value: the brand confirms each one in its program settings. */
export const TERM_PLACEHOLDER = 'To be confirmed';

function Term({ label, value }: { label: string; value: string | null }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '6px 0', borderTop: `1px solid ${theme.borderSubtle}`, fontSize: 14 }}>
      <span style={{ color: theme.textMuted }}>{label}</span>
      {value ? (
        <span style={{ color: theme.text, textAlign: 'right' }}>{value}</span>
      ) : (
        <span data-placeholder="true" style={{ color: theme.textDim, fontStyle: 'italic', textAlign: 'right' }}>{TERM_PLACEHOLDER}</span>
      )}
    </div>
  );
}

function days(n: number | null): string | null {
  if (n == null) return null;
  return n === 1 ? '1 day' : `${n} days`;
}

/** Commission rate, attribution window, hold period, payout schedule,
 *  minimum and currency, read from the program. Unset values show a
 *  marked placeholder rather than a default. */
export function ProgramTermsCard({ compact = false }: { compact?: boolean }) {
  const terms = useProgramTerms();
  if (terms.isLoading) return null;
  const data: ProgramTerms = terms.data ?? { currency: null, minimumPayout: null, payoutSchedule: null, nextRun: null, programs: [] };
  const programs = data.programs.length > 0 ? data.programs : [{ name: 'Commission', commission: null, attributionWindowDays: null, holdDays: null }];
  const minimum = data.minimumPayout == null ? null : data.currency ? `${data.minimumPayout} ${data.currency}` : String(data.minimumPayout);
  const hasPlaceholder =
    [data.currency, data.minimumPayout, data.payoutSchedule].some((v) => v == null) ||
    programs.some((p) => p.commission == null || p.attributionWindowDays == null || p.holdDays == null);
  return (
    <section aria-label="Program terms" style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: theme.radiusSm, padding: 16, marginBottom: 16 }}>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Program terms</div>
      {programs.map((program) => (
        <div key={program.name} style={{ marginBottom: 8 }}>
          {data.programs.length > 1 && <div style={{ fontSize: 13, fontWeight: 600, margin: '6px 0' }}>{program.name}</div>}
          <Term label="Commission rate" value={program.commission} />
          <Term label="Attribution (cookie) window" value={days(program.attributionWindowDays)} />
          <Term label="Hold period before approval" value={days(program.holdDays)} />
        </div>
      ))}
      <Term label="Payout schedule" value={data.payoutSchedule ? `Payouts run ${data.payoutSchedule}` : null} />
      <Term label="Minimum payout" value={minimum} />
      <Term label="Currency" value={data.currency} />
      {!compact && (
        <p style={{ margin: '10px 0 0', color: theme.textMuted, fontSize: 13, lineHeight: 1.6 }}>
          <strong>What &ldquo;next run&rdquo; means:</strong> {data.nextRun ?? 'the next scheduled payout of approved commission. An amount under the minimum waits for a later run.'}
        </p>
      )}
      {hasPlaceholder && (
        <p style={{ margin: '8px 0 0', color: theme.textDim, fontSize: 12 }}>
          &ldquo;{TERM_PLACEHOLDER}&rdquo; means the program has not published that term yet.
        </p>
      )}
    </section>
  );
}

function PublicShell({ title, children }: { title: string; children: ReactNode }) {
  const tenantBase = useTenantBase();
  const brand = usePublicBrand();
  const product = affiliateTitle(undefined, brand.isLoading ? null : brand.programName) ?? 'Affiliate';
  return (
    <div style={{ minHeight: '100vh', background: theme.bg, color: theme.text }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px 20px 64px' }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{product}</div>
        <h1 style={{ fontSize: 28, margin: '0 0 12px' }}>{title}</h1>
        {children}
        <p style={{ marginTop: 28, fontSize: 13, color: theme.textMuted }}>
          <Link to={`${tenantBase}/terms`} style={{ color: theme.accentText }}>Terms</Link>
          {' · '}
          <Link to={`${tenantBase}/privacy`} style={{ color: theme.accentText }}>Privacy</Link>
          {' · '}
          <Link to={`${tenantBase}/faq`} style={{ color: theme.accentText }}>FAQ</Link>
          {' · '}
          <Link to={`${tenantBase}/login`} style={{ color: theme.accentText }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

function LegalTermsLink() {
  const brand = usePublicBrand();
  if (brand.isLoading) return null;
  return brand.programTermsUrl ? (
    <p style={{ lineHeight: 1.6 }}>
      The full legal terms are at <a href={brand.programTermsUrl} style={{ color: theme.accentText }}>{brand.programTermsUrl}</a>.
    </p>
  ) : (
    <p data-placeholder="true" style={{ color: theme.textDim, fontStyle: 'italic', lineHeight: 1.6 }}>
      Full legal terms: {TERM_PLACEHOLDER}. They will be linked here once the program publishes them.
    </p>
  );
}

export function TermsPage() {
  return (
    <PublicShell title="Program terms">
      <ProgramTermsCard />
      <p style={{ color: theme.textMuted, lineHeight: 1.6 }}>
        How credit works: a code entered at sign-up beats a remembered visit. Within the attribution window, the last
        affiliate link clicked gets the credit. The first payment locks the credit to that affiliate. A refund reverses
        the commission on it.
      </p>
      <LegalTermsLink />
    </PublicShell>
  );
}

export function FaqPage() {
  return (
    <PublicShell title="FAQ">
      <p style={{ lineHeight: 1.6 }}><strong>How do I join?</strong> Use Request access on the sign-in page. Once you are approved, sign in and your personal link and code are on the Links page.</p>
      <p style={{ lineHeight: 1.6 }}><strong>What is the next payout run?</strong> Approved commission is paid on the regular payout. Anything under the minimum waits for a later run.</p>
      <p style={{ lineHeight: 1.6 }}><strong>What does Identified mean?</strong> A visitor we could match to a person, usually after they sign up.</p>
      <ProgramTermsCard />
    </PublicShell>
  );
}

export function PrivacyPage() {
  const brand = usePublicBrand();
  const product = affiliateTitle(undefined, brand.isLoading ? null : brand.programName) ?? 'This affiliate program';
  return (
    <PublicShell title="Privacy">
      <p style={{ color: theme.textMuted, lineHeight: 1.6 }}>
        {product} stores the name and email you use to sign in, your payout details, the links you share, and the clicks
        and payments credited to those links. Visitor IP addresses are stored only as hashes. Sign-in links are emailed to
        your address.
      </p>
      {brand.supportEmail ? (
        <p style={{ lineHeight: 1.6 }}>
          Questions about your data: <a href={`mailto:${brand.supportEmail}`} style={{ color: theme.accentText }}>{brand.supportEmail}</a>.
        </p>
      ) : null}
      <p data-placeholder="true" style={{ color: theme.textDim, fontStyle: 'italic', lineHeight: 1.6 }}>
        Full privacy notice: {TERM_PLACEHOLDER}.
      </p>
    </PublicShell>
  );
}

export function NotFoundPage({ signedIn = false }: { signedIn?: boolean } = {}) {
  const tenantBase = useTenantBase();
  return (
    <AuthFrame title="Page not found" subtitle="That address is not part of this affiliate portal.">
      {signedIn ? (
        <Link to={tenantBase || '/'} style={{ color: theme.accentText }}>Back to your dashboard</Link>
      ) : (
        <>
          <Link to={`${tenantBase}/login`} style={{ color: theme.accentText }}>Sign in</Link>
          {' · '}
          <Link to={`${tenantBase}/signup`} style={{ color: theme.accentText }}>Request access</Link>
        </>
      )}
    </AuthFrame>
  );
}
