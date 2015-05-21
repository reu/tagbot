var es = require("event-stream");
var Meme = require("../meme");

module.exports = class MemeRepository {
  constructor(conduit) {
    this.conduit = conduit;
  }

  listMemes() {
    return this.conduit.listMacros().then((macros) => {
      console.log(macros);
      return Object.keys(macros).map((name) => {
        return this.buildMeme(name, macros[name].filePHID);
      });
    });
  }

  findMeme(name) {
    console.log("Finding macro", name);
    return this.conduit.findMacroByName(name).then((meme) => {
      return this.buildMeme(meme.name, meme.filePHID);
    });
  }

  buildMeme(name, fileId) {
    return new Meme(name, () => {
      var file = this.conduit.dowloadFile(fileId);

      return es.readable(function(count, callback) {
        file.then((data) => {
          this.emit("data", data);
          this.emit("end");
          callback();
        });
      });
    });
  }
}
