/*
 * Zones
 */

let locker, cadence;
let map = new Map();

const configs = new Map();
const backup = new DocumentFragment();
const io = new IntersectionObserver(handleIntersection, { rootMargin: "500px" });
const to = new IntersectionObserver(handleTracking, { threshold: 0.25 });

// Changes map
export const changes = new Map();

/*
 * Zone class
 */

export class Zone {
  /*
   * Zone constructor
   */

  constructor(id, vip = null) {
    if(!id) {
      throw new Error("zone id is required");
    }

    this.id = id;
    this.vip = vip;
    this.hopper = new Map();
  }

  /*
   * Getter/Setter to copy/create the zone element
   */

  get id() {
    return this.element.id;
  }

  set id(val) {
    let ele = document.getElementById(val) || backup.getElementById(val);

    if(!ele) {
      ele = document.createElement("div");
      ele.id = val;
    }

    // Connect the element
    this.element = ele;

    // Add this zone to the map
    map.set(val, this);

    // Add the zone class for SDS (deprecated)
    this.classList.add("zone");
  }

  /*
   * Getter/Setter for tracking
   */

  get tracking() {
    return this.element.dataset.tracking;
  }

  set tracking(val) {
    this.element.dataset.tracking = val;
  }

  /*
   * Appends dom/string to the element
   * @param payload {element|string} the element or string to inject
   */

  append(payload) {
    if(payload instanceof HTMLElement) {
      this.element.append(payload);
    } else {
      let range = document.createRange().createContextualFragment(payload);
      this.element.append(range)
    }
  }

  /**
   * Getter/Setter for the type
   */

  get type() {
    return this.dataset.type;
  }

  set type(val) {
    this.dataset.type = val;
  }

  /*
   * Getters for element attributes
   */

  get classList() {
    return this.element.classList;
  }

  get dataset() {
    return this.element.dataset;
  }

  get style() {
    return this.element.style;
  }

  /*
   * Zephr feature functionality
   * @param feature {string} the feature slug in Zephr
   */

