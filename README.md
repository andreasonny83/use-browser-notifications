# use-browser-notifications

> Made with create-react-library

[![NPM](https://img.shields.io/npm/v/use-browser-notifications.svg)](https://www.npmjs.com/package/use-browser-notifications) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```sh
$ npm install --save use-browser-notifications
```

Or using Yarn with

```sh
$ yarn add use-browser-notifications
```

## Usage

```tsx
import React from 'react'

import { useBrowserNotifications } from 'use-browser-notifications';

function App() {
  const { show } = useBrowserNotifications({
    title: 'test notification',
    body: 'Hello world!',
  });

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Use Browser Notifications
        </p>

        <div className="buttons">
          <button className="button" onClick={show}>Show Notification</button>
        </div>
      </header>
    </div>
  );
}

export default App;
```

## Local development

First install all the node dependencies using npm

```sh
$ npm install
```

Then run the `start` script

```sh
$ npm start
```

## License

MIT © [andreasonny83](https://github.com/andreasonny83)
