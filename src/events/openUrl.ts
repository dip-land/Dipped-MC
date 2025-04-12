import { validateSender } from '../index';
import { Event } from '../classes/event';
import { shell } from 'electron';

export default new Event(async (event, url: string) => {
    if (!validateSender(event.senderFrame)) return null;
    const parsedURL = new URL(url);
    const allowedHosts = ['dipped.dev', 'www.dipped.dev', 'curseforge.com', 'www.curseforge.com', 'modrinth.com', 'www.modrinth.com'];
    if (!allowedHosts.some((str) => parsedURL.host === str)) return false;
    shell.openExternal(url);
    return true;
});
