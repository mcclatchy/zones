# Zones
A Yozons extension to dynamically distribute or re-distribute zones on the websites. 

Release `1.0.23` introduced a configuration layer hosted in the PEX bucket. This gives us the capability of updating zones on each sync to the production servers. We currently support home, section and story pages. JSON files are located in the config folder for each page type.

## Config structure

```
{
  "base": "query string",
  "ignore": [array of zone ids],
  "zones": [
    {
      "id": "id attribute for the zone",
      "type": "ad|editorial",
      "placement": {
        "type": "query|before|after",
        "value": "zone id|query string"
      },
      "filters": [
        {
          "type": "config|subscriber|dma",
          "name": "the name of the config",
          "pattern": "regex string for comparison",
          "value": true|false
        }
      ],
      "zephr": {
        "feature": "name of the feature in Zephr",
        "dataset": [
          {
            "name": "custom input key sent to Zephr",
            "config": "config value to send"
          }
        ]
      },
    }
  ]
}
```

## Root object

The root properties collect zones delivered by WPS, ignore zones that should be left alone, and sets up new zones.

| Property | Value |
| --- | --- |
| base | uses `querySelectorAll` to populate the zone map with any zones delivered by WPS |
| ignore | removes specific zones in the map by their ID attribute | 
| zones | adds new zones to the map |

## Zone object

The zone object creates a new zone in the map.

| Property | Value |
| --- | --- |
| id | the id attribute for the zone element |
| type | the data-type attribute for the zone element |

### Placement object

These properties determine the placement of the zone. There are two options: add a zone relative to another zone already in the map, or add a zone before another element on the page using a query selector string. _Note, if referencing a zone already in the map the `#` is not required to select by id._

| Property | Value |
| --- | --- |
| type | "before" or "after" uses zones already in the map | "query" looks for the element on the page |
| value | the id of the zone in the map, or the query string to use |


### Filter objects (optional)

These properties will restrict the zone display based on Yozons configurations. All filters must be true for the zone to show. Negative values can be made true by setting the value to false. Some Yozons configurations return a Promise, which is why they've been separated into their own type.

| Property | Value |
| --- | --- |
| type | "subscriber" and "dma" wait for promise resolution, "config" makes a generic Yozons request |
| name | the name of the Yozons config |
| pattern | a regex pattern to match on string config values |
| value | the boolean value of the configuration or regex match |

### Zephr object (optional)

This object asks Zephr for a dynamic payload and passes any Yozons configuration values to help determine the correct payload.

| Property | Value |
| --- | --- |
| feature | the slug of the feature in Zephr |
| dataset[].name | the custom input key sent to Zephr |
| dataset[].config | the Yozons config value sent to Zephr |
