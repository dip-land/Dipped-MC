# Tomate Loaders

Tomate Loaders is a JavaScript library designed to facilitate the management and launching of Minecraft game instances with different mod loaders, specifically Fabric, Quilt, Forge and NeoForge. This README.md provides an overview of how to use Tomate Loaders in your own projects.

## Installation

To use Tomate Loaders in your project, you can install it via npm:

```bash
npm install tomate-loaders
```

## Usage


### Vanilla
If you only need to ever launch Vanilla Minecraft you should use MCLC directly. This is just here for a consistant api

#### Launch vanilla Minecraft
```javascript
import { vanilla } from 'tomate-loaders';
import { Client, Authenticator } from 'minecraft-launcher-core';

// Create a Minecraft launcher instance
const launcher = new Client();

// Get the launch configuration for Fabric
const launchConfig = await vanilla.getMCLCLaunchConfig({
  gameVersion: '1.20.2',
  rootPath: './minecraft',
});

launcher.launch({
  ...launchConfig,
  authorization: Authenticator.getAuth('username'), // You can use https://www.npmjs.com/package/msmc for microsoft auth
  memory: {
    min: 2000,
    max: 5000,
  },
  javaPath: 'javaw',
});
```

### Quilt
Quilt has the same api in Tomate Loaders. Just replace the `import { fabric } from 'tomate-loaders'` with `import { quilt } from 'tomate-loaders'`

### Fabric
Tomate Loaders provides functionality for working with the Fabric mod loader. Here's how you can use it in your project:

#### Get Profile
```javascript
import { fabric } from 'tomate-loaders';
import { Client, Authenticator } from 'minecraft-launcher-core';

// Get a list of available Fabric loaders
const loaders = await fabric.getLoaders();

// Get a Fabric profile for a specific Minecraft version and loader
const profile = await fabric.getProfile('1.19.4', loaders[0].version);
```

#### Launch Minecraft with fabric (it will download the profile for you automatically)
```javascript
import { fabric } from 'tomate-loaders';
import { Client, Authenticator } from 'minecraft-launcher-core';

// Create a Minecraft launcher instance
const launcher = new Client();

// Get the launch configuration for Fabric
const launchConfig = await fabric.getMCLCLaunchConfig({
  gameVersion: '1.20.2',
  rootPath: './minecraft',
});

launcher.launch({
  ...launchConfig,
  authorization: Authenticator.getAuth('username'), // You can use https://www.npmjs.com/package/msmc for microsoft auth
  memory: {
    min: 2000,
    max: 5000,
  },
  javaPath: 'javaw',
});
```

### Forge
Tomate Loaders also supports working with the Forge mod loader. Here's how you can use it in your project:

#### Download Forge for a specific Minecraft version
```javascript
import { forge } from 'tomate-loaders';

await forge.downloadForge('./forge.jar', '1.19.2');
```

#### Launch Minecraft with Forge (it will download forge for you automatically)
```javascript
import { forge } from 'tomate-loaders';

// Create a Minecraft launcher instance
const launcher = new Client();

// Get the launch configuration for Forge
const launchConfig = await forge.getMCLCLaunchConfig({
  gameVersion: '1.20.2',
  rootPath: './minecraft',
});

launcher.launch({
  ...launchConfig,
  authorization: Authenticator.getAuth('username'), // You can use https://www.npmjs.com/package/msmc for microsoft auth
  memory: {
    min: 2000,
    max: 5000,
  },
  javaPath: 'javaw',
});
```

### NeoForge
NeoForge works just like forge.

### Loader id
Each modloader has an unique id
```javascript
console.log(fabric.id); // "fabric"
```

```javascript
const fabric = loader('fabric');
```

### TomateMods loader config
You can get the loader config for `tomate-mods` for any of the mod loaders like this:
```javascript
const fabricLoader = fabric.tomateModsModLoader;
```

### Liner
Liner is super usefull for parsing the output of the minecraft client. It collects the output of the minecraft client and calls the function specified, when encountering a new line.

To simply output what the client does you can do the following:
```javascript
import { liner } from 'tomate-loaders';

launcher.on('data', liner(console.log));
```

