'use strict'

var xray = require('x-ray')();
var fs = require('fs');
var URL = "https://en.wikipedia.org/wiki/List_of_states_and_territories_of_the_United_States"

xray(URL, 
  'table.wikitable.sortable tr', [{
    location: "th[scope='row']",
    population: "td:nth-child(6)"
}])(function(err, res) {
  res.map(function(item) {
    var out = {
      'location': item.location.replace(/\[.*\]/g, "").trim(), 
      'population': item.population.replace(/,/g, "").trim()
    };
    fs.appendFile('locations.json', JSON.stringify(out, null, " "));
    return out
  });
});
