import React, { useState, useEffect } from 'react';
import MusicLinkInput from './components/MusicLinkInput';
import ResultCard from './components/ResultCard';
import { resolveMusicLink } from './services/geminiService';
import { AppState, MusicMetadata } from './types';

// Inline SVGs for guaranteed rendering
const Icons = {
  Spotify: () => (
    <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.508 17.302c-.223.367-.704.484-1.071.261-2.973-1.819-6.716-2.228-11.125-1.222-.419.095-.839-.168-.934-.587-.095-.419.168-.839.587-.934 4.828-1.103 8.956-.628 12.308 1.42.368.223.485.705.262 1.072zm1.47-3.253c-.281.455-.878.6-1.333.319-3.403-2.093-8.591-2.701-12.615-1.478-.512.155-1.045-.138-1.201-.65-.155-.512.138-1.045.65-1.201 4.595-1.397 10.312-.724 14.2 1.667.456.282.601.878.32 1.333-.001 0-.001.001-.001.01zm.126-3.414c-4.085-2.426-10.816-2.651-14.733-1.462-.625.189-1.282-.167-1.471-.792-.189-.625.167-1.282.792-1.471 4.493-1.363 11.931-1.101 16.64 1.693.562.333.751 1.058.418 1.62-.333.562-1.058.751-1.62.418-.001-.001-.001-.001-.026-.006z"/></svg>
  ),
  Apple: () => (
    <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M19.102 11.458c.026-3.048 2.658-4.512 2.78-4.582-1.417-2.071-3.626-2.352-4.414-2.385-1.88-.191-3.666 1.104-4.616 1.104-.951 0-2.426-1.082-4.018-1.051-2.091.031-4.015 1.217-5.092 3.088-2.17 3.76-.554 9.317 1.554 12.363 1.032 1.491 2.259 3.164 3.876 3.104 1.557-.061 2.146-1.004 4.027-1.004 1.88 0 2.415 1.004 4.053.971 1.666-.031 2.722-1.507 3.748-3.003 1.184-1.73 1.673-3.407 1.701-3.493-.037-.015-3.268-1.254-3.3-5.112zm-3.322-7.854c.844-1.022 1.411-2.443 1.256-3.854-1.213.049-2.68.809-3.55 1.831-.78.905-1.462 2.355-1.278 3.738 1.354.105 2.728-.693 3.572-1.715z"/></svg>
  ),
  YouTube: () => (
    <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
  ),
  Tidal: () => (
    <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M12.012 3.962l-3.99 4.02-4.017-4.02L0 8.007l4.005 4.008-4.005 4.005 4.005 4.017 4.008-4.017 4.002 4.017 4.005-4.017 3.985 4.017L24 16.02l-4.005-4.005L24 8.007l-3.992-4.045-4.008 4.02-3.988-4.02zm0 8.04l-3.99 4.005-4.017-4.005 3.993-4.008 4.014 4.008z"/></svg>
  )
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [metadata, setMetadata] = useState<MusicMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(true);
  const [loadingText, setLoadingText] = useState('Mapping the sonic landscape');

  useEffect(() => {
    const initialTheme = localStorage.getItem('theme') === 'dark' || !('theme' in localStorage);
    setIsDark(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme);
  }, []);

  useEffect(() => {
    if (state === AppState.LOADING) {
      const phrases = [
        'Mapping the sonic landscape',
        'Aligning harmonic frequencies',
        'Tracing melodies across the void',
        'Synthesizing cosmic echoes',
        'Unlocking rhythmic secrets',
        'Bridging sonic dimensions'
      ];
      let i = 0;
      const interval = setInterval(() => {
        i = (i + 1) % phrases.length;
        setLoadingText(phrases[i]);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [state]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newTheme);
  };

  const handleConvert = async (url: string) => {
    setState(AppState.LOADING);
    setError(null);
    try {
      const result = await resolveMusicLink(url);
      setMetadata(result);
      setState(AppState.SUCCESS);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setState(AppState.ERROR);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-[#050505] transition-colors duration-500 relative overflow-hidden font-sans">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-fuchsia-500/10 dark:bg-fuchsia-500/5 blur-[120px] pointer-events-none rounded-full"></div>

      <button
        onClick={toggleTheme}
        className="fixed top-8 right-8 w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-400 hover:text-fuchsia-500 transition-all z-50 shadow-sm"
      >
        <i className={`fa-solid ${isDark ? 'fa-sun' : 'fa-moon'}`}></i>
      </button>

      <div className="w-full max-w-xl relative z-10">
        <header className="mb-16 text-center">
          <h1 className="text-xs font-black tracking-[0.6em] uppercase text-fuchsia-600 dark:text-fuchsia-400 mb-2">
            SoundBridge
          </h1>
          <p className="text-slate-400 dark:text-neutral-600 text-[9px] uppercase tracking-[0.3em] font-medium">
            Universal Music Link Convertor
          </p>
        </header>

        <main className="min-h-[400px]">
          {state === AppState.IDLE && (
            <div className="animate-in slide-in-bottom">
              <MusicLinkInput onConvert={handleConvert} isLoading={false} />
              <div className="mt-24 flex justify-center gap-14 text-slate-300 dark:text-neutral-800 transition-colors">
                <div className="flex flex-col items-center gap-4 group cursor-default">
                  <div className="group-hover:text-[#1DB954] transition-colors"><Icons.Spotify /></div>
                  <span className="text-[7px] font-black uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-all">Spotify</span>
                </div>
                <div className="flex flex-col items-center gap-4 group cursor-default">
                  <div className="group-hover:text-[#FA2D48] transition-colors"><Icons.Apple /></div>
                  <span className="text-[7px] font-black uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-all">Apple</span>
                </div>
                <div className="flex flex-col items-center gap-4 group cursor-default">
                  <div className="group-hover:text-[#FF0000] transition-colors"><Icons.YouTube /></div>
                  <span className="text-[7px] font-black uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-all">YouTube</span>
                </div>
                <div className="flex flex-col items-center gap-4 group cursor-default">
                  <div className="group-hover:text-fuchsia-500 transition-colors"><Icons.Tidal /></div>
                  <span className="text-[7px] font-black uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-all">Tidal</span>
                </div>
              </div>
            </div>
          )}

          {state === AppState.LOADING && (
            <div className="flex flex-col items-center justify-center space-y-12 py-20 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-3.5 h-3.5 bg-fuchsia-400 dark:bg-fuchsia-300 rounded-full animate-fluid-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-3.5 h-3.5 bg-fuchsia-500 dark:bg-fuchsia-400 rounded-full animate-fluid-bounce" style={{ animationDelay: '0.15s' }}></div>
                <div className="w-3.5 h-3.5 bg-fuchsia-600 dark:bg-fuchsia-500 rounded-full animate-fluid-bounce" style={{ animationDelay: '0.3s' }}></div>
                <div className="w-3.5 h-3.5 bg-fuchsia-700 dark:bg-fuchsia-600 rounded-full animate-fluid-bounce" style={{ animationDelay: '0.45s' }}></div>
              </div>
              <div className="text-center">
                <p className="text-slate-500 dark:text-neutral-500 text-[9px] font-black uppercase tracking-[0.4em] transition-all duration-500 ease-in-out">
                  {loadingText}
                </p>
              </div>
            </div>
          )}

          {state === AppState.SUCCESS && metadata && (
            <ResultCard metadata={metadata} onReset={() => setState(AppState.IDLE)} />
          )}

          {state === AppState.ERROR && (
            <div className="text-center space-y-8 animate-in slide-in-bottom py-10">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-red-500/5 border border-red-500/10 mb-2">
                <i className="fa-solid fa-triangle-exclamation text-red-500"></i>
              </div>
              <p className="text-red-500 dark:text-red-400 text-[10px] font-bold uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                {error}
              </p>
              <button
                onClick={() => setState(AppState.IDLE)}
                className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-fuchsia-500 transition-colors"
              >
                ← Back to Input
              </button>
            </div>
          )}
        </main>
      </div>

      <footer className="fixed bottom-8 text-[8px] uppercase tracking-[0.5em] text-slate-300 dark:text-neutral-800 font-bold">
        Made with ♥ for music fans
      </footer>
    </div>
  );
};

export default App;