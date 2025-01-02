import type { ModLoader } from 'tomate-mods';
import type { LaunchConfig } from '.';
export declare const id = "quilt";
export type Loader = {
    separator: string;
    build: number;
    maven: string;
    version: string;
};
export declare function getLoaders(): Promise<Loader[]>;
export declare function getProfile(gameVersion: string, loaderVersion: string): Promise<any>;
/**
 * Downloads the latest version json and returns a partial MCLC config
 *
 * @export
 * @param {LaunchConfig} config
 */
export declare function getMCLCLaunchConfig(config: LaunchConfig): Promise<{
    root: string;
    version: {
        number: string;
        type: string;
        custom: string;
    };
}>;
export declare const totalModsModLoader: ModLoader;
