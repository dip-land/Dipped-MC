import axios, { AxiosHeaders } from 'axios';
import { Event } from '../classes/event';
import { apiServer, getApp, getPacks, logger, validateSender } from '../index';
import { Server } from '../types';

export default new Event(async (event) => {
    if (!validateSender(event.senderFrame)) return null;
    const packs = await getPacks();
    const servers: Array<Server> = [];
    for (const pack of packs) {
        try {
            const headers = new AxiosHeaders({ app: JSON.stringify(getApp()) });
            const server = await axios(`${apiServer}/minecraft/servers/${pack.id}`, { headers });
            servers.push(server.data as Server);
        } catch (error) {
            logger.log(error);
            continue;
        }
    }
    return servers;
});
