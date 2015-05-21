# Tagbot

A Slack bot for [Tagview](http://www.tagview.com.br)

![Sausage party fun](https://dl.dropboxusercontent.com/u/732128/sausages.gif)

# Features

- Phabricator Macros: yeah, the most important one
- Phabricator Diffs: link generation and notification
- Votes: +awesome

# Configuration

The bot configuration is done via environment variables, which are:

- `APP_URL`: full URL where the bot application is hosted
- `BOT_TOKEN`: Slack Bot token
- `CONDUIT_USER`: Phabriactor user that has access to the Conduit API
- `CONDUIT_API_URL`: Phabricator Conduit API URL, ex: http://phabricator.com/api/
- `CONDUIT_CERTIFICATE`: Phabricator Conduit API authentication certificate

# Tests
![hahaha no](https://dl.dropboxusercontent.com/u/732128/81f2deb5142749624159709399_700wa_0.gif)

# License
(The MIT License)

Copyright (c) 2015 Rodrigo Navarro rnavarro@rnavarro.com.br

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
