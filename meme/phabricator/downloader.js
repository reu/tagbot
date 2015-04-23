"use strict";

var s3 = require("s3");

module.exports = class MemeDownloader {
  constructor(bucket, keyId, secretAccessKey) {
    this.bucket = bucket;
    this.s3 = s3.createClient({
      s3Options: {
        accessKeyId: keyId,
        secretAccessKey: secretAccessKey
      }
    });
  }

  memeStream(path) {
    return this.s3.downloadStream({
      Bucket: this.bucket,
      Key: path
    });
  }
}
