import './index.css';

const packs = window.dmc.getPacks();
let offline = false;
if (!packs.packs[0]?.id) offline = true;
offline = false;

window.addEventListener('DOMContentLoaded', async () => {
    window.dmc.reloadPacks(offline);

    const delConfig = document.getElementById('delete_config');
    delConfig.addEventListener('click', async () => {
        window.dmc.deleteConfig();
    });
});

let devOptions = false;
const devMenu = document.getElementById('dev_tools');
const map: Record<string, boolean> = {}; // You could also use an array
onkeydown = onkeyup = function (e) {
    map[e.key] = e.type == 'keydown';
    if (map['Shift'] && map['F1'] && map['Control']) {
        devOptions = !devOptions;
        devMenu.classList.toggle('hidden');
        const debug = document.getElementById('debug');
        debug.classList.toggle('hidden');
        const debugConfig = document.getElementById('debugConfig');
        if (devOptions) {
            debugConfig.innerText = JSON.stringify(this.dmc.getConfig(), null, 4);
        } else {
            debugConfig.innerText = '';
        }
    }
};

const callback = (mutationList: any, observer: any) => {
    for (const mutation of mutationList) {
        if (mutation.type === 'childList' && mutation.target.nodeName === 'BODY' && mutation.addedNodes[0].id === 'webpack-dev-server-client-overlay') {
            const errorFrame = document.getElementById('webpack-dev-server-client-overlay') as HTMLIFrameElement;
            errorFrame.remove();
        }
    }
};

const observer = new MutationObserver(callback);
observer.observe(document.documentElement, { attributes: true, childList: true, subtree: true });
