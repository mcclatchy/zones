/*
 * JSON configuration support
 */

import { locker, Zone, ignore, distribute } from "./zones.js";

/**
 * Loads a configuration file
 * @param url {string} the url to the JSON file
 * @returns {Promise} a promise object
 */

export function load(url) {
  return new Promise(async (resolve, reject) => {
    let data;
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

    // Configs
    const template = locker.pageType;
    const subscriber = locker.user.isSubscriber();
    const dma = subscriber ? true : await locker.user.isInDMA();

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
        const zone = new Zone(config.id);

        // Zephr connection
        if(config.zephr) {
          const { feature, dataset } = config.zephr;

          if(dataset) {
            dataset.forEach(d => {
              const {type, name, value} = d;

              switch(type) {
                case "subscriber":
                  zone.dataset[name] = subscriber;
                  break;
                case "dma":
                  zone.dataset[name] = dma;
                  break;
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

        // CUE connection
        if(config.cue) {
          zone.cue(config.cue);
        }

        // Add classes
        if(config.classList) {
          zone.classList.add(...config.classList)
        }

        // Add type
        if(config.type) {
          zone.dataset.type = config.type;
        }

        // Add tracking
        if(config.tracking) {
          zone.tracking = true;
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
            case "remove":
              zone.remove();
              break;
            default:
              zone.vip = value;
          }
        }
      }
    });

    // Story page cadence distribution
    if(locker.pageType == "story") {
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

      distribute(cadence);
    }

    resolve();
  });
}
