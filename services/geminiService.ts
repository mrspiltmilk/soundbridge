
import { GoogleGenAI } from "@google/genai";
import { MusicMetadata, MusicLinkResult } from "../types";

export const resolveMusicLink = async (inputUrl: string): Promise<MusicMetadata> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Streamlined, imperative prompt for faster processing
  const prompt = `Find official direct streaming links for the music at ${inputUrl}.
Required platforms: Spotify, Apple Music, Tidal, YouTube Music.

Output strictly in this format:
Title: [Name]
Artist: [Name]
Links:
- Spotify: [URL]
- Apple Music: [URL]
- Tidal: [URL]
- YouTube Music: [URL]

Rules:
- NO markdown formatting (no asterisks).
- ONLY direct track/album URLs.
- Do not explain yourself.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0,
        // Disable thinking budget to minimize latency for straightforward search tasks
        thinkingConfig: { thinkingBudget: 0 }
      },
    });

    const text = response.text || "";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    const patterns = {
      'Spotify': /https?:\/\/open\.spotify\.com\/(track|album|playlist|artist)\/[a-zA-Z0-9]+[?a-zA-Z0-9=_]*/i,
      'Apple Music': /https?:\/\/(music|itunes)\.apple\.com\/[a-z]{2}\/(album|song|playlist|artist)\/[a-zA-Z0-9\-_/]+/i,
      'Tidal': /https?:\/\/(www\.|listen\.|browse\.)?tidal\.com\/(browse\/)?(track|album|playlist|artist)\/[0-9a-zA-Z_-]+/i,
      'YouTube Music': /https?:\/\/music\.youtube\.com\/(watch\?v=|playlist\?list=)[a-zA-Z0-9_-]+/i
    };

    const links: MusicLinkResult[] = [];
    const platformKeys: (keyof typeof patterns)[] = ['Spotify', 'Apple Music', 'Tidal', 'YouTube Music'];
    const lines = text.split('\n');
    
    for (const platform of platformKeys) {
      const pattern = patterns[platform];
      let foundUrl: string | null = null;

      const chunkMatch = groundingChunks.find(c => c.web?.uri?.match(pattern));
      if (chunkMatch?.web?.uri) {
        foundUrl = chunkMatch.web.uri;
      }

      if (!foundUrl) {
        for (const line of lines) {
          if (line.toLowerCase().includes(platform.toLowerCase())) {
            const matches = line.match(pattern);
            if (matches) {
              foundUrl = matches[0];
              break;
            }
          }
        }
      }

      if (!foundUrl) {
        const globalMatches = text.match(pattern);
        if (globalMatches) {
          foundUrl = globalMatches[0];
        }
      }

      if (foundUrl) {
        links.push({ platform, url: foundUrl });
      }
    }

    const titleMatch = text.match(/Title:\s*(.*)/i);
    const artistMatch = text.match(/Artist:\s*(.*)/i);
    
    if (links.length === 0) {
      throw new Error("No matching streaming links found. The track might be exclusive or search results were inconclusive.");
    }

    const cleanField = (raw: string | null | undefined) => {
      if (!raw) return "";
      return raw.replace(/\*/g, '').trim();
    };

    return {
      title: titleMatch ? cleanField(titleMatch[1]) : "Unknown Track",
      artist: artistMatch ? cleanField(artistMatch[1]) : "Unknown Artist",
      links
    };
  } catch (error: any) {
    console.error("Gemini Resolution Error:", error);
    throw new Error(error.message || "Failed to resolve links. Please ensure the URL is valid.");
  }
};
