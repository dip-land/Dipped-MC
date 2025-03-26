import { IpcMainInvokeEvent } from 'electron';

export class Event {
    #fn: (event: IpcMainInvokeEvent, ...args) => Promise<unknown>;
    constructor(fn: (event: IpcMainInvokeEvent, ...args) => Promise<unknown>) {
        this.#fn = fn;
    }

    public get fn(): (event: IpcMainInvokeEvent, ...args) => Promise<unknown> {
        return this.#fn;
    }
}
