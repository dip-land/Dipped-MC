import { Event } from '../event';
import { fetchPacks } from '../index';

export default new Event(async (event) => {
    event.returnValue = true;
    fetchPacks();
});
