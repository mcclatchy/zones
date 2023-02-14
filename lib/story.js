/*
 * Story template
 */

import * as zones from "./zones.js";

export async function render(locker) {
  // If ads are disabled bail
  if(!locker.areAdsAllowed()) {
    zones.log("none", "ads are disabled for this page");
    return;
  }

  // Locker configs
  const subscriber = locker.user.isSubscriber();
  const market = locker.getConfig("marketInfo.domain");
  const taxonomy = locker.getConfig("marketInfo.taxonomy");

  // Page elements
  const wps = document.querySelectorAll(".story-body [id^=zone-el]");
  const combos = document.querySelectorAll(".story-body > .zone.combo");

  // Test filters
  const nonSubTest = ["kansas", "kentucky"].includes(market);

  /*
   * Early test for non-subs in two markets
   */

  if(subscriber || nonSubTest) {
    // Generate a zone for everything remaining
    wps.forEach(ele => zones.get(ele.id));

    // Temp fix for combo zones until WPS can be updated
    zones.forEach(zone => zone.classList.remove("cap-width"));

    // Ignore these zones
    zones.ignore("zone-el-16");

    // Remove the combo zone containers
    combos.forEach(ele => ele.remove());

    /*
     * Sub additional zones
     */

    if(subscriber) {
      // Featured carousels
      if(locker.getConfig("zone.carousel")) {
        let carousel = new zones.Zone("zone-featured-carousel");
        carousel.dataset.taxonomy = taxonomy;
        carousel.dataset.market = market;
        carousel.zephr("zone-featured-carousel", market);
        carousel.after("zone-el-101");
      }

      zones.distribute(4);
    } else {
      zones.distribute(3);
    }
  }

  zones.render()
}
