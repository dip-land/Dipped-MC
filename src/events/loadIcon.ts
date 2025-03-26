import path from 'path';
import { Event } from '../classes/event';
import { readFileSync } from 'fs';
import { getConfig, validateSender } from '../index';

export default new Event(async (event, id) => {
    if (!validateSender(event.senderFrame)) return null;
    const pack = getConfig().packs.find((p) => p.id === id);
    if (!pack) return false;
    const data = readFileSync(path.join(pack.path, 'packIcon.png'));
    return `data:image/png;base64,${data.toString('base64')}`;
});
