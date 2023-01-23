/*
 * Zones extension (Yozons)
 */

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

      // Set up the communication bridge
      window.addEventListener("load", () => {
        console.log(window.mi.zones);
      });
    });
  });
}

export default distributeZones;
