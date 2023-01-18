/*
 * Zone
 * This class handles individual zone elements
 */

// Set up the communication layer
window.mi = window.mi || {};
window.mi.zones = window.mi.zones || {}
window.mi.zones.changes = new Map();

// Constants for determining zones and vips
const map = new Map();
const fragment = new DocumentFragment();

// Zone class
export class Zone {

  /*
   * Zone constructor
   */

  constructor(id, vip = null) {
    // Set up the element and vip
    this.element = null;
    this.vip = vip;

    // Set the id if not empty
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

    // Add this zone to the map
    map.set(val, this);
  }

  /*
   * Getter to manipulate classes of the zone element
   */

  get classList() {
    return this.element.classList;
  }

  /*
   * Setter to change zone type
   */

  set type(val) {
    switch(val) {
      case "editorial":
        this.log("zone changed to editorial");
        break;
    }
  }

  /*
   * Injects a zone
   * @param ele {element} the injection point
   * @param loc {string} the placement relative to the injection point
   * @returns {Promise} a promise object
   */

  inject(loc = "beforebegin") {
    let err = undefined;
    
    // Error checks
    if(!this.element) {
      err = "null zone element";
    }

    if(this.vip === null) {
      err = "zone disabled";
    }

    if(this.vip === undefined) {
      err = "no valid insertion point";
    }

    if(err) {
      this.remove();
      this.log(err);
    } else {
      this.element.dataset.distributed = true;
      this.vip.insertAdjacentElement(loc, this.element);
      this.log("zone moved into new location");
    }
  }

  /*
   * Removes a zone
   */

  remove() {
    remove(this.id);
  }

  /*
   * Log a change to the zones object
   * @param msg {string} the message for the log
   */

  log(msg) {
    log(this.id, msg);
  }
}

/*
 * Gets a zone
 * @param id {string} the id for the zone
 */

export function get(id) {
  return map.get(id) || new Zone(id)
}

/*
 * Ignores a zone in the map
 * @param id {string} the id for the zone
 */

export function ignore(id) {
  map.delete(id);
}

/*
 * Deletes a zone
 * @param id {string} the id for the zone
 */

export function remove(id) {
  let entry = map.get(id);

  if(entry) {
    fragment.append(entry.element);
    log(id, "zone removed");
  }

  map.delete(id);
}

/*
 * Logs a message for other teams
 * @param id {string} the id of the zone
 * @param msg {string} the log message
 */

export function log(id, msg) {
  window.mi.zones.changes.set(id, msg);
}

/*
 * Identifies valid insertion points for zones in story bodies
 * @returns {array} all valid paragraph elements
 */

export function getValidInsertionPoints() {
  const df = new DocumentFragment();
  const story = document.querySelector(".story-body");
  const grafs = [...story.querySelectorAll(":scope > p")];

  // Make a copy of the story nodes
  df.append(story.cloneNode(true));

  // Clean zones out of the copy
  df.querySelectorAll("[id^=zone-el]").forEach(ele => ele.remove());

  // Make a boolean map for each paragraph
  const clones = [...df.querySelectorAll(".story-body > p")];
  const map = clones.map((p, i) => { 
    let prev = p.previousElementSibling;

    if(i == 0) return false;
    if(p.textContent.length < 100) return false;
    if(prev && prev.nodeName != "P") return false;
    if(prev && prev.textContent.length < 100) return false;

    return true;
  });

  // Return a filtered array of the real ones
  return grafs.filter((p, i) => {
    return map[i] === true;
  });
}

/*
 * Distributes zones generically using vips
 * @param map {Map} the map to alter
 * @param start {integer} the first position
 * @param tick {integer} the cadence
 */

export function distribute(start = 3, tick = 4) {
  const vips = getValidInsertionPoints();

  map.forEach(zone => {
    zone.vip = vips[start];
    start += tick;
  });
}

/*
 * Renders a zone map
 * @param map {Map} an iterable object
 */

export function render() {
  map.forEach(zone => zone.inject());
  window.dispatchEvent(new Event("zones-loaded"));
}
