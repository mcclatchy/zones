/*
 * Zones extension (Yozons)
 */

import * as zones from "./lib/zones.js";
import * as config from "./lib/config.js";
import * as story from "./lib/story.js";

function distributeZones(locker) {
  // Setup
  zones.setLocker(locker);

  // Configs 
  if(!locker.config) {
    locker.config = {
      homepage: "/static/hi/zones/homepage.json",
      section: "/static/hi/zones/section.json",
      story: "/static/hi/zones/story.json"
    }
  }

  // Add the communication bridge 
  locker.getYozonsLocker("zones").changes = zones.changes;

  // Give the performance team a promise
  return new Promise((resolve, reject) => {
    locker.executeWhenDOMReady(async () => {
      switch(locker.pageType) {
        case "story":
          await config.load(locker.config.story);

          // Set cadence for subsriber vs. nonsubscriber - testing different cadence for two markets
          const subscriber = locker.user.isSubscriber();
          const domainName = locker.getConfig('domainName');
          const allowedDomains = ["https://www.bnd.com/", "https://www.myrtlebeachonline.com/"];
          const cadence = allowedDomains.includes(domainName) ? (subscriber ? 4 : 2) : (subscriber ? 4 : 3);

          zones.distribute(cadence);

          // Temporary cleanup
          story.cleanup();
          break;
        case "homepage":
          await config.load(locker.config.homepage);
          break;
        case "sectfront":
          await config.load(locker.config.section);
          break;
        default:
          reject("not a matching page type");
      }

      zones.render();
      resolve("zones-loaded")
    });
  });
}


console.log(locker);

export default distributeZones;
