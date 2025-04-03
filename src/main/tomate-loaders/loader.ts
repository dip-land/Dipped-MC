//import { fabric, forge, LoaderId, neoforge, quilt, vanilla } from '.';
import { fabric, forge, LoaderId } from '.';
type Loader<Id extends LoaderId> = {
    //vanilla: typeof vanilla;
    fabric: typeof fabric;
    //quilt: typeof quilt;
    forge: typeof forge;
    //neoforge: typeof neoforge;
}[Id];
import * as index from './index';
export function loader(id: LoaderId): Loader<LoaderId> {
    if (id === 'fabric') return index.fabric;
    // if (id === 'quilt') return index.quilt;
    if (id === 'forge') return index.forge;
    // if (id === 'neoforge') return index.neoforge;
    // if (id === 'vanilla') return index.vanilla;
    throw new Error(`Loader "${id}" could not be found`);
}
export {};
