/*
 * Zones
 */

// Internals
let map = new Map();
let fragment = new DocumentFragment();
let observer = new IntersectionObserver(handleIntersection, { rootMargin: "500px" })

// Locker
export let locker;

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
  }

  /*
   * Getter/Setter to copy/create the zone element
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

    this.element = zone;
    this.element.classList.add("zone");

    // Add this zone to the map
    map.set(val, this);
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
    const body = JSON.stringify({ "sdkFeatureSlug": feature, ...this.element.dataset });

    const req = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: body
    });

    const response = await req.json();
    const payload = response.outputValue;
    
    // Create the range including script tags
    if(payload) {
      const range = document.createRange().createContextualFragment(payload);
      this.element.append(range);
    } else {
      this.log("Zephr paylod was empty");
    }
  }

  /*
   * Injects this zone
   * @param ele {element} the injection point
   * @param loc {string} the placement relative to the injection point
   */

  inject(loc = "beforebegin") {
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
      this.element.dataset.distributed = true;
      this.vip.insertAdjacentElement(loc, this.element);
      this.log(this.msg || "zone moved into new location");

      // Observer for performance team
      observer.observe(this.element);
    }
  }

  /*
   * Removes this zone
   */

  remove() {
    remove(this.id);
  }

  /*
   * Insert this zone before another
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
   * Insert this zone after another
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
 * Gets the locker for external use
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
 * Gets a zone
 * @param id {string} the id for the zone
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
    fragment.append(entry.element);
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
 */

export function getValidInsertionPoints() {
  const df = new DocumentFragment();
  const story = document.querySelector(".story-body");
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
}

/*
 * Distributes zones generically using vips
 * @param map {Map} the map to alter
 * @param tick {integer} the cadence
 */

export function distribute(tick = 4) {
  const vips = getValidInsertionPoints();
  const cadence = tick;

  map.forEach(zone => {
    zone.vip = vips[tick];
    tick += cadence;
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

/*
 * Renders a zone config file
 * @param url {string} the url to the file
 */

export async function loadConfig(url) {
  const res = await fetch(url);
  const config = await res.json();
  const subscriber = locker.user.isSubscriber();
  const dma = await locker.user.isInDMA();

  config.zones.forEach(config => {
    const {id, filters, zephr, placement, classList} = config;

    // Filter check
    const show = filters.every(f => {
      switch(f.type) {
        case "subscriber":
          return subscriber === f.value;
        case "dma":
          return dma === f.value;
        case "config":
          let prop = locker.getConfig(f.name);

          if(typeof f.value == "boolean") {
            return prop === f.value;
          } else {
            let rx = new RegExp(f.value);
            return rx.test(prop);
          }
      }
    });

    // Render 
    if(show) {
      const zone = get(id);

      // Add classes
      if(classList) {
        zone.classList.add(...classList)
      }

      // Zephr connection
      if(zephr) {
        const dataset = zephr.dataset || [];
        
        dataset.forEach(d => {
          const {type, name, value} = d;

          switch(type) {
            case "config":
              zone.dataset[name] = locker.getConfig(value);
              break;
            default:
              zone.dataset[name] = value;
          }
        });

        zone.zephr(zephr.feature);
      }

      // Placement
      if(placement) {
        let {type, value} = placement;

        switch(type) {
          case "query":
            zone.vip = document.querySelector(value);
            break
          case "before":
            zone.before(value);
            break;
          case "after":
            zone.after(value);
            break;
          default:
            zone.vip = value;
        }
      }
    }
  });

  return config;
}

/*
 * IntersectionObserver callback
 */

function handleIntersection(entries, observer) {
  entries.forEach((entry) => {
    if(entry.isIntersecting) {
      // Build the event
      const loadZone = new CustomEvent("zone", {
        detail: {
          id: entry.target.id
        }
      });

      // Send it
      window.dispatchEvent(loadZone);

      // Only do it once
      observer.unobserve(entry.target);
    }
  });
}
