
import React from 'react';
import { MusicMetadata } from '../types';

const Icons = {
  Spotify: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.508 17.302c-.223.367-.704.484-1.071.261-2.973-1.819-6.716-2.228-11.125-1.222-.419.095-.839-.168-.934-.587-.095-.419.168-.839.587-.934 4.828-1.103 8.956-.628 12.308 1.42.368.223.485.705.262 1.072zm1.47-3.253c-.281.455-.878.6-1.333.319-3.403-2.093-8.591-2.701-12.615-1.478-.512.155-1.045-.138-1.201-.65-.155-.512.138-1.045.65-1.201 4.595-1.397 10.312-.724 14.2 1.667.456.282.601.878.32 1.333-.001 0-.001.001-.001.01zm.126-3.414c-4.085-2.426-10.816-2.651-14.733-1.462-.625.189-1.282-.167-1.471-.792-.189-.625.167-1.282.792-1.471 4.493-1.363 11.931-1.101 16.64 1.693.562.333.751 1.058.418 1.62-.333.562-1.058.751-1.62.418-.001-.001-.001-.001-.026-.006z"/></svg>
  ),
  'Apple Music': () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M19.102 11.458c.026-3.048 2.658-4.512 2.78-4.582-1.417-2.071-3.626-2.352-4.414-2.385-1.88-.191-3.666 1.104-4.616 1.104-.951 0-2.426-1.082-4.018-1.051-2.091.031-4.015 1.217-5.092 3.088-2.17 3.76-.554 9.317 1.554 12.363 1.032 1.491 2.259 3.164 3.876 3.104 1.557-.061 2.146-1.004 4.027-1.004 1.88 0 2.415 1.004 4.053.971 1.666-.031 2.722-1.507 3.748-3.003 1.184-1.73 1.673-3.407 1.701-3.493-.037-.015-3.268-1.254-3.3-5.112zm-3.322-7.854c.844-1.022 1.411-2.443 1.256-3.854-1.213.049-2.68.809-3.55 1.831-.78.905-1.462 2.355-1.278 3.738 1.354.105 2.728-.693 3.572-1.715z"/></svg>
  ),
  'YouTube Music': () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
  ),
  Tidal: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M12.012 3.962l-3.99 4.02-4.017-4.02L0 8.007l4.005 4.008-4.005 4.005 4.005 4.017 4.008-4.017 4.002 4.017 4.005-4.017 3.985 4.017L24 16.02l-4.005-4.005L24 8.007l-3.992-4.045-4.008 4.02-3.988-4.02zm0 8.04l-3.99 4.005-4.017-4.005 3.993-4.008 4.014 4.008z"/></svg>
  )
};

interface ResultCardProps {
  metadata: MusicMetadata;
  onReset: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ metadata, onReset }) => {
  const platforms: ('Spotify' | 'Apple Music' | 'Tidal' | 'YouTube Music')[] = [
    'Spotify', 'Apple Music', 'Tidal', 'YouTube Music'
  ];

  const platformConfig: Record<string, { color: string; bg: string; label: string; icon: keyof typeof Icons }> = {
    'Spotify': { color: 'text-[#1DB954]', bg: 'bg-[#1DB954]/5', label: 'Spotify', icon: 'Spotify' },
    'Apple Music': { color: 'text-[#FA2D48]', bg: 'bg-[#FA2D48]/5', label: 'Apple Music', icon: 'Apple Music' },
    'Tidal': { color: 'text-fuchsia-500', bg: 'bg-fuchsia-500/5', label: 'Tidal', icon: 'Tidal' },
    'YouTube Music': { color: 'text-[#FF0000]', bg: 'bg-[#FF0000]/5', label: 'YT Music', icon: 'YouTube Music' },
  };

  const copyToClipboard = (url: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    const target = e.currentTarget as HTMLElement;
    const originalText = target.innerText;
    target.innerText = 'COPIED';
    setTimeout(() => {
      target.innerText = originalText;
    }, 1500);
  };

  const isComplete = metadata.links.length === platforms.length;
  const showArtist = metadata.type !== 'artist' && metadata.artist;

  return (
    <div className="w-full space-y-12 animate-in slide-in-bottom">
      <div className="text-center space-y-3">
        <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] px-4">
          {metadata.title || 'Resolving...'}
        </h2>
        <div className="flex items-center justify-center gap-3">
          <span className="w-6 h-px bg-fuchsia-500/20"></span>
          <p className="text-fuchsia-500 text-[10px] font-black uppercase tracking-[0.4em]">
            {showArtist ? metadata.artist : (metadata.type === 'artist' ? 'Verified Artist' : 'Tuning...')}
          </p>
          <span className="w-6 h-px bg-fuchsia-500/20"></span>
        </div>
      </div>

      <div className="grid gap-4">
        {platforms.map((p) => {
          const link = metadata.links.find(l => l.platform === p);
          const config = platformConfig[p];
          if (!config) return null;
          const IconComp = Icons[config.icon];
          
          return (
            <div 
              key={p} 
              className={`group flex items-center justify-between p-5 bg-white dark:bg-neutral-950/40 border border-slate-100 dark:border-neutral-900/50 rounded-2xl transition-all duration-500 shadow-sm ${!link ? 'opacity-20' : 'hover:border-fuchsia-500/30'}`}
            >
              <div className="flex items-center gap-5">
                <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${config.bg} ${config.color} ${!link ? 'grayscale' : ''}`}>
                  <IconComp />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
                    {config.label}
                  </span>
                </div>
              </div>
              
              {link ? (
                <div className="flex items-center gap-5 animate-in fade-in">
                  <button
                    onClick={(e) => copyToClipboard(link.url, e)}
                    className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-fuchsia-500 transition-colors"
                  >
                    Copy
                  </button>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-[9px] font-black uppercase tracking-widest transition-transform active:scale-95"
                  >
                    Open
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-2 pr-4">
                  <div className="w-1 h-1 bg-slate-200 dark:bg-neutral-800 rounded-full animate-pulse"></div>
                  <div className="w-1 h-1 bg-slate-200 dark:bg-neutral-800 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-8 pt-6">
        {!isComplete && (
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-fuchsia-500 rounded-full animate-ping"></div>
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-fuchsia-500/40">Broadcasting...</span>
          </div>
        )}
        <button 
          onClick={onReset}
          className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-400 hover:text-fuchsia-600 transition-colors py-2 px-4 border border-transparent hover:border-slate-100 dark:hover:border-neutral-800 rounded-full"
        >
          ← New Session
        </button>
      </div>
    </div>
  );
};

export default ResultCard;
