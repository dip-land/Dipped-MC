import path from 'path';
import { Event } from '../event';

export default new Event(async (event, ...args) => {
    event.returnValue = path.join(...args);
});
