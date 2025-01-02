import type { ModLoader } from 'tomate-mods';
import type { LaunchConfig } from '..';
export declare const id = "forge";
export declare function downloadForge(forgeFilePath: string, gameVersion: string): Promise<void>;
export declare function getMavenMetadata(): Promise<any>;
/**
 * Downloads the latest forge jar and returns a partial MCLC config
 *
 * @export
 * @param {LaunchConfig} config
 */
export declare function getMCLCLaunchConfig(config: LaunchConfig): Promise<{
    root: string;
    clientPackage: never;
    version: {
        number: string;
        type: string;
        custom: string;
    };
    forge: string;
}>;
export declare function listSupportedVersions(): Promise<{
    version: string;
    stable: boolean;
}[]>;
export declare const tomateModsModLoader: ModLoader;
