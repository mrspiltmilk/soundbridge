import React, { useState, useEffect } from 'react';
import MusicLinkInput from './components/MusicLinkInput';
import ResultCard from './components/ResultCard';
import { resolveMusicLink } from './services/geminiService';
import { AppState, MusicMetadata } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [metadata, setMetadata] = useState<MusicMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme ? savedTheme === 'dark' : prefersDark;
    setIsDark(initialTheme);
    if (initialTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleConvert = async (url: string) => {
    setState(AppState.LOADING);
    setError(null);
    try {
      const result = await resolveMusicLink(url);
      setMetadata(result);
      setState(AppState.SUCCESS);
    } catch (err: any) {
      console.error("Conversion failure:", err);
      setError(err.message || "An unexpected error occurred.");
      setState(AppState.ERROR);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-[#050505] transition-colors duration-300 relative overflow-hidden">
      {/* Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-fuchsia-500/20 dark:bg-fuchsia-500/10 blur-[120px] pointer-events-none rounded-full"></div>

      <button
        onClick={toggleTheme}
        className="fixed top-8 right-8 w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-500 dark:text-neutral-400 hover:text-fuchsia-500 transition-all z-50 shadow-sm"
      >
        <i className={`fa-solid ${isDark ? 'fa-sun' : 'fa-moon'}`}></i>
      </button>

      <div className="w-full max-w-xl relative z-10">
        <header className="mb-16 text-center space-y-2">
          <h1 className="text-sm font-bold tracking-[0.4em] uppercase text-fuchsia-600 dark:text-fuchsia-400 drop-shadow-[0_0_8px_rgba(217,70,239,0.3)]">
            SoundBridge
          </h1>
          <p className="text-slate-500 dark:text-neutral-400 text-[10px] uppercase tracking-[0.2em] font-bold">
            Universal Music Convertor
          </p>
        </header>

        <main className="min-h-[350px]">
          {state === AppState.IDLE && (
            <div className="animate-in slide-in-bottom">
              <MusicLinkInput onConvert={handleConvert} isLoading={false} />
              
              <div className="mt-20 flex justify-center gap-10 text-slate-400 dark:text-neutral-700 transition-colors">
                <i className="fa-brands fa-spotify text-2xl hover:text-[#1DB954] transition-colors" title="Spotify"></i>
                <i className="fa-brands fa-apple text-2xl hover:text-[#FA2D48] transition-colors" title="Apple Music"></i>
                <i className="fa-brands fa-youtube text-2xl hover:text-[#FF0000] transition-colors" title="YouTube Music"></i>
                <i className="fa-solid fa-music text-2xl hover:text-fuchsia-500 transition-colors" title="Tidal"></i>
              </div>
            </div>
          )}

          {state === AppState.LOADING && (
            <div className="flex flex-col items-center justify-center space-y-8 py-12 animate-in fade-in">
              <div className="w-8 h-8 border-[3px] border-fuchsia-500/10 border-t-fuchsia-500 rounded-full animate-spin"></div>
              <p className="text-slate-600 dark:text-neutral-300 text-[10px] font-bold uppercase tracking-[0.3em]">Resolving Deep Links</p>
            </div>
          )}

          {state === AppState.SUCCESS && metadata && (
            <ResultCard metadata={metadata} onReset={() => setState(AppState.IDLE)} />
          )}

          {state === AppState.ERROR && (
            <div className="text-center space-y-6 animate-in slide-in-bottom">
              <div className="p-8 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-3xl max-w-md mx-auto">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                  <i className="fa-solid fa-circle-exclamation text-red-500 text-xl"></i>
                </div>
                <p className="text-red-600 dark:text-red-400 text-[11px] font-bold uppercase tracking-wider leading-relaxed text-center">
                  {error}
                </p>
                {error?.includes("API Key") && (
                  <div className="mt-6 pt-6 border-t border-red-500/10">
                    <p className="text-[9px] text-slate-500 dark:text-neutral-500 uppercase tracking-widest leading-loose text-center">
                      Make sure your Vercel project has the <span className="text-fuchsia-500 font-black">API_KEY</span> variable set and you have <span className="text-slate-900 dark:text-white font-bold">Redeployed</span> your project.
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setState(AppState.IDLE)}
                className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-neutral-500 hover:text-fuchsia-500 transition-colors"
              >
                ← Back to Input
              </button>
            </div>
          )}
        </main>
      </div>

      <footer className="fixed bottom-8 text-[9px] uppercase tracking-[0.4em] text-slate-400 dark:text-neutral-600 pointer-events-none text-center px-4">
        Made with ♥ for music lovers
      </footer>
    </div>
  );
};

export default App;