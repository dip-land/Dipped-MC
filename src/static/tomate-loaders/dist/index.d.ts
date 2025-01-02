import type { ModLoader as TomateModsModLoader } from 'tomate-mods';
import type { ILauncherOptions } from 'minecraft-launcher-core';
export type LaunchConfig = {
    rootPath: string;
    gameVersion: string;
    launcherVersion: string;
};
export type ModLoader = {
    getMCLCLaunchConfig(config: LaunchConfig): Promise<Partial<ILauncherOptions>>;
    listSupportedVersions(): Promise<
        {
            version: string;
            stable: boolean;
        }[]
    >;
    tomateModsModLoader: TomateModsModLoader;
};
export type VanillaLoader = Omit<ModLoader, 'tomateModsModLoader'>;
export type LoaderId = 'quilt' | 'fabric' | 'forge' | 'neoforge' | 'vanilla';
export type ModdedLoaderId = 'quilt' | 'fabric' | 'forge';
export * as fabric from './loaders/fabric';
export * as quilt from './loaders/quilt';
export * as forge from './loaders/forge';
export * as neoforge from './loaders/neoforge';
export * as vanilla from './loaders/vanilla';
export { loader } from './loader';
export { liner } from './liner';
