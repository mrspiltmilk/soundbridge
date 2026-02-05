
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

  return (
    <div className="w-full space-y-12 animate-in slide-in-bottom">
      <div className="text-center space-y-2">
        <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest px-4">
          {metadata.title}
        </h2>
        <div className="flex items-center justify-center gap-2">
          <span className="w-4 h-px bg-fuchsia-500/30"></span>
          <p className="text-fuchsia-500 text-[9px] font-black uppercase tracking-[0.4em]">
            {metadata.artist}
          </p>
          <span className="w-4 h-px bg-fuchsia-500/30"></span>
        </div>
      </div>

      <div className="grid gap-3">
        {metadata.links.map((link) => {
          const config = platformConfig[link.platform];
          if (!config) return null;
          const IconComp = Icons[config.icon];
          return (
            <div 
              key={link.platform} 
              className="group flex items-center justify-between p-4 bg-white dark:bg-neutral-900/40 border border-slate-100 dark:border-neutral-800/50 rounded-2xl transition-all hover:border-fuchsia-500/20 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className={`w-9 h-9 flex items-center justify-center rounded-xl ${config.bg} ${config.color}`}>
                  <IconComp />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    {config.label}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={(e) => copyToClipboard(link.url, e)}
                  className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-fuchsia-500 transition-colors px-2"
                >
                  Copy
                </button>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-[8px] font-black uppercase tracking-widest transition-transform active:scale-95"
                >
                  Open
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center pt-4">
        <button 
          onClick={onReset}
          className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-400 hover:text-fuchsia-500 transition-colors"
        >
          ← New Session
        </button>
      </div>
    </div>
  );
};

export default ResultCard;
