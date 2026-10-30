# Conservative dead-code sweep

## Scope and evidence

Code only: no table, column, policy, migration, function configuration, deployment or hosted endpoint changed. SHA-256 checks confirm all 129 existing migration/config files are byte-identical.

Searches covered source, tests, docs and hidden config, excluding Git metadata, dependencies, lockfiles and compiler caches. Symbol searches were paired with module-path searches. No filesystem/glob-driven component loader was found. Removed files were read before deletion; same-name symbols in other modules were resolved by their imports.

## Removed

| Candidate | Zero-reference proof |
| --- | --- |
| `src/utils/sectionMapper.ts`: buildTestimonials | Only its exported definition was found. Generate, TestPage and tests import other named mapper exports. Only this helper was removed. |
| `src/components/sections/TrustBadgesStrip.tsx` | No external component/path references. AVAILABLE_TRUST_BADGES was used only by this dead component; whole local subgraph removed. |
| `src/lib/industryTemplates.ts` | No module imports/path references. IndustryPattern, transformAnswerToProfessionalCopy and getAudienceLanguage occurred only here. Other INDUSTRY_PATTERNS/detectIndustry/extractCredentials symbols resolve to unrelated modules/local functions. All exports/internal data removed together. |
| `src/components/consultation/LevelUpCelebration.tsx` | Only own-file definition; no imports, JSX invocations or dynamic references. |
| `src/components/consultation/PageStrengthMeter.tsx` | Only own-file definition/props; no imports, invocations or dynamic references. |
| `src/components/consultation/StrategicLevelIndicator.tsx` | Only own-file definition; no imports, invocations or dynamic references. |
| `src/components/demo/IndustryConfirmationCard.tsx` | Only own-file definition/props; no imports, invocations or dynamic references. |
| `src/components/editor/WelcomeBackModal.tsx` | Only own-file definition/props; no imports, invocations or dynamic references. |
| `src/components/strategy-brief/CollapsibleCodeBlock.tsx` | Only own-file definition/props; no imports, invocations or dynamic references. |

**Code LOC: 178,357 → 176,689 = −1,668 physical lines**, counting src and supabase/functions, including final unterminated lines. Eight deleted files and one removed helper; documentation excluded.

## Kept: evaluated candidates

| Candidate | Reason |
| --- | --- |
| orchestrator-research | Real invocation at useOrchestrator.ts:59; hook called by OrchestratorContext.tsx:39, provider mounted by App.tsx:108. Also configured endpoint. Stale model does not prove dead code. |
| useOrchestrator / OrchestratorContext | Imported/mounted chain above; not zero-reference. Optional trigger behavior does not justify deleting the mounted/exported provider. |
| stripe-checkout | Live pack purchase caller at UpgradeDrawer.tsx:159, plus configuration. |
| create-checkout-session | Pricing.tsx and PricingPage.tsx callers. |
| stripe-webhook | External Stripe target, configuration and regression tests; internal invocation unnecessary. |
| remove-logo-background | No application invocation found, but configured endpoint; external use ambiguous. |
| render-public-page | Configured public renderer; hosting/crawler/indirect use ambiguous. |
| render-prospect-page | Configured public renderer; external/indirect use ambiguous. |
| set-session-cookie | Configured session endpoint; external/indirect use ambiguous. |
| track-prospect-page-view | Configured tracking endpoint; external/embed use ambiguous. |
| Other sectionMapper helpers/exports | Live module; only buildTestimonials had complete deletion proof. |
| DevTestPanel.tsx | Standing keep-out; untouched. |

## Kept: preliminary source-only findings

These source-only scan results remain because complete repo-wide export/path/dynamic/config audits were not established. No claim of proven dead code is made:

| Group | Candidates retained |
| --- | --- |
| Top-level components | AIDemo, AbstractHeroTeaser, AnimatedChatPreview, HeroBackgroundCarousel |
| Context/data | StyleContext, industryAesthetics |
| Hooks | useBetaPage, useExtractionTicker, useGuestSession, useSubscription, useTrialAccess |
| Utilities/services | demoHandoff, heroBackgroundPrompts, industrySections, pageScoreService |
| Consultation/demo | PrefilledWizardStep, MobileIntelligencePanel |
| Editor | EmailCaptureModal, PageGenerationLoader, StylePresetPicker |
| Landing/sections | ConversionCTAPanel, EmailGateModal, ExampleShowcaseCTA, IndustryStatsSection, InteractiveFinalCTA, PremiumShowcaseCTA |
| Other | TestimonialNudgeBanner, IntelligenceGathering |

Shared UI primitives and external entry points were not presumed dead from unused exports.

## Verification

- All 205 tests pass: Bun 198 across 27 files; separate Deno suite 7. No tests changed/skipped.
- Automatic build: build OK at 2026-10-29 01:15:56 UTC.
- Live homepage rendered; 5,454 body-text characters, no page errors, screenshot inspected.
- Post-deletion source/tests: no removed-symbol references remain.
- Protected migration/config fingerprints: zero changes.
- Standalone typecheck is unverified: no separate automatic result is exposed, and this environment prohibits manually running project builds/typechecks. Build OK is not substituted for typecheck evidence.

Skill applied: Compact code.
## 2026-10-30 — trial-theater removal
- src/components/trial/TrialBanner.tsx — only reference was Dashboard.tsx:392 (removed with it). Counted down a trial nothing enforces; showed a false "trial ended" nag at day 15.
- src/hooks/useTrialAccess.ts — zero references (`grep -rn useTrialAccess src/` returned only the hook itself).
- src/lib/contentGenerator.ts — zero references (`grep -rn contentGenerator src/` returned only the file itself).
- src/lib/contentTemplates.ts — only reference was contentGenerator.ts (removed with it). Contained canned fabricated feature claims ("Free 14-Day Trial", "SOC 2 compliance", "Bank-level encryption") that would have violated zero-fabrication had the chain ever been wired in.
