window.addEventListener('load', async () => {
    const modpacksSection = document.getElementById('modpackSection');
    const serversSection = document.getElementById('serverSection');
    const settingsSection = document.getElementById('settings');
    document.getElementById('openServers').addEventListener('click', async () => {
        document.getElementById('content').scrollTo(0, 0);
        if (serversSection.classList.contains('hidden')) loadServers();
        modpacksSection.classList.add('hidden');
        serversSection.classList.remove('hidden');
        settingsSection.classList.add('hidden');
    });
    loadServers().then(() => document.getElementById('serverLoader').remove());

    setInterval(() => {
        if (serversSection.classList.contains('hidden')) return;
        loadServers();
    }, 1000 * 60);
});

async function loadServers() {
    const serverContainer = document.getElementById('servers');
    const sortDirection = 'desc';
    const sortBy = 'status';
    const servers = (await window.dmc.getServers()).sort((a, b) => {
        const valueA = a[sortBy].toUpperCase();
        const valueB = b[sortBy].toUpperCase();
        if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    const packs = await window.dmc.getPacks();
    const status = await window.dmc.getStatus();
    for (const serverData of servers) {
        const pack = packs.find((p) => p.id === serverData.id);
        const serverStatus = serverData.status === 'current' ? (serverData.offline ? 'Offline' : 'Online') : 'Archived';
        const installed = pack.installed;
        if (document.getElementById(`${serverData.id}_Server`)) {
            const server = document.getElementById(`${serverData.id}_Server`);
            server.children[1].innerHTML = `<div class="serverInfoContainer">
                    <h1 class="serverName">${serverData.name}</h1>
                    <div class="serverInfo">
                    <div class="serverStatusIndicator"></div>
                        <h3 class="serverStatus">${serverStatus}</h3>
                        <div class="playerCount ${serverStatus !== 'Online' ? 'hidden' : ''}">0 Player(s)</div>
                    </div>
                </div>`;
            server.children[2].innerHTML = `<div class="serverButtons">
                    <button ${
                        installed && serverStatus === 'Online' ? `onclick="window.dmc.playPack('${serverData.id}', '${serverData.ip}')"` : 'class="hidden"'
                    }>Join Server</button>
                    <button ${installed ? 'class="hidden"' : `onclick="window.dmc.preInstall('${serverData.id}')"`}>Install Pack</button>
                    <button ${installed && serverData.download ? `onclick="window.dmc.downloadWorld('${serverData.id}')"` : 'class="hidden"'}>Download Archived World</button>
                </div>`;
        } else {
            const server = document.createElement('div');
            server.classList.add('server');
            server.classList.add(serverStatus.toLowerCase());
            server.id = `${serverData.id}_Server`;

            const serverIcon = document.createElement('img');
            serverIcon.classList.add('serverIcon');
            serverIcon.src = await window.dmc.loadIcon(serverData.id, status);

            const serverInfo = document.createElement('template');
            serverInfo.innerHTML = `<div class="serverInfoContainer">
                    <h1 class="serverName">${serverData.name}</h1>
                    <div class="serverInfo">
                    <div class="serverStatusIndicator"></div>
                        <h3 class="serverStatus">${serverStatus}</h3>
                        <div class="playerCount ${serverStatus !== 'Online' ? 'hidden' : ''}">0 Player(s)</div>
                    </div>
                </div>`;

            const serverButtons = document.createElement('template');
            serverButtons.innerHTML = `<div class="serverButtons">
                    <button ${
                        installed && serverStatus === 'Online' ? `onclick="window.dmc.playPack('${serverData.id}', '${serverData.ip}')"` : 'class="hidden"'
                    }>Join Server</button>
                    <button ${installed ? 'class="hidden"' : `onclick="window.dmc.preInstall('${serverData.id}')"`}>Install Pack</button>
                    <button ${installed && serverData.download ? `onclick="window.dmc.downloadWorld('${serverData.id}')"` : 'class="hidden"'}>Download Archived World</button>
                </div>`;

            const serverExpandable = document.createElement('template');
            serverExpandable.innerHTML = `<div class="serverExpanded hidden">
                    <h2>Players</h2>
                    <div class="serverPlayers"></div>
                    <h2>Chat</h2>
                    <div class="serverChat">
                        <div class="serverChatContainer"></div>
                        <input class="serverChatInput" type="text">
                    </div>
                </div>`;

            server.append(...[serverIcon, serverInfo.content.childNodes[0], serverButtons.content.childNodes[0], serverExpandable.content.childNodes[0]]);
            serverContainer.append(server);
        }
    }
}
