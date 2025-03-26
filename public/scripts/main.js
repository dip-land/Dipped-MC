window.onload = async () => {
    const packs = await window.dmc.getPacks();
    let offline = false;
    if (!packs.find((pack) => pack.installed === false)) offline = true;

    window.dmc.reloadPacks(offline);

    const delConfig = document.getElementById('delete_config');
    delConfig.addEventListener('click', async () => {
        window.dmc.deleteConfig();
    });

    let devOptions = false;
    const devMenu = document.getElementById('dev_tools');
    const map = {}; // You could also use an array
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

    const user = await window.dmc.getUser();
    const container = document.getElementById('user');
    let userContext = false;
    if (user.status === 'valid' && !offline) {
        container.classList.remove('hidden');
        const textures = user?.textures;
        const avatarCanvas = document.getElementById('userAvatar');
        const avatarCtx = avatarCanvas.getContext('2d');
        const img = new Image();

        img.addEventListener('load', () => {
            avatarCtx.imageSmoothingEnabled = false;
            avatarCtx.drawImage(img, -25, -25, 200, 200);
        });

        img.src = textures.SKIN.url;
        document.getElementById('userAvatar').src = textures ? textures.SKIN.url : '';
        document.getElementById('username').innerText = user.name;
        container.addEventListener('click', (event) => {
            document.getElementById('nav_popout').classList.toggle('hidden');
            document.getElementById('caret').classList.toggle('rotated');
            container.classList.toggle('active');
            userContext = event.target;
        });

        document.getElementById('loginButton').remove();
        document.getElementById('logout').addEventListener('click', async () => {
            window.dmc.logout();
            window.location.reload();
        });
    } else if (user.status === 'offline') window.dmc.reloadPacks(true);

    const contextMenu = document.getElementById('context');

    document.addEventListener('click', (event) => {
        if (event.target.parentNode.id !== 'context' && !event.target.classList.contains('packCtxMenuButton')) {
            contextMenu.classList.add('hidden');
            const elements = document.getElementsByClassName('activePack');
            for (const element of elements) {
                element.classList.remove('activePack');
            }
        }
        if (event.target.parentNode.id !== 'nav_popout' && container.classList.contains('active') && event.target !== userContext) {
            document.getElementById('nav_popout').classList.add('hidden');
            document.getElementById('caret').classList.add('rotated');
            container.classList.remove('active');
        }
    });
    document.addEventListener('contextmenu', (event) => {
        if (event.target.parentNode.id !== 'nav_popout' && container.classList.contains('active')) {
            document.getElementById('nav_popout').classList.toggle('hidden');
            document.getElementById('caret').classList.toggle('rotated');
            container.classList.toggle('active');
        }
    });

    setInterval(() => {
        window.dmc.fetchPacks();
        window.dmc.reloadPacks(offline);
    }, 1000 * 60 * 15);
};

window.addEventListener('resize', () => {
    document.getElementById('context').classList.add('hidden');
    if (document.getElementById('user').classList.contains('active')) {
        document.getElementById('nav_popout').classList.toggle('hidden');
        document.getElementById('caret').classList.toggle('rotated');
        document.getElementById('user').classList.toggle('active');
    }
});
