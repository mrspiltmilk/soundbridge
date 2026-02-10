
import { GoogleGenAI } from "@google/genai";
import { MusicMetadata, MusicLinkResult } from "../types";

export const streamMusicLinks = async (
  inputUrl: string, 
  onUpdate: (metadata: MusicMetadata) => void
): Promise<void> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `You are an elite Music Metadata Bridge.
Source link: ${inputUrl}

TASKS:
1. Determine if the link is an ARTIST, ALBUM, or TRACK.
2. Identify the specific entity. If the artist name is ambiguous (e.g., "u", "A"), use search to cross-reference their exact discography or unique ID from the source URL to find the matching profile on other platforms.
3. Find the official direct deep links for this exact entity on Spotify, Apple Music, Tidal, and YouTube Music.

OUTPUT FORMAT:
Type: [artist/album/track]
Title: [Entity Name]
Artist: [Artist Name, or N/A if it is an Artist profile]
Links:
Spotify: [Full Deep URL]
Apple Music: [Full Deep URL]
Tidal: [Full Deep URL]
YouTube Music: [Full Deep URL]

RULES:
- Never return search result URLs (URLs containing 'search').
- Only use deep links (e.g., /artist/, /album/, /track/, /song/, /channel/).
- If you cannot find a verified match for a platform, omit it entirely.`;

  let accumulatedText = "";
  const metadata: MusicMetadata = {
    title: "",
    artist: "",
    type: "unknown",
    links: []
  };

  // Auto-populate the source URL so the UI reflects it immediately
  const lowerUrl = inputUrl.toLowerCase();
  if (lowerUrl.includes('spotify.com') && !lowerUrl.includes('search')) {
    metadata.links.push({ platform: 'Spotify', url: inputUrl });
  } else if (lowerUrl.includes('apple.com') && !lowerUrl.includes('search')) {
    metadata.links.push({ platform: 'Apple Music', url: inputUrl });
  } else if (lowerUrl.includes('tidal.com') && !lowerUrl.includes('search')) {
    metadata.links.push({ platform: 'Tidal', url: inputUrl });
  } else if (lowerUrl.includes('youtube.com') && !lowerUrl.includes('search')) {
    metadata.links.push({ platform: 'YouTube Music', url: inputUrl });
  }

  // Initial update to trigger UI instantly if a valid link was detected
  onUpdate({ ...metadata });

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0,
        thinkingConfig: { thinkingBudget: 2000 }
      },
    });

    for await (const chunk of responseStream) {
      accumulatedText += chunk.text || "";
      
      // Extract Type
      if (!metadata.type || metadata.type === 'unknown') {
        const match = accumulatedText.match(/Type[\s\*:]*(artist|album|track)/i);
        if (match) metadata.type = match[1].toLowerCase() as any;
      }
      
      // Extract Title
      if (!metadata.title) {
        const match = accumulatedText.match(/Title[\s\*:]*([^\n\r]+)/i);
        if (match) {
          const cleaned = match[1].replace(/\*/g, '').trim();
          if (cleaned && cleaned.toLowerCase() !== 'n/a') metadata.title = cleaned;
        }
      }

      // Extract Artist
      if (!metadata.artist) {
        const match = accumulatedText.match(/Artist[\s\*:]*([^\n\r]+)/i);
        if (match) {
          const cleaned = match[1].replace(/\*/g, '').trim();
          if (cleaned && cleaned.toLowerCase() !== 'n/a' && cleaned.toLowerCase() !== 'none') metadata.artist = cleaned;
        }
      }

      // Extract Links from Grounding Metadata
      const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (groundingChunks) {
        groundingChunks.forEach((c: any) => {
          const uri = c.web?.uri;
          if (uri && !uri.toLowerCase().includes('search')) {
            if (uri.includes('spotify.com') && uri.match(/\/(track|album|artist)\//) && !metadata.links.find(l => l.platform === 'Spotify')) {
              metadata.links.push({ platform: 'Spotify', url: uri });
            } else if (uri.includes('apple.com') && uri.match(/\/(album|song|artist|playlist)\//) && !metadata.links.find(l => l.platform === 'Apple Music')) {
              metadata.links.push({ platform: 'Apple Music', url: uri });
            } else if (uri.includes('tidal.com') && uri.match(/\/(track|album|artist|browse)\//) && !metadata.links.find(l => l.platform === 'Tidal')) {
              metadata.links.push({ platform: 'Tidal', url: uri });
            } else if (uri.includes('music.youtube.com') && uri.match(/\/(watch|playlist|channel|browse)/) && !metadata.links.find(l => l.platform === 'YouTube Music')) {
              metadata.links.push({ platform: 'YouTube Music', url: uri });
            }
          }
        });
      }

      // Extract Links from Text Response (Forgiving global regex)
      const urlRegex = /(https?:\/\/[^\s\n\r"']+)/ig;
      let match;
      while ((match = urlRegex.exec(accumulatedText)) !== null) {
        let url = match[1].replace(/[.,)]$/, ''); // clean trailing punctuation
        if (url.toLowerCase().includes('search')) continue; // skip search URLs

        if (url.includes('spotify.com') && !metadata.links.find(l => l.platform === 'Spotify')) {
          metadata.links.push({ platform: 'Spotify', url });
        } else if ((url.includes('music.apple.com') || url.includes('itunes.apple.com')) && !metadata.links.find(l => l.platform === 'Apple Music')) {
          metadata.links.push({ platform: 'Apple Music', url });
        } else if (url.includes('tidal.com') && !metadata.links.find(l => l.platform === 'Tidal')) {
          metadata.links.push({ platform: 'Tidal', url });
        } else if (url.includes('music.youtube.com') && !metadata.links.find(l => l.platform === 'YouTube Music')) {
          metadata.links.push({ platform: 'YouTube Music', url });
        }
      }

      onUpdate({ ...metadata });
    }

    if (metadata.links.length === 0) {
      throw new Error("Unable to locate verified matches on any platform.");
    }
  } catch (error: any) {
    console.error("SoundBridge Error:", error);
    throw new Error(error.message || "The bridge collapsed. Please verify the link and try again.");
  }
};
