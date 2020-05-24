import { useCallback, useState, useEffect } from 'react';

const DEBUG_MESSAGE = '[useBrowserNotifications]';

type Status = 'Enabled' | 'Disabled';

interface Config {
  debug?: boolean;
  disableActiveWindow?: boolean;
  enabled?: boolean;
  requireInteraction?: boolean;
  tag?: string;
  icon?: string;
  badge?: string;
  image?: string;
  body?: string;
  title: string;
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
  onShow?: (event: Event, tag: string) => void;
  onClick?: (event: Event, tag: string) => void;
  onClose?: (event: Event, tag: string) => void;
  onError?: (err: any, tag: string) => void;
  notSupported?: () => void;
}

interface UseBrowserNotifications extends Partial<Config> {
  debug: boolean;
  disableActiveWindow: boolean;
  enabled: boolean;
  requireInteraction: boolean;
  onPermissionGranted: () => void;
  onPermissionDenied: () => void;
  onShow: (event: Event, tag: string) => void;
  onClick: (event: Event, tag: string) => void;
  onClose: (event: Event, tag: string) => void;
  onError: (err: any, tag: string) => void;
  notSupported: () => void;
}

const defaultConfig: UseBrowserNotifications = {
  debug: false,
  disableActiveWindow: false,
  enabled: true,
  requireInteraction: false,
  onPermissionGranted: () => {},
  onPermissionDenied: () => {},
  onShow: () => {},
  onClick: () => {},
  onClose: () => {},
  onError: () => {},
  notSupported: () => {},
};

enum Permission {
  PERMISSION_GRANTED = 'granted',
  PERMISSION_DENIED = 'denied',
}

const notifications = {};

export const useBrowserNotifications = (config: Config) => {
  const _config = { ...defaultConfig, ...config };
  const {
    enabled,
    title,
    body,
    icon,
    badge,
    image,
    requireInteraction,
    onPermissionGranted,
    onPermissionDenied,
    onShow,
    onClick,
    onClose,
    onError,
    notSupported,
    debug: isDebugEnabled,
  } = _config;

  const [supported, setSupported] = useState<boolean>(false);
  const [granted, setGranted] = useState<boolean>(window.Notification.permission === Permission.PERMISSION_GRANTED);
  const [tag, setTag] = useState<string | undefined>(_config.tag);
  const [windowFocus, setWindowFocus] = useState<boolean>(true);
  const [disableActiveWindow, setDisableActiveWindow] = useState<boolean>(_config.disableActiveWindow);
  const [status, setStatus] = useState<Status>(enabled ? 'Enabled' : 'Disabled');

  const debug = useCallback(
    (message: string) => {
      if (isDebugEnabled) {
        console.warn(DEBUG_MESSAGE, message);
      }
    },
    [isDebugEnabled]
  );

  const onWindowFocus = useCallback(() => {
    debug('window on focus');
    setWindowFocus(true);
  }, [debug]);

  const onWindowBlur = useCallback(() => {
    debug('window on blur');
    setWindowFocus(false);
  }, [debug]);

  const showNotification = useCallback(async () => {
    debug('Show Notification');

    const notificationTag = _config.tag || `use-browser-notifications-${Date.now().toString().slice(4, -3)}`;
    if (!_config.tag) {
      setTag(notificationTag);
    }

    if (notifications[notificationTag]) {
      return;
    }

    const notification = new window.Notification(title, {
      tag: notificationTag,
      vibrate: [200, 100, 200],
      requireInteraction,
      icon,
      badge,
      image,
      body,
    });

    debug(`Notification created:

${JSON.stringify(notification, null, 2)}`);

    notification.onshow = (event: Event) => {
      onShow(event, notificationTag);
    };

    notification.onclick = (event: Event) => {
      onClick(event, notificationTag);
    };
    notification.onclose = (event: Event) => {
      onClose(event, notificationTag);
    };
    notification.onerror = (err: any) => {
      onError(err, notificationTag);
    };

    notifications[notificationTag] = notification;
  }, [_config.tag, badge, body, debug, icon, image, onClick, onClose, onError, onShow, requireInteraction, title]);

  const checkNotificationPromise = useCallback(async () => {
    let permission;
    try {
      permission = await window.Notification.requestPermission();
    } catch (e) {
      return Permission.PERMISSION_DENIED;
    }
    return permission === Permission.PERMISSION_GRANTED ? Permission.PERMISSION_GRANTED : Permission.PERMISSION_DENIED;
  }, []);

  const askPermission = useCallback(async () => {
    const handlePermission = (permission: Permission) => {
      if (!granted) {
        const result = permission === Permission.PERMISSION_GRANTED;

        if (result) {
          setGranted(true);
          debug(`permission granted`);
          onPermissionGranted();
          return true;
        } else {
          setGranted(false);
          debug(`permission denied`);
          onPermissionDenied();
          return false;
        }
      }
      return false;
    };

    const permission = await checkNotificationPromise();

    return handlePermission(permission);
  }, [checkNotificationPromise, debug, granted, onPermissionDenied, onPermissionGranted]);

  useEffect(() => {
    if (disableActiveWindow && status === 'Enabled') {
      window.addEventListener('focus', onWindowFocus);
      window.addEventListener('blur', onWindowBlur);
      debug('disableActiveWindow event listeners created');
    }

    return () => {
      window.removeEventListener('focus', onWindowFocus);
      window.removeEventListener('blur', onWindowBlur);
      debug('disableActiveWindow event listeners removed');
    };
  }, [debug, disableActiveWindow, onWindowBlur, onWindowFocus, status]);

  useEffect(() => {
    if ('Notification' in window && window.Notification) {
      setSupported(true);
    } else {
      setSupported(false);
    }
  }, []);

  return {
    enable: async () => {
      if (status === 'Enabled') {
        debug('Browser notifications already enabled');
        return;
      }

      debug('Trying to enabling browser notifications...');

      if (!supported) {
        debug('Browser notifications are not supported for this browser');
        notSupported();
        return;
      }

      if (status === 'Disabled' && supported) {
        const permissionGranted = granted || (await askPermission());

        if (permissionGranted) {
          setStatus('Enabled');
        }
      }
    },
    disableActiveWindow: (status: boolean) => {
      setDisableActiveWindow(status);
    },
    show: () => {
      const doNotShowOnActiveWindow = disableActiveWindow && windowFocus;

      if (granted && status === 'Enabled' && !doNotShowOnActiveWindow) {
        showNotification();
      } else {
        debug(`Cannot show a notification right now:

permissions granted:  ${granted}
notifications status: ${status}
disableActiveWindow:  ${disableActiveWindow}
is window on focus:   ${windowFocus}
`);
      }
    },
    getConfig: () => {
      return {
        status,
        disableActiveWindow,
        tag,
      };
    },
  };
};