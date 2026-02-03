
import { GoogleGenAI } from "@google/genai";
import { MusicMetadata, MusicLinkResult } from "../types";

export const resolveMusicLink = async (inputUrl: string): Promise<MusicMetadata> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    I need to find universal share links for a piece of music.
    Original Link: ${inputUrl}
    
    TASK:
    1. Identify the Title and Artist from the provided link.
    2. Search for the official deep-link URLs for this EXACT track/album on Spotify, Apple Music, Tidal, and YouTube Music.
    
    CRITICAL REQUIREMENTS FOR LINKS:
    - Spotify: https://open.spotify.com/track/[ID] or https://open.spotify.com/album/[ID]
    - Apple Music: https://music.apple.com/[country]/album/[slug]/[ID]
    - Tidal: https://tidal.com/track/[ID] or https://tidal.com/album/[ID]
    - YouTube Music: https://music.youtube.com/watch?v=[ID] or https://music.youtube.com/playlist?list=[ID]
    
    DO NOT provide search result pages (e.g., /search?q=...). 
    DO NOT provide links that require a login to see the content.
    If you cannot find a direct link for a specific platform, do not include it.
    
    RESPONSE FORMAT:
    Title: [Track/Album Title]
    Artist: [Artist Name]
    Spotify: [Direct Link]
    Apple Music: [Direct Link]
    Tidal: [Direct Link]
    YouTube Music: [Direct Link]
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0, 
      },
    });

    const text = response.text || "";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    // Extract basic metadata
    const titleMatch = text.match(/Title:\s*(.*)/i);
    const artistMatch = text.match(/Artist:\s*(.*)/i);
    
    const links: MusicLinkResult[] = [];
    
    // Robust regex patterns for deep links
    const patterns = {
      'Spotify': /https?:\/\/open\.spotify\.com\/(track|album|playlist)\/[a-zA-Z0-9?=&_-]+/i,
      'Apple Music': /https?:\/\/music\.apple\.com\/[a-z]{2}\/(album|song|playlist)\/[a-zA-Z0-9\-_/]+(\?i=[0-9]+)?/i,
      'Tidal': /https?:\/\/(www\.)?tidal\.com\/(browse\/)?(track|album|playlist)\/[0-9a-zA-Z_-]+/i,
      'YouTube Music': /https?:\/\/music\.youtube\.com\/(watch\?v=|playlist\?list=)[a-zA-Z0-9_-]+/i
    };

    const extractLink = (platform: keyof typeof patterns): string | null => {
      const pattern = patterns[platform];
      
      // 1. Check grounding chunks first (higher reliability)
      const officialChunk = groundingChunks.find(c => {
        const uri = c.web?.uri || "";
        return uri.match(pattern) && !uri.includes('/search');
      });
      if (officialChunk?.web?.uri) return officialChunk.web.uri;
      
      // 2. Check the generated text for links matching the pattern
      const textMatches = text.match(new RegExp(pattern, 'gi'));
      if (textMatches && textMatches.length > 0) {
        const validLink = textMatches.find(link => !link.toLowerCase().includes('/search'));
        if (validLink) return validLink;
      }
      
      return null;
    };

    const platformKeys: (keyof typeof patterns)[] = ['Spotify', 'Apple Music', 'Tidal', 'YouTube Music'];
    
    for (const key of platformKeys) {
      const url = extractLink(key);
      if (url) {
        links.push({ platform: key as any, url });
      }
    }

    return {
      title: titleMatch ? titleMatch[1].trim() : "Music Track",
      artist: artistMatch ? artistMatch[1].trim() : "Artist",
      links
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Unable to find working links. Please ensure the source link is for a specific song or album.");
  }
};
