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

  /*
   * Subscribers
   */

  if(subscriber) {
    // Make sure to serve the top ad always
    zones.get("zone-el-101");

    // Carousel for miamiherald/News
    if(market == "miamiherald") {
      let carousel = new zones.Zone("zone-featured-carousel");
      carousel.dataset.taxonomy = taxonomy;
      carousel.dataset.market = market;
      carousel.zephr("zone-featured-carousel", market);
    }

    // Generate a zone for everything remaining
    wps.forEach(ele => new zones.Zone(ele.id));

    // Temp fix for OpenWeb until SDS 1.16.6 is live
    zones.get("zone-el-16").classList.remove("zone");

    // Temp fix for combo zones until WPS can be updated
    zones.forEach(zone => {
      zone.classList.remove("cap-width");
    });

    // Ignore these zones
    zones.ignore("zone-el-16");

    // Remove the combo zone containers
    combos.forEach(ele => ele.remove());

    // Redistribute zones generically
    zones.distribute(5);
  }

  zones.render()
}
