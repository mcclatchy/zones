/*
 * Zones map file
 */

const cards = [...document.querySelectorAll(".grid > .card")];

export default function(locker) {
  const map = new Map();

  // Moving zone 9 up for non-subs as a test
  if(!locker.isSubscriber()) {
    map.set("zone-el-9", cards[14]);
  }

  return map;
}
