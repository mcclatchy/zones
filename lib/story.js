/*
 * Story template
 */

import * as zones from "./zones.js";

export async function render(locker) {
  // Locker configs
  const subscriber = locker.user.isSubscriber();
  const market = locker.getConfig("marketInfo.domain");
  const taxonomy = locker.getConfig("marketInfo.taxonomy");

  // Page elements
  const wps = document.querySelectorAll(".story-body [id^=zone-el]");
  const combos = document.querySelectorAll(".story-body > .zone.combo");

  // Connatix goes to everyone
  zones.get("zone-el-101");

  // Featured carousel for subs
  if(subscriber) {
    // Carousel for miamiherald/News
    if(market == "miamiherald" && taxonomy.includes("News")) {
      let carousel = new zones.Zone("zone-featured-carousel");
      carousel.dataset.taxonomy = taxonomy;
      carousel.dataset.market = market;
      carousel.zephr("zone-featured-carousel", market);
    }
  }

  // Generate a zone for everything else in the story body
  wps.forEach(ele => new zones.Zone(ele.id));

  // Temp fix for combo zones until WPS can be updated
  zones.forEach(zone => {
    zone.classList.remove("cap-width");
  });

  // Leave these zones alone
  zones.ignore("zone-el-16");

  // Remove the combo zone containers
  combos.forEach(ele => ele.remove());

  // Redistribute zones generically
  if(subscriber) {
    zones.distribute(5);
  } else {
    zones.distribute(3);
  }

  zones.render();
}
