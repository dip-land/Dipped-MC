window.addEventListener('load', async () => {
    const modpacksSection = document.getElementById('modpacks');
    const settingsSection = document.getElementById('settings');
    document.getElementById('openModpacks').addEventListener('click', () => {
        document.getElementById('content').scrollTo(0, 0);
        modpacksSection.classList.remove('hidden');
        settingsSection.classList.add('hidden');
    });
    document.getElementById('openSettings').addEventListener('click', async () => {
        document.getElementById('content').scrollTo(0, 0);
        if (settingsSection.classList.contains('hidden')) await loadSettings();
        settingsSection.classList.remove('hidden');
        modpacksSection.classList.add('hidden');
    });
    loadSettings();

    const config = await window.dmc.getConfig();
    const themeButtons = document.getElementsByClassName('themeButton');
    const themeStyle = document.getElementById('theme');
    themeStyle.setAttribute('href', `./styles/${config.theme ?? 'default'}.css`);

    for (const button of themeButtons) {
        button.addEventListener('click', async () => {
            const theme = button.classList.item(1);
            themeStyle.setAttribute('href', `./styles/${theme}.css`);
            const config = await window.dmc.getConfig();
            config.theme = theme;
            window.dmc.editConfig(config);
        });
    }
});

async function loadSettings() {
    const config = await window.dmc.getConfig();
    const packs = await window.dmc.getPacks();
    const menuBar = document.getElementById('settingsMenuBar');
    const settingsContent = document.getElementById('settingsContent');
    const defaultInstallLocation = document.getElementById('defaultInstallLocation');
    defaultInstallLocation.value = `${config.packPath}`;
    const defaultPackRam = document.getElementById('defaultPackRam');
    defaultPackRam.innerHTML = '';
    const ramValues = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    for (const value of ramValues) {
        const option = document.createElement('option');
        option.value = value;
        option.innerText = `${value}GB`;
        defaultPackRam.append(option);
    }
    defaultPackRam.value = config.ram;
    menuBar.innerHTML = '<a href="#appSettings"><img src="/favicon_x64.png"></a>';

    document.getElementById('changeDefaultLocation').addEventListener('click', async () => {
        let folder = await window.dmc.selectFolder('pack');
        if (!folder) return;
        defaultInstallLocation.value = folder;
        const config = await window.dmc.getConfig();
        config.packPath = folder;
        await window.dmc.editConfig(config);
    });
    document.getElementById('openDefaultLocation').addEventListener('click', async () => {
        await window.dmc.openFolder(defaultInstallLocation.value);
    });
    document.getElementById('defaultPackRam').addEventListener('change', async () => {
        const config = await window.dmc.getConfig();
        config.ram = +document.getElementById('defaultPackRam').value;
        await window.dmc.editConfig(config);
    });

    for (const pack of config.packs) {
        menuBar.innerHTML += `<a href="#${pack.id}_Settings"><img src="${await window.dmc.loadIcon(pack.id, { api: false, network: false })}"></a>`;
        const packData = packs.find((p) => p.id === pack.id);
        const section = document.getElementById(`${pack.id}_Settings`) ?? document.createElement('section');
        section.id = `${pack.id}_Settings`;
        section.innerHTML = '';

        const heading = document.createElement('h1');
        heading.innerText = packData.name;

        const thinHR = document.createElement('hr');
        thinHR.classList.add('thin', 'extraMargin');

        const locationLabel = document.createElement('label');
        locationLabel.classList.add('locationLabel');
        locationLabel.setAttribute('for', `${pack.id}_installLocation`);
        locationLabel.innerText = 'Install Location';

        const locationInput = document.createElement('input');
        locationInput.id = `${pack.id}_installLocation`;
        locationInput.setAttribute('name', `${pack.id}_installLocation`);
        locationInput.setAttribute('type', 'text');
        locationInput.disabled = true;
        locationInput.value = `${pack.path}`;

        const locationChangeButton = document.createElement('button');
        locationChangeButton.classList.add('basicButton');
        locationChangeButton.innerText = 'Change';

        const locationOpenButton = document.createElement('button');
        locationOpenButton.classList.add('basicButton');
        locationOpenButton.innerText = 'Open';

        const ramLabel = document.createElement('label');
        ramLabel.classList.add('ramLabel');
        ramLabel.setAttribute('for', `${pack.id}_ram`);
        ramLabel.innerText = 'Allocated Pack Ram';

        const ramInput = document.createElement('select');
        ramInput.id = `${pack.id}_ram`;
        ramInput.setAttribute('name', `${pack.id}_ram`);
        for (const value of ramValues) {
            const option = document.createElement('option');
            option.value = value;
            option.innerText = `${value}GB`;
            ramInput.append(option);
        }
        ramInput.value = `${pack.ram}`;

        section.append(...[document.createElement('hr'), heading, thinHR, locationLabel, locationInput, locationChangeButton, locationOpenButton, ramLabel, ramInput]);
        section.remove();
        settingsContent.append(section);

        locationChangeButton.addEventListener('click', async () => {
            let folder = await window.dmc.selectFolder('pack');
            if (!folder) return;
            folder = await window.dmc.pathJoin(folder, packData.identifier);
            locationInput.value = folder;
            await window.dmc.movePack(pack.id, folder);
            await window.dmc.reloadPacks();
        });
        locationOpenButton.addEventListener('click', async () => {
            await window.dmc.openFolder(locationInput.value);
        });
        ramInput.addEventListener('change', async () => {
            await window.dmc.editPackConfig(pack.id, { ram: +ramInput.value });
        });
    }
}
