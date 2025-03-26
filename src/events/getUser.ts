import axios from 'axios';
import { Event } from '../classes/event';
import { getKey, validateSender } from '../index';
import type { MclcUser } from 'msmc/types/types';

export default new Event(async (event) => {
    if (!validateSender(event.senderFrame)) return null;
    const key = getKey();
    try {
        const response = await axios.get(`https://sessionserver.mojang.com/session/minecraft/profile/${(key as MclcUser)?.uuid}`, {
            validateStatus: function (status) {
                return status >= 200 && status < 500;
            },
        });
        if (response.data.errorMessage) {
            return { status: 'invalid' };
        } else {
            const user = JSON.parse(atob(response.data.properties.find((v: { name: string }) => v.name === 'textures').value));
            return {
                status: 'valid',
                name: user.profileName,
                uuid: user.profileId,
                textures: user.textures,
            };
        }
    } catch (error) {
        return {
            status: 'offline',
            name: (key as MclcUser)?.name,
            uuid: (key as MclcUser)?.uuid,
        };
    }
});
