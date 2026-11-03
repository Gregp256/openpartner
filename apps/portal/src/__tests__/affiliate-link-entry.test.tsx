// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AffiliateLinkGate, isAffiliateLinkEntry } from '../pages/auth/AffiliateLinkGate.js';
import { pathAfterSignIn } from '../pages/auth/Login.js';

describe('affiliate link entry', () => {
  it('treats the site root and the links page as the place an affiliate gets their link', () => {
    expect(isAffiliateLinkEntry('/', '')).toBe(true);
    expect(isAffiliateLinkEntry('/links', '')).toBe(true);
    expect(isAffiliateLinkEntry('/t/truest/links', '/t/truest')).toBe(true);
    expect(isAffiliateLinkEntry('/commissions', '')).toBe(false);
    expect(isAffiliateLinkEntry('/login', '')).toBe(false);
  });

  it('sends a partner to their links page, and keeps a return path that is not sign-in', () => {
    expect(pathAfterSignIn('partner', '')).toBe('/links');
    expect(pathAfterSignIn('partner', '/t/truest')).toBe('/t/truest/links');
    expect(pathAfterSignIn('admin', '')).toBe('/');
    expect(pathAfterSignIn('partner', '', { pathname: '/commissions' })).toBe('/commissions');
    expect(pathAfterSignIn('partner', '', { pathname: '/login' })).toBe('/links');
  });

  it('offers sign-in as a link on the page where the affiliate gets their link', () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
    client.setQueryData(['public-branding', null], { tenantSlug: 'default', programName: 'Truest', whiteLabel: true });
    const page = render(
      <MemoryRouter>
        <QueryClientProvider client={client}>
          <AffiliateLinkGate />
        </QueryClientProvider>
      </MemoryRouter>,
    );
    expect(page.getByText('Your link')).toBeTruthy();
    expect(page.getByRole('link', { name: 'Sign in' }).getAttribute('href')).toBe('/login');
  });
});
