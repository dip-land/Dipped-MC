import { editConfig } from '../index';
import { Event } from '../event';

export default new Event(async (event, newConfig) => {
    event.returnValue = editConfig(newConfig);
});
