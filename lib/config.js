/*
 * JSON configuration support
 */

import * as zones from "./zones.js";

/**
 * Loads a configuration file
 * @param url {string} the url to the JSON file
 * @returns {Promise} a promise object
 */

export function load(url) {
  const locker = zones.getLocker();
  const template = zones.getConfig("template");
  const subscriber = zones.getConfig("subscriber");
  const dma = zones.getConfig("dma");

  return new Promise(async (resolve, reject) => {
    // Make the request
    let data = null;
    const res = await fetch(url);

    // Reject if file missing
    if(!res.ok) {
      reject("zones: missing config file");
      return;
    }

    // Reject if file is not JSON
    try {
      data = await res.json();
    } catch(e) {
      reject("zones: config file not JSON");
      return;
    }

    // Load WPS zones by query
    if(data.wps) {
      let wps = document.querySelectorAll(data.wps);
      wps.forEach(ele => new zones.Zone(ele.id));
    }

    // Generate story zones
    if(data.cadence && zones.isStoryPage()) {
      let cadence;

      switch(true) {
        case subscriber:
          cadence = data.cadence.subscriber;
          break;
        case dma:
          cadence = data.cadence.dma;
          break
        default:
          cadence = data.cadence.standard;
      }

      zones.setCadence(cadence);
      // zones.createStoryZones();
    }

    // Ignore these WPS zones
    if(Array.isArray(data.ignore)) {
      zones.ignore(...data.ignore);
    }

    // Loop through zones
    const set = new Set(data.zones);

    set.forEach( config => {
      const { 
        id, 
        filters = {}, 
        vip = undefined, 
        position = "beforebegin",
        before = undefined, 
        after = undefined,
        remove = false,
        classList = [],
        type = "ad",
        tracking = false,
        cue = false,
        zephr = false,
        loading = "lazy",
        targeting = {}
      } = config;

      // Make the zone 
      if(check(filters)) {
        const zone = new zones.Zone(id);

        /*
         * Placement options
         */

        if(remove) {
          zone.remove();
        }
        else if(vip) {
          zone.vip = document.querySelector(vip);
        } 
        else if(before) {
          zone.before(before);
        }
        else if(after) {
          zone.after(after);
        } 

        /*
         * Output options
         */

        // CUE connection
        if(cue) {
          // zone.cue(cue);
          zone.hopper.set("cue", cue);
        }

        // Zephr connection
        else if(zephr) {
          const { feature, dataset } = zephr;

          if(Array.isArray(dataset)) {
            dataset.forEach(c => {
              zone.dataset[c] = zones.getConfig(c);
            });
          }

          zone.zephr(feature);
        }

        // Default to GAM
        else {
          zone.gam(targeting);
        }

        /*
         * Remaining configs
         */

        zone.position = position;
        zone.classList.add(...classList)
        zone.type = type;
        zone.loading = loading;
        zone.tracking = tracking;
      }
    });

    resolve();
  });
}

/*
 * Checks configs
 * @param filters {object} a set of section configs or segments 
 * @returns {boolean}
 */

function check(filters) {
  const keys = Object.keys(filters || []); 

  if(!keys.length) {
    return true;
  }

  return keys.every(key => {
    let value = filters[key];
    let config = zones.getConfig(key);

    if(typeof value == "boolean") {
      return config == value;
    } else {
      let rx = new RegExp(value, "i");
      return rx.test(config);
    }
  });
}
