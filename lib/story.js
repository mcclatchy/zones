/*
 * Story template
 */

import * as zones from "./zones.js";

/**
 * Cleanup that needs to move to WPS
 */

export function cleanup() {
  const combos = document.querySelectorAll(".story-body > .zone.combo");
  zones.forEach(zone => zone.classList.remove("cap-width"));
  combos.forEach(ele => ele.remove());

  const related = document.querySelectorAll(".related-stories");
  related.forEach(ele => ele.parentElement.classList.remove("zone", "grid"));
}
