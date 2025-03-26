import { validateSender } from '../index';
import { Event } from '../event';
import { shell } from 'electron';

export default new Event(async (event, url: string) => {
    if (!validateSender(event.senderFrame)) return null;
    const allowedURLs = ['https://dipped.dev/', 'https://curseforge.com/', 'https://modrinth.com/'];
    if (!allowedURLs.some((str) => url.startsWith(str))) return false;
    shell.openExternal(url);
    return true;
});
