const bridge = require('./bridge');
const bridgeLight = require('./bridge').light;
const splash = require('./splash');
const packageJson = require('../../package.json');

// dev vars
window.vkSandbox = {
    enabled: true,
    version: packageJson.version,
};

// Splash screen
document.addEventListener('DOMContentLoaded', () => document.body.append(splash));

// Connect bridge emulator
window.addEventListener('message', bridge);
require('electron').ipcRenderer.on('vk-bridge', (event, message) => {
    console.log(event, message);
    bridgeLight(message);
})