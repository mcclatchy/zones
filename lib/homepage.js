/*
 * Homepage template
 *
 * Note: 
 * The DOM has not been updated to the grid yet, so this is 
 * a manual set up for now.
 */

import * as zones from "./zones.js";

export function render(locker) {
  // Locker configs
  const market = locker.getConfig("marketInfo.domain");

  // Community Events (iPublish)
  const ipublish = zones.get("zone-community-events");
  ipublish.dataset.market = market;
  ipublish.zephr("zone-community-events", market)
  ipublish.vip = document.querySelector("#latest-news");
  ipublish.inject("beforeend");
}
