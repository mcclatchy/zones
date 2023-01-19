/*
 * Story template
 */

import * as zones from "./zones.js";

export function render(locker) {
  const subscriber = locker.user.isSubscriber();
  const wps = document.querySelectorAll(".story-body [id^=zone-el]");
  const combos = document.querySelectorAll(".story-body > .zone.combo");

  /*
   * Subscribers
   */

  if(subscriber) {
    // Generate a zone for everything there
    wps.forEach(ele => new zones.Zone(ele.id))

    // Need a quick fix for OpenWeb until SDS 1.16.6 is live
    zones.get("zone-el-16").classList.remove("zone");

    // Ignore these zones
    zones.ignore("zone-el-16");

    // Delete these zones
    // zones.remove("zone-el-102");
    // zones.remove("zone-el-104");

    // Remove the combo zone containers
    combos.forEach(ele => ele.remove());

    // Redistribute zones generically
    zones.distribute(4, 5);
  }

  zones.render()
}
