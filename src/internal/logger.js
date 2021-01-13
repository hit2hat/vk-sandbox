const colors = require('colors/safe');

const pad = (number) => {
    if (number < 10) {
        return '0' + number;
    }
    return number;
}

const getTime = () => {
    const date = new Date();

    const hours = pad(date.getUTCHours());
    const minutes = pad(date.getUTCMinutes());
    const seconds = pad(date.getUTCSeconds());

    return `${hours}:${minutes}:${seconds}`;
};

const send = (payload) => require('electron').ipcRenderer.send('log', payload);
const get = (payload) => require('electron').ipcRenderer.sendSync('input', payload);
const request = (payload) => require('electron').ipcRenderer.sendSync('permissions-request', payload);

module.exports = {
    send,
    get,
    getTime,
    request,
    bridgeRequest: (method, params) => {
        send(`${colors.bgCyan('[BRIDGE]')} <- ${colors.cyan(method)} was called with ${colors.cyan(JSON.stringify(params || {}))}`);
    },
    bridgeResponse: (method, data) => {
        send(`${colors.bgBlue('[BRIDGE]')} -> ${colors.blue(method)} was sent with ${colors.blue(JSON.stringify(data || {}))}`);
    },
    unknownMethod: (method, params) => {
        send(`${colors.bgBlue('[BRIDGE]')} <- Unknown method ${colors.red(method)} was called with ${colors.red(JSON.stringify(params || {}))}`);
    },
    updateStorage: (key, value) => {
        send(`${colors.bgMagenta('[STORAGE]')} Set key "${colors.magenta(key)}" equals "${colors.magenta(value)}"`);
    },
    purgeStorage: () => {
        send(`${colors.bgMagenta('[STORAGE]')} Storage successful cleared`);
    },
    importStorage: (keys) => {
        send(`${colors.bgMagenta('[STORAGE]')} Keys (${colors.magenta(keys.join(','))}) successful imported to storage from vk api`);
    }
};