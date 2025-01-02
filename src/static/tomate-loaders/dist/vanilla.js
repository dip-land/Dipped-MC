"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMCLCLaunchConfig = exports.id = void 0;
exports.id = "vanilla";
/**
 * Downloads the latest version json and returns a partial MCLC config
 *
 * @export
 * @param {LaunchConfig} config
 */
async function getMCLCLaunchConfig(config) {
    return {
        root: config.rootPath,
        version: {
            number: config.gameVersion,
            type: "release",
        },
    };
}
exports.getMCLCLaunchConfig = getMCLCLaunchConfig;
//# sourceMappingURL=vanilla.js.map