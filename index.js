/*
 * Zones extension (Yozons)
 */

import * as zones from "./lib/zones.js";
import * as section from "./lib/section.js";
import * as story from "./lib/story.js";

function distributeZones(locker) {
  return new Promise((resolve, reject) => {
    locker.executeWhenDOMReady(() => {
      switch(locker.pageType) {
        case "sectfront":
          section.render(locker);
          break;
        case "story":
          story.render(locker);
          break;
        default:
          reject("not a matching page type");
      }

      resolve("zones-loaded")
    });

    // Add the communication bridge and vip method to the zones API
    locker.getYozonsLocker("zones").changes = zones.changes;
    locker.getYozonsLocker("zones").getValidInsertionPoints = zones.getValidInsertionPoints;
  });
}

export default distributeZones;
