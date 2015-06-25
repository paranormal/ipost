#!/usr/bin/env node
"use strict";

var async = require('async'),
    program = require('commander'),
    config = require('../package.json');

var Gallery = require('../lib/ipost').Gallery,
    Image = require('../lib/ipost').Image,
    Sheet = require('../lib/sheet').Sheet;

program
  .version(config.version)
  .option('-f, --file [value]', 'Set video file to process')
  .option('-d, --dstdir [value]', 'Screenshots dir [default: video file dir]')
  .option('-g, --gallery [value]', 'gallery name [default: file name]')
  .option('-c, --format [value]', 'image format (png|jpg) [default: png]')
  .option('-s, --service [value]', 'image service [default: someimage]')
  .parse(process.argv);


var gallery = new Gallery(program);
var sheet = new Sheet(program);

var bbcode = [];

// -- Creating gallery
gallery.post(function(data) {
  console.log("Gallery name:    ", data.galleryid);
  async.each(sheet.steps(), function(item, cb) {
    // Creating images
    sheet.exec(item, function(file) {
      // -- Upload image
      var image = new Image(program, data.galleryid, file);
      image.post(function(data) {
        bbcode[item] = data.embedbb;
        cb();
      });
    });
  }, function(err) {
    console.log(bbcode.filter(String).join(' '));
  });
});
