import type { LaunchConfig } from '..';
export declare const id = 'neoforge';
export declare function downloadNeoForge(neoForgeFilePath: string, gameVersion: string): Promise<void>;
export declare function getMavenMetadata(): Promise<any>;
/**
 * Downloads the latest neoforge jar and returns a partial MCLC config
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
export declare function listSupportedVersions(): Promise<
    {
        version: string;
        stable: boolean;
    }[]
>;
