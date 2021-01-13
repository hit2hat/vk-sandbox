<h1 align="center">
  <a href="#"><img src="docs/logo.svg?raw=true" width="300" alt="VK Sandbox"></a>
  <p>New way to test your apps 🔥</p>
</h1>

### Как использовать?
1. 📦 Установите пакет: ```yarn add -D @vkdev/vk-sandbox```
2. ✏️ Создайте или откройте файл ```vk-hosting-config.json``` и измените его, как показано ниже:
```
{
    "static_path": "build",
    "app_id": <ID вашего приложения>,
    ////////////////// Добавь это //////////////////
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
3. ✏️ Создайте или откройте файлы ```.env``` и измените его, как показано ниже:
```
VK_SANDBOX_APP_SECRET_KEY=<секретный ключ вашего приложения>
VK_SANDBOX_APP_ACCESS_TOKEN=<сервисный токен вашего приложения>
```
4. ❗️ **ДОБАВЬТЕ ```.env``` В ```.gitignore```**
5. ✏️ Добавьте скрипт в ```package.json```:
```
    "scripts": {
        ...your scripts...
        "sandbox": "vk-sandbox"
    },
```
6. 🚀 Запустите: ```yarn sandbox```

### Настройки
Все настройки сандбокса находятся в файле ```vk-hosting-config.json``` в секции ```sandbox```

| Параметр | Описание | Значение по-умолчанию  |
| ------------- | ------------- | ----- |
| **url** (required; string) | Ссылка на бандл вашего приложения | ```http://localhost:10888``` |
| **launch_params** (required; map of string) | Параметры запуска, пишутся без префикса ```vk_``` | см. пример выше |
| **disable_touch** (optional; boolean) | Отключение эмуляции серсерного экрана | ```false``` |

### Создатели
* Степан Новожилов (@hit2hat)