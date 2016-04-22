'use strict'

var Promise = require('promise');
var nightmare = require('nightmare')({ show: true })
var fs = require('fs');
var URL = "http://www.indeed.com/"
var languagesFile = "languages.json";
var locationsFile = "locations.json";

fs.readFile(locationsFile, function(err, locationData) {
  var locations = JSON.parse(locationData)["locations"];

  fs.readFile(languagesFile, function(err, languagesData) {
    var languages = JSON.parse(languagesData)["languages"];

    var locLangs = locations.map(function(loc) {
      return languages.map(function(lang) {
        return function() {
          return findRecords(loc["location"], lang);
        }
      })
    })

    console.log(locLangs[0]);
    var locLangTask = locLangs[0][0]().then(function(res){console.log(res);});
    for(var i = 0; i < locLangs.length - 1; i++) {
      for(var j = 0; i < locLangs[i].length - 1; j++) {
        locLangTask = locLangTask.then(locLangs[i][j]);
      }
    }
  });
});


function findRecords(location, language) {
  return new Promise(function(resolve, reject) {
    nightmare
    .goto(URL)
    .insert('input#what', '"' + language + '"')
    .insert('input#where', false)
    .insert('input#where', location)
    .click('input#fj')
    .wait('div#searchCount')
    .evaluate(function () {
      var count = document.querySelector('div#searchCount').innerHTML;
      return count.split("of ")[1].replace(/,/g, "").trim()
    })
    .end()
    .then(function (result) {
      console.log(result)
      var output = {
        "location": location,
        "language": language,
        "hits": result
      }
      fs.appendFile('indeed-scrape.json', JSON.stringify(output, null, " "));
      resolve("DONE!");
    })
  })
}
