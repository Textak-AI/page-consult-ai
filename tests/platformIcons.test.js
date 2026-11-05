import { test, expect } from 'bun:test';
import { resolvePlatforms } from '../src/lib/design/platformIcons.ts';

// Kyle, Nov 4: listeners expect the platforms' icons, not names. Only the ones the owner named, links only when pasted.
test('named platforms get their published marks; unknown names stay as text; links only when given', () => {
  const r = resolvePlatforms(['Spotify', 'Apple Music', 'Bandcamp', 'Tidal', 'YouTube Music', 'My own shop'], { Spotify: 'https://open.spotify.com/album/x', Tidal: 'not a url' });
  expect(r.map(p => p.title)).toEqual(['Spotify', 'Apple Music', 'Bandcamp', 'TIDAL', 'YouTube Music', null]);
  expect(r[0].url).toBe('https://open.spotify.com/album/x');
  expect(r[3].url).toBeNull();
  expect(r[5].path).toBeNull();
  expect(r.every(p => p.path === null || p.path.length > 20)).toBe(true);
});
