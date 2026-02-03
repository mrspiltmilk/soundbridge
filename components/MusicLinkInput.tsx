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
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto space-y-6">
      <div className="relative group">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste Spotify, Apple, or Tidal link..."
          disabled={isLoading}
          autoFocus
          className="w-full bg-white dark:bg-neutral-900 border-2 border-slate-200 dark:border-neutral-800 rounded-2xl py-5 px-6 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-600 focus:outline-none focus:border-fuchsia-500/50 focus:ring-4 focus:ring-fuchsia-500/5 transition-all shadow-sm"
        />
      </div>
      
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-xl shadow-fuchsia-500/10"
        >
          {isLoading ? 'Converting...' : 'Bridge Link'}
        </button>
      </div>
    </form>
  );
};

export default MusicLinkInput;