import { Event } from '../event';
import { editKey } from '../index';

export default new Event(async (event) => {
    try {
        event.returnValue = editKey({});
        event.sender.reload();
    } catch (error) {
        event.returnValue = false;
    }
});
