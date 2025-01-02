import type { ModLoader } from "tomate-mods";
import type { LaunchConfig } from ".";
export declare const id = "forge";
export declare function downloadForge(forgeFilePath: string, gameVersion: string): Promise<void>;
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
    };
    forge: string;
}>;
export declare const totalModsModLoader: ModLoader;
