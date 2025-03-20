import { exec } from 'child_process';
import { Event } from '../event';

let lastOpen = 0;
export default new Event(async (event, path) => {
    if (lastOpen + 2000 > Date.now()) return (event.returnValue = false);
    exec(`start "" "${path}"`);
    lastOpen = Date.now();
    event.returnValue = true;
});
