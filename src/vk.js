const fetch = require('node-fetch');
const promptly = require('promptly');
const chalk = require('chalk');
const config = require('./config');

const SANDBOX_APP_ID = 6670517;
const CLIENT_VERSION = 2;
const API_VERSION = '5.131';
const API_HOST = 'https://api.vk.com/method/';
const OAUTH_HOST = 'https://oauth.vk.com/';

async function auth() {
    const get_auth_code = await fetch(OAUTH_HOST + 'get_auth_code?scope=apps,users,groups,offline&client_id=' + SANDBOX_APP_ID);
    const get_auth_code_res = await get_auth_code.json();

    if (get_auth_code_res.error !== void 0) {
        throw new Error(JSON.stringify(get_auth_code_res.error));
    }

    if (get_auth_code_res.response !== void 0) {
        console.log('fail, get_auth_code response ', get_auth_code_res);
        return get_auth_code_res.response;
    }

    if (get_auth_code_res.auth_code) {
        const { auth_code, device_id } = get_auth_code_res;

        const url = OAUTH_HOST + 'code_auth?stage=check&code=' + auth_code;

        let handled = false;
        do {
            const prompt_question = await promptly.confirm(chalk.yellow('Please open this url in browser', url, '(Y/n)'));

            if (!prompt_question) {
                return Promise.reject("bad response " + prompt_question);
            }

            const code_auth_token = await fetch(OAUTH_HOST + 'code_auth_token?device_id=' + device_id + '&client_id=' + SANDBOX_APP_ID);
            const code_auth_token_json = await code_auth_token.json();

            if (code_auth_token.status !== 200) {
                console.error('code_auth_token.status: ', code_auth_token.status, code_auth_token_json);
                continue;
            }

            const {access_token} = code_auth_token_json;
            if (access_token || access_token === null) {
                handled = true;
            }

            return Promise.resolve(access_token);

        } while (handled === false);
    }
}

async function call(method, params) {
    const defaultParams = {
        v: API_VERSION,
        access_token: config.get('access_token'),
        cli_version: CLIENT_VERSION,
    }

    if (!config.has('access_token') || config.get('access_token') === null) {
        console.error('access_token is missing');
        return false;
    }

    params = { ...defaultParams, ...params };
    const queryParams = Object.keys(params).map((k) => { return k + "=" + encodeURIComponent(params[k]) }).join('&');
    try {
        const query = await fetch(API_HOST + method + '?' + queryParams);
        const res = await query.json();
        if (res.error !== void 0) {
            throw new Error(res.error.error_code + ': ' + res.error.error_msg);
        }

        if (res.response !== void 0) {
            return res.response;
        }
    } catch (e) {
        console.error(e);
    }
}

module.exports = {
    auth,
    call,
};