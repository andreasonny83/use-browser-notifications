import React, { useCallback } from 'react';
import { useBrowserNotifications } from 'use-browser-notifications';
import './App.css';

function App() {
  const { enable, disableActiveWindow, show, getConfig } = useBrowserNotifications({
    // disableActiveWindow: true,
    // enabled: false,
    debug: true,
    icon: 'https://raw.githubusercontent.com/Online-Memory/online-memory/master/packages/client/src/assets/img/WMC_icon.png',
    title: 'test notification',
    body: 'Hello world!',
    onPermissionGranted: () => {
      console.warn('onPermissionGranted');
    },
    onPermissionDenied: () => {
      console.warn('onPermissionDenied');
    },
    onShow: (event, tag) => {
      console.warn('onShow', tag, event);
    },
    onClick: (event, tag) => {
      console.warn('onClick', tag, event);
    },
    onClose: (event, tag) => {
      console.warn('onClose', tag, event);
    }
  });

  const handleEnableNotification = useCallback(() => {
    enable();
  }, [enable]);

  const handleShowNotification = useCallback(() => {
    show();
  }, [show]);

  const handleDisableActiveWindow = useCallback(() => {
    disableActiveWindow(true);
  }, [disableActiveWindow]);

  const handleEnableActiveWindow = useCallback(() => {
    disableActiveWindow(false);
  }, [disableActiveWindow]);

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Use Browser Notifications
        </p>

        <div className="buttons">
          <button className="button" onClick={handleEnableNotification}>Enable Notification</button>
          {getConfig().disableActiveWindow && <button className="button" onClick={handleEnableActiveWindow}>Enable on active window</button>}
          {!getConfig().disableActiveWindow && <button className="button" onClick={handleDisableActiveWindow}>Disable on active window</button>}
          <br/>
          <button className="button" onClick={handleShowNotification}>Show Notification</button>
        </div>

        <div>
          <p>Config</p>
          <p>{JSON.stringify(getConfig(), null, 2)}</p>
        </div>
      </header>
    </div>
  );
}

export default App;
