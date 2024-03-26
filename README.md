# Sort Google Scholar by Citations (Web-UI version)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)]()

![Demo image](https://i.ibb.co/Y06mZwc/2024-03-26-162901.png)

**@sort-google-scholarUI** is a web application that helps you search the *most-cited academic papers* published in a certain range of years.

This project is inspired from the work of [@WittmannF](https://github.com/WittmannF/sort-google-scholar).

## Setup
Clone this repo, and then install the required python packages.
```bash
$ git clone https://github.com/byanko55/sort-google-scholarUI
$ cd sort-google-scholarUI

$ pip install -r requirements.txt
```

***uvicorn*** is one simple choice for deploying your web server. You can specify the server's IP address (default is `127.0.0.1:8000`) or others. For more details, see the *uvicorn* documentation [here](https://www.uvicorn.org/settings/).
```bash
$ uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## How to bypass the daily request limit
![Daily Limit](https://i.ibb.co/C9jDhKr/2024-03-26-164948.png)

If you search too many things in a short time, the above warning sign will appear on your screen. This is caused by Google's Bot Detector (also called '*Recaptcha*'), not what we intend. It blocks any access to google scholar until you prove that "I'm not a bot!".

The general ways to bypass the bot checking process are:
1. **Try again tomorrow!** Google periodically expires the limit, so waiting a couple of hours highly resolves it. 
2. **Constantly rotate IP address or Get help from a Proxy**. It certainly minimizes the risk of being flagged as a bot activity.

For the second strategy, please refer following guidelines.

### Method 1: Usage of `free-proxy` package

***free-proxy*** is a python package that finds out the addresses of free working proxies.

```
$ pip install free-proxy
```

First, get a URL of available proxy.

```Python
>>> from fp.fp import FreeProxy
>>> proxy_url = FreeProxy(rand=True).get()

'http://138.68.60.8:3128'
```

In `main.py`, find out the global variable named `PROXY` and change it as below.

```Python
# main.py
PROXY = { 'http': 'http://138.68.60.8:3128' }
```

Finally, restart the server.

```
$ uvicorn main:app --reload
```

### Method 2: Usage of Proxy service platform
Proxy provider offers more reliable IP rotation service (Note that such a strategy may demand a service fee).

For example, *[oxylabs](https://oxylabs.io/blog/bypass-captcha)* can be an ideal choice. Make an account and get your keys (`USERNAME` and `PASSWORD`).

Update the variable `PROXY` in `main.py`.

```Python
# main.py
PROXY = {
  'http': 'http://USERNAME:PASSWORD@unblock.oxylabs.io:60000',
  'https': 'http://USERNAME:PASSWORD@unblock.oxylabs.io:60000',
}
```

Now, re-run the server.

```
$ uvicorn main:app --reload
```