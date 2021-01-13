const splash = document.createElement('div');
splash.id = 'vk-sandbox-splash';
splash.setAttribute('style', `
    width: 100vw;
    height: 100vh;
    position: absolute;
    z-index: 99999;
    background: #71aaeb;
    top: 0;
    left: 0
`);

module.exports = splash;