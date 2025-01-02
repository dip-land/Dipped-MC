import type IForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

import path from 'node:path';
// @ts-ignore
import CopyPlugin from 'copy-webpack-plugin';

const assets = ['static'];
const copyPlugins = assets.map((asset) => {
    return new CopyPlugin({
        patterns: [
            {
                from: path.resolve(__dirname, 'src', asset),
                to: asset,
            },
        ],
    });
});

export const plugins = [
    ...copyPlugins,
    new ForkTsCheckerWebpackPlugin({
        logger: 'webpack-infrastructure',
    }),
];
