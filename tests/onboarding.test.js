import { test, expect } from 'bun:test';
import { readFileSync, readdirSync } from 'fs';
import { normalizeWebsite, firstNameOf, onboardingErrors, readOnboardingHandoff, needsOnboarding, HOW_IT_WORKS } from '../src/lib/onboarding';
const src = (f) => readFileSync(new URL('../' + f, import.meta.url), 'utf8');

test('website: forgiving input, refuses non-addresses', () => {
  expect(normalizeWebsite('acme.com')).toBe('https://acme.com');
  expect(normalizeWebsite(' www.acme.com/about/ ')).toBe('https://www.acme.com/about');
  expect(normalizeWebsite('http://acme.io')).toBe('http://acme.io');
  expect(normalizeWebsite('')).toBeNull();
  expect(normalizeWebsite('my business')).toBeNull();
  expect(normalizeWebsite('localhost')).toBeNull();
});

test('greeting uses a stated name, never the email prefix', () => {
  expect(firstNameOf('kyle moyer')).toBe('kyle');
  expect(firstNameOf('  ')).toBe('');
  expect(firstNameOf(undefined)).toBe('');
  expect(src('src/pages/Dashboard.tsx')).not.toMatch(/email\.split\('@'\)/);
  const h = src('src/components/dashboard/DashboardHeader.tsx');
  expect(h).toMatch(/Welcome back\$\{name\}/);
});

test('onboarding asks name and business, website optional', () => {
  expect(onboardingErrors({ name: '', businessName: '', website: '' })).toEqual({ name: expect.any(String), businessName: expect.any(String) });
  expect(onboardingErrors({ name: 'Kyle', businessName: 'Hyperbrand', website: '' })).toEqual({});
  expect(onboardingErrors({ name: 'Kyle', businessName: 'Hyperbrand', website: 'not a site' }).website).toBeTruthy();
});

test('hand-off to the wizard travels in router state and is cleaned', () => {
  expect(readOnboardingHandoff({ onboarding: { businessName: ' Hyperbrand ', websiteUrl: 'hyperbrand.ai' } })).toEqual({ businessName: 'Hyperbrand', websiteUrl: 'https://hyperbrand.ai' });
  expect(readOnboardingHandoff(null)).toBeNull();
  expect(readOnboardingHandoff({ onboarding: { businessName: '', websiteUrl: '' } })).toBeNull();
  expect(src('src/pages/NewConsultation.tsx')).toMatch(/readOnboardingHandoff\(location\.state\)/);
  expect(src('src/pages/NewConsultation.tsx')).toMatch(/initialUrl=\{onboarding\?\.websiteUrl/);
  expect(src('src/components/consultation/StrategicConsultation.tsx')).toMatch(/statedBusinessName\.trim\(\)/);
});

test('only accounts with no onboarded_at go through it; a failed read never blocks', () => {
  expect(needsOnboarding(null, false)).toBe(true);
  expect(needsOnboarding({ onboarded_at: null }, false)).toBe(true);
  expect(needsOnboarding({ onboarded_at: '2026-11-01' }, false)).toBe(false);
  expect(needsOnboarding(null, true)).toBe(false);
});

test('/wizard has no either/or choice; /welcome is routed; migration keeps RLS', () => {
  const w = src('src/pages/WizardChoice.tsx');
  expect(w).not.toMatch(/Guided Conversation|Step-by-Step Form/);
  expect(w).toMatch(/navigate\('\/welcome'/);
  expect(src('src/App.tsx')).toMatch(/path="\/welcome"/);
  const mig = readdirSync(new URL('../supabase/migrations/', import.meta.url)).filter((f) => f.startsWith('20261101040000'));
  expect(mig.length).toBe(1);
  const sql = src('supabase/migrations/' + mig[0]);
  expect(sql).toMatch(/ADD COLUMN IF NOT EXISTS onboarded_at/);
  expect(sql).not.toMatch(/DROP POLICY|DISABLE ROW LEVEL/);
});

test('how-it-works copy makes no promises the product does not keep', () => {
  const text = HOW_IT_WORKS.map((s) => s.title + ' ' + s.body).join(' ');
  expect(text).not.toMatch(/minutes|guarantee|only|instantly|AI-powered|convert/i);
  expect(text).toMatch(/Strategy Brief/);
});

test('one intake path: nothing routes to the retired chat wizard', () => {
  expect(src('src/services/flowEngine.ts')).not.toMatch(/route: '\/wizard\/chat'/);
  expect(src('src/services/flowEngine.ts')).toMatch(/route: '\/wizard\/form'/);
  expect(src('src/App.tsx')).toMatch(/path="\/wizard\/chat" element=\{<Navigate to="\/wizard" replace \/>\}/);
  // The form wizard picks up the demo's answers from ?consultationId.
  expect(src('src/pages/NewConsultation.tsx')).toMatch(/source: 'demo_consultation'/);
});

test('every way in lands on onboarding or the form wizard, never the old brand-setup/huddle pipeline', () => {
  expect(src('src/components/landing/DefaultHero.tsx')).toMatch(/<Link to="\/wizard">/);
  expect(src('src/components/Header.tsx')).not.toMatch(/to="\/brand-setup"/);
  const signup = src('src/pages/Signup.tsx');
  expect(signup).not.toMatch(/navigate\(`\/brand-setup\?consultationId/);
  expect(signup).not.toMatch(/navigate\(`\/huddle/);
  expect(src('src/components/landing/SoftLockDemo.tsx')).toMatch(/\/wizard\/form\?consultationId=\$\{consultationId\}/);
  const wc = src('src/pages/WizardChoice.tsx');
  expect(wc).not.toMatch(/\/huddle/);
  for (const f of ['src/pages/Dashboard.tsx', 'src/components/dashboard/PriorityAction.tsx', 'src/components/dashboard/ActionCards.tsx']) {
    expect(src(f)).not.toMatch(/try\?from=dashboard/);
  }
});
