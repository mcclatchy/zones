/*
 * Proposed ads API
 */

export function createAdTag(targeting) {
  let tag = document.createElement("div");

  tag.classList.add("ad");
  tag.setAttribute("targeting", JSON.stringify(targeting));

  return tag;
}
