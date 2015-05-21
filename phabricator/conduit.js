var canduit = require("canduit");

module.exports = class Conduit {
  constructor(user, certificate, api) {
    this.user = user;
    this.certificate = certificate;
    this.api = api;
    this.client = null;
  }

  call(method, params = {}) {
    return new Promise((resolve, reject) => {
      if (this.client) {
        this.client.exec(method, params, function(error, result) {
          if (error) return reject(error);
          resolve(result);
        });
      } else {
        canduit({ user: this.user, cert: this.certificate, api: this.api }, (error, client) => {
          this.client = client
          this.call(method, params).then(resolve, reject);
        });
      }
    });
  }

  listDiffsByIds(ids) {
    if (ids.length > 0) {
      return this.call("differential.query", { phids: ids });
    } else {
      return Promise.resolve([]);
    }
  }

  listUsersByIds(ids) {
    if (ids.length > 0) {
      return this.call("user.query", { phids: ids });
    } else {
      return Promise.resolve([]);
    }
  }
}
