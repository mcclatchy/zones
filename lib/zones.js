/*
 * Zone
 * This class handles individual zone elements
 */

export class Zone {

  /*
   * Zone constructor
   */

  constructor(id) {
    // Set up the element
    this.element = null;

    // Set the id if passed in
    if(id) {
      this.id = id;
    }
  }

  /*
   * Setter to copy/create the zone element
   */

  get id() {
    return this.element.id;
  }

  set id(val) {
    let zone = document.querySelector(`#${val}`)

    if(!zone) {
      zone = document.createElement("div");
      zone.id = val || '';
    }

    // Not all zones are properly classed in WPS
    zone.classList.add("zone");
    zone.dataset.distributed = true;

    this.element = zone;
  }

  /*
   * Injects a zone
   * @param ele {element} the injection point
   * @param loc {string} the placement relative to the injection point
   * @returns {Promise} a promise object
   */

  inject(ele, loc = "before") {
    return new Promise((resolve, reject) => {
      // Error checks
      if(!this.element) {
        reject("null zone element");
      }

      if(!ele) {
        reject(`invalid zone injection point: ${this.id}`);
      }

      ele.insertAdjacentElement("beforebegin", this.element);
      resolve(this.element);
    });
  }

  /*
   * Removes a zone
   */

  remove() {
    this.element.remove();
  }
}

/*
 * Renders a zone map
 * @param map {Map} an iterable object
 */

export function renderMap(map) {
  for(let [key, element] of map) {
    let zone = new Zone(key);
    zone.inject(element)
      .catch(e => {
        console.warn(e);
        zone.remove();
      });
  }

  const e = new Event("zones-loaded");
  window.dispatchEvent(e);
}

/*
 * Identifies valid insertion points for zones in story bodies
 * @returns {array} all valid paragraph elements
 */

export function getValidInsertionPoints() {
  let grafs = [...document.querySelectorAll(".story-body > p")];

  return grafs.filter((p, i) => {
    let prev = p.previousElementSibling;

    if(i == 0) {
      return false;
    }

    if(p.textContent.length < 100) {
      return false;
    }

    if(prev?.nodeName != "P" || prev?.textContent.length < 100) {
      return false;
    }

    return true;
  });
}
