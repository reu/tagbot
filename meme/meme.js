"use strict";

module.exports = class Meme {
  constructor(name, image) {
    this.name = name;
    this.getImage = image || (() => new stream.Readable);
  }

  toString() {
    return this.name;
  }
}
