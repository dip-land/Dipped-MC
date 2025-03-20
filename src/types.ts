export interface Config {
    configPath: string;
    appPath: string;
    installed: number;
    packPath: string;
    ram: number;
    packs: Array<{ id: string; path: string; ram: number }>;
}

export interface WebPack {
    id: string;
    status: string;
    online: boolean;
    version: string;
    name: string;
    identifier: string;
    link: { type: 'curseforge' | 'modrinth'; url: string };
}

export interface LocalPack {
    id: string;
    version: string;
    name: string;
    identifier: string;
    launcher: 'forge' | 'fabric';
    gameVersion: string;
    launcherVersion: string;
    installed: boolean;
}

export type Pack<installed> = installed extends false
    ? {
          id: string;
          identifier: string;
          name: string;
          serverVersion: string;
          localVersion: string | undefined;
          status: string;
          online: boolean;
          link: { type: 'curseforge' | 'modrinth'; url: string };
          installed: boolean;
          gameVersion: string | undefined;
          launcher: 'forge' | 'fabric' | undefined;
          launcherVersion: string | undefined;
      }
    : {
          id: string;
          identifier: string;
          name: string;
          serverVersion: string | undefined;
          localVersion: string;
          status: string | undefined;
          online: boolean;
          link: { type: 'curseforge' | 'modrinth' | undefined; url: string | undefined };
          installed: boolean;
          gameVersion: string;
          launcher: 'forge' | 'fabric';
          launcherVersion: string;
      };
