import { Event } from '../event';
import { getPacks } from '../index';

export default new Event(async (event) => {
    event.returnValue = await getPacks();
});
