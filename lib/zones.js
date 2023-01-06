/*
 * Zone
 * This class handles individual zone elements
 */

const fragment = new DocumentFragment();

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
    let zone = document.getElementById(val) || fragment.getElementById(val);

    if(!zone) {
      zone = document.createElement("div");
      zone.id = val;
    }

    zone.classList.add("zone");
    this.element = zone;
  }

  /*
   * Injects a zone
   * @param ele {element} the injection point
   * @param loc {string} the placement relative to the injection point
   * @returns {Promise} a promise object
   */

  inject(vip, loc = "beforebegin") {
    return new Promise((resolve, reject) => {
      // Error checks
      if(!this.element) {
        reject("null zone element");
      }

      if(vip === null) {
        reject(`zone disabled: ${this.id}`);
      }

      if(vip === undefined) {
        reject(`invalid zone injection point: ${this.id}`);
      }

      this.element.dataset.distributed = true;
      vip.insertAdjacentElement(loc, this.element);
      resolve(this.element);
    });
  }

  /*
   * Removes a zone
   */

  remove() {
    fragment.append(this.element);
  }
}

/*
 * Renders a zone map
 * @param map {Map} an iterable object
 */

export function renderMap(map) {
  for(let [k,v] of map) {
    const zone = v && v.zone || new Zone(k);
    const vip = v instanceof Element ? v : v && v.vip;

    zone.inject(vip)
      .catch(e => {
        console.info(e);
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
  const grafs = [...document.querySelectorAll(".story-body > p")];

  const filtered = grafs.filter((p, i) => {
    let prev = p.previousElementSibling;

    if(i == 0) {
      return false;
    }

    if(p.textContent.length < 100) {
      return false;
    }

    if(prev && prev.nodeName != "P") {
      return false;
    }

    if(prev && prev.textContent.length < 100) {
      return false;
    }

    return true;
  });

  return filtered;
}

/*
 * Distributes zones generically using vips
 * @param map {Map) the map to alter
 * @param start {integer} the first position
 * @param tick {integer} the cadence
 */

export function distribute(map, start = 3, tick = 4) {
  const vips = getValidInsertionPoints();

  // Temporary communication tool
  vips.forEach((ele, i) => ele.dataset.vip = i);

  map.forEach((val, id) => {
    val.vip = vips[start];
    map.set(id, val);
    start += tick;
  });
}
