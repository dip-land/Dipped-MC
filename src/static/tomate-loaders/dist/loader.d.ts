import { fabric, forge, LoaderId, neoforge, quilt, vanilla } from './';
type Loader<Id extends LoaderId> = {
    vanilla: typeof vanilla;
    fabric: typeof fabric;
    quilt: typeof quilt;
    forge: typeof forge;
    neoforge: typeof neoforge;
}[Id];
export declare function loader<Id extends LoaderId>(id: Id): Loader<Id>;
export {};
