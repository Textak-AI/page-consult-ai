/**
 * The places a creative owner names ("Where can people get it, hear it or see it?") as link icons.
 * The marks are the platforms' published ones (simple-icons), used as link icons the way every
 * artist page does; nothing is drawn here. Only platforms the owner named are ever shown.
 */
import {
  siSpotify, siApplemusic, siBandcamp, siTidal, siYoutubemusic, siYoutube, siDeezer, siSoundcloud, siApplepodcasts,
  siPatreon, siBeatport, siMixcloud, siAudiomack, siPandora, siNapster, siItunes, siSubstack, siKickstarter, siGoodreads,
  siSteam, siItchdotio, siVimeo, siTwitch, siInstagram, siTiktok, siDiscord,
} from 'simple-icons';

interface Mark { title: string; path: string; }

const MARKS: Array<{ match: RegExp; icon: Mark }> = [
  { match: /^spotify$/i, icon: siSpotify },
  { match: /^apple ?music$/i, icon: siApplemusic },
  { match: /^itunes$/i, icon: siItunes },
  { match: /^bandcamp$/i, icon: siBandcamp },
  { match: /^tidal$/i, icon: siTidal },
  { match: /^youtube ?music$/i, icon: siYoutubemusic },
  { match: /^youtube$/i, icon: siYoutube },
  { match: /^deezer$/i, icon: siDeezer },
  { match: /^soundcloud$/i, icon: siSoundcloud },
  { match: /^apple ?podcasts?$/i, icon: siApplepodcasts },
  { match: /^patreon$/i, icon: siPatreon },
  { match: /^beatport$/i, icon: siBeatport },
  { match: /^mixcloud$/i, icon: siMixcloud },
  { match: /^audiomack$/i, icon: siAudiomack },
  { match: /^pandora$/i, icon: siPandora },
  { match: /^napster$/i, icon: siNapster },
  { match: /^substack$/i, icon: siSubstack },
  { match: /^kickstarter$/i, icon: siKickstarter },
  { match: /^goodreads$/i, icon: siGoodreads },
  { match: /^steam$/i, icon: siSteam },
  { match: /^itch(\.io)?$/i, icon: siItchdotio },
  { match: /^vimeo$/i, icon: siVimeo },
  { match: /^twitch$/i, icon: siTwitch },
  { match: /^instagram$/i, icon: siInstagram },
  { match: /^tiktok$/i, icon: siTiktok },
  { match: /^discord$/i, icon: siDiscord },
];

export interface PlatformLink { name: string; url?: string | null; }
export interface ResolvedPlatform { name: string; url: string | null; title: string | null; path: string | null; }

/** The owner's named platforms with their marks; names without a known mark render as text. */
export function resolvePlatforms(names: string[], links?: Record<string, string> | null): ResolvedPlatform[] {
  return names.map((name) => {
    const key = name.trim();
    const hit = MARKS.find((m) => m.match.test(key));
    const raw = links?.[key] || links?.[key.toLowerCase()] || null;
    const url = typeof raw === 'string' && /^https?:\/\//i.test(raw.trim()) ? raw.trim() : null;
    return { name: key, url, title: hit?.icon.title ?? null, path: hit?.icon.path ?? null };
  });
}
