window.onload = async () => {
    let offline = !(await window.dmc.getStatus()).api;

    window.dmc.reloadPacks();
    getVersions();

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
            container.classList.toggle('active');
            userContext = event.target;
        });

        document.getElementById('loginButton').remove();
        document.getElementById('logout').addEventListener('click', async () => {
            window.dmc.logout();
            window.location.reload();
        });
    } else if (user.status === 'offline') window.dmc.reloadPacks();

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
            container.classList.remove('active');
        }
    });
    document.addEventListener('contextmenu', (event) => {
        if (event.target.parentNode.id !== 'nav_popout' && container.classList.contains('active')) {
            document.getElementById('nav_popout').classList.toggle('hidden');
            container.classList.toggle('active');
        }
    });

    document.getElementById('logsButton').setAttribute('onclick', `window.dmc.openFolder("${(await window.dmc.getConfig()).configPath.replaceAll('\\', '/')}/logs")`);

    setInterval(() => {
        window.dmc.fetchPacks();
        window.dmc.reloadPacks();
    }, 1000 * 60 * 15);
};

async function getVersions() {
    const versions = await window.dmc.getVersions();
    document.getElementById('appVersion').innerHTML = versions.app;
    document.getElementById('chromeVersion').innerHTML = versions.chrome;
    document.getElementById('electronVersion').innerHTML = versions.electron;
    document.getElementById('nodeVersion').innerHTML = versions.node;
    document.getElementById('v8Version').innerHTML = versions.v8;
}

window.addEventListener('resize', () => {
    document.getElementById('context').classList.add('hidden');
    if (document.getElementById('user').classList.contains('active')) {
        document.getElementById('nav_popout').classList.toggle('hidden');
        document.getElementById('user').classList.toggle('active');
    }
});

const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
        document.getElementById('resizer').setAttribute('style', `max-width: ${entry.contentRect.width + 20}px;`);
    }
});

resizeObserver.observe(document.getElementById('end'));
