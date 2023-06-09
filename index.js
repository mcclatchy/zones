/*
 * Zones extension (Yozons)
 */

import * as zones from "./lib/zones.js";
import * as config from "./lib/config.js";
import * as story from "./lib/story.js";

function distributeZones(locker) {
  const zl = locker.getYozonsLocker("zones");

  // Setup
  zones.setLocker(locker);

  // Configs 
  if(!zl.config) {
    zl.config = {
      homepage: "/static/hi/zones/homepage.json",
      section: "/static/hi/zones/section.json",
      story: "/static/hi/zones/story.json"
    }
  }

  // Add the communication bridge 
  zl.changes = zones.changes;

  // Give the performance team a promise
  return new Promise((resolve, reject) => {
    locker.executeWhenDOMReady(async () => {
      switch(locker.pageType) {
        case "story":
          await config.load(zl.config.story);

          // Change the cadence
          const subscriber = locker.user.isSubscriber();
          const cadence = subscriber ? 4 : 3;
          zones.distribute(cadence);

          // Temporary cleanup
          story.cleanup();
          break;
        case "homepage":
          await config.load(zl.config.homepage);
          break;
        case "sectfront":
          await config.load(zl.config.section);
          break;
        default:
          reject("not a matching page type");
      }

      zones.render();
      resolve("zones-loaded")
    });
  });
}

export default distributeZones;
