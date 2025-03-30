import axios from 'axios';
import { Event } from '../classes/event';
import { apiServer, validateSender } from '../index';

export default new Event(async (event) => {
    if (!validateSender(event.senderFrame)) return null;
    const validateStatus = () => true;
    const apiStatus = await axios.head(apiServer, { validateStatus });
    const google = await axios.head('https://google.com', { validateStatus });
    const cloudflare = await axios.head('https://cloudflare.com', { validateStatus });
    return {
        api: apiStatus.status === 200,
        network: google.status === 200 || cloudflare.status === 200,
    };
});
