
import { GoogleGenAI } from "@google/genai";
import { MusicMetadata, MusicLinkResult } from "../types";

export const resolveMusicLink = async (inputUrl: string): Promise<MusicMetadata> => {
  // Directly initialize with process.env.API_KEY as per instructions
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    I need to find universal streaming links for a piece of music.
    Original Link: ${inputUrl}
    
    TASK:
    1. Identify the Track/Album Title and Artist from the provided link.
    2. Use Google Search to find the OFFICIAL direct streaming links for this exact track or album on:
       - Spotify (open.spotify.com)
       - Apple Music (music.apple.com)
       - Tidal (tidal.com)
       - YouTube Music (music.youtube.com)
    
    RESPONSE FORMAT:
    Return the information in this format:
    Title: [Name]
    Artist: [Name]
    Links:
    - Spotify: [URL]
    - Apple Music: [URL]
    - Tidal: [URL]
    - YouTube Music: [URL]

    IMPORTANT: 
    - Only return direct URLs to the track/album, not search result pages.
    - Ensure URLs are fully qualified.
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

    // Improved Regex Patterns to handle variations (subdomains, localizations, etc.)
    const patterns = {
      'Spotify': /https?:\/\/open\.spotify\.com\/(track|album|playlist|artist)\/[a-zA-Z0-9]+[?a-zA-Z0-9=_]*/i,
      'Apple Music': /https?:\/\/(music|itunes)\.apple\.com\/[a-z]{2}\/(album|song|playlist|artist)\/[a-zA-Z0-9\-_/]+/i,
      'Tidal': /https?:\/\/(www\.|listen\.|browse\.)?tidal\.com\/(browse\/)?(track|album|playlist|artist)\/[0-9a-zA-Z_-]+/i,
      'YouTube Music': /https?:\/\/music\.youtube\.com\/(watch\?v=|playlist\?list=)[a-zA-Z0-9_-]+/i
    };

    const links: MusicLinkResult[] = [];
    const platformKeys: (keyof typeof patterns)[] = ['Spotify', 'Apple Music', 'Tidal', 'YouTube Music'];

    // 1. First, check the text response for explicitly listed links
    const lines = text.split('\n');
    
    for (const platform of platformKeys) {
      const pattern = patterns[platform];
      let foundUrl: string | null = null;

      // Check grounding chunks (highest reliability for search results)
      const chunkMatch = groundingChunks.find(c => c.web?.uri?.match(pattern));
      if (chunkMatch?.web?.uri) {
        foundUrl = chunkMatch.web.uri;
      }

      // Fallback: Check the text output itself
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

      // Final Fallback: Scan the entire text if the platform-specific line check failed
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

    // Extract basic metadata with fallbacks
    const titleMatch = text.match(/Title:\s*(.*)/i);
    const artistMatch = text.match(/Artist:\s*(.*)/i);
    
    if (links.length === 0) {
      throw new Error("No matching streaming links found. The track might be exclusive to one platform or the search grounding failed to find direct matches.");
    }

    return {
      title: titleMatch ? titleMatch[1].trim() : "Unknown Track",
      artist: artistMatch ? artistMatch[1].trim() : "Unknown Artist",
      links
    };
  } catch (error: any) {
    console.error("Gemini Resolution Error:", error);
    throw new Error(error.message || "Failed to resolve links. Please ensure the URL is valid.");
  }
};
