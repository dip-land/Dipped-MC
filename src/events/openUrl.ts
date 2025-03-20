import { Event } from '../event';
import { shell } from 'electron';

export default new Event(async (event, url) => {
    shell.openExternal(url);
    event.returnValue = true;
});
