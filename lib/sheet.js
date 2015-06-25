'use strict';

var fs = require('fs'),
    path = require('path'),
    exec = require('child_process').exec,
    mime = require('mime');

var STEP   = 5;
var FORMAT = 'png';

var Sheet = function(program) {

  // is it video, is it even exists?
  if (!mime.lookup(program.file).match(/^video/)) {
    throw new Error(this.file, ', is not a video file');
  } else {
    this.file = program.file;
  }

  // setting images destination dir
  if (program.dstdir) {
    this.dstdir = program.dstdir;
  } else {
    this.dstdir = path.dirname(program.file);
  }

  // step to go through video file, screens time interval using %
  this.step = program.step ? program.step : STEP;
  // image format png, jpg
  this.format = program.format ? program.format : FORMAT;
};

Sheet.prototype.steps = function() {
  // working with per cent: %
  var steps = [];
  for (var step = 1; step <= 100; step += this.step) {
    steps.push(step);
  }
  return steps;
};

Sheet.prototype.exec = function(part, cb) {
  // thumbnail size is hardcoded for now, 0 - for original size
  var image_path = path.resolve(this.dstdir, part + '.' + this.format);
  var command = 'ffmpegthumbnailer -i \'' + this.file + '\' -s ' + 0 + ' -c ' +
    this.format + ' -o ' + image_path + ' -t ' + part + "%";
  var ff = exec(command, function(err, stdout, stderr) {
    if (err) {
      throw err;
    } else {
      cb(image_path);
    }
  }.bind(this));
};

exports.Sheet = Sheet;
