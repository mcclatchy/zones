/*
 * This is a fake Yozons locker for development
 */

import * as ads from "./ads.js";

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
      case "articleCredit":
        return "The Kansas City Star";
      case "domainName":
        return "www.kansascity.com";
      case "marketInfo.domain":
        return "miamiherald";
      case "marketInfo.taxonomy":
        return "News/Sports//";
      case "zone.communityEvents":
        return false;
      case "zone.editorPicks":
        return false;
      case "zone-events-calendar":
        return false;
      case "zone.gamecocksNav":
        return false;
      case "zone.lexgoEatSponsor":
        return true;
      case "zone.localNewsDigest":
        return true;
      case "zone.siTickets":
        return false;
      case "zone.sponsoredArticle":
        return true;
      case "zone.taboolaRecommendations":
        return false;
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

  areAdsAllowed() {
    return true;
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
  getYozonsLocker(key) {
    window.mi = window.mi || {};

    switch(key) {
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

  // API functionality (proposed)
  getAPI(key) {
    switch(key) {
      case "ads":
        return ads;
    }
  },

  // Demo only for now
  config: {
    homepage: "/config/homepage.json",
    sectfront: "/config/section.json",
    story: "/config/story.json"
  }
}

export default locker;
