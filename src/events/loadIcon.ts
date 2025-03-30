import path from 'path';
import { Event } from '../classes/event';
import { readFileSync } from 'fs';
import { getConfig, validateSender } from '../index';

export default new Event(async (event, id, status: { api: boolean; network: boolean }) => {
    if (!validateSender(event.senderFrame)) return null;
    if (status.api) return 'https://dipped.dev/api/minecraft/icons/' + id;
    const pack = getConfig().packs.find((p) => p.id === id);
    if (!pack) return false;
    try {
        const data = readFileSync(path.join(pack.path, 'packIcon.png'));
        return `data:image/png;base64,${data.toString('base64')}`;
    } catch (error) {
        return false;
    }
});
