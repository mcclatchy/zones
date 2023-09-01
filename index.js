/*
 * Zones extension (Yozons)
 */

import * as zones from "./lib/zones.js";
import * as config from "./lib/config.js";
import * as story from "./lib/story.js";

function distributeZones(locker) {
  // Setup
  zones.setLocker(locker);

  // Config files 
  if(!locker.config) {
    locker.config = {
      homepage: "/static/hi/zones/homepage.json",
      sectfront: "/static/hi/zones/section.json",
      story: "/static/hi/zones/story.json"
    }
  }

  // Add the communication bridge 
  locker.getYozonsLocker("zones").changes = zones.changes;

  // Give the performance team a promise
  return new Promise((resolve, reject) => {
    locker.executeWhenDOMReady(async () => {
      // Config keys match pageType coming from Yozons
      const file = locker.config[locker.pageType];

      // Load config file
      if(file) {
        await config.load(file);
      } else {
        reject("not a matching page type");
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
