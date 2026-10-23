/**
 * Game Detection Utility
 * Detects active gaming applications from DisplayMedia capture stream labels,
 * window titles, and system application signatures.
 */

export interface GameSignature {
  id: string;
  name: string;
  aliases: string[];
  patterns: RegExp[];
  genre: string;
}

export interface GameDetectionResult {
  detected: boolean;
  gameName: string;
  confidence: 'high' | 'medium' | 'low';
  source: 'window_title' | 'stream_label' | 'signature_match' | 'fallback';
  rawLabel: string;
  surfaceType?: 'window' | 'monitor' | 'browser';
}

// Known game signatures database
export const KNOWN_GAME_SIGNATURES: GameSignature[] = [
  {
    id: 'valorant',
    name: 'Valorant',
    aliases: ['valorant', 'riot client', 'riot games - valorant'],
    patterns: [/valorant/i, /riot.*valorant/i],
    genre: 'Tactical FPS',
  },
  {
    id: 'gta_v',
    name: 'GTA V',
    aliases: ['grand theft auto v', 'gta 5', 'gta v', 'fivem', 'rockstar games - gta v'],
    patterns: [/grand theft auto\s*v/i, /gta\s*v/i, /gta\s*5/i, /fivem/i],
    genre: 'Open World Action',
  },
  {
    id: 'bgmi',
    name: 'BGMI',
    aliases: ['battlegrounds mobile india', 'bgmi', 'pubg mobile', 'pubg'],
    patterns: [/battlegrounds mobile india/i, /\bbgmi\b/i, /pubg mobile/i, /pubg:\s*battlegrounds/i],
    genre: 'Battle Royale',
  },
  {
    id: 'cs2',
    name: 'Counter-Strike 2',
    aliases: ['cs2', 'counter-strike 2', 'counter strike 2', 'cs:go', 'counter-strike: global offensive'],
    patterns: [/counter-strike\s*2/i, /\bcs2\b/i, /cs:go/i, /counter-strike/i],
    genre: 'Tactical FPS',
  },
  {
    id: 'apex_legends',
    name: 'Apex Legends',
    aliases: ['apex legends', 'apex'],
    patterns: [/apex legends/i, /\bapex\b/i],
    genre: 'Battle Royale',
  },
  {
    id: 'fortnite',
    name: 'Fortnite',
    aliases: ['fortnite', 'epic games - fortnite'],
    patterns: [/fortnite/i],
    genre: 'Battle Royale',
  },
  {
    id: 'minecraft',
    name: 'Minecraft',
    aliases: ['minecraft', 'minecraft* 1.', 'minecraft java edition', 'minecraft bedrock edition'],
    patterns: [/minecraft/i],
    genre: 'Sandbox Survival',
  },
  {
    id: 'cod_warzone',
    name: 'Call of Duty: Warzone',
    aliases: ['call of duty: warzone', 'warzone', 'call of duty', 'modern warfare', 'black ops'],
    patterns: [/call of duty.*warzone/i, /\bwarzone\b/i, /call of duty/i, /modern warfare/i, /black ops/i],
    genre: 'FPS',
  },
  {
    id: 'league_of_legends',
    name: 'League of Legends',
    aliases: ['league of legends', 'lol', 'riot client - league of legends'],
    patterns: [/league of legends/i, /\blol\b/i],
    genre: 'MOBA',
  },
  {
    id: 'rocket_league',
    name: 'Rocket League',
    aliases: ['rocket league'],
    patterns: [/rocket league/i],
    genre: 'Vehicular Soccer',
  },
  {
    id: 'overwatch_2',
    name: 'Overwatch 2',
    aliases: ['overwatch 2', 'overwatch'],
    patterns: [/overwatch\s*2/i, /overwatch/i],
    genre: 'Hero Shooter',
  },
  {
    id: 'roblox',
    name: 'Roblox',
    aliases: ['roblox', 'roblox player'],
    patterns: [/roblox/i],
    genre: 'Platform / Sandbox',
  },
  {
    id: 'genshin_impact',
    name: 'Genshin Impact',
    aliases: ['genshin impact', 'genshin'],
    patterns: [/genshin impact/i, /\bgenshin\b/i],
    genre: 'Action RPG',
  },
  {
    id: 'honkai_star_rail',
    name: 'Honkai: Star Rail',
    aliases: ['honkai: star rail', 'star rail', 'honkai star rail'],
    patterns: [/honkai.*star rail/i, /star rail/i],
    genre: 'Turn-based RPG',
  },
  {
    id: 'dota_2',
    name: 'Dota 2',
    aliases: ['dota 2', 'dota'],
    patterns: [/\bdota\s*2\b/i, /\bdota\b/i],
    genre: 'MOBA',
  },
  {
    id: 'rainbow_six',
    name: 'Rainbow Six Siege',
    aliases: ['tom clancy\'s rainbow six siege', 'rainbow six siege', 'r6 siege', 'r6'],
    patterns: [/rainbow six/i, /r6 siege/i],
    genre: 'Tactical Shooter',
  },
  {
    id: 'free_fire',
    name: 'Free Fire',
    aliases: ['garena free fire', 'free fire max', 'free fire'],
    patterns: [/free fire/i, /garena/i],
    genre: 'Battle Royale',
  },
  {
    id: 'mobile_legends',
    name: 'Mobile Legends',
    aliases: ['mobile legends: bang bang', 'mobile legends', 'mlbb'],
    patterns: [/mobile legends/i, /\bmlbb\b/i],
    genre: 'MOBA',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk 2077',
    aliases: ['cyberpunk 2077', 'cyberpunk'],
    patterns: [/cyberpunk\s*2077/i, /cyberpunk/i],
    genre: 'Action RPG',
  },
  {
    id: 'elden_ring',
    name: 'Elden Ring',
    aliases: ['elden ring'],
    patterns: [/elden ring/i],
    genre: 'Action RPG',
  },
  {
    id: 'ea_fc',
    name: 'EA SPORTS FC',
    aliases: ['ea sports fc', 'fc 24', 'fc 25', 'fifa 23', 'fifa 24', 'fifa'],
    patterns: [/ea sports fc/i, /\bfc\s*2[4-6]\b/i, /\bfifa\s*2[0-4]\b/i],
    genre: 'Sports / Soccer',
  },
  {
    id: 'scrcpy_mirror',
    name: 'Mobile Gameplay',
    aliases: ['scrcpy', 'phone link', 'vysor', 'samsung dex', 'smart view'],
    patterns: [/scrcpy/i, /phone link/i, /vysor/i, /samsung dex/i, /smart view/i],
    genre: 'Mobile Screen Mirror',
  },
  {
    id: 'bluestacks',
    name: 'Mobile Game (BlueStacks)',
    aliases: ['bluestacks app player', 'bluestacks', 'ldplayer', 'noxplayer', 'gameloop', 'memu'],
    patterns: [/bluestacks/i, /ldplayer/i, /noxplayer/i, /gameloop/i, /memu/i],
    genre: 'Android Emulator',
  },
];

