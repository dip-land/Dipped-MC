import type { LaunchConfig } from '..';
export declare const id = "vanilla";
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
    };
}>;
export type VersionManifest = {
    latest: {
        release: string;
        snapshot: string;
    };
    versions: {
        id: string;
        type: 'snapshot' | 'release';
        url: string;
        time: string;
        releaseTime: string;
        sha1: string;
        complianceLevel: number;
    }[];
};
export declare function getVersionManifest(): Promise<VersionManifest>;
export declare function listSupportedVersions(): Promise<{
    version: string;
    stable: boolean;
}[]>;
