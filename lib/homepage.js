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
  if(locker.getConfig("zone.communityEvents")) {
    const ipublish = zones.get("zone-community-events");
    ipublish.style.padding = 0;
    ipublish.dataset.market = market;
    ipublish.zephr("zone-community-events", market)
    ipublish.vip = document.querySelector("#zone-el-5");
    ipublish.inject();
  }
}
