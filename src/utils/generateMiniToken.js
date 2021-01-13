const configFile = require('../config').file;

const generateMiniToken = (user_id, params = configFile.launch_params, secret_key = configFile.secret_key) => {
    const preparedConfigParams = Object.keys(params).reduce((a, x) => {
        return {
            ...a,
            [`vk_${x}`]: params[x],
        };
    }, {});

    const queryParams = {
        vk_access_token_settings: 'notify%2Cmenu',
        vk_app_id: configFile.app_id,
        vk_are_notifications_enabled: 0,
        vk_is_app_user: 1,
        vk_is_favorite: 0,
        vk_language: 'ru',
        vk_platform: 'desktop_web',
        vk_ref: 'other',
        vk_user_id: user_id,
        vk_ts: Math.floor((new Date()).getTime() / 1000),
        ...preparedConfigParams,
    }

    const signParams = {};
    Object.keys(queryParams).sort()
        .forEach((key) => {
            signParams[key] = queryParams[key];
        });

    const signStr = Object.keys(signParams).reduce((a, x) => {
        a.push(x + '=' + signParams[x]);
        return a;
    }, []).join('&');

    let sign = require('crypto').createHmac('sha256', secret_key).update(signStr);
    sign = sign.digest('binary');
    sign = require('buffer').Buffer.from(sign, 'binary').toString('base64');
    sign = sign.split('+').join('-');
    sign = sign.split('/').join('_');
    sign = sign.replace(/=+$/, '');

    return `${signStr}&sign=${sign}`;
};

module.exports = generateMiniToken;