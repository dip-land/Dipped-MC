import type { LaunchConfig } from ".";
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