  async zephr(feature) {
    const market = locker.getConfig("marketInfo.domain");
    const endpoint = `https://mcclatchy-${market}.cdn.zephr.com/zephr/decision-engine`;
    const body = JSON.stringify({ "sdkFeatureSlug": feature, ...this.dataset });

    const req = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: body
    });

    const response = await req.json();
    const payload = response.outputValue;
    
    if(payload) {
      this.append(payload);
    } else {
      this.log("Zephr paylod was empty");
    }
  }

  /*
   * CUE content item functionality
   * @param id {string} the content id in CUE
   */

  async cue(id) {
    const domain = locker.getConfig("domainName");
    const endpoint = `https://${domain}/webapi-public/v2/content/${id}`

    const req = await fetch(endpoint);
    const response = await req.json();
    const payload = response.content;

    if(payload) {
      this.append(payload);
    } else {
      this.log("CUE payload was empty");
    }
  }

  /*
   * Ad functionality
   * @param targeting {object} the targeting string for the ad
   */

  async ad(targeting) {
    const defaults = {
      atf: "n",
      pkg: "a"
    }
    
    const payload = {...defaults, ...targeting};
    const ads = locker.getAPI("ads");
    const tag = ads.createAdTag(payload);

    this.append(tag);
  }

  /*
   * Injects this zone
   * @param position {string} the placement relative to the injection point
   * @param vip {element} the insertion point for the zone
   */

  inject(position = this.position, vip = this.vip) {
    let err = false;
    
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
      // Insert the element
      vip.insertAdjacentElement(position || "beforebegin", this.element);

      // Messaging
      this.dataset.distributed = true;
      this.log(this.msg || "zone created");

      // Observer for performance team
      io.observe(this.element);

      // Tracking observer
      if(this.tracking) {
        to.observe(this.element);
      }
    }
  }

  /*
   * Removes this zone
   */

  remove() {
    remove(this.id);
  }

  /*
   * Insert this zone before another (story pages)
   * @param referenceId {string} the id of the reference zone
   */

  before(referenceId) {
    let keys = Array.from(map.keys());
    let index = keys.indexOf(referenceId);

    if(index > -1) {
      insert(index, this.id);
    } else {
      this.remove();
    }

    this.msg = `placed before ${referenceId}`;
  }

  /*
   * Insert this zone after another (story pages)
   * @param referenceId {string} the id of the reference zone
   */

  after(referenceId) {
    let keys = Array.from(map.keys());
    let index = keys.indexOf(referenceId);

    if(index > -1) {
      insert(index + 1, this.id);
    } else {
      this.remove();
    }

    this.msg = `placed after ${referenceId}`;
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
 * Exports the public API limited set
 */

export function getPublicAPI() {
  return { changes };
}

/*
 * Gets the locker for external use
 * @returns {object} the locker
 */

export function getLocker() {
  return locker;
}

/*
 * Sets the locker for internal use
 * @param locker {object} the locker from Yozons
 */

export function setLocker(obj) {
  locker = obj;
}

/*
 * Gets a config stored locally
 * @returns {(boolean|string)} the value of the stored config
 */

export function getConfig(key) {
  if(configs.has(key)) {
    return configs.get(key);
  } else {
    const val = locker.getConfig(key);
    configs.set(key, val);
    return val;
  }
}

/*
 * Stores a config locally
 * @param key {string} the key for the config
 * @apram value {(boolean|string)} the value for the config
 */

export function setConfig(key, value) {
  configs.set(key, value);
}

/*
 * Checks to see if on a story page
 * @returns {boolean}
 */

export function isStoryPage() {
  return locker.pageType == "story";
}

/* 
 * Gets the cadence for story pages
 * @returns {integer} the cadence
 */

export function getCadence() {
  return parseInt(cadence) || 3;
}

/*
 * Sets the cadence
 * @param int {integer} the number to set
 */

export function setCadence(int) {
  cadence = parseInt(int);
}

/*
 * Gets a zone
 * @param id {string} the id for the zone
 * @returns {object} a zone
 */

export function get(id) {
  return map.get(id) || new Zone(id)
}

/*
 * Ignores a zone in the map and cleans up
 * @param id {string} the id for the zone
 */

export function ignore(id) {
  let z = map.get(id);

  if(z) {
    z.classList.remove("zone");
  }

  map.delete(id);
}

/*
 * Inserts a zone at a specific index
 * @param index {int} the index location
 * @param zones {rest} zones to inject
 */

export function insert(index, ...zones) {
  let entries = Array.from(map.entries());
  let newEntries = zones.map(zone => {
    if(zone instanceof Zone) {
      return [zone.id, zone];
    }

    if(typeof zone == "string") {
      return [zone, get(zone)]
    }
  });

  entries.splice(index, 0, ...newEntries);
  map = new Map(entries);
}

/*
 * Deletes a zone
 * @param id {string} the id for the zone
 */

export function remove(id) {
  let entry = map.get(id);

  if(entry) {
    backup.append(entry.element);
    log(id, "zone removed");
  }

  map.delete(id);
}

/*
 * Loops through the zone map
 * @param callback {function} the callback function for each zone
 */

export function forEach(callback) {
  return map.forEach(callback);
}

/*
 * Logs a message for other teams
 * @param id {string} the id of the zone
 * @param msg {string} the log message
 */

export function log(id, msg) {
  changes.set(id, msg);
}

/*
 * Tracks a feature flag in Amplitude
 * @param key {string} the key for the feature
 * @param msg {string} the event message
 * @param flush {bool} flush now
 */

export function track(key, msg, flush = true) {
  const analytics = locker.getYozonsLocker("analytics");

  analytics.addEventToQueue({
    eventProperties: {
      action_performed: msg,
      flag_key: key,
      variant: "on"
    },
    eventType: "$exposure",
    flushNow: flush
  });
}

/*
 * Identifies valid insertion points for zones in story bodies
 * @returns {array} all valid paragraph elements
 *
 * NEW
 * ---
 * PE-127 disables vip functionality for OOM readers
 */

export function getValidInsertionPoints() {
  const story = document.querySelector(".story-body");

  if(getConfig("dma")) {
    const df = new DocumentFragment();
    const grafs = [...story.querySelectorAll(":scope > p")];

    // Make a copy of the story nodes
    df.append(story.cloneNode(true));

    // Clean zones out of the copy
    df.querySelectorAll("[id^=zone-], .zone").forEach(ele => ele.remove());

    // Make a boolean map for each paragraph
    const clones = [...df.querySelectorAll(".story-body > p")];
    const map = clones.map((p, i) => { 
      let prev = p.previousElementSibling;

      if(i == 0) return true;
      if(p.textContent.length < 100) return false;
      if(prev && prev.nodeName != "P") return false;

      return true;
    });

    // Return a filtered array of the real ones
    return grafs.filter((p, i) => {
      return map[i] === true;
    });
  } else {
    return Array.from(story.querySelectorAll(":scope > p, :scope > figure, :scope > .embed-infographic"));
  }
}

/*
 * Creates a dynamic number of story zones
 * @param cadence {integer} the cadence
 */

export function createStoryZones() {
  const vips = getValidInsertionPoints();
  const total = Math.floor(vips.length / cadence);

  for(let i = 1; i <= total; i++) {
    const zone = new Zone(`zone-el-${100 + i}`);
    zone.ad();
  }
}

/*
 * Distributes zones generically using vips
 * @param map {Map} the map to alter
 * @param tick {integer} the cadence
 */

export function distribute() {
  const vips = getValidInsertionPoints();
  let tick = cadence;

  map.forEach(zone => {
    if(!zone.vip) {
      zone.vip = vips[tick];
      tick += cadence;
    }
  });
}

/*
 * Renders a zone map
 * @param map {Map} an iterable object
 */

export function render() {
  // Distribute story zones
  if(isStoryPage()) distribute();

  // Inject
  map.forEach(zone => zone.inject());
  window.dispatchEvent(new Event("zones-loaded"));
}

/*
 * Intersection callback
 */

function handleIntersection(entries, observer) {
  entries.forEach((entry) => {
    if(entry.isIntersecting) {
      let e = entry.target;
      let zone = map.get(e.id);
      
      zone.hopper.forEach((value, key) => {
        zone[key](value);
      });

      // Only do this once
      observer.unobserve(e);
    }
  });
}

/*
 * Tracking callback
 */

function handleTracking(entries, observer) {
  entries.forEach((entry) => {
    if(entry.isIntersecting) {
      // Build the tracking event if configured (Joe Grubbs spec)
      const trackEvent = new CustomEvent('trackcustomzones', {
        detail: {
          data: [
            {
              zone: entry.target.id.replace(/zone-(el-)?/, ''),
              action: "impression",
              count: 1
            }
          ]
        }
      });

      // Send it
      window.dispatchEvent(trackEvent);

      // Only do this once
      observer.unobserve(entry.target);
    }
  });
}
