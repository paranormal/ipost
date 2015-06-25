"use strict";

var fs = require('fs'),
    path = require('path'),
    mime = require('mime'),
    rest = require('restler'),
    config = require('../package.json').config;

var utils = {
  post: function(cb) {
    rest.post(this.uri, this.data()).on('complete', function(data, response) {
      if (response.statusCode === 200) {
        var jdata = JSON.parse(data);
        if (jdata.success) {
          cb(jdata);
        } else {
          throw("ImageServer error: ", jdata);
        }
      } else {
        throw "Response error: " + response.statusCode;
      }
    });
  }
};

var Gallery = function(program) {
  if (!(this instanceof Gallery)) {
    return new Gallery(program);
  }

  // gallery name will be set from command line or get from filename
  if (program.gallery) {
    this.gallery = program.gallery;
  } else if (program.file) {
    this.gallery = path.basename(program.file);
  } else {
    throw new Error('Either file, or gallery must be defined');
  }

  // currently only one service
  if (!program.service) {
    this.uri = config.someimage.gallery;
    this.apikey = config.someimage.apikey;
  }
};

Gallery.prototype.data = function () {
// api post data
  return {
    data: {
      title: this.gallery,
      apikey: this.apikey
    }
  };
};

Gallery.prototype.post = function(cb) {
  utils.post.call(this, cb);
};

var Image = function(program, galleryid, file) {
  if (!(this instanceof Image)) {
    return new Image(galleryid, file);
  }

  // currently only one service
  if (!program.service) {
    this.uri = config.someimage.image;
    this.apikey = config.someimage.apikey;
    this.familysafe = config.someimage.familysafe;
  }

  if (typeof galleryid === 'string') {
    this.galleryid = galleryid;
  } else {
    this.galleryid = '';
  }

  // setting multipart file data
  this.file(file);
};

Image.prototype.data = function() {
  // api post data
  return {
    multipart: true,
    data: {
      apikey: this.apikey,
      galleryid: this.galleryid,
      familysafe: this.familysafe,
      image: this.image
    }
  };
};

Image.prototype.file = function(file) {
  var size = fs.statSync(file).size;
  var type = mime.lookup(file);
  if (!type.match(/^image/)) {
    throw new Error(file, ', is not an image file');
  }
  this.image = rest.file(file, null, size, null, type);
};

Image.prototype.post = function(cb) {
  utils.post.call(this, cb);
};


exports.Gallery = Gallery;
exports.Image = Image;
