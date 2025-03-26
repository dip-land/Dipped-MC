import { exec } from 'child_process';
import { Event } from '../event';
import { validateSender } from '../index';

let lastOpen = 0;
export default new Event(async (event, path) => {
    if (!validateSender(event.senderFrame)) return null;
    if (lastOpen + 2000 > Date.now()) return false;
    exec(`start "" "${path}"`);
    lastOpen = Date.now();
    return true;
});
