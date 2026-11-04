import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { theme } from '../theme.js';
import { AuthFrame } from './auth/Shared.js';
import { affiliateTitle } from '../lib/affiliateHost.js';
import { useTenantBase } from '../tenant-base.js';

export interface ProgramTerms {
  currency: string;
  minimumPayout: number;
  payoutSchedule: string;
  nextRun: string;
  programs: Array<{
    name: string;
    commission: string;
    attributionWindowDays: number;
    holdDays: number;
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

export function ProgramTermsCard() {
  const terms = useProgramTerms();
  if (terms.isLoading) return null;
  if (!terms.data || terms.data.programs.length === 0) return null;
  const data = terms.data;
  return (
    <section style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: theme.radiusSm, padding: 16, marginBottom: 16 }}>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Program terms</div>
      {data.programs.map((program) => (
        <p key={program.name} style={{ margin: '0 0 8px', color: theme.text, fontSize: 14, lineHeight: 1.6 }}>
          <strong>{program.name}.</strong> Commission is {program.commission}. A visit is remembered for {program.attributionWindowDays} days. Commission is held {program.holdDays} days before it can be approved.
        </p>
      ))}
      <p style={{ margin: 0, color: theme.textMuted, fontSize: 13, lineHeight: 1.6 }}>
        Amounts are in {data.currency}. The minimum payout is {data.minimumPayout} {data.currency}. Payouts run {data.payoutSchedule}. {data.nextRun}
      </p>
    </section>
  );
}

function PublicShell({ title, children }: { title: string; children: ReactNode }) {
  const tenantBase = useTenantBase();
  const product = affiliateTitle() ?? 'Affiliate';
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

export function TermsPage() {
  return (
    <PublicShell title="Terms">
      <ProgramTermsCard />
      <p style={{ color: theme.textMuted, lineHeight: 1.6 }}>
        These are the terms of the affiliate program. A code beats a remembered visit. The first payment locks the credit. A refund reverses the commission.
      </p>
    </PublicShell>
  );
}

export function FaqPage() {
  return (
    <PublicShell title="FAQ">
      <p style={{ lineHeight: 1.6 }}><strong>How do I get a code?</strong> Sign up, then sign in. The code is on the links page after you sign in.</p>
      <p style={{ lineHeight: 1.6 }}><strong>What is the next payout run?</strong> Approved commission is paid on the regular payout. Anything under the minimum waits for a later run.</p>
      <p style={{ lineHeight: 1.6 }}><strong>What does Identified mean?</strong> A visitor we could match to a person, usually after they sign up.</p>
      <ProgramTermsCard />
    </PublicShell>
  );
}

export function PrivacyPage() {
  const product = affiliateTitle() ?? 'This affiliate program';
  return (
    <PublicShell title="Privacy">
      <p style={{ color: theme.textMuted, lineHeight: 1.6 }}>
        {product} stores the name and email you use to sign in, the link you share, and the clicks and payments credited to that link. Sign-in links are emailed to that address.
      </p>
    </PublicShell>
  );
}

export function NotFoundPage() {
  const tenantBase = useTenantBase();
  return (
    <AuthFrame title="Page not found" subtitle="That address is not part of this affiliate portal.">
      <Link to={`${tenantBase}/login`} style={{ color: theme.accentText }}>Sign in</Link>
      {' · '}
      <Link to={`${tenantBase}/join`} style={{ color: theme.accentText }}>Become an affiliate</Link>
    </AuthFrame>
  );
}
