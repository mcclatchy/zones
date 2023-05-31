/*
 * Zones extension (Yozons)
 */

import * as zones from "./lib/zones.js";
import * as section from "./lib/section.js";
import * as story from "./lib/story.js";
import * as homepage from "./lib/homepage.js";

function distributeZones(locker) {
  // Setup
  zones.setLocker(locker);

  // Add the communication bridge 
  locker.getYozonsLocker("zones").changes = zones.changes;

  // Bail if ads are disabled
  if(!locker.areAdsAllowed()) {
    zones.log("none", "ads are disabled");
    return;
  }

  // Give the performance team a promise
  return new Promise((resolve, reject) => {
    locker.executeWhenDOMReady(() => {
      switch(locker.pageType) {
        case "sectfront":
          section.render(locker);
          break;
        case "story":
          story.render(locker);
          break;
        case "homepage":
          homepage.render(locker);
          break;
        default:
          reject("not a matching page type");
      }

      resolve("zones-loaded")
    });
  });
}

export default distributeZones;
