import axios from 'axios';
import { Event } from '../classes/event';
import { apiServer, validateSender } from '../index';

export default new Event(async (event) => {
    if (!validateSender(event.senderFrame)) return null;
    const validateStatus = () => true;
    /* 
        STATUS
            -1 = no internet
            0 = offline
            1 = online
    */
    try {
        const api = await axios.head(apiServer, { validateStatus, maxRedirects: 0 });
        return api.status === 200 ? 1 : 0;
    } catch (error) {
        return -1;
    }
});
