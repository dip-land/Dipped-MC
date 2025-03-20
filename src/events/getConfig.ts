import { Event } from '../event';
import { getConfig } from '../index';

export default new Event(async (event) => {
    event.returnValue = getConfig();
});
