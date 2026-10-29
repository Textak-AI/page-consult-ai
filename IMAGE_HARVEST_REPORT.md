# Image harvest and unified treatment

## Result
- Website extraction now discovers an OG/Twitter image, content `<img>` sources, and raster references in up to three same-origin JS/CSS files for client-rendered websites. It never crawls an unrelated website automatically.
- Validated images are downloaded and stored through the authenticated caller's existing `brand-assets` policies at `<owner>/site-images/<uuid>.png|jpg`. No service-role upload, new provider, migration, schema, or policy changes.
- Candidates carry `source: client-site`, source page URL, original image URL, durable URL/path, dimensions, and pixel-audit status. Existing website/consultation/page JSON holds the data.
- Hero and supporting-image pickers show client assets before stock search. Stock search attribution is labeled separately; choosing a client asset clears old Unsplash attribution. Work samples remain strictly upload-only.

## Preference enforcement
`src/lib/clientImages.ts` defines `IMAGE_SOURCE_ORDER` and `preferredImage`: **client-upload > client-site > brand-scene > unsplash**. `collectClientImages` gathers eligible structured candidates, requiring source-page and durable-path provenance for site images.

`composeClientImages` applies this ranking to unfilled hero and single differentiator supporting-image slots, annotates already chosen candidate URLs, and retains candidates in section content for editor history/autosave/public snapshots. An explicit existing user selection is never silently replaced. The optional supporting image avoids the current hero when initially composed.

Generate uses the selector in its initial brief hero path, fallback image resolver, and editor composition effect before generated image work. `useHeroImageResolution` and its standalone resolver accept ranked candidates before generated cache/work. Existing AI generation feature flags remain unchanged: the ranking selects available assets; it does not enable or request new provider work.

## Treatment
`src/lib/design/tokens.ts:imageTreatment` owns the 8px radius, 4:3 photographic frame and overlay strengths: restrained 0, balanced 0.06, expressive 0.10. `TreatedImage` uses a client-primary color blend defined in global CSS, eager/high priority for hero imagery, and lazy loading for below-fold images. Failed loads disappear. Full-bleed hero imagery fills an absolutely reserved section rather than imposing a 4:3 hero height.

Shared treatment is used in main and art-directed heroes, differentiator supporting image, photo gallery, work samples, testimonial portraits, founder/team photos, example thumbnails, and image-background beta hero. Logos retain their separate audited identity treatment; decorative CSS textures and non-image hero variant re-export files are not photographic slots. Work samples retain contain-fit to avoid cropping the actual deliverable. Existing portrait outer frames/layouts remain; their inner photograph gets the shared radius/tint.

## Validation and cap
- **8 accepted images per extraction**, up to 24 candidate URLs; four fetch/decode candidates at a time.
- Per-image fetch deadline **8 seconds**, **2MB** byte cap; rejects non-public/literal/local destinations and rechecks redirects, up to four requests. Same-site SPA discovery is limited to three JS/CSS files, 2MB each.
- Decode must succeed; minimum **16px short side / 64px long side**, sampled down to **64px** long side, alpha **≤16** invisible, opaque per-channel range **≤12** rejects solid colors; completely transparent images rejected. A decoded image above 20 million pixels is discarded.
- Pixel rules are shared by the logo/work-sample measured audit and server harvest. Harvest storage currently accepts decoded **PNG/JPEG MIME** only. WebP URLs are discovered but their MIME is deliberately not persisted by this v1 decoder/storage path; uploaded work samples still support WebP.
- Logo/icon/avatar/tracking/pixel/badge/sprite URL or image-tag markers, SVGs, and the selected logo URL are excluded. These are heuristic filters, not semantic image recognition; editorial suitability still needs the client's selection.

## Live verification
1. Fresh authenticated extraction of **https://hyperbrand.ai** returned `harvestStatus: complete` and **0 images**. Browser inspection independently found **0 `<img>` elements**; the current site has drawn graphics, SVG textures and a cube rather than raster content photos. The requested successful harvested hero from that exact site therefore cannot honestly be demonstrated.
2. The homepage links **https://hyperbrandcreative.com/**, Kyle's creative site. A separate, explicitly targeted test extraction there returned **4 durable, pixel-validated assets**: 1200×630 OG image, 457×457 portrait, 900×1157 speaking photo, 400×419 mobile speaking photo. Nothing was harvested automatically across the domain boundary.
3. Created a disposable owner draft using that fresh extraction. Editor automatically composed harvested imagery, displayed all four candidates with source-page links, allowed selection, and persisted `client-site` asset provenance. Actual owner database readback confirmed selection; no AI work was needed.
4. Desktop and 375px iframe editor: two treated images, no horizontal overflow, picker functional, zero page runtime errors.
5. Used the real Share control and opened its token preview signed out. Desktop/mobile: both images decoded, shared 8px radius and 0.06 client-color treatment; support reserved 4:3/lazy, hero eager. CLS: **0.0002821 desktop / 0 mobile**, no overflow or runtime errors. Visually inspected screenshots. The OG artwork is legible in the picker but contains its own lettering and is not an ideal background; no claim of art-direction suitability is made.
6. Removed the temporary draft, its preview links, and all four harvested files through the owner session; readback showed zero remaining test pages and four removed files. No real pages were changed or published.

## Diff and remaining boundaries
New shared modules: `imageAudit.ts`, `siteImages.ts`, `clientImages.ts`, `ClientImageContext.tsx`, `TreatedImage.tsx`; two regression files. Extended existing extractor, brand setup handoff, Generate composition, image pickers and photographic render slots. Architecture and roadmap updated.

No authentication requirements were added to ordinary guest website analysis: guests can extract brand information but harvest returns `sign-in-required` with no stored assets. Ownership of a submitted external website is supplied by the consultation/user; the system does not independently prove domain ownership. No new verification infrastructure was introduced.

No whole-site crawl, semantic image classification, exact pixel/perceptual duplicate detection, or automatic pruning of durable assets: retained copies protect undo and existing snapshots. Responsive image variants can both appear. Original filenames are not turned into captions or alt claims. Harvested content is never injected into upload-only work samples.

Tests: existing full suite 262 passed after the first nine new image tests; final suite adds four harvesting boundary regressions. Automatic preview checks are clean. Earlier scripted verification retries encountered test-selector/preview-column mistakes; the successful run used actual Edit and Share controls, with saved and signed-out UI checks.