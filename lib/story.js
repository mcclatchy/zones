/*
 * Zones map file
 */

import * as zones from "./zones.js";

export default function(locker) {
  const map = new Map();
  const subscriber = locker.user.isSubscriber();
  const wps = document.querySelectorAll(".story-body [id^=zone-el]");
  const combos = document.querySelectorAll(".story-body > .zone.combo");

  /*
   * Subscribers
   */

  if(subscriber) {
    // Fill the map with all zones
    wps.forEach(ele => {
      let zone = new zones.Zone(ele.id)

      map.set(ele.id, {
        zone: zone
      });
    });

    // Leave these zones alone
    map.delete("zone-el-16");
    map.delete("zone-el-102");
    map.delete("zone-el-104");

    // Remove the combo zone containers and marketing zones (102, 104)
    combos.forEach(ele => ele.remove());

    // Redristrbute zones generically
    zones.distribute(map, 4, 5);
  }

  return map;
}
