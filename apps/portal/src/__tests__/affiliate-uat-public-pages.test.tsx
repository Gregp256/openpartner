// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import { ProgramTermsCard, TERM_PLACEHOLDER } from '../pages/PublicPages.js';
import { LoginPage } from '../pages/auth/Login.js';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function wrap(node: React.ReactNode, terms?: unknown) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
  if (terms) client.setQueryData(['program-terms'], terms);
  client.setQueryData(['public-branding', null], { programName: 'Truest', tenantSlug: 'default', whiteLabel: true });
  return render(<MemoryRouter><QueryClientProvider client={client}>{node}</QueryClientProvider></MemoryRouter>);
}

describe('program terms card', () => {
  it('shows a marked placeholder for every unset term instead of a default', () => {
    const page = wrap(<ProgramTermsCard />, { currency: null, minimumPayout: null, payoutSchedule: null, nextRun: null, programs: [] });
    expect(page.getAllByText(TERM_PLACEHOLDER).length).toBe(6);
    expect(page.queryByText(/USD|weekly/)).toBeNull();
  });
  it('shows configured values as given', () => {
    const page = wrap(<ProgramTermsCard />, {
      currency: 'AED', minimumPayout: 100, payoutSchedule: 'once a month', nextRun: 'Next run text.',
      programs: [{ name: 'Truest', commission: '20%', attributionWindowDays: 90, holdDays: 30 }],
    });
    expect(page.getByText('20%')).toBeTruthy();
    expect(page.getByText('90 days')).toBeTruthy();
    expect(page.getByText('30 days')).toBeTruthy();
    expect(page.getByText('100 AED')).toBeTruthy();
    expect(page.getByText('Payouts run once a month')).toBeTruthy();
    expect(page.queryByText(TERM_PLACEHOLDER)).toBeNull();
  });
});

describe('public sign-in', () => {
  it('has no admin key tab, no env-var name, and links to request access', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 401 })));
    const page = wrap(<LoginPage />);
    await waitFor(() => expect(page.getByText('Request access')).toBeTruthy());
    expect(page.queryByText(/Admin key/)).toBeNull();
    expect(document.body.innerHTML).not.toContain('ADMIN_API_KEY');
  });
  it('admin sign-in lives on its own route and still never names the env var', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 401 })));
    const page = wrap(<LoginPage allowAdminKey />);
    page.getByText('Admin key').click();
    await waitFor(() => expect(page.getByPlaceholderText('op_...')).toBeTruthy());
    expect(document.body.innerHTML).not.toContain('ADMIN_API_KEY');
  });
});
