
import { GoogleGenAI } from "@google/genai";
import { MusicMetadata, MusicLinkResult } from "../types";

export const resolveMusicLink = async (inputUrl: string): Promise<MusicMetadata> => {
  const apiKey = process.env.API_KEY;
  
  // Vite's 'define' might stringify undefined as "undefined"
  if (!apiKey || apiKey === 'undefined' || apiKey === 'null') {
    throw new Error("API Key is missing. Please ensure you have added API_KEY to your Vercel Environment Variables and redeployed the app.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    I need to find universal share links for a piece of music.
    Original Link: ${inputUrl}
    
    TASK:
    1. Identify the Track/Album Title and Artist from the provided link.
    2. Use Google Search to find the official direct streaming links for this EXACT track or album on:
       - Spotify
       - Apple Music
       - Tidal
       - YouTube Music
    
    CRITICAL LINK FORMATS:
    - Spotify: https://open.spotify.com/track/[ID] or https://open.spotify.com/album/[ID]
    - Apple Music: https://music.apple.com/[country]/album/[slug]/[ID]
    - Tidal: https://tidal.com/track/[ID] or https://tidal.com/album/[ID]
    - YouTube Music: https://music.youtube.com/watch?v=[ID] or https://music.youtube.com/playlist?list=[ID]
    
    INSTRUCTIONS:
    - Only return valid direct links.
    - Do not return search query URLs.
    - If a platform doesn't have the track, omit it.
    
    RESPONSE FORMAT:
    Title: [Name]
    Artist: [Name]
    Spotify: [Link]
    Apple Music: [Link]
    Tidal: [Link]
    YouTube Music: [Link]
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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
      
      // 1. Check grounding chunks first (usually contains the most accurate search results)
      const officialChunk = groundingChunks.find(c => {
        const uri = c.web?.uri || "";
        return uri.match(pattern) && !uri.includes('/search');
      });
      if (officialChunk?.web?.uri) return officialChunk.web.uri;
      
      // 2. Fallback to extracting from the generated text
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

    if (links.length === 0) {
      throw new Error("We identified the track, but couldn't find verified links on other platforms. Try a different link or check the track name.");
    }

    return {
      title: titleMatch ? titleMatch[1].trim() : "Music Track",
      artist: artistMatch ? artistMatch[1].trim() : "Artist",
      links
    };
  } catch (error: any) {
    console.error("Gemini API Error details:", error);
    
    // Preserve our specific error messages
    if (error.message.includes("API Key") || error.message.includes("identified the track")) {
      throw error;
    }

    // Handle standard Gemini API errors
    const errorMessage = error?.message || "";
    if (errorMessage.includes("403") || errorMessage.includes("API_KEY_INVALID")) {
      throw new Error("Invalid API Key. Please verify your key at Google AI Studio.");
    }
    
    throw new Error("The music resolution service is currently unavailable or the link is invalid. Please try again later.");
  }
};
