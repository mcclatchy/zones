/*
 * Zones extension (Yozons)
 */

import * as zones from "./lib/zones.js";
import section from "./lib/section.js";
import story from "./lib/story.js";

function distributeZones(locker) {
  return new Promise((resolve, reject) => {
    let map = null;

    switch(locker.pageType) {
      case "sectfront":
        map = section(locker);
        break;
      case "story":
        map = story(locker);
        break;
      default:
        // do nothing
    }

    if(map) {
      locker.executeWhenDOMReady(() => {
        zones.renderMap(map);
        resolve("zones-loaded");
      });
    } else {
      reject("zone map is empty");
    }
  });
}

export default distributeZones;
