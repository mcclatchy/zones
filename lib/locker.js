/*
 * This is a fake Yozons locker for development
 */

export function isSubscriber() {
  return false;
}

export function isUserLoggedIn() {
  return false;
}

export function getPageType() {
  return pageInfo["marketInfo.pagelevel"] || "custom";
}

export function getPageTemplate() {
  return pageInfo["template"] || "custom";
}

export function executeWhenDOMReady(callback, state = document.readyState) {
  if (callback && typeof callback === 'function') {
    switch (state) {
      case 'loading':
        document.addEventListener('DOMContentLoaded', callback);
        break;
      default:
        callback();
    }
  }
}
