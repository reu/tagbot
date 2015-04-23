"use strict";

var mysql = require("mysql");
var Meme = require("../meme");

var listMemesQuery = `
SELECT
  file_imagemacro.name as name, file.storageHandle as url
FROM
  file_imagemacro
JOIN
  file on file.phid=filePHID`;

var findMemeQuery = `
SELECT
  storageHandle as url
FROM
  file
WHERE
  phid=(
    SELECT
      filePHID
    FROM
      file_imagemacro
    WHERE
      name = ?
  )
`;

module.exports = class MemeRepository {
  constructor(db, downloader) {
    if (typeof db == "string") {
      this.db = mysql.createPool(db);
    } else {
      this.db = db;
    }

    this.downloader = downloader;
  }

  listMemes() {
    return new Promise((resolve, reject) => {
      this.db.query(listMemesQuery, (error, rows) => {
        if (error) return reject(error);

        resolve(rows.map(row => this.buildMeme(row.name, row.url)));
      });
    });
  }

  findMeme(name) {
    return new Promise((resolve, reject) => {
      this.db.query(findMemeQuery, [name], (error, rows) => {
        if (error) return reject(error);
        if (!rows[0] || !rows[0].url) return reject(new Error("Meme not found"));

        resolve(this.buildMeme(name, rows[0].url));
      });
    });
  }

  buildMeme(name, imagePath) {
    return new Meme(name, () => this.downloader.memeStream(imagePath));
  }
}