export class GameDetector {
  /**
   * Cleans raw stream label or window title by stripping OS / Browser prefixes
   * e.g., "window:12345:VALORANT " -> "VALORANT"
   * e.g., "screen:0:0" -> ""
   */
  public cleanRawLabel(raw: string): string {
    if (!raw) return '';

    let cleaned = raw.trim();

    // Remove window / screen / tab prefixes like "window:1234:"
    cleaned = cleaned.replace(/^(?:window|screen|tab|application):\d*:(?:[0-9a-fA-F-]+:)?/i, '');
    cleaned = cleaned.replace(/^(?:window|screen|tab):\s*/i, '');

    // Remove common process suffixes / bitness tags
    cleaned = cleaned.replace(/\s*\((?:64-bit|32-bit|DX11|DX12|Vulkan|Singleplayer|Multiplayer)\)/gi, '');

    // Remove trailing asterisks (e.g., Minecraft*)
    cleaned = cleaned.replace(/\*+/g, '');

    // Remove version numbers at end like " 1.20.4"
    cleaned = cleaned.replace(/\s+v?\d+(?:\.\d+)+(?:-[a-z0-9.]+)?$/i, '');

    return cleaned.trim();
  }

  /**
   * Detects active game from a WebRTC MediaStream
   */
  public detectGameFromMediaStream(stream: MediaStream): GameDetectionResult {
    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) {
      return {
        detected: false,
        gameName: 'Mobile Gameplay',
        confidence: 'low',
        source: 'fallback',
        rawLabel: '',
      };
    }

