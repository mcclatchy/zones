/*
 * Story template
 */

import * as zones from "./zones.js";

export async function render(locker) {
  // Configs
  const config = await zones.loadConfig("/config/story.json");
  const subscriber = locker.user.isSubscriber();
  const dma = await locker.user.isInDMA();

  // VIP distribution cadence
  let cadence = 3;
  if(subscriber) { cadence = 4; }

  // Incorporate WPS story zones
  const base = document.querySelectorAll(config.base);
  base.forEach(ele => new zones.Zone(ele.id));

  // Ignore these zones
  zones.ignore(...config.ignore);

  // Custom zones
  config.zones.forEach(c => {
    const show = c.filters.every(f => {
      switch(f.type) {
        case "subscriber":
          return subscriber === f.value;
        case "dma":
          return dma === f.value;
        case "config":
          let prop = locker.getConfig(f.name);

          if(typeof f.value == "boolean") {
            return prop === f.value;
          } else {
            let r = new RegExp(f.value);
            return r.test(prop);
          }
      }
    });

    if(show) {
      let zone = new zones.Zone(c.id);

      // Zephr connection
      if(c.zephr) {
        c.zephr.dataset.forEach(d => {
          if(d.config) {
            zone.dataset[d.name] = locker.getConfig(d.config)
          } else {
            zone.dataset[d.name] = d.value;
          }
        });

        zone.zephr(c.zephr.feature);
      }

      // Placement
      switch(c.placement.type) {
        case "before":
          zone.before(c.placement.value);
          break;
        case "after":
          zone.after(c.placement.value);
          break;
      }
    }
  });

  // Cleanup that needs to move to WPS
  const combos = document.querySelectorAll(".story-body > .zone.combo");
  zones.forEach(zone => zone.classList.remove("cap-width"));
  combos.forEach(ele => ele.remove());

  const related = document.querySelectorAll(".related-stories");
  related.forEach(ele => ele.parentElement.classList.remove("zone", "grid"));

  // Distribute and render
  zones.distribute(subscriber ? 4 : 3);
  zones.render()
}
