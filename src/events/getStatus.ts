import axios from 'axios';
import { Event } from '../classes/event';
import { apiServer, logger, validateSender } from '../index';

export default new Event(async (event) => {
    if (!validateSender(event.senderFrame)) return null;
    const validateStatus = () => true;
    const status = { api: false, network: false };
    axios
        .head(apiServer, { validateStatus })
        .then((res) => {
            status.api = res.status === 200;
        })
        .catch();
    try {
        const google = await axios.head('https://google.com', { validateStatus });
        const cloudflare = await axios.head('https://cloudflare.com', { validateStatus });
        status.network = google.status === 200 || cloudflare.status === 200;
    } catch (error) {
        logger.error(error);
    }

    return status;
});
