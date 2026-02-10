
export interface MusicLinkResult {
  platform: 'Spotify' | 'Apple Music' | 'Tidal' | 'YouTube Music';
  url: string;
}

export interface MusicMetadata {
  title: string;
  artist: string;
  type: 'track' | 'album' | 'artist' | 'unknown';
  links: MusicLinkResult[];
}

export enum AppState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
