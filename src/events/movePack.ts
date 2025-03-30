import { editPackConfig, getConfig, logger, validateSender } from '../index';
import { Event } from '../classes/event';
import fs from 'fs/promises';

export default new Event(async (event, id: string, path: string) => {
    if (!validateSender(event.senderFrame)) return null;
    const config = getConfig();
    const pack = config.packs.find((p) => p.id === id);
    if (!pack) return;
    fs.cp(pack.path, path, {
        recursive: true,
    })
        .then(() => {
            fs.rm(pack.path, {
                recursive: true,
            }).catch((e) => logger.error(e));
            logger.log(`Moved Pack ${pack.path} -> ${path}`);
            editPackConfig(id, { path });
        })
        .catch((e) => logger.error(e));
});
