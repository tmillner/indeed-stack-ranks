'use strict'

var Promise = require('promise');
var nightmare = require('nightmare')({ waitTimeout: 6000, show: true })
var fs = require('fs');
var URL = "http://www.indeed.com/"
var languagesFile = "languages.json";
var locationsFile = "locations.json";

fs.readFile(locationsFile, function(err, locationData) {
  var locations = JSON.parse(locationData)["locations"];

  fs.readFile(languagesFile, function(err, languagesData) {
    var languages = JSON.parse(languagesData)["languages"];

    // Bundle up a 2d map of the function tasks
    var locLangs = locations.map(function(loc) {
      return languages.map(function(lang) {
        return function() {
          return new Promise(function(resolve, reject) {
            findRecords(loc["location"], lang, resolve);
          })
        }
      })
    })

    var locLangTask = locLangs[0][0]().then(function(res){console.log(res);});
    locLangs.forEach(function(locLang) {
      for(var i = 0; i < locLang.length - 1; i++) locLangTask = locLangTask.then(locLang[i]);
    })
  });
});


function findRecords(location, language, resolve) {
    nightmare
    .goto(URL)
    .insert('input#what', '"' + language + '"')
    .insert('input#where', false)
    .insert('input#where', location)
    .click('input#fj')
    .wait('table#serpBody')
    .evaluate(function () {
      var obj = document.querySelector('div#searchCount');
      console.log(obj);
      if (obj == null) {
        return "0";
      }
      else {
        return obj.innerHTML.split("of ")[1].replace(/,/g, "").trim();
      }
    })
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
}
