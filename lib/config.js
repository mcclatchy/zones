/*
 * JSON configuration support
 */

import { locker, Zone, ignore } from "./zones.js";

/**
 * Loads a configuration file
 * @param url {string} the url to the JSON file
 * @returns {Promise} a promise object
 */

export function load(url) {
  return new Promise(async (resolve, reject) => {
    const res = await fetch(url);
    const data = await res.json();
    const subscriber = locker.user.isSubscriber();
    const dma = await locker.user.isInDMA();

    // Load WPS zones
    if(data.base) {
      const base = document.querySelectorAll(data.base);
      base.forEach(ele => new Zone(ele.id));
    }
    
    // Ignore these zones
    if(data.ignore) {
      ignore(...data.ignore);
    }

    // Loop through changes
    const zones = data.zones || [];
    zones.forEach(config => {
      let show = true;

      // Filter check
      if(config.filters) {
        show = config.filters.every(f => {
          const { type, name, value, pattern } = f;

          switch(type) {
            case "subscriber":
              return subscriber === value;
            case "dma":
              return dma === value;
            case "config":
              const prop = locker.getConfig(name);

              // Pattern will peform a Regex match on the config value
              if(pattern) {
                let rx = new RegExp(pattern);
                return rx.test(prop) == value;
              } 

              // Anything else is a straight compare
              else {
                return prop === value;
              } 
          }
        });
      }

      // Render 
      if(show) {
        renderZone(config)
      }
    });

    resolve();
  });
}

/**
 * Renders a zone by config
 * @param config {object} a zone config object
 */

function renderZone(config) {
  const zone = new Zone(config.id);

  // Zephr connection
  if(config.zephr) {
    const { feature, dataset } = config.zephr;

    if(dataset) {
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
    }

    zone.zephr(feature);
  }

  // Add classes
  if(config.classList) {
    zone.classList.add(...config.classList)
  }

  // Add type
  if(config.type) {
    zone.dataset.type = config.type;
  }

  // Placement
  if(config.placement) {
    const {type, value} = config.placement;

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
