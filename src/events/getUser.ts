import axios from 'axios';
import { Event } from '../event';
import { getKey } from '../index';
import type { MclcUser } from 'msmc/types/types';

export default new Event(async (event) => {
    const key = getKey();
    axios
        .get(`https://sessionserver.mojang.com/session/minecraft/profile/${(key as MclcUser)?.uuid}`, {
            validateStatus: function (status) {
                return status >= 200 && status < 500;
            },
        })
        .then((response) => {
            if (response.data.errorMessage) {
                event.returnValue = { status: 'invalid' };
            } else {
                const user = JSON.parse(atob(response.data.properties.find((v: { name: string }) => v.name === 'textures').value));
                event.returnValue = {
                    status: 'valid',
                    name: user.profileName,
                    uuid: user.profileId,
                    textures: user.textures,
                };
            }
        })
        .catch(() => {
            event.returnValue = {
                status: 'offline',
                name: (key as MclcUser)?.name,
                uuid: (key as MclcUser)?.uuid,
            };
        });
});
