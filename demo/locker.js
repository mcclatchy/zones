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
      case "domainName":
        return "www.charlotteobserver.com";
      case "articleCredit":
        return "The Kansas City Star";
      case "marketInfo.domain":
        return "miamiherald";
      case "marketInfo.taxonomy":
        return "News/Sports//";
      case "zone.carousel":
        return true;
      case "zone.zeeto":
        return true;
      case "zone.moneycom":
        return false;
      case "zone.communityEvents":
        return true;
      case "zone.taboolaRecommendations":
        return true;
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
      case "analytics":
        return {
          addEventToQueue: function(obj) {
            console.log("adding event:", obj);
          }
        }
      default:
        // nothing
    }
  },

  areAdsAllowed() {
    return true;
  },

  // Demo only for now
  config: {
    homepage: "/config/homepage.json",
    section: "/config/section.json",
    story: "/config/story.json"
  }
}

export default locker;
