import { Event } from '../event';
import { getInstalling } from '../index';

export default new Event(async (event) => {
    event.returnValue = getInstalling();
});
