import { test, expect } from 'bun:test';
import { readFileSync } from 'node:fs';
import { embedFor, pickEmbed, parseTracklist, releaseStructure } from '../src/lib/design/releasePage.ts';
import { composeArc, slotOf } from '../src/lib/composition/arc.ts';
import { hiddenReason } from '../src/lib/editor/emptySections.ts';

// Kyle, Nov 6: "feels like there is something missing from this approach — like it's not the
// right format for this." A record page is a place to hear the record, not a sales arc.
test('the platform\'s own embed is derived from the link the owner pasted; Bandcamp has none', () => {
  expect(embedFor('https://open.spotify.com/album/6EbSxQ6UMqHVPGJT5hOutL').src).toBe('https://open.spotify.com/embed/album/6EbSxQ6UMqHVPGJT5hOutL?theme=0');
  expect(embedFor('https://music.apple.com/us/album/drift-off/6821403918').src).toBe('https://embed.music.apple.com/us/album/drift-off/6821403918');
  expect(embedFor('https://tidal.com/album/123456').src).toBe('https://embed.tidal.com/albums/123456');
  expect(embedFor('https://soundcloud.com/4dhb/sets/drift-off').src).toMatch(/^https:\/\/w\.soundcloud\.com\/player\/\?url=https%3A%2F%2Fsoundcloud\.com%2F4dhb%2Fsets%2Fdrift-off/);
  expect(embedFor('https://music.youtube.com/playlist?list=OLAK5uy_k').src).toBe('https://www.youtube-nocookie.com/embed/videoseries?list=OLAK5uy_k');
  expect(embedFor('https://youtu.be/abc123').src).toBe('https://www.youtube-nocookie.com/embed/abc123');
  expect(embedFor('https://4dhb.bandcamp.com/album/drift-off')).toBeNull();
  expect(embedFor('javascript:alert(1)')).toBeNull();
  expect(embedFor('https://evil.example/open.spotify.com/album/x')).toBeNull();
});

test('the page gets one player: the owner\'s choice, else the best of their pasted links', () => {
  const links = { Bandcamp: 'https://4dhb.bandcamp.com/album/drift-off', 'YouTube Music': 'https://music.youtube.com/playlist?list=L', Spotify: 'https://open.spotify.com/album/A' };
  expect(pickEmbed(null, links).provider).toBe('spotify');
  expect(pickEmbed('https://music.apple.com/us/album/drift-off/1', links).provider).toBe('apple-music');
  expect(pickEmbed(null, { Bandcamp: 'https://4dhb.bandcamp.com/album/drift-off' })).toBeNull();
  expect(hiddenReason({ type: 'player', content: {} })).toMatch(/Hidden until you paste an album link/);
  expect(hiddenReason({ type: 'player', content: { pageLinks: links } })).toBeNull();
  expect(hiddenReason({ type: 'tracklist', content: { tracks: [] } })).toMatch(/tracklist/);
});

test('the tracklist is the owner\'s, numbering stripped, and the structure takes the release shape', () => {
  expect(parseTracklist('1. Lobby\n2) Stairwell\n- Second Floor\n\n 14. Roof ')).toEqual(['Lobby', 'Stairwell', 'Second Floor', 'Roof']);
  expect(releaseStructure(['hero', 'problem-solution', 'features', 'social-proof', 'final-cta'], true)).toEqual(['hero', 'player', 'problem-solution', 'tracklist', 'social-proof', 'final-cta']);
  expect(releaseStructure(['hero', 'features', 'final-cta'], false)).toEqual(['hero', 'player', 'final-cta']);
  // The arc keeps them where the release shape put them.
  expect(slotOf('player')).toBe('hero');
  expect(slotOf('tracklist')).toBe('outcome');
  const arc = composeArc(['hero', 'player', 'problem-solution', 'tracklist', 'final-cta'], { solutionStatement: 'x', problemStatement: 'y', messagingPillars: [] });
  expect(arc.structure).toEqual(['hero', 'player', 'problem-solution', 'tracklist', 'final-cta']);
});

test('creative pages run the owner\'s words as one unlabelled passage, and every renderer knows the new sections', () => {
  const mapper = readFileSync(new URL('../src/utils/sectionMapper.ts', import.meta.url), 'utf8');
  expect(mapper).toMatch(/releaseStructure\(pageStructure, tracklist\.length > 0\)/);
  expect(mapper).toMatch(/creativeWork \? \{ labels: 'none' \}/);
  const prose = readFileSync(new URL('../src/components/sections/problem-solution/ProblemSolutionProse.tsx', import.meta.url), 'utf8');
  expect(prose).toMatch(/content\.labels !== 'none' && <p style=\{label\}>/);
  for (const f of ['src/components/public/PublicPageRenderer.tsx', 'src/components/editor/LivePreview.tsx']) {
    const src = readFileSync(new URL('../' + f, import.meta.url), 'utf8');
    expect(src).toMatch(/PlayerSection/);
    expect(src).toMatch(/TracklistSection/);
    expect(src).toMatch(/pageLinks/);
  }
  const wizard = readFileSync(new URL('../src/components/consultation/StrategicConsultation.tsx', import.meta.url), 'utf8');
  expect(wizard).toMatch(/updateData\(\{ tracklist: e\.target\.value \}\)/);
  const player = readFileSync(new URL('../src/components/sections/release/PlayerSection.tsx', import.meta.url), 'utf8');
  expect(player).toMatch(/if \(!embed && !isEditing\) return null;/);
  expect(player).toMatch(/sandbox=/);
});
