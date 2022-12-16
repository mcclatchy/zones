/*
 * Zones extension (Yozons)
 */

import section from "./lib/section.js";
import * as zones from "./lib/zones.js";

function distributeZones(locker) {
  return new Promise((resolve, reject) => {
    let pt = locker.getPageType();
    let map = null;

    switch(pt) {
      case "sectfront":
        map = section(locker);
        break;
      default:
        // do nothing
    }

    if(map) {
      locker.executeWhenDOMReady(() => {
        zones.renderMap(map)
        resolve("zones-loaded");
      });
    } else {
      reject("zone map is empty");
    }
  })
}

export default distributeZones;
