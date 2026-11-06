/**
 * The release page: the shape creative work takes. A record, a film or a book is not a problem
 * being solved; the page is a place to hear, see or read the thing. So the section set changes,
 * not only the look: cover and ask, the platform's own player, the owner's words as one
 * passage, the tracklist when stated, the close. Nothing here is written for the owner — the
 * player is the platform's embed of the link they pasted, the tracklist is theirs.
 */

export interface Embed {
  provider: 'spotify' | 'apple-music' | 'tidal' | 'soundcloud' | 'youtube';
  src: string;
  height: number;
  title: string;
}

/** The platform's own embed for a link the owner gave; null for links with no embed form (Bandcamp needs an id the URL doesn't carry). */
export function embedFor(url: string | null | undefined, accentHex?: string | null): Embed | null {
  if (typeof url !== 'string' || !/^https?:\/\//i.test(url.trim())) return null;
  let u: URL;
  try { u = new URL(url.trim()); } catch { return null; }
  const host = u.hostname.replace(/^www\./, '');
  if (host === 'open.spotify.com') {
    const m = u.pathname.match(/^\/(?:intl-[a-z]+\/)?(album|track|playlist|artist|episode|show)\/([A-Za-z0-9]+)/);
    if (!m) return null;
    return { provider: 'spotify', src: `https://open.spotify.com/embed/${m[1]}/${m[2]}?theme=0`, height: m[1] === 'track' || m[1] === 'episode' ? 152 : 352, title: 'Spotify player' };
  }
  if (host === 'music.apple.com' || host === 'embed.music.apple.com') {
    const m = u.pathname.match(/^\/([a-z]{2})\/(album|playlist|song)\/([^/]+)\/([^/?]+)/);
    if (!m) return null;
    return { provider: 'apple-music', src: `https://embed.music.apple.com/${m[1]}/${m[2]}/${m[3]}/${m[4]}${u.search}`, height: m[2] === 'song' ? 175 : 450, title: 'Apple Music player' };
  }
  if (host === 'tidal.com' || host === 'listen.tidal.com') {
    const m = u.pathname.match(/\/(album|track|playlist)s?\/([A-Za-z0-9-]+)/);
    if (!m) return null;
    return { provider: 'tidal', src: `https://embed.tidal.com/${m[1]}s/${m[2]}`, height: m[1] === 'track' ? 120 : 400, title: 'TIDAL player' };
  }
  if (host === 'soundcloud.com' || host === 'on.soundcloud.com') {
    const color = (accentHex || '#15707f').replace('#', '%23');
    return { provider: 'soundcloud', src: `https://w.soundcloud.com/player/?url=${encodeURIComponent(u.toString())}&color=${color}&auto_play=false&show_teaser=false`, height: /\/sets\//.test(u.pathname) ? 450 : 166, title: 'SoundCloud player' };
  }
  if (host === 'youtube.com' || host === 'music.youtube.com' || host === 'youtu.be') {
    const list = u.searchParams.get('list');
    const v = host === 'youtu.be' ? u.pathname.slice(1) : u.searchParams.get('v');
    if (list) return { provider: 'youtube', src: `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(list)}`, height: 352, title: 'YouTube player' };
    if (v) return { provider: 'youtube', src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(v)}`, height: 352, title: 'YouTube player' };
    return null;
  }
  return null;
}

const PREFERENCE = ['spotify', 'apple-music', 'tidal', 'soundcloud', 'youtube'] as const;

/** The one player for the page: the owner's chosen link first, else the best of the links they pasted. */
export function pickEmbed(sourceUrl: string | null | undefined, links: Record<string, string> | null | undefined, accentHex?: string | null): Embed | null {
  const chosen = embedFor(sourceUrl, accentHex);
  if (chosen) return chosen;
  const found = Object.values(links || {}).map((l) => embedFor(l, accentHex)).filter((e): e is Embed => !!e);
  found.sort((a, b) => PREFERENCE.indexOf(a.provider) - PREFERENCE.indexOf(b.provider));
  return found[0] || null;
}

/** The owner's tracklist as they typed it, one per line, leading numbers and dashes dropped. */
export function parseTracklist(text: string | null | undefined): string[] {
  if (typeof text !== 'string') return [];
  return text.split(/\r?\n/).map((l) => l.replace(/^\s*(?:\d+[.)\-:]?|[-•*])\s*/, '').trim()).filter(Boolean);
}

/**
 * The creative page structure: features (a product grid) goes, the player follows the opening,
 * the tracklist follows the owner's words when they gave one. Everything else keeps its place.
 */
export function releaseStructure(structure: string[], hasTracklist: boolean): string[] {
  const out = structure.filter((t) => t !== 'features' && t !== 'player' && t !== 'tracklist');
  const heroAt = out.findIndex((t) => t === 'hero' || t === 'beta-hero-teaser');
  out.splice(heroAt + 1, 0, 'player');
  if (hasTracklist) {
    const afterWords = out.findIndex((t) => t === 'problem-solution' || t === 'the-real-challenge');
    out.splice((afterWords === -1 ? heroAt + 1 : afterWords) + 1, 0, 'tracklist');
  }
  return out;
}
