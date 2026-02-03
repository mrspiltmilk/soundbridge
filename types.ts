
export interface MusicLinkResult {
  platform: 'Spotify' | 'Apple Music' | 'Tidal' | 'YouTube Music';
  url: string;
  title?: string;
}

export interface MusicMetadata {
  title: string;
  artist: string;
  album?: string;
  artworkUrl?: string;
  links: MusicLinkResult[];
}

export enum AppState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
