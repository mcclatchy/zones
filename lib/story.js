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

  // VIP distribution cadence
  let cadence = 3;

  // Locker configs
  const subscriber = locker.user.isSubscriber();
  const market = locker.getConfig("marketInfo.domain");
  const taxonomy = locker.getConfig("marketInfo.taxonomy");

  // Page elements
  const wps = document.querySelectorAll(".story-body [id^=zone-el]");
  const combos = document.querySelectorAll(".story-body > .zone.combo");

  // Generate a zone for everything coming from WPS
  wps.forEach(ele => zones.get(ele.id));

  // Ignore these zones
  zones.ignore("zone-el-16");

  // Cleanup that needs to move to WPS
  zones.forEach(zone => zone.classList.remove("cap-width"));
  combos.forEach(ele => ele.remove());

  const related = document.querySelectorAll(".related-stories");
  related.forEach(ele => ele.parentElement.classList.remove("zone"));

  /*
   * Subscriber changes
   */

  if(subscriber) {
    // Adjust the cadence
    cadence = 4;
    
    // Featured carousels
    if(locker.getConfig("zone.carousel")) {
      let carousel = new zones.Zone("zone-featured-carousel");
      carousel.dataset.taxonomy = taxonomy;
      carousel.dataset.market = market;
      carousel.zephr("zone-featured-carousel", market);
      carousel.after("zone-el-101");
    }
  }

  zones.distribute(cadence);
  zones.render()
}
