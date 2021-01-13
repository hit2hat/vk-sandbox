const electron = require('electron');
const { app, Menu, ipcMain, shell, dialog, BrowserWindow } = electron;
const readline = require('readline');
const colors = require('colors/safe');
const packageJson = require('../package.json');

const configFile = require('./config').file;
const generateMiniToken = require('./utils/generateMiniToken');
const vk = require('./vk');

global.mainWindow = null;
const isMac = process.platform === 'darwin';
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

app.setName('VK Sandbox');
app.setAboutPanelOptions({
    applicationName: 'VK Sandbox',
    applicationVersion: `v${packageJson.version}`,
    version: '',
    copyright: 'Open Source Project',
    credits: 'Developer: Stepan Novozhilov | @hit2hat',
    website: `https://www.npmjs.com/package/${packageJson.name}`,
});

async function run(url) {
    const createWindow = async () => {
        mainWindow = new BrowserWindow({
            width: 414,
            height: 736,
            backgroundColor: '#fff',
            resizable: false,
            title: 'VK Sandbox',
            webPreferences: {
                contextIsolation: true,
                nodeIntegration: true,
                preload: __dirname + '/internal/preload.js',
                nativeWindowOpen: true,
            },
        });

        if (!configFile.disable_touch) {
            mainWindow.webContents.debugger.attach('1.2');
            mainWindow.webContents.debugger.sendCommand('Emulation.setEmitTouchEventsForMouse', {
                enabled: true
            });
            mainWindow.webContents.debugger.sendCommand('Emulation.setDeviceMetricsOverride', {
                mobile: true,
                deviceScaleFactor: 5,
                width: 0,
                height: 0,
            });
        }

        const userInfo = (await vk.call('users.get', {}))[0];
        console.log(`Opening app under user ${colors.cyan(userInfo.id)}...`);

        const startupLink = `${url}/?${generateMiniToken(userInfo.id)}`;
        mainWindow.loadURL(startupLink, {
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
        });
        mainWindow.show();

        mainWindow.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
            if (frameName === 'modal') {
                event.preventDefault()
                Object.assign(options, {
                    modal: true,
                    parent: mainWindow,
                    width: 414,
                    height: 736,
                    webPreferences: {
                        contextIsolation: true,
                    }
                })

                event.newGuest = new BrowserWindow(options)
            } else {
                shell.openExternal(url);
                event.preventDefault();
            }
        })

        const appInfo = (await vk.call('apps.get', { app_id: configFile.app_id }))['items'][0];
        const menu = [
            ...(isMac ? [{
                label: 'VK Sandbox',
                submenu: [
                    {
                        role: 'about',
                        label: 'О VK Sandbox',
                    },
                    {
                        role: 'quit',
                        label: 'Закрыть',
                    },
                ],
            }] : []),
            {
                label: 'Сервис',
                submenu: [
                    {
                        label: `${appInfo.title} (${configFile.app_id})`,
                    },
                    {
                        label: 'Открыть',
                        submenu: [
                            {
                                label: 'На телефоне',
                                click: () => {
                                    vk.call('notifications.sendMessage', {
                                        user_ids: userInfo.id,
                                        message: 'Откройте мини-приложение',
                                        access_token: configFile.access_token,
                                    })
                                        .then(() => {
                                            dialog.showMessageBox({
                                                title: 'Успех!',
                                                type: 'info',
                                                message: 'VK Sandbox отправило уведомление на ваш телефон',
                                            });
                                        });
                                }
                            },
                            {
                                label: 'vk.com',
                                click: () => {
                                    shell.openExternal(`https://vk.com/app${configFile.app_id}`);
                                },
                            },
                            {
                                label: 'm.vk.com',
                                click: () => {
                                    shell.openExternal(`https://m.vk.com/app${configFile.app_id}`);
                                },
                            },
                        ],
                    },
                    {
                        label: 'Перезагрузить бандл',
                        role: 'forceReload',
                    },
                    {
                        label: 'Открыть DevTools',
                        click: () => {
                            mainWindow.openDevTools({ mode: 'detach' });
                            mainWindow.webContents.addWorkSpace(process.cwd());
                        },
                    },
                ],
            },
            {
                label: 'VK Bridge',
                submenu: [
                    {
                        label: 'Сменить тему',
                        submenu: [
                            {
                                label: 'Светлая (bright_light)',
                                type: 'radio',
                                checked: true,
                                click: () => {
                                    mainWindow.webContents.send('vk-bridge', {
                                        type: 'change_theme',
                                        data: 'bright_light',
                                    });
                                },
                            },
                            {
                                label: 'Тёмная (space_gray)',
                                type: 'radio',
                                click: () => {
                                    mainWindow.webContents.send('vk-bridge', {
                                        type: 'change_theme',
                                        data: 'space_gray',
                                    });
                                },
                            },
                        ],
                    },
                    {
                        label: 'Сменить платформу',
                        submenu: [
                            {
                                label: 'iOS',
                                type: 'radio',
                                checked: true,
                                click: () => {
                                    mainWindow.webContents.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1';
                                    mainWindow.webContents.reloadIgnoringCache();
                                }
                            },
                            {
                                label: 'Android',
                                type: 'radio',
                                click: () => {
                                    mainWindow.webContents.userAgent = 'Mozilla/5.0 (Linux; Android 5.1.1; Nexus 5 Build/LMY48B; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/43.0.2357.65 Mobile Safari/537.36';
                                    mainWindow.webContents.reloadIgnoringCache();
                                }
                            }
                        ],
                    },
                    {
                        label: 'Отправить кастомное событие',
                        click: () => {
                            let options = {};
                            Object.assign(options, {
                                modal: true,
                                parent: mainWindow,
                                width: 400,
                                height: 250,
                                webPreferences: {
                                    contextIsolation: false,
                                    nodeIntegration: true,
                                },
                            });

                            const win = new BrowserWindow(options);
                            win.loadURL(`file://${__dirname}/assets/custom-event.html`);
                        },
                    },
                ],
            },
            {
                label: 'VK Storage',
                submenu: [
                    {
                        label: 'Импортировать из VK API',
                        click: async () => {
                            const keys = await vk.call('storage.getKeys', {
                                user_id: userInfo.id,
                                access_token: configFile.access_token,
                            });

                            const storage = await vk.call('storage.get', {
                                keys,
                                user_id: userInfo.id,
                                access_token: configFile.access_token,
                            });

                            mainWindow.webContents.send('vk-bridge', {
                                type: 'import-storage',
                                data: storage,
                            });

                            return dialog.showMessageBox({
                                title: 'Успех!',
                                type: 'info',
                                message: 'Ключи успешно импортированы из VK API',
                            });
                        }
                    },
                    {
                        label: 'Удалить все ключи',
                        click: () => {
                            mainWindow.webContents.send('vk-bridge', {
                                type: 'purge_storage',
                                data: '',
                            });
                        },
                    },
                ],
            },
        ];

        Menu.setApplicationMenu(Menu.buildFromTemplate(menu));

        mainWindow.on('page-title-updated', (event) => {
            event.preventDefault();
        });

        mainWindow.on('closed',  () => {
            mainWindow = null
        });
    }

    app.on('ready', createWindow);
    app.on('window-all-closed', app.quit);

    ipcMain.on('log', (event, arg) => {
        console.log(arg);
    })

    ipcMain.on('input', (event, arg) => {
        rl.question(arg, (answer) => {
            event.returnValue = answer;
        })
    })

    ipcMain.on('permissions-request', (event, arg) => {
        const button = dialog.showMessageBoxSync({
            title: '',
            message: arg,
            buttons: ['Разрешить', 'Запретить'],
        });

        event.returnValue = button === 0;
    })

    ipcMain.on('vk-bridge', (event, arg) => {
        mainWindow.webContents.send('vk-bridge', arg);
        dialog.showMessageBox({
            title: 'Успех!',
            type: 'info',
            message: 'Событие успешно отправлено!',
        });
    })
}

run(configFile.url);