    const rawLabel = videoTrack.label || '';
    const settings = videoTrack.getSettings ? videoTrack.getSettings() : {};
    const surfaceType = (settings as unknown as { displaySurface?: 'window' | 'monitor' | 'browser' }).displaySurface;

    // 1. If empty or generic monitor label, check for whole screen capture
    if (!rawLabel || rawLabel.toLowerCase().includes('screen:') || rawLabel.toLowerCase() === 'entire screen') {
      return {
        detected: false,
        gameName: 'Full Screen Game',
        confidence: 'low',
        source: 'stream_label',
        rawLabel,
        surfaceType: 'monitor',
      };
    }

    const cleanedTitle = this.cleanRawLabel(rawLabel);

    // 2. Check against known game signatures
    for (const signature of KNOWN_GAME_SIGNATURES) {
      // Check regex patterns against raw and cleaned titles
      for (const pattern of signature.patterns) {
        if (pattern.test(rawLabel) || pattern.test(cleanedTitle)) {
          // Special case: Emulator window might have game name inside label, e.g., "BlueStacks - BGMI"
          if (signature.id === 'bluestacks') {
            for (const subGame of KNOWN_GAME_SIGNATURES) {
              if (subGame.id !== 'bluestacks' && subGame.patterns.some((p) => p.test(rawLabel))) {
                return {
                  detected: true,
                  gameName: `${subGame.name} (Mobile)`,
                  confidence: 'high',
                  source: 'signature_match',
                  rawLabel,
                  surfaceType: surfaceType || 'window',
                };
              }
            }
          }

          return {
            detected: true,
            gameName: signature.name,
            confidence: 'high',
            source: 'signature_match',
            rawLabel,
            surfaceType: surfaceType || 'window',
          };
        }
      }

      // Check aliases
      for (const alias of signature.aliases) {
        if (cleanedTitle.toLowerCase().includes(alias.toLowerCase())) {
          return {
            detected: true,
            gameName: signature.name,
            confidence: 'high',
            source: 'signature_match',
            rawLabel,
            surfaceType: surfaceType || 'window',
          };
        }
      }
    }

    // 3. If a specific window title was shared that wasn't in database, use cleaned title
    if (cleanedTitle && cleanedTitle.length >= 2 && !cleanedTitle.toLowerCase().includes('screen')) {
      // Capitalize first letters nicely if needed
      const formattedTitle = cleanedTitle.length > 28 ? cleanedTitle.substring(0, 28) + '...' : cleanedTitle;
      return {
        detected: true,
        gameName: formattedTitle,
        confidence: 'medium',
        source: 'window_title',
        rawLabel,
        surfaceType: surfaceType || 'window',
      };
    }

    return {
      detected: false,
      gameName: 'Gameplay',
      confidence: 'low',
      source: 'fallback',
      rawLabel,
      surfaceType,
    };
  }

  /**
   * Suggests quick game titles based on popular esports and mobile titles
   */
  public getPopularGameSuggestions(): string[] {
    return [
      'Valorant',
      'GTA V',
      'BGMI',
      'Apex Legends',
      'Counter-Strike 2',
      'Fortnite',
      'Minecraft',
      'Call of Duty',
      'League of Legends',
      'Free Fire',
      'Roblox',
      'Genshin Impact'
    ];
  }
}

export const gameDetector = new GameDetector();
