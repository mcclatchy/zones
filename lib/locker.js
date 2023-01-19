/*
 * This is a fake Yozons locker for development
 */

const locker = {
  pageType: document.documentElement.dataset.pagetype,
  template: document.documentElement.dataset.template,

  // good for market branches
  getSecondLevelDomain() {
    return "kansascity";
  },

  // generic pageInfo getter
  getConfig(key) {
    switch(key) {
      case "enableConnatixZone":
        // do something
        break;
      default: 
        return undefined;
    }
  },

  // user info
  user: {
    isSubscriber() {
      return false;
    },

    isLoggedIn() {
      return false;
    },
  },

  // utility for timing
  executeWhenDOMReady(callback, state = document.readyState) {
    if (callback && typeof callback === 'function') {
      switch (state) {
        case 'loading':
          document.addEventListener('DOMContentLoaded', callback);
          break;
        default:
          callback();
      }
    }
  },
}

export default locker;
