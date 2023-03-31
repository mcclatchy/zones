/*
 * Homepage template
 *
 * Note: 
 * The DOM has not been updated to the grid yet, so this is 
 * a manual set up for now.
 */

import * as zones from "./zones.js";

export function render(locker) {
  // Community Events (iPublish)
  let ipublish = zones.get("zone-community-events");
  ipublish.vip = document.querySelector("#latest-news");
  ipublish.inject("beforeend");
}
