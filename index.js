/*
 * Zones extension (Yozons)
 */

import * as zones from "./lib/zones.js";
import * as section from "./lib/section.js";
import * as story from "./lib/story.js";
import * as homepage from "./lib/homepage.js";

function distributeZones(locker) {
  // Set the locker for future use
  Object.assign(zones.locker, locker);

  // Add the communication bridge 
  locker.getYozonsLocker("zones").changes = zones.changes;

  // Give the performance team a promise
  return new Promise((resolve, reject) => {
    locker.executeWhenDOMReady(() => {
      switch(locker.pageType) {
        case "sectfront":
          section.render();
          break;
        case "story":
          story.render();
          break;
        case "homepage":
          homepage.render();
          break;
        default:
          reject("not a matching page type");
      }

      resolve("zones-loaded")
    });
  });
}

export default distributeZones;
