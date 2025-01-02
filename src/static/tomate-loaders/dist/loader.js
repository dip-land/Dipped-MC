"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loader = void 0;
const _1 = require("./");
function loader(id) {
    if (id === 'fabric')
        return _1.fabric;
    if (id === 'quilt')
        return _1.quilt;
    if (id === 'forge')
        return _1.forge;
    if (id === 'neoforge')
        return _1.neoforge;
    if (id === 'vanilla')
        return _1.vanilla;
    throw new Error(`Loader "${id}" could not be found`);
}
exports.loader = loader;
//# sourceMappingURL=loader.js.map