/*
 * Section template
 */

import * as zones from "./zones.js";

export function render() {
  const locker = zones.locker;
  const subscriber = locker.user.isSubscriber();
  const cards = [...document.querySelectorAll(".grid > .card")];

  // Moving zone 9 up for non-subs as a test
  if(!subscriber) {
    zones.get("zone-el-9").vip = cards[14];
  }

  zones.render();
}
