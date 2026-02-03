
import React, { useState } from 'react';

interface MusicLinkInputProps {
  onConvert: (url: string) => void;
  isLoading: boolean;
}

const MusicLinkInput: React.FC<MusicLinkInputProps> = ({ onConvert, isLoading }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onConvert(url.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto text-center">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-fuchsia-500/20 dark:bg-fuchsia-500/10 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
        <div className="relative">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste music link here..."
            disabled={isLoading}
            autoFocus
            className="w-full bg-white dark:bg-neutral-900/40 border border-slate-200 dark:border-neutral-800 rounded-2xl py-5 px-8 text-lg md:text-xl font-medium text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all shadow-sm"
          />
        </div>
      </div>
      
      <div className="mt-10 flex justify-center">
        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="px-12 py-4 bg-fuchsia-600 dark:bg-fuchsia-500 text-white text-[11px] font-black uppercase tracking-[0.4em] rounded-full hover:bg-fuchsia-500 dark:hover:bg-fuchsia-400 transition-all disabled:opacity-20 disabled:grayscale active:scale-95 shadow-[0_0_20px_rgba(217,70,239,0.2)] hover:shadow-[0_0_25px_rgba(217,70,239,0.4)]"
        >
          {isLoading ? 'Bridging...' : 'Bridge Track'}
        </button>
      </div>
    </form>
  );
};

export default MusicLinkInput;
