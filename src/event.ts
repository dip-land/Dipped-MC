import { IpcMainEvent } from 'electron';

export class Event {
    #fn: (event: IpcMainEvent, ...args) => Promise<void | unknown>;
    constructor(fn: (event: IpcMainEvent, ...args) => Promise<void | unknown>) {
        this.#fn = fn;
    }

    public get fn(): (event: IpcMainEvent, ...args) => Promise<void | unknown> {
        return this.#fn;
    }
}
