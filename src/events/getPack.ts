import { Event } from '../event';
import { getPacks } from '../index';

export default new Event(async (event, id) => {
    event.returnValue = (await getPacks()).find((pack) => pack.id === id);
});
