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
      case "marketInfo.domain":
        return "miamiherald";
      case "marketInfo.taxonomy":
        return "News/Local//";
      case "zone.carousel":
        return true;
      default: 
        return undefined;
    }
  },

  // user info
  user: {
    isSubscriber() {
      return true;
    },

    isLoggedIn() {
      return false;
    },

    isInDMA() {
      return Promise.resolve(true);
    }
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

  // mimic locker functionality
  getYozonsLocker(val) {
    window.mi = window.mi || {};

    switch(val) {
      case "zones":
        window.mi.zones = window.mi.zones || {};
        return window.mi.zones;
      default:
        // nothing
    }
  },

  areAdsAllowed() {
    return true;
  }
}

export default locker;
