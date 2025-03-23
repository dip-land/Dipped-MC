import { IpcMainEvent } from 'electron';

export class Event {
    #fn: (event: IpcMainEvent, ...args) => Promise<unknown>;
    constructor(fn: (event: IpcMainEvent, ...args) => Promise<unknown>) {
        this.#fn = fn;
    }

    public get fn(): (event: IpcMainEvent, ...args) => Promise<unknown> {
        return this.#fn;
    }
}
