/*
 * Zones extension (Yozons)
 */

import * as zones from "./lib/zones.js";
import * as config from "./lib/config.js";
import * as story from "./lib/story.js";

function distributeZones(locker) {
  // Setup
  zones.setLocker(locker);

  // Add the communication bridge 
  locker.getYozonsLocker("zones").changes = zones.changes;

  // Give the performance team a promise
  return new Promise((resolve, reject) => {
    locker.executeWhenDOMReady(() => {
      switch(locker.pageType) {
        case "story":
          // story.render(locker);
          const subscriber = locker.user.isSubscriber();

          config.load("/config/story.json").then(() => {
            const cadence = subscriber ? 4 : 3;
            zones.distribute(cadence);
            zones.render();
          });

          story.cleanup();
          break;
        case "homepage":
          config.load("/config/homepage.json").then(zones.render);
          break;
        case "sectfront":
          config.load("/config/section.json").then(zones.render);
          break;
        default:
          reject("not a matching page type");
      }

      resolve("zones-loaded")
    });
  });
}

export default distributeZones;
