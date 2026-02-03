import React from 'react';
import { MusicMetadata } from '../types';

interface ResultCardProps {
  metadata: MusicMetadata;
  onReset: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ metadata, onReset }) => {
  const platformIcons: Record<string, { icon: string; color: string; bg: string; label: string }> = {
    'Spotify': { icon: 'fa-brands fa-spotify', color: 'text-[#1DB954]', bg: 'bg-[#1DB954]/5', label: 'Spotify' },
    'Apple Music': { icon: 'fa-brands fa-apple', color: 'text-[#FA2D48]', bg: 'bg-[#FA2D48]/5', label: 'Apple Music' },
    'Tidal': { icon: 'fa-solid fa-music', color: 'text-fuchsia-500', bg: 'bg-fuchsia-500/5', label: 'Tidal' },
    'YouTube Music': { icon: 'fa-brands fa-youtube', color: 'text-[#FF0000]', bg: 'bg-[#FF0000]/5', label: 'YT Music' },
  };

  const copyToClipboard = (url: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    const target = e.currentTarget as HTMLElement;
    const originalContent = target.innerHTML;
    target.innerHTML = '<span class="text-fuchsia-500">Copied!</span>';
    setTimeout(() => {
      target.innerHTML = originalContent;
    }, 1500);
  };

  return (
    <div className="w-full space-y-8 animate-in slide-in-bottom">
      <div className="text-center space-y-1">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          {metadata.title}
        </h2>
        <p className="text-fuchsia-500 text-[10px] font-bold uppercase tracking-widest">
          {metadata.artist}
        </p>
      </div>

      <div className="grid gap-3">
        {metadata.links.length > 0 ? (
          metadata.links.map((link) => {
            const platform = platformIcons[link.platform];
            if (!platform) return null;
            return (
              <div 
                key={link.platform} 
                className="group flex items-center justify-between p-4 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl transition-all hover:border-fuchsia-500/30 hover:shadow-lg hover:shadow-fuchsia-500/5"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${platform.bg} ${platform.color}`}>
                    <i className={`${platform.icon} text-lg`}></i>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      {platform.label}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <button
                    onClick={(e) => copyToClipboard(link.url, e)}
                    className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-fuchsia-500 transition-colors px-2 py-1"
                  >
                    Copy
                  </button>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-slate-100 dark:bg-neutral-800 rounded-full text-[9px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors"
                  >
                    Open
                  </a>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs font-medium">
            No links found for this track.
          </div>
        )}
      </div>

      <div className="flex justify-center pt-4">
        <button 
          onClick={onReset}
          className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-fuchsia-500 transition-colors"
        >
          ← New Conversion
        </button>
      </div>
    </div>
  );
};

export default ResultCard;