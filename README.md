<h1 align="center">
  <a href="#"><img src="docs/logo.svg?raw=true" width="300" alt="VK Sandbox"></a>
  <p>New way to test your apps 🔥</p>
</h1>

## How to use?
1. Install deps: ```npm i @vkdev/vk-sandbox --save-dev``` or ```yarn add -D @vkdev/vk-sandbox```
2. Create or open ```vk-hosting-config.json``` and update it like under
```
{
    "static_path": "build",
    "app_id": <YOUR APP ID>,
    ////////////////// ADD IT //////////////////
    "sandbox": {
        "url": "http://localhost:10888",
        "launch_params": {
            "access_token_settings": "",
            "are_notifications_enabled": 1,
            "is_app_user": 1,
            "is_favorite": 1,
            "language": "ru",
            "platform": "mobile_iphone",
            "ref": "other"
        }
    },
    ////////////////////////////////////////////
    "endpoints": {
        "mobile": "index.html",
        "mvk": "index.html",
        "web": "index.html"
    }
}
```
3. Create or open ```.env``` and update it like under
```
VK_SANDBOX_APP_SECRET_KEY=<your app secret key>
VK_SANDBOX_APP_ACCESS_TOKEN=<your app access token>
```
4. **!!! ADD ```.env``` INTO ```.gitignore``` !!!**
5. Add to scripts in ```package.json```:
```
    "scripts": {
        ...your scripts...
        "sandbox": "vk-sandbox"
    },
```
6. Run: ```npm run sandbox``` or ```yarn sandbox```

## Credits
* Stepan Novozhilov (@hit2hat)