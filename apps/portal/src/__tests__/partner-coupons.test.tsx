// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import type { CustomerReward } from '@openpartner/db';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import { AdminPartnerCoupons } from '../pages/AdminPartnerCoupons.js';
afterEach(cleanup);
function show(canEdit: boolean, customerReward?: CustomerReward | null, stripePromotionCodeId: string | null = null) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
  client.setQueryData(['partner', 'p1'], { id: 'p1', name: 'Partner' });
  client.setQueryData(['partner-coupons', 'p1'], { coupons: [{ id: 'c1', code: 'MYCODE', programId: 'pr1', canEdit, stripePromotionCodeId }] });
  client.setQueryData(['me-campaigns'], { programs: [{ id: 'pr1', name: 'Brand', partnersMayCustomizeCode: canEdit, customerReward }] });
  return render(<MemoryRouter><QueryClientProvider client={client}><AdminPartnerCoupons ownPartnerId="p1" /></QueryClientProvider></MemoryRouter>);
}
const REWARD: CustomerReward = { type: 'percent_off', value: 10, duration: 'once' };
describe('local partner coupon page', () => {
  it('offers another code for an editable assigned program while preserving existing codes', () => {
    const page = show(true, REWARD);
    expect(page.getByText('MYCODE')).toBeTruthy();
    expect(page.getByText('Deactivate')).toBeTruthy();
    const program = page.getByRole('combobox') as HTMLSelectElement;
    fireEvent.change(program, { target: { value: 'pr1' } });
    expect((page.getByText('Mint coupon') as HTMLButtonElement).disabled).toBe(false);
  });
  it('keeps brand-managed codes visible without edit controls', () => {
    const page = show(false, REWARD);
    expect(page.getByText('MYCODE')).toBeTruthy();
    expect(page.getByText('Managed by brand')).toBeTruthy();
    expect(page.queryByText('Deactivate')).toBeNull();
    expect(page.queryByText('Mint coupon')).toBeNull();
  });
});

describe('partner-visible discount terms', () => {
  it.each([
    [{ type: 'percent_off', value: 15, duration: 'once' }, '15% off, first payment only'],
    [{ type: 'percent_off', value: 20, duration: 'repeating', durationInMonths: 3 }, '20% off, for 3 months'],
    [{ type: 'amount_off', value: 5, currency: 'eur', duration: 'forever' }, '€5.00 off, every eligible payment'],
    [{ type: 'free_months', value: 2, duration: 'forever' }, '2 months free'],
  ] as Array<[CustomerReward | null, string]>)('previews %j when choosing a program', (reward, summary) => {
    const page = show(true, reward, 'promo_test');
    fireEvent.change(page.getByRole('combobox'), { target: { value: 'pr1' } });
    expect(page.getByText(`Customer discount: ${summary}`)).toBeTruthy();
    expect(page.getByText(`Current program discount: ${summary}`)).toBeTruthy();
    expect(page.getByText('Discount applies automatically at checkout')).toBeTruthy();
    expect(page.getByText(/A code does not expire on its own/)).toBeTruthy();
  });
  it('does not promise missing Stripe provisioning', () => {
    const page = show(true, REWARD);
    // No Stripe promotion recorded (always the case on hosted): say nothing
    // rather than an alarming "not recorded".
    expect(page.queryByText(/Stripe|applies automatically/)).toBeNull();
  });
  it.each([[null], [undefined]])('hides coupons when no program offers a customer discount (%s), without deleting codes', (reward) => {
    const page = show(true, reward as CustomerReward | null | undefined);
    expect(page.getByText('There is no customer discount on your programs yet.')).toBeTruthy();
    expect(page.queryByText('Mint coupon')).toBeNull();
    expect(page.queryByText('Deactivate')).toBeNull();
  });
});
