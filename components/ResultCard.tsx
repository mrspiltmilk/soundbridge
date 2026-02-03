
import React from 'react';
import { MusicMetadata } from '../types';

interface ResultCardProps {
  metadata: MusicMetadata;
  onReset: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ metadata, onReset }) => {
  const platformIcons: Record<string, { icon: string; color: string; label: string }> = {
    'Spotify': { icon: 'fa-brands fa-spotify', color: 'text-[#1DB954]', label: 'Spotify' },
    'Apple Music': { icon: 'fa-brands fa-apple', color: 'text-[#FA2D48]', label: 'Apple Music' },
    'Tidal': { icon: 'fa-solid fa-music', color: 'text-slate-900 dark:text-white', label: 'Tidal' },
    'YouTube Music': { icon: 'fa-brands fa-youtube', color: 'text-[#FF0000]', label: 'YouTube Music' },
  };

  const copyToClipboard = (url: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    const target = e.currentTarget as HTMLElement;
    const originalText = target.innerText;
    target.innerText = 'COPIED';
    setTimeout(() => target.innerText = originalText, 1500);
  };

  return (
    <div className="w-full space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-light text-slate-900 dark:text-white tracking-tight">
          {metadata.title}
        </h2>
        <p className="text-fuchsia-600 dark:text-fuchsia-400 text-xs font-bold uppercase tracking-widest drop-shadow-[0_0_4px_rgba(217,70,239,0.2)]">
          {metadata.artist}
        </p>
      </div>

      <div className="bg-white dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-900 rounded-3xl overflow-hidden shadow-sm">
        {metadata.links.length > 0 ? (
          metadata.links.map((link, idx) => {
            const platform = platformIcons[link.platform];
            if (!platform) return null;
            return (
              <div 
                key={link.platform} 
                className={`group flex items-center justify-between px-8 py-6 transition-colors hover:bg-slate-50 dark:hover:bg-neutral-900/80 ${
                  idx !== metadata.links.length - 1 ? 'border-b border-slate-100 dark:border-neutral-900' : ''
                }`}
              >
                <div className="flex items-center gap-5">
                  <i className={`${platform.icon} ${platform.color} text-xl w-6 text-center opacity-90 group-hover:opacity-100 transition-opacity`}></i>
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-700 dark:text-neutral-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {platform.label}
                  </span>
                </div>
                
                <div className="flex items-center gap-6">
                  <button
                    onClick={(e) => copyToClipboard(link.url, e)}
                    className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-neutral-400 hover:text-fuchsia-500 transition-colors"
                  >
                    Copy
                  </button>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-neutral-300 hover:text-fuchsia-600 dark:hover:text-fuchsia-400 transition-all"
                  >
                    Listen <i className="fa-solid fa-arrow-right-long text-[10px] group-hover:translate-x-1 transition-transform"></i>
                  </a>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center text-slate-500 dark:text-neutral-400 italic text-[10px] uppercase tracking-[0.3em]">
            No matches found for other platforms
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <button 
          onClick={onReset}
          className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-500 dark:text-neutral-500 hover:text-fuchsia-500 transition-colors"
        >
          Reset Session
        </button>
      </div>
    </div>
  );
};

export default ResultCard;
