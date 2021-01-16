const Config = require('configstore');
const packageJson = require('../package.json');

const config = new Config(packageJson.name, {
    access_token: null,
});

const dotenv = require('dotenv');
const dotenvConfig = dotenv.config({ path: `${process.cwd()}/.env` }).parsed || {};
const deployConfig = require('require-module')('./vk-hosting-config.json') || {};

module.exports = config;
module.exports.file = {
    app_id: deployConfig.app_id || 0,
    secret_key: dotenvConfig.VK_SANDBOX_APP_SECRET_KEY || null,
    access_token: dotenvConfig.VK_SANDBOX_APP_ACCESS_TOKEN || null,
    launch_params: deployConfig?.sandbox?.launch_params || {},
    url: deployConfig?.sandbox?.url || 'http://localhost:10888',
    hash: deployConfig?.sandbox?.hash || '',
    disable_touch: deployConfig?.sandbox?.disable_touch || false,
};