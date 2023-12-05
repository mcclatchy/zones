/*
 * Zones extension (Yozons)
 */

import * as zones from "./lib/zones.js";
import * as config from "./lib/config.js";
import * as story from "./lib/story.js";

async function distributeZones(locker) {
  const subscriber = locker.user.isSubscriber();

  // Setup
  zones.setLocker(locker);
  zones.setConfig("subscriber", subscriber);
  zones.setConfig("dma", subscriber ? true : await locker.user.isInDMA());

  // Config files 
  if(!locker.config) {
    locker.config = {
      homepage: "/static/hi/zones/homepage.json",
      sectfront: "/static/hi/zones/section.json",
      story: "/static/hi/zones/story.json"
    }
  }

  // Add the communication bridge 
  window.mi = window.mi || {};
  window.mi.zones = window.mi.zones || {};
  window.mi.zones = Object.assign(window.mi.zones, zones.getPublicAPI());

  // Give the performance team a promise
  return new Promise((resolve, reject) => {
    locker.executeWhenDOMReady(async () => {
      // Config keys match pageType coming from Yozons
      const match = locker.config[locker.pageType];

      // Load config file
      if(match) {
        try {
          await config.load(match);
        } catch(e) {
          reject(e);
        }
      } else {
        reject("zones: not a matching page type");
      }

      // Temporary cleanup
      if(locker.pageType == "story") {
        story.cleanup();
      }

      // Render and resolve
      zones.render();
      resolve("zones-loaded")
    });
  });
}

export default distributeZones;
