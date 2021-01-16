const Storage = require('configstore');
const packageJson = require('../../package.json');
const logger = require('./logger');
const config = require('../config');
const configFile = require('../config').file;
const vk = require('../vk');

const APP_ID = Number(configFile.app_id);
let THEME = 'bright_light';
let APPEARANCE = 'light';
let INSETS = {
    top: 0,
    bottom: 34,
    left: 0,
    right: 0,
};

const getAppConfig = () => {
    return {
        app_id: APP_ID,
        app: 'vkclient',
        appearance: APPEARANCE,
        start_time: (new Date()).getTime(),
        scheme: THEME,
        insets: INSETS,
    };
}

const storage = new Storage(`${packageJson.name}-${APP_ID}`);

const sendBridgeEvent = (request_id, type, data = {}) => {
    logger.bridgeResponse(type, data);
    window.postMessage({
        type,
        data: {
            ...data,
            request_id,
        },
    }, '*');
};

const methodsFactory = (request_id) => ({
    /*
        Common
     */
    'VKWebAppInit': () => {
        document.getElementById('vk-sandbox-splash').setAttribute('style', 'display: none');
        return sendBridgeEvent(request_id, 'VKWebAppUpdateConfig', getAppConfig());
    },
    'VKWebAppGetClientVersion': () => {
        return sendBridgeEvent(request_id, 'VKWebAppGetClientVersionResult', {
            platform: 'ios',
            version: '5.3.3',
        });
    },
    'VKWebAppOpenCodeReader': () => {
        return sendBridgeEvent(request_id, 'VKWebAppOpenCodeReaderResult', {
            code_data: logger.get('Input data to be read as a result of the scan > '),
        });
    },
    'VKWebAppClose': ({ status = 'success', payload = {} }) => {
        window.close();
    },
    'VKWebAppEnableSwipeBack': () => {
        return sendBridgeEvent(request_id, 'VKWebAppEnableSwipeBackResult', {
            result: true,
        });
    },
    'VKWebAppDisableSwipeBack': () => {
        return sendBridgeEvent(request_id, 'VKWebAppDisableSwipeBackResult', {
            result: true,
        });
    },
    'VKWebAppCopyText': ({ text = '' }) => {
        require('electron').clipboard.writeText(text);
        return sendBridgeEvent(request_id, 'VKWebAppCopyTextResult', {
            result: true,
        });
    },
    'VKWebAppAllowNotifications': () => {
        const response = logger.request('Разрешить приложению присылать вам уведомления?');
        if (response) {
            return sendBridgeEvent(request_id, 'VKWebAppAllowNotificationsResult', {
                result: true,
            });
        }

        return sendBridgeEvent(request_id, 'VKWebAppAllowNotificationsFailed', {
            error_type: 'vk-sandbox',
            error_data: 'denied by user',
        });
    },
    'VKWebAppDenyNotifications': () => {
        return sendBridgeEvent(request_id, 'VKWebAppDenyNotificationsResult', {
            result: true,
        });
    },
    'VKWebAppAddToFavorites': () => {
        const response = logger.request('Добавить сервис в избранные?');
        if (response) {
            return sendBridgeEvent(request_id, 'VKWebAppAddToFavoritesResult', {
                result: true,
            });
        }

        return sendBridgeEvent(request_id, 'VKWebAppAddToFavoritesFailed', {
            error_type: 'vk-sandbox',
            error_data: 'denied by user',
        });
    },
    'VKWebAppAddToHomeScreen': () => {
        const response = logger.request('Добавить на главный экран?');
        if (response) {
            return sendBridgeEvent(request_id, 'VKWebAppAddToHomeScreenResult', {
                result: true,
            });
        }

        return sendBridgeEvent(request_id, 'VKWebAppAddToHomeScreenFailed', {
            error_type: 'vk-sandbox',
            error_data: 'denied by user',
        });
    },
    'VKWebAppSendToClient': async ({ fragment = 'welcome'}) => {
        const userInfo = (await vk.call('users.get', {}))[0];
        vk.call('notifications.sendMessage', {
            user_ids: userInfo.id,
            message: 'Откройте мини-приложение',
            access_token: configFile.access_token,
            fragment,
        })
            .then(() => {
                return sendBridgeEvent(request_id, 'VKWebAppSendToClientResult', {
                    result: true,
                });
            })
            .catch((error) => {
                return sendBridgeEvent(request_id, 'VKWebAppSendToClientFailed', {
                    error_type: 'vk-sandbox',
                    error_data: error.message,
                });
            })
    },

    /*
        User
     */
    'VKWebAppGetUserInfo': async () => {
        vk.call('users.get', {
            fields: 'sex,city,country,bdate,photo_100,photo_200,photo_max_orig,timezone',
        })
            .then((user) => {
                return sendBridgeEvent(request_id, 'VKWebAppGetUserInfoResult', user[0]);
            })
            .catch((err) => {
                return sendBridgeEvent(request_id, 'VKWebAppGetUserInfoFailed', {
                    error_type: 'vk-sandbox',
                    error_data: err.message,
                });
            })
    },
    'VKWebAppCallAPIMethod': async ({ method, params = {}, request_id: rid }) => {
        if (!method) {
            return sendBridgeEvent(request_id, 'VKWebAppCallAPIMethodFailed', {
                error_type: 'vk-sandbox',
                error_data: `"method" is required`,
            });
        }

        vk.call(method, params)
            .then((response) => {
                return sendBridgeEvent(request_id, 'VKWebAppCallAPIMethodResult', {
                    request_id: rid,
                    response,
                });
            })
            .catch((err) => {
                return sendBridgeEvent(request_id, 'VKWebAppCallAPIMethodFailed', {
                    error_type: 'vk-sandbox',
                    error_data: err.message,
                });
            })
    },
    'VKWebAppGetAuthToken': async ({ scope }) => {
        return sendBridgeEvent(request_id, 'VKWebAppGetAuthTokenResult', {
            access_token: config.get('access_token'),
            scope,
        });
    },

    /*
        Storage
     */
    'VKWebAppStorageGet': async ({ keys }) => {
        if (!Array.isArray(keys)) {
            return sendBridgeEvent(request_id, 'VKWebAppStorageGetFailed', {
                error_type: 'vk-sandbox',
                error_data: `"keys" is not array`,
            });
        }

        const result = [];
        for (let i = 0; i < keys.length; i++) {
            if (!!keys[i]) {
                result.push({
                    key: keys[i],
                    value: storage.get(keys[i]) || '',
                });
            }
        }

        return sendBridgeEvent(request_id, 'VKWebAppStorageGetResult', {
            keys: result,
        });
    },
    'VKWebAppStorageSet': ({ key, value = '' }) => {
        if (!key) {
            return sendBridgeEvent(request_id, 'VKWebAppStorageSetFailed', {
                error_type: 'vk-sandbox',
                error_data: `"key" is required`,
            });
        }

        storage.set(key, value);
        logger.updateStorage(key, value);

        return sendBridgeEvent(request_id, 'VKWebAppStorageSetResult', {
            result: true,
        });
    },
    'VKWebAppStorageGetKeys': ({ count, offset = 0 }) => {
        if (!count || isNaN(Number(count))) {
            return sendBridgeEvent(request_id, 'VKWebAppStorageGetKeysFailed', {
                error_type: 'vk-sandbox',
                error_data: `"count" is required and be integer`,
            });
        }

        return sendBridgeEvent(request_id, 'VKWebAppStorageGetKeysResult', {
            keys: Object.keys(storage.all).slice(offset, offset + count),
        });
    },

    /*
        Stories
     */
    'VKWebAppShowStoryBox': ({ background_type, url = null, blob = null, attachment = null }) => {
        switch (background_type) {
            case 'image': {
                if (url === null && blob === null) {
                    return sendBridgeEvent(request_id, 'VKWebAppShowStoryBoxFailed', {
                        error_type: 'vk-sandbox',
                        error_data: `"url" or "blob" is required`,
                    });
                }

                const modal = window.open('', 'modal');
                modal.document.write(`
                    <style>
                        * { padding: 0; margin: 0; }
                    </style>
                    <img
                        src="${blob === null ? url : blob}" style="height: 100vh; width: 100vw" alt="story"
                        onClick="window.close()"
                    />
                `);

                modal.onclick = () => {
                    return sendBridgeEvent(request_id, 'VKWebAppShowStoryBoxResult', {
                        result: true,
                    });
                }

                return
            }

            case 'video': {
                // doesnt support now
                return
            }

            default: {
                return
            }
        }
    },

    /*
        Ads
     */
    'VKWebAppGetAds': () => {
        return sendBridgeEvent(request_id, 'VKWebAppGetAdsResult', {
            title: 'VK Sandbox',
            domain: 'vk.com',
            trackingLink: `https://www.npmjs.com/package/${packageJson.name}`,
            ctaText: 'Перейти',
            advertisingLabel: 'Реклама',
            iconLink: 'https://sun9-7.userapi.com/c846420/v846420985/1526c3/ISX7VF8NjZk.jpg',
            description: 'Лучшая библиотека для тестирования ваших сервисов',
            ageRestrictions: '0+',
            statistics: [
                { url: '', type: 'playbackStarted' },
                { url: '', type: 'click' }
            ]
        });
    },
    'VKWebAppShowNativeAds': ({ ad_format }) => {
        if (!['preloader', 'reward', 'interstitial'].includes(ad_format)) {
            return sendBridgeEvent(request_id, 'VKWebAppShowNativeAdsFailed', {
                error_type: 'vk-sandbox',
                error_data: `incorrect "ad_format"`,
            });
        }

        return sendBridgeEvent(request_id, 'VKWebAppShowNativeAdsResult', {
            result: true,
        });
    }
});

const bridgeHandler = (event) => {
    if (event.data && event.data.type === 'vk-connect') {
        const { data: { handler: type, params: { request_id, ...params } } } = event;
        const methods = methodsFactory(request_id);
        if (!!methods[type]) {
            logger.bridgeRequest(type, params);
            methods[type](params);
        } else {
            logger.unknownMethod(type, params);
        }
    }
};

module.exports = bridgeHandler;
module.exports.light = (message) => {
    const { type, data } = message;
    switch (type) {
        case 'change_theme': {
            THEME = data;
            return sendBridgeEvent('internal', 'VKWebAppUpdateConfig', getAppConfig());
        }

        case 'purge_storage': {
            storage.clear();
            return logger.purgeStorage();
        }

        case 'import-storage': {
            storage.clear();
            data.map((x) => storage.set(x.key, x.value));
            return logger.importStorage(data.map((x) => x.key));
        }

        case 'custom_event': {
            return sendBridgeEvent('custom', data.type, data.params);
        }

        default: return;
    }
};