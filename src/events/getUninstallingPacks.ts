import { Event } from '../event';
import { getUninstalling } from '../index';

export default new Event(async (event) => {
    event.returnValue = getUninstalling();
});